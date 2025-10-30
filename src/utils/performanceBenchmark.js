/**
 * Performance Benchmarking and Testing Suite
 * Provides comprehensive performance monitoring, testing, and reporting
 */

export class PerformanceBenchmark {
  constructor() {
    this.metrics = {
      frameRate: {
        current: 0,
        average: 0,
        min: Infinity,
        max: 0,
        samples: [],
        maxSamples: 120 // 2 seconds at 60fps
      },
      renderTime: {
        current: 0,
        average: 0,
        min: Infinity,
        max: 0,
        samples: []
      },
      updateTime: {
        current: 0,
        average: 0,
        min: Infinity,
        max: 0,
        samples: []
      },
      memory: {
        used: 0,
        total: 0,
        samples: []
      },
      gameLoop: {
        iterations: 0,
        totalTime: 0,
        averageTime: 0
      }
    };
    
    this.benchmarkTests = new Map();
    this.isRunning = false;
    this.startTime = 0;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    
    // Performance thresholds
    this.thresholds = {
      targetFPS: 60,
      minAcceptableFPS: 30,
      maxFrameTime: 16.67, // 60fps = 16.67ms per frame
      maxRenderTime: 10,
      maxUpdateTime: 5,
      memoryWarningMB: 100
    };
    
    this.callbacks = {
      onPerformanceIssue: null,
      onBenchmarkComplete: null,
      onMetricUpdate: null
    };
  }
  
  /**
   * Start performance monitoring
   */
  start() {
    this.isRunning = true;
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;
    this.frameCount = 0;
    
    // Start memory monitoring if available
    if (performance.memory) {
      this.monitorMemory();
    }
    
    console.log('Performance benchmarking started');
  }
  
  /**
   * Stop performance monitoring
   */
  stop() {
    this.isRunning = false;
    const totalTime = performance.now() - this.startTime;
    
    console.log('Performance benchmarking stopped');
    console.log(`Total runtime: ${(totalTime / 1000).toFixed(2)}s`);
    console.log(`Total frames: ${this.frameCount}`);
    console.log(`Average FPS: ${this.metrics.frameRate.average.toFixed(2)}`);
    
    return this.generateReport();
  }
  
  /**
   * Record frame timing
   */
  recordFrame() {
    if (!this.isRunning) return;
    
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    const fps = 1000 / frameTime;
    
    this.updateMetric('frameRate', fps);
    this.frameCount++;
    this.lastFrameTime = now;
    
    // Check for performance issues
    this.checkPerformanceThresholds();
  }
  
  /**
   * Record render timing
   */
  recordRenderTime(startTime, endTime) {
    if (!this.isRunning) return;
    
    const renderTime = endTime - startTime;
    this.updateMetric('renderTime', renderTime);
  }
  
  /**
   * Record update timing
   */
  recordUpdateTime(startTime, endTime) {
    if (!this.isRunning) return;
    
    const updateTime = endTime - startTime;
    this.updateMetric('updateTime', updateTime);
  }
  
  /**
   * Update a metric with new value
   */
  updateMetric(metricName, value) {
    const metric = this.metrics[metricName];
    if (!metric) return;
    
    metric.current = value;
    metric.samples.push(value);
    
    // Keep only recent samples
    if (metric.samples.length > metric.maxSamples || 120) {
      metric.samples.shift();
    }
    
    // Update statistics
    metric.min = Math.min(metric.min, value);
    metric.max = Math.max(metric.max, value);
    metric.average = metric.samples.reduce((a, b) => a + b, 0) / metric.samples.length;
    
    // Trigger callback if set
    if (this.callbacks.onMetricUpdate) {
      this.callbacks.onMetricUpdate(metricName, metric);
    }
  }
  
  /**
   * Monitor memory usage
   */
  monitorMemory() {
    if (!performance.memory || !this.isRunning) return;
    
    const memoryInfo = {
      used: performance.memory.usedJSHeapSize / (1024 * 1024), // MB
      total: performance.memory.totalJSHeapSize / (1024 * 1024), // MB
      limit: performance.memory.jsHeapSizeLimit / (1024 * 1024) // MB
    };
    
    this.metrics.memory = memoryInfo;
    
    // Schedule next memory check
    setTimeout(() => this.monitorMemory(), 1000);
  }
  
  /**
   * Check performance thresholds and trigger warnings
   */
  checkPerformanceThresholds() {
    const issues = [];
    
    // Check FPS
    if (this.metrics.frameRate.current < this.thresholds.minAcceptableFPS) {
      issues.push({
        type: 'low_fps',
        value: this.metrics.frameRate.current,
        threshold: this.thresholds.minAcceptableFPS
      });
    }
    
    // Check render time
    if (this.metrics.renderTime.current > this.thresholds.maxRenderTime) {
      issues.push({
        type: 'slow_render',
        value: this.metrics.renderTime.current,
        threshold: this.thresholds.maxRenderTime
      });
    }
    
    // Check update time
    if (this.metrics.updateTime.current > this.thresholds.maxUpdateTime) {
      issues.push({
        type: 'slow_update',
        value: this.metrics.updateTime.current,
        threshold: this.thresholds.maxUpdateTime
      });
    }
    
    // Check memory
    if (this.metrics.memory.used > this.thresholds.memoryWarningMB) {
      issues.push({
        type: 'high_memory',
        value: this.metrics.memory.used,
        threshold: this.thresholds.memoryWarningMB
      });
    }
    
    // Trigger callback if issues found
    if (issues.length > 0 && this.callbacks.onPerformanceIssue) {
      this.callbacks.onPerformanceIssue(issues);
    }
  }
  
  /**
   * Run a specific benchmark test
   */
  async runBenchmarkTest(testName, testFunction, iterations = 100) {
    console.log(`Running benchmark test: ${testName}`);
    
    const results = {
      name: testName,
      iterations,
      times: [],
      average: 0,
      min: Infinity,
      max: 0,
      totalTime: 0
    };
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      await testFunction();
      const endTime = performance.now();
      
      const time = endTime - startTime;
      results.times.push(time);
      results.min = Math.min(results.min, time);
      results.max = Math.max(results.max, time);
      results.totalTime += time;
    }
    
    results.average = results.totalTime / iterations;
    this.benchmarkTests.set(testName, results);
    
    console.log(`Benchmark ${testName} completed:`);
    console.log(`  Average: ${results.average.toFixed(3)}ms`);
    console.log(`  Min: ${results.min.toFixed(3)}ms`);
    console.log(`  Max: ${results.max.toFixed(3)}ms`);
    
    return results;
  }
  
  /**
   * Generate comprehensive performance report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      duration: performance.now() - this.startTime,
      frameCount: this.frameCount,
      metrics: { ...this.metrics },
      benchmarkTests: Object.fromEntries(this.benchmarkTests),
      performance: {
        averageFPS: this.metrics.frameRate.average,
        minFPS: this.metrics.frameRate.min,
        maxFPS: this.metrics.frameRate.max,
        averageRenderTime: this.metrics.renderTime.average,
        averageUpdateTime: this.metrics.updateTime.average,
        memoryUsage: this.metrics.memory.used
      },
      recommendations: this.generateRecommendations()
    };
    
    return report;
  }
  
  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.metrics.frameRate.average < this.thresholds.targetFPS) {
      recommendations.push({
        type: 'performance',
        message: `Average FPS (${this.metrics.frameRate.average.toFixed(1)}) is below target (${this.thresholds.targetFPS}). Consider optimizing render or update loops.`
      });
    }
    
    if (this.metrics.renderTime.average > this.thresholds.maxRenderTime) {
      recommendations.push({
        type: 'rendering',
        message: `Render time (${this.metrics.renderTime.average.toFixed(2)}ms) is high. Consider reducing draw calls or optimizing graphics.`
      });
    }
    
    if (this.metrics.updateTime.average > this.thresholds.maxUpdateTime) {
      recommendations.push({
        type: 'logic',
        message: `Update time (${this.metrics.updateTime.average.toFixed(2)}ms) is high. Consider optimizing game logic or using object pooling.`
      });
    }
    
    if (this.metrics.memory.used > this.thresholds.memoryWarningMB) {
      recommendations.push({
        type: 'memory',
        message: `Memory usage (${this.metrics.memory.used.toFixed(1)}MB) is high. Check for memory leaks or excessive object creation.`
      });
    }
    
    return recommendations;
  }
  
  /**
   * Set callback functions
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }
  
  /**
   * Get current metrics
   */
  getCurrentMetrics() {
    return { ...this.metrics };
  }
  
  /**
   * Reset all metrics
   */
  reset() {
    Object.keys(this.metrics).forEach(key => {
      if (this.metrics[key].samples) {
        this.metrics[key].samples = [];
        this.metrics[key].min = Infinity;
        this.metrics[key].max = 0;
        this.metrics[key].average = 0;
        this.metrics[key].current = 0;
      }
    });
    
    this.benchmarkTests.clear();
    this.frameCount = 0;
  }
}

// Global benchmark instance
export const globalBenchmark = new PerformanceBenchmark();

// React hook for performance monitoring
export const usePerformanceBenchmark = () => {
  return {
    start: () => globalBenchmark.start(),
    stop: () => globalBenchmark.stop(),
    recordFrame: () => globalBenchmark.recordFrame(),
    recordRenderTime: (start, end) => globalBenchmark.recordRenderTime(start, end),
    recordUpdateTime: (start, end) => globalBenchmark.recordUpdateTime(start, end),
    getCurrentMetrics: () => globalBenchmark.getCurrentMetrics(),
    generateReport: () => globalBenchmark.generateReport(),
    runBenchmarkTest: (name, fn, iterations) => globalBenchmark.runBenchmarkTest(name, fn, iterations),
    setCallbacks: (callbacks) => globalBenchmark.setCallbacks(callbacks),
    reset: () => globalBenchmark.reset()
  };
};