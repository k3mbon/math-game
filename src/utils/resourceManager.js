// Resource management utilities for optimized memory usage and asset loading
import { GAME_CONFIG } from '../config/gameConfig';

// Asset cache with LRU eviction policy
export class AssetCache {
  constructor(maxSize = 100, maxMemory = 50 * 1024 * 1024) { // 50MB default
    this.maxSize = maxSize;
    this.maxMemory = maxMemory;
    this.cache = new Map();
    this.usage = new Map(); // Track usage order for LRU
    this.memoryUsage = 0;
    this.accessCounter = 0;
  }

  // Estimate memory usage of an asset
  estimateMemoryUsage(asset) {
    if (asset instanceof HTMLImageElement) {
      return asset.width * asset.height * 4; // RGBA bytes
    } else if (asset instanceof HTMLCanvasElement) {
      return asset.width * asset.height * 4;
    } else if (asset instanceof AudioBuffer) {
      return asset.length * asset.numberOfChannels * 4; // Float32 bytes
    } else if (typeof asset === 'string') {
      return asset.length * 2; // UTF-16 bytes
    }
    return 1024; // Default estimate
  }

  // Add asset to cache
  set(key, asset) {
    const memorySize = this.estimateMemoryUsage(asset);
    
    // Remove existing entry if it exists
    if (this.cache.has(key)) {
      this.memoryUsage -= this.usage.get(key).size;
    }

    // Evict items if necessary
    while ((this.cache.size >= this.maxSize || this.memoryUsage + memorySize > this.maxMemory) && this.cache.size > 0) {
      this.evictLRU();
    }

    // Add new entry
    this.cache.set(key, asset);
    this.usage.set(key, {
      accessTime: ++this.accessCounter,
      size: memorySize
    });
    this.memoryUsage += memorySize;
  }

  // Get asset from cache
  get(key) {
    if (this.cache.has(key)) {
      // Update access time for LRU
      this.usage.get(key).accessTime = ++this.accessCounter;
      return this.cache.get(key);
    }
    return null;
  }

  // Check if asset exists in cache
  has(key) {
    return this.cache.has(key);
  }

  // Remove asset from cache
  delete(key) {
    if (this.cache.has(key)) {
      this.memoryUsage -= this.usage.get(key).size;
      this.cache.delete(key);
      this.usage.delete(key);
      return true;
    }
    return false;
  }

  // Evict least recently used item
  evictLRU() {
    let lruKey = null;
    let lruTime = Infinity;

    for (const [key, usage] of this.usage.entries()) {
      if (usage.accessTime < lruTime) {
        lruTime = usage.accessTime;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.delete(lruKey);
    }
  }

  // Clear all cached assets
  clear() {
    this.cache.clear();
    this.usage.clear();
    this.memoryUsage = 0;
    this.accessCounter = 0;
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      memoryUsage: this.memoryUsage,
      maxMemory: this.maxMemory,
      memoryUtilization: (this.memoryUsage / this.maxMemory) * 100
    };
  }
}

// Asset loader with preloading and lazy loading
export class AssetLoader {
  constructor() {
    this.cache = new AssetCache();
    this.loadingPromises = new Map();
    this.preloadQueue = [];
    this.loadingStats = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      loadErrors: 0
    };
  }

  // Load image asset
  async loadImage(src, priority = 'normal') {
    this.loadingStats.totalRequests++;

    // Check cache first
    if (this.cache.has(src)) {
      this.loadingStats.cacheHits++;
      return this.cache.get(src);
    }

    this.loadingStats.cacheMisses++;

    // Check if already loading
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }

    // Create loading promise
    const loadPromise = new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache.set(src, img);
        this.loadingPromises.delete(src);
        resolve(img);
      };

      img.onerror = () => {
        this.loadingStats.loadErrors++;
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load image: ${src}`));
      };

      // Set crossOrigin for external images
      if (src.startsWith('http')) {
        img.crossOrigin = 'anonymous';
      }

      img.src = src;
    });

    this.loadingPromises.set(src, loadPromise);
    return loadPromise;
  }

  // Load audio asset
  async loadAudio(src, priority = 'normal') {
    this.loadingStats.totalRequests++;

    if (this.cache.has(src)) {
      this.loadingStats.cacheHits++;
      return this.cache.get(src);
    }

    this.loadingStats.cacheMisses++;

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }

    const loadPromise = new Promise((resolve, reject) => {
      const audio = new Audio();
      
      audio.oncanplaythrough = () => {
        this.cache.set(src, audio);
        this.loadingPromises.delete(src);
        resolve(audio);
      };

      audio.onerror = () => {
        this.loadingStats.loadErrors++;
        this.loadingPromises.delete(src);
        reject(new Error(`Failed to load audio: ${src}`));
      };

      audio.src = src;
      audio.load();
    });

    this.loadingPromises.set(src, loadPromise);
    return loadPromise;
  }

  // Preload assets
  async preloadAssets(assetList) {
    const promises = assetList.map(asset => {
      if (asset.type === 'image') {
        return this.loadImage(asset.src, 'high');
      } else if (asset.type === 'audio') {
        return this.loadAudio(asset.src, 'high');
      }
      return Promise.resolve();
    });

    try {
      await Promise.all(promises);
      console.log('✅ All assets preloaded successfully');
    } catch (error) {
      console.warn('⚠️ Some assets failed to preload:', error);
    }
  }

  // Get cached asset
  getCachedAsset(src) {
    return this.cache.get(src);
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  // Get loading statistics
  getStats() {
    return {
      ...this.loadingStats,
      cacheStats: this.cache.getStats(),
      hitRate: this.loadingStats.totalRequests > 0 ? 
        (this.loadingStats.cacheHits / this.loadingStats.totalRequests) * 100 : 0
    };
  }
}

// Memory monitor for tracking game memory usage
export class MemoryMonitor {
  constructor() {
    this.samples = [];
    this.maxSamples = 100;
    this.monitoringInterval = null;
    this.thresholds = {
      warning: 0.8, // 80% of available memory
      critical: 0.9  // 90% of available memory
    };
    this.callbacks = {
      warning: [],
      critical: []
    };
  }

  // Start monitoring memory usage
  startMonitoring(intervalMs = 5000) {
    this.monitoringInterval = setInterval(() => {
      this.takeSample();
    }, intervalMs);
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  // Take a memory sample
  takeSample() {
    if (performance.memory) {
      const sample = {
        timestamp: Date.now(),
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };

      this.samples.push(sample);

      // Limit sample history
      if (this.samples.length > this.maxSamples) {
        this.samples.shift();
      }

      // Check thresholds
      const utilization = sample.used / sample.limit;
      if (utilization >= this.thresholds.critical) {
        this.triggerCallbacks('critical', sample);
      } else if (utilization >= this.thresholds.warning) {
        this.triggerCallbacks('warning', sample);
      }

      return sample;
    }
    return null;
  }

  // Add callback for memory threshold
  onThreshold(type, callback) {
    if (this.callbacks[type]) {
      this.callbacks[type].push(callback);
    }
  }

  // Trigger threshold callbacks
  triggerCallbacks(type, sample) {
    this.callbacks[type].forEach(callback => {
      try {
        callback(sample);
      } catch (error) {
        console.error(`Memory monitor callback error:`, error);
      }
    });
  }

  // Get current memory usage
  getCurrentUsage() {
    return this.takeSample();
  }

  // Get memory statistics
  getStats() {
    if (this.samples.length === 0) return null;

    const latest = this.samples[this.samples.length - 1];
    const oldest = this.samples[0];
    
    return {
      current: latest,
      trend: this.samples.length > 1 ? latest.used - oldest.used : 0,
      average: this.samples.reduce((sum, sample) => sum + sample.used, 0) / this.samples.length,
      peak: Math.max(...this.samples.map(s => s.used)),
      utilization: (latest.used / latest.limit) * 100
    };
  }
}

// Garbage collection helper
export class GarbageCollector {
  constructor() {
    this.cleanupTasks = [];
    this.cleanupInterval = null;
    this.forceGCThreshold = 0.85; // Force cleanup at 85% memory usage
  }

  // Register cleanup task
  registerCleanupTask(name, task) {
    this.cleanupTasks.push({ name, task });
  }

  // Start automatic cleanup
  startAutoCleanup(intervalMs = 30000) { // 30 seconds
    this.cleanupInterval = setInterval(() => {
      this.runCleanup();
    }, intervalMs);
  }

  // Stop automatic cleanup
  stopAutoCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Run cleanup tasks
  runCleanup() {
    console.log('🧹 Running garbage collection...');
    
    let tasksRun = 0;
    for (const { name, task } of this.cleanupTasks) {
      try {
        task();
        tasksRun++;
      } catch (error) {
        console.error(`Cleanup task '${name}' failed:`, error);
      }
    }

    console.log(`✅ Garbage collection completed (${tasksRun} tasks)`);
  }

  // Force garbage collection if available
  forceGC() {
    if (window.gc) {
      window.gc();
      console.log('🗑️ Forced garbage collection');
    }
  }
}

// Main resource manager
export class ResourceManager {
  constructor() {
    this.assetLoader = new AssetLoader();
    this.memoryMonitor = new MemoryMonitor();
    this.garbageCollector = new GarbageCollector();
    
    this.initialized = false;
    this.gameAssets = new Map();
  }

  // Initialize resource manager
  initialize() {
    if (this.initialized) return;

    // Start memory monitoring
    this.memoryMonitor.startMonitoring();

    // Register cleanup tasks
    this.garbageCollector.registerCleanupTask('assetCache', () => {
      // Clear old cached assets
      const stats = this.assetLoader.getStats();
      if (stats.cacheStats.memoryUtilization > 80) {
        console.log('🧹 Clearing asset cache due to high memory usage');
        this.assetLoader.clearCache();
      }
    });

    // Setup memory threshold callbacks
    this.memoryMonitor.onThreshold('warning', (sample) => {
      console.warn('⚠️ Memory usage warning:', (sample.used / sample.limit * 100).toFixed(1) + '%');
    });

    this.memoryMonitor.onThreshold('critical', (sample) => {
      console.error('🚨 Critical memory usage:', (sample.used / sample.limit * 100).toFixed(1) + '%');
      this.garbageCollector.runCleanup();
      this.garbageCollector.forceGC();
    });

    // Start automatic cleanup
    this.garbageCollector.startAutoCleanup();

    this.initialized = true;
    console.log('✅ Resource manager initialized');
  }

  // Shutdown resource manager
  shutdown() {
    this.memoryMonitor.stopMonitoring();
    this.garbageCollector.stopAutoCleanup();
    this.assetLoader.clearCache();
    this.gameAssets.clear();
    this.initialized = false;
  }

  // Load game asset
  async loadAsset(key, src, type = 'image') {
    try {
      let asset;
      if (type === 'image') {
        asset = await this.assetLoader.loadImage(src);
      } else if (type === 'audio') {
        asset = await this.assetLoader.loadAudio(src);
      } else {
        throw new Error(`Unsupported asset type: ${type}`);
      }

      this.gameAssets.set(key, asset);
      return asset;
    } catch (error) {
      console.error(`Failed to load asset '${key}':`, error);
      return null;
    }
  }

  // Get game asset
  getAsset(key) {
    return this.gameAssets.get(key) || this.assetLoader.getCachedAsset(key);
  }

  // Preload essential game assets
  async preloadEssentialAssets() {
    const essentialAssets = [
      { key: 'player', src: '/images/player.png', type: 'image' },
      { key: 'grass', src: '/images/grass.png', type: 'image' },
      { key: 'tree', src: '/images/tree.png', type: 'image' },
      { key: 'treasure', src: '/images/treasure.png', type: 'image' }
    ];

    console.log('🔄 Preloading essential assets...');
    
    const promises = essentialAssets.map(asset => 
      this.loadAsset(asset.key, asset.src, asset.type)
    );

    try {
      await Promise.all(promises);
      console.log('✅ Essential assets preloaded');
    } catch (error) {
      console.error('❌ Failed to preload some essential assets:', error);
    }
  }

  // Preload assets using the asset loader
  async preloadAssets(assetList) {
    console.log('🔄 Preloading assets...');
    
    const promises = assetList.map(asset => {
      if (asset.type === 'image') {
        return this.loadAsset(asset.id, asset.url, 'image');
      } else if (asset.type === 'audio') {
        return this.loadAsset(asset.id, asset.url, 'audio');
      }
      return Promise.resolve();
    });

    try {
      const results = await Promise.all(promises);
      console.log('✅ Assets preloaded successfully');
      return results;
    } catch (error) {
      console.warn('⚠️ Some assets failed to preload:', error);
      throw error;
    }
  }

  // Get comprehensive statistics
  getStats() {
    return {
      assetLoader: this.assetLoader.getStats(),
      memory: this.memoryMonitor.getStats(),
      gameAssets: this.gameAssets.size,
      initialized: this.initialized
    };
  }
}

// Global resource manager instance
export const globalResourceManager = new ResourceManager();

// Hook for using resource management
export const useResourceManager = () => {
  if (!globalResourceManager.initialized) {
    globalResourceManager.initialize();
  }
  return globalResourceManager;
};