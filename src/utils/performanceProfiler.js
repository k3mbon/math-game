// Performance profiler for game optimization
export class PerformanceProfiler {
  constructor() {
    this.metrics = {
      frameTime: [],
      renderTime: [],
      updateTime: [],
      collisionTime: [],
      memoryUsage: [],
      fps: 0,
      averageFrameTime: 0,
      maxFrameTime: 0,
      minFrameTime: Infinity
    };
    
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsUpdateInterval = 1000; // Update FPS every second
    this.lastFpsUpdate = 0;
    this.maxSamples = 100; // Keep last 100 samples
    
    this.isEnabled = false;
    this.timers = new Map();
    
    // Frame rate monitoring
    this.lagSpikes = [];
    this.lagThreshold = 33.33; // 30fps threshold (33.33ms per frame)
    this.criticalLagThreshold = 50; // 20fps threshold (50ms per frame)
    this.frameDropCount = 0;
    this.totalFrameDrops = 0;
  }

  enable() {
    this.isEnabled = true;
    console.log('🔍 Performance profiler enabled');
  }

  disable() {
    this.isEnabled = false;
    console.log('🔍 Performance profiler disabled');
  }

  // Debug logging that respects profiler state
  logDebug(message, data = null) {
    if (!this.isEnabled) return;
    if (data) {
      console.log(`🔍 ${message}:`, data);
    } else {
      console.log(`🔍 ${message}`);
    }
  }

  startTimer(name) {
    if (!this.isEnabled) return;
    this.timers.set(name, performance.now());
  }

  endTimer(name) {
    if (!this.isEnabled) return;
    const startTime = this.timers.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.addMetric(name + 'Time', duration);
      this.timers.delete(name);
      return duration;
    }
    return 0;
  }

  addMetric(metricName, value) {
    if (!this.isEnabled) return;
    
    if (!this.metrics[metricName]) {
      this.metrics[metricName] = [];
    }
    
    this.metrics[metricName].push(value);
    
    // Keep only the last maxSamples
    if (this.metrics[metricName].length > this.maxSamples) {
      this.metrics[metricName].shift();
    }
  }

  updateFrameMetrics() {
    if (!this.isEnabled) return;
    
    const currentTime = performance.now();
    const frameTime = currentTime - this.lastTime;
    
    this.addMetric('frameTime', frameTime);
    this.frameCount++;
    
    // Update frame time statistics
    this.metrics.averageFrameTime = this.getAverage('frameTime');
    this.metrics.maxFrameTime = Math.max(this.metrics.maxFrameTime, frameTime);
    this.metrics.minFrameTime = Math.min(this.metrics.minFrameTime, frameTime);
    
    // Monitor for lag spikes and frame drops
    this.monitorFrameRate(frameTime, currentTime);
    
    // Update FPS
    if (currentTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.metrics.fps = Math.round(1000 / this.metrics.averageFrameTime);
      this.lastFpsUpdate = currentTime;
    }
    
    this.lastTime = currentTime;
  }

  monitorFrameRate(frameTime, currentTime) {
    // Detect lag spikes
    if (frameTime > this.lagThreshold) {
      this.frameDropCount++;
      this.totalFrameDrops++;
      
      const lagSpike = {
        timestamp: currentTime,
        frameTime: frameTime,
        severity: frameTime > this.criticalLagThreshold ? 'critical' : 'moderate'
      };
      
      this.lagSpikes.push(lagSpike);
      
      // Keep only recent lag spikes (last 100)
      if (this.lagSpikes.length > 100) {
        this.lagSpikes.shift();
      }
      
      // Log critical lag spikes immediately
      if (lagSpike.severity === 'critical') {
        this.logDebug(`Critical lag spike detected: ${frameTime.toFixed(2)}ms frame time`);
      }
    } else {
      // Reset frame drop count if we have good frames
      this.frameDropCount = Math.max(0, this.frameDropCount - 0.1);
    }
  }

  getFrameRateHealth() {
    if (!this.isEnabled) return null;
    
    const recentLagSpikes = this.lagSpikes.filter(spike => 
      performance.now() - spike.timestamp < 10000 // Last 10 seconds
    );
    
    const criticalSpikes = recentLagSpikes.filter(spike => spike.severity === 'critical');
    const moderateSpikes = recentLagSpikes.filter(spike => spike.severity === 'moderate');
    
    let healthStatus = 'excellent';
    if (criticalSpikes.length > 0) {
      healthStatus = 'poor';
    } else if (moderateSpikes.length > 3) {
      healthStatus = 'fair';
    } else if (this.metrics.fps < 50) {
      healthStatus = 'good';
    }
    
    return {
      status: healthStatus,
      currentFps: this.metrics.fps,
      averageFrameTime: this.metrics.averageFrameTime,
      recentLagSpikes: recentLagSpikes.length,
      criticalSpikes: criticalSpikes.length,
      totalFrameDrops: this.totalFrameDrops,
      frameDropRate: this.frameCount > 0 ? (this.totalFrameDrops / this.frameCount * 100).toFixed(2) : 0
    };
  }

  measureMemoryUsage() {
    if (!this.isEnabled) return;
    
    if (performance.memory) {
      const memoryInfo = {
        used: performance.memory.usedJSHeapSize / 1024 / 1024, // MB
        total: performance.memory.totalJSHeapSize / 1024 / 1024, // MB
        limit: performance.memory.jsHeapSizeLimit / 1024 / 1024 // MB
      };
      
      this.addMetric('memoryUsage', memoryInfo.used);
      return memoryInfo;
    }
    return null;
  }

  getAverage(metricName) {
    const values = this.metrics[metricName];
    if (!values || values.length === 0) return 0;
    
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  getMax(metricName) {
    const values = this.metrics[metricName];
    if (!values || values.length === 0) return 0;
    return Math.max(...values);
  }

  getMin(metricName) {
    const values = this.metrics[metricName];
    if (!values || values.length === 0) return 0;
    return Math.min(...values);
  }

  getPerformanceReport() {
    if (!this.isEnabled) return null;
    
    const memoryInfo = this.measureMemoryUsage();
    
    return {
      fps: this.metrics.fps,
      frameTime: {
        average: Math.round(this.getAverage('frameTime') * 100) / 100,
        max: Math.round(this.getMax('frameTime') * 100) / 100,
        min: Math.round(this.getMin('frameTime') * 100) / 100
      },
      renderTime: {
        average: Math.round(this.getAverage('renderTime') * 100) / 100,
        max: Math.round(this.getMax('renderTime') * 100) / 100
      },
      updateTime: {
        average: Math.round(this.getAverage('updateTime') * 100) / 100,
        max: Math.round(this.getMax('updateTime') * 100) / 100
      },
      collisionTime: {
        average: Math.round(this.getAverage('collisionTime') * 100) / 100,
        max: Math.round(this.getMax('collisionTime') * 100) / 100
      },
      memory: memoryInfo,
      totalFrames: this.frameCount
    };
  }

  logPerformanceReport() {
    if (!this.isEnabled) return;
    
    const report = this.getPerformanceReport();
    const frameHealth = this.getFrameRateHealth();
    
    if (report) {
      console.log('🔍 Performance Report:', {
        fps: report.fps,
        frameTime: report.frameTime,
        renderTime: report.renderTime,
        updateTime: report.updateTime,
        collisionTime: report.collisionTime,
        memory: report.memory,
        frameHealth: frameHealth
      });
      
      // Log performance warnings
      if (frameHealth && frameHealth.status !== 'excellent') {
        console.warn(`🔍 Performance Warning: Frame rate health is ${frameHealth.status}`);
        if (frameHealth.criticalSpikes > 0) {
          console.warn(`🔍 ${frameHealth.criticalSpikes} critical lag spikes in the last 10 seconds`);
        }
      }
      
      // Log optimization suggestions
      const suggestions = this.getOptimizationSuggestions();
      if (suggestions.length > 0) {
        console.log('🔍 Optimization Suggestions:', suggestions);
      }
    }
  }

  reset() {
    this.metrics = {
      frameTime: [],
      renderTime: [],
      updateTime: [],
      collisionTime: [],
      memoryUsage: [],
      fps: 0,
      averageFrameTime: 0,
      maxFrameTime: 0,
      minFrameTime: Infinity
    };
    
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.lastFpsUpdate = 0;
    this.timers.clear();
  }

  // Performance optimization suggestions based on metrics
  getOptimizationSuggestions() {
    if (!this.isEnabled) return [];
    
    const suggestions = [];
    const report = this.getPerformanceReport();
    
    if (!report) return suggestions;
    
    if (report.fps < 30) {
      suggestions.push('Low FPS detected. Consider reducing render complexity or implementing object culling.');
    }
    
    if (report.frameTime.average > 33) {
      suggestions.push('Frame time is high. Target is 16.67ms for 60 FPS.');
    }
    
    if (report.renderTime.average > 16) {
      suggestions.push('Render time is high. Consider optimizing draw calls or implementing batching.');
    }
    
    if (report.collisionTime.average > 5) {
      suggestions.push('Collision detection is expensive. Consider spatial partitioning or broad-phase optimization.');
    }
    
    if (report.memory && report.memory.used > 100) {
      suggestions.push('High memory usage detected. Consider implementing object pooling.');
    }
    
    return suggestions;
  }
}

// Global profiler instance
export const gameProfiler = new PerformanceProfiler();

// Performance monitoring hook
export const usePerformanceMonitor = (enabled = false) => {
  if (enabled && !gameProfiler.isEnabled) {
    gameProfiler.enable();
  } else if (!enabled && gameProfiler.isEnabled) {
    gameProfiler.disable();
  }
  
  return {
    profiler: gameProfiler,
    startTimer: (name) => gameProfiler.startTimer(name),
    endTimer: (name) => gameProfiler.endTimer(name),
    getReport: () => gameProfiler.getPerformanceReport(),
    getSuggestions: () => gameProfiler.getOptimizationSuggestions(),
    getFrameHealth: () => gameProfiler.getFrameRateHealth(),
    getLagSpikes: () => gameProfiler.lagSpikes,
    getTotalFrameDrops: () => gameProfiler.totalFrameDrops
  };
};