/**
 * Procedural Environment Distribution System
 * Handles dynamic generation and placement of environmental objects
 * with performance-aware density management and biome-based distribution
 */

import React from 'react';
import { GAME_CONFIG } from '../config/gameConfig';

// Environment object types and their properties
export const ENVIRONMENT_OBJECTS = {
  TREE: {
    type: 'tree',
    size: 32,
    collision: true,
    density: 0.15,
    biomes: ['forest', 'grassland'],
    variants: ['realistic-tree', 'forest-tree'],
    colors: ['#228B22', '#32CD32', '#006400']
  },
  ROCK: {
    type: 'rock',
    size: 24,
    collision: true,
    density: 0.08,
    biomes: ['mountain', 'desert', 'grassland'],
    variants: ['realistic-rock'],
    colors: ['#696969', '#A9A9A9', '#778899']
  },
  BUSH: {
    type: 'bush',
    size: 16,
    collision: false,
    density: 0.25,
    biomes: ['forest', 'grassland'],
    variants: ['high-grass'],
    colors: ['#32CD32', '#228B22', '#90EE90']
  },
  FLOWER: {
    type: 'flower',
    size: 12,
    collision: false,
    density: 0.3,
    biomes: ['grassland', 'forest'],
    variants: ['wildflower'],
    colors: ['#FF69B4', '#FFB6C1', '#FF1493', '#FFA500', '#FFFF00', '#9370DB']
  },
  MUSHROOM: {
    type: 'mushroom',
    size: 14,
    collision: false,
    density: 0.1,
    biomes: ['forest'],
    variants: ['forest-mushroom'],
    colors: ['#DC143C', '#8B0000', '#FF6347']
  },
  WATER: {
    type: 'water',
    size: 32,
    collision: true,
    density: 0.05,
    biomes: ['lake', 'river'],
    variants: ['realistic-water'],
    colors: ['#2196F3', '#1976D2', '#0D47A1']
  },
  TREASURE: {
    type: 'treasure',
    size: 24,
    collision: false,
    density: 0.02,
    biomes: ['all'],
    variants: ['realistic-treasure'],
    colors: ['#FFD700', '#FFA500', '#FF8C00']
  }
};

// Biome definitions with environmental characteristics
export const BIOMES = {
  GRASSLAND: {
    name: 'grassland',
    baseColor: '#4CAF50',
    objects: [
      { type: ENVIRONMENT_OBJECTS.TREE, weight: 0.2 },
      { type: ENVIRONMENT_OBJECTS.BUSH, weight: 0.3 },
      { type: ENVIRONMENT_OBJECTS.FLOWER, weight: 0.4 },
      { type: ENVIRONMENT_OBJECTS.ROCK, weight: 0.1 }
    ],
    density: 1.0,
    temperature: 0.6,
    humidity: 0.7
  },
  FOREST: {
    name: 'forest',
    baseColor: '#2E7D32',
    objects: [
      { type: ENVIRONMENT_OBJECTS.TREE, weight: 0.5 },
      { type: ENVIRONMENT_OBJECTS.BUSH, weight: 0.2 },
      { type: ENVIRONMENT_OBJECTS.MUSHROOM, weight: 0.2 },
      { type: ENVIRONMENT_OBJECTS.FLOWER, weight: 0.1 }
    ],
    density: 1.8,
    temperature: 0.5,
    humidity: 0.8
  },
  MOUNTAIN: {
    name: 'mountain',
    baseColor: '#795548',
    objects: [
      { type: ENVIRONMENT_OBJECTS.ROCK, weight: 0.7 },
      { type: ENVIRONMENT_OBJECTS.TREE, weight: 0.2 },
      { type: ENVIRONMENT_OBJECTS.BUSH, weight: 0.1 }
    ],
    density: 0.6,
    temperature: 0.3,
    humidity: 0.4
  },
  DESERT: {
    name: 'desert',
    baseColor: '#FFC107',
    objects: [
      { type: ENVIRONMENT_OBJECTS.ROCK, weight: 0.5 },
      { type: ENVIRONMENT_OBJECTS.TREASURE, weight: 0.3 },
      { type: ENVIRONMENT_OBJECTS.BUSH, weight: 0.2 }
    ],
    density: 0.3,
    temperature: 0.9,
    humidity: 0.1
  },
  LAKE: {
    name: 'lake',
    baseColor: '#2196F3',
    objects: [
      { type: ENVIRONMENT_OBJECTS.WATER, weight: 0.6 },
      { type: ENVIRONMENT_OBJECTS.TREE, weight: 0.2 },
      { type: ENVIRONMENT_OBJECTS.FLOWER, weight: 0.2 }
    ],
    density: 0.8,
    temperature: 0.5,
    humidity: 0.9
  },
  SWAMP: {
    name: 'swamp',
    baseColor: '#4A5D23',
    objects: [
      { type: ENVIRONMENT_OBJECTS.MUSHROOM, weight: 0.4 },
      { type: ENVIRONMENT_OBJECTS.WATER, weight: 0.3 },
      { type: ENVIRONMENT_OBJECTS.TREE, weight: 0.2 },
      { type: ENVIRONMENT_OBJECTS.BUSH, weight: 0.1 }
    ],
    density: 1.2,
    temperature: 0.7,
    humidity: 0.95
  }
};

/**
 * Procedural Environment System
 * Manages dynamic generation and distribution of environmental objects
 */
export class ProceduralEnvironmentSystem {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 512;
    this.loadedChunks = new Map();
    this.objectCache = new Map();
    this.performanceThreshold = options.performanceThreshold || 60; // Target FPS
    this.maxObjectsPerChunk = options.maxObjectsPerChunk || 50;
    this.seed = options.seed || Math.random() * 1000000;
    this.noiseScale = options.noiseScale || 0.01;
    
    // Performance tracking
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.avgFrameTime = 16.67; // 60 FPS baseline
    
    // Adaptive density properties
    this.currentDensityModifier = 1.0;
    this.lastDensityModifier = 1.0;
    this.densityUpdateInterval = 30; // Update density every 30 frames
    this.densityUpdateCounter = 0;
    
    // Biome noise parameters
    this.biomeNoiseScale = 0.005;
    this.biomeThresholds = {
      forest: 0.3,
      mountain: 0.6,
      desert: 0.8,
      lake: 0.9
    };
  }

  /**
   * Simple noise function for procedural generation
   */
  noise(x, y, seed = this.seed) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return n - Math.floor(n);
  }

  /**
   * Octave noise for more complex patterns
   */
  octaveNoise(x, y, octaves = 4, persistence = 0.5, scale = 1) {
    let value = 0;
    let amplitude = 1;
    let frequency = scale;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += this.noise(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return value / maxValue;
  }

  /**
   * Determine biome type based on world coordinates
   */
  getBiome(worldX, worldY) {
    // Use multiple noise layers for more complex biome distribution
    const temperatureNoise = this.octaveNoise(
      worldX * this.biomeNoiseScale * 0.8,
      worldY * this.biomeNoiseScale * 0.8,
      3,
      0.6,
      1
    );
    
    const humidityNoise = this.octaveNoise(
      worldX * this.biomeNoiseScale * 1.2,
      worldY * this.biomeNoiseScale * 1.2,
      3,
      0.5,
      1
    );
    
    const elevationNoise = this.octaveNoise(
      worldX * this.biomeNoiseScale * 0.5,
      worldY * this.biomeNoiseScale * 0.5,
      4,
      0.7,
      1
    );

    // Normalize noise values to 0-1 range
    const temperature = (temperatureNoise + 1) * 0.5;
    const humidity = (humidityNoise + 1) * 0.5;
    const elevation = (elevationNoise + 1) * 0.5;

    // Determine biome based on temperature, humidity, and elevation
    if (elevation > 0.7) {
      return BIOMES.MOUNTAIN;
    } else if (humidity > 0.8 && temperature > 0.6) {
      return BIOMES.SWAMP;
    } else if (humidity > 0.7 && temperature < 0.4) {
      return BIOMES.LAKE;
    } else if (temperature < 0.3 || humidity < 0.2) {
      return BIOMES.DESERT;
    } else if (temperature > 0.4 && humidity > 0.5 && elevation < 0.3) {
      return BIOMES.FOREST;
    } else {
      return BIOMES.GRASSLAND;
    }
  }

  /**
   * Get chunk coordinates from world position
   */
  getChunkCoords(worldX, worldY) {
    return {
      x: Math.floor(worldX / this.chunkSize),
      y: Math.floor(worldY / this.chunkSize)
    };
  }

  /**
   * Generate chunk key for caching
   */
  getChunkKey(chunkX, chunkY) {
    return `${chunkX},${chunkY}`;
  }

  /**
   * Calculate performance-based density modifier
   */
  getPerformanceDensityModifier() {
    const currentFPS = 1000 / this.avgFrameTime;
    
    // Dynamic density adjustment based on performance
    if (currentFPS >= this.performanceThreshold) {
      // Excellent performance - increase density slightly
      return Math.min(1.2, this.currentDensityModifier + 0.05);
    } else if (currentFPS >= this.performanceThreshold * 0.8) {
      // Good performance - maintain or slightly reduce density
      return Math.max(0.8, this.currentDensityModifier - 0.02);
    } else if (currentFPS >= this.performanceThreshold * 0.6) {
      // Poor performance - reduce density
      return Math.max(0.5, this.currentDensityModifier - 0.1);
    } else {
      // Very poor performance - minimal density
      return Math.max(0.3, this.currentDensityModifier - 0.15);
    }
  }

  /**
   * Update density modifier smoothly over time
   */
  updateDensityModifier() {
    const targetDensity = this.getPerformanceDensityModifier();
    const smoothingFactor = 0.1; // Smooth transitions
    
    this.currentDensityModifier = this.currentDensityModifier * (1 - smoothingFactor) + 
                                  targetDensity * smoothingFactor;
    
    // Track density changes for debugging
    if (Math.abs(this.currentDensityModifier - this.lastDensityModifier) > 0.05) {
      this.lastDensityModifier = this.currentDensityModifier;
      console.log(`Environment density adjusted to: ${(this.currentDensityModifier * 100).toFixed(1)}%`);
    }
  }

  /**
   * Generate environmental objects for a chunk
   */
  generateChunkObjects(chunkX, chunkY) {
    const objects = [];
    const chunkKey = this.getChunkKey(chunkX, chunkY);
    
    // Check if chunk is already generated
    if (this.loadedChunks.has(chunkKey)) {
      return this.loadedChunks.get(chunkKey);
    }

    const startX = chunkX * this.chunkSize;
    const startY = chunkY * this.chunkSize;
    
    // Sample biome at chunk center
    const centerX = startX + this.chunkSize / 2;
    const centerY = startY + this.chunkSize / 2;
    const biome = this.getBiome(centerX, centerY);
    
    // Calculate density based on performance and current density modifier
    const effectiveDensity = biome.density * this.currentDensityModifier;
    
    // Generate objects based on biome configuration
    const objectCount = Math.floor(this.maxObjectsPerChunk * effectiveDensity);
    
    for (let i = 0; i < objectCount; i++) {
      // Random position within chunk
      const localX = this.noise(chunkX + i * 0.1, chunkY + i * 0.2) * this.chunkSize;
      const localY = this.noise(chunkX + i * 0.3, chunkY + i * 0.4) * this.chunkSize;
      
      const worldX = startX + localX;
      const worldY = startY + localY;
      
      // Select object type based on biome weights
      const objectType = this.selectObjectType(biome, worldX, worldY);
      
      if (objectType) {
        // Select variant
        const variant = objectType.variants[
          Math.floor(this.noise(worldX, worldY, this.seed + 1000) * objectType.variants.length)
        ];
        
        // Select color variation
        const color = objectType.colors[
          Math.floor(this.noise(worldX + 100, worldY + 100, this.seed + 2000) * objectType.colors.length)
        ];
        
        // Add slight size variation based on biome and noise
        const sizeVariation = 0.8 + (this.noise(worldX * 0.1, worldY * 0.1, this.seed + 3000) * 0.4);
        const finalSize = Math.round(objectType.size * sizeVariation);
        
        // Add rotation for visual variety
        const rotation = this.noise(worldX * 0.05, worldY * 0.05, this.seed + 4000) * Math.PI * 2;
        
        objects.push({
          id: `${chunkKey}_${i}`,
          type: objectType.type,
          variant: variant,
          x: worldX,
          y: worldY,
          size: finalSize,
          color: color,
          rotation: rotation,
          collision: objectType.collision,
          chunkX: chunkX,
          chunkY: chunkY,
          biome: biome.name,
          temperature: biome.temperature,
          humidity: biome.humidity
        });
      }
    }
    
    // Add treasure boxes with special distribution
    this.addTreasureBoxes(objects, chunkX, chunkY, startX, startY);
    
    // Cache the generated chunk
    this.loadedChunks.set(chunkKey, objects);
    return objects;
  }

  /**
   * Select object type based on biome weights and noise
   */
  selectObjectType(biome, worldX, worldY) {
    const noiseValue = this.noise(worldX * 0.01, worldY * 0.01, this.seed + 500);
    
    let cumulativeWeight = 0;
    const totalWeight = biome.objects.reduce((sum, obj) => sum + obj.weight, 0);
    const normalizedNoise = noiseValue * totalWeight;
    
    for (const obj of biome.objects) {
      cumulativeWeight += obj.weight;
      if (normalizedNoise <= cumulativeWeight) {
        return obj.type;
      }
    }
    
    return biome.objects[biome.objects.length - 1].type;
  }

  /**
   * Add treasure boxes with special distribution logic
   */
  addTreasureBoxes(objects, chunkX, chunkY, startX, startY) {
    // Treasure boxes are placed more strategically
    const treasureNoise = this.octaveNoise(
      chunkX * 0.1,
      chunkY * 0.1,
      2,
      0.5,
      1
    );
    
    // Only place treasure if noise value is above threshold
    if (treasureNoise > 0.7) {
      const treasureX = startX + this.chunkSize * 0.3 + 
        this.noise(chunkX, chunkY, this.seed + 2000) * this.chunkSize * 0.4;
      const treasureY = startY + this.chunkSize * 0.3 + 
        this.noise(chunkX + 100, chunkY + 100, this.seed + 2000) * this.chunkSize * 0.4;
      
      objects.push({
        id: `treasure_${chunkX}_${chunkY}`,
        type: 'treasure',
        variant: 'realistic-treasure',
        x: treasureX,
        y: treasureY,
        size: 24,
        collision: false,
        chunkX: chunkX,
        chunkY: chunkY,
        collected: false
      });
    }
  }

  /**
   * Get objects in view with intelligent streaming and preloading
   */
  getObjectsInView(cameraX, cameraY, viewWidth, viewHeight, padding = 100) {
    const objects = [];
    
    // Enhanced streaming: calculate extended range for preloading
    const preloadDistance = this.getPreloadDistance();
    const extendedPadding = padding + preloadDistance;
    
    // Calculate chunk range to check (with preloading)
    const minChunkX = Math.floor((cameraX - extendedPadding) / this.chunkSize);
    const maxChunkX = Math.floor((cameraX + viewWidth + extendedPadding) / this.chunkSize);
    const minChunkY = Math.floor((cameraY - extendedPadding) / this.chunkSize);
    const maxChunkY = Math.floor((cameraY + viewHeight + extendedPadding) / this.chunkSize);
    
    // Prioritize chunks by distance from camera center
    const cameraChunk = this.getChunkCoords(cameraX + viewWidth/2, cameraY + viewHeight/2);
    const chunkQueue = [];
    
    for (let chunkX = minChunkX; chunkX <= maxChunkX; chunkX++) {
      for (let chunkY = minChunkY; chunkY <= maxChunkY; chunkY++) {
        const distance = Math.abs(chunkX - cameraChunk.x) + Math.abs(chunkY - cameraChunk.y);
        chunkQueue.push({ chunkX, chunkY, distance });
      }
    }
    
    // Sort by distance (closest first)
    chunkQueue.sort((a, b) => a.distance - b.distance);
    
    // Process chunks with performance-aware limits
    const maxChunksPerFrame = this.getMaxChunksPerFrame();
    let processedChunks = 0;
    
    for (const { chunkX, chunkY, distance } of chunkQueue) {
      if (processedChunks >= maxChunksPerFrame && distance > 1) {
        // Skip distant chunks if we've hit the processing limit
        continue;
      }
      
      const chunkObjects = this.generateChunkObjects(chunkX, chunkY);
      processedChunks++;
      
      // Filter objects that are actually in view (with original padding)
      for (const obj of chunkObjects) {
        if (obj.x >= cameraX - padding && 
            obj.x <= cameraX + viewWidth + padding &&
            obj.y >= cameraY - padding && 
            obj.y <= cameraY + viewHeight + padding) {
          objects.push(obj);
        }
      }
    }
    
    return objects;
  }

  /**
   * Calculate preload distance based on performance
   */
  getPreloadDistance() {
    const currentFPS = 1000 / this.avgFrameTime;
    
    if (currentFPS >= this.performanceThreshold) {
      return this.chunkSize * 1.5; // High performance - preload more
    } else if (currentFPS >= this.performanceThreshold * 0.8) {
      return this.chunkSize * 1.0; // Good performance - moderate preload
    } else {
      return this.chunkSize * 0.5; // Poor performance - minimal preload
    }
  }

  /**
   * Calculate maximum chunks to process per frame
   */
  getMaxChunksPerFrame() {
    const currentFPS = 1000 / this.avgFrameTime;
    
    if (currentFPS >= this.performanceThreshold) {
      return 12; // High performance - process more chunks
    } else if (currentFPS >= this.performanceThreshold * 0.8) {
      return 8; // Good performance - moderate processing
    } else if (currentFPS >= this.performanceThreshold * 0.6) {
      return 6; // Poor performance - fewer chunks
    } else {
      return 4; // Very poor performance - minimal processing
    }
  }

  /**
   * Update performance metrics
   */
  updatePerformance(frameTime) {
    this.frameCount++;
    
    // Update rolling average
    const alpha = 0.1; // Smoothing factor
    this.avgFrameTime = this.avgFrameTime * (1 - alpha) + frameTime * alpha;
    
    // Update density modifier periodically
    this.densityUpdateCounter++;
    if (this.densityUpdateCounter >= this.densityUpdateInterval) {
      this.updateDensityModifier();
      this.densityUpdateCounter = 0;
    }
    
    // Clean up distant chunks periodically
    if (this.frameCount % 300 === 0) { // Every 5 seconds at 60fps
      this.cleanupDistantChunks();
    }
  }

  /**
   * Clean up chunks that are far from current view
   */
  cleanupDistantChunks(cameraX = 0, cameraY = 0, maxDistance = 3) {
    const currentChunk = this.getChunkCoords(cameraX, cameraY);
    const chunksToRemove = [];
    
    // Enhanced streaming: track memory usage and adjust cleanup distance
    const memoryUsage = this.loadedChunks.size;
    const maxChunks = this.getMaxChunksForPerformance();
    
    // Adjust cleanup distance based on memory pressure
    let effectiveMaxDistance = maxDistance;
    if (memoryUsage > maxChunks * 0.8) {
      effectiveMaxDistance = Math.max(2, maxDistance - 1);
    } else if (memoryUsage > maxChunks * 0.6) {
      effectiveMaxDistance = Math.max(2, maxDistance - 0.5);
    }
    
    for (const [chunkKey, objects] of this.loadedChunks) {
      const [chunkX, chunkY] = chunkKey.split(',').map(Number);
      const distance = Math.abs(chunkX - currentChunk.x) + Math.abs(chunkY - currentChunk.y);
      
      if (distance > effectiveMaxDistance) {
        chunksToRemove.push(chunkKey);
      }
    }
    
    // Remove distant chunks with priority (furthest first)
    chunksToRemove.sort((a, b) => {
      const [aX, aY] = a.split(',').map(Number);
      const [bX, bY] = b.split(',').map(Number);
      const distA = Math.abs(aX - currentChunk.x) + Math.abs(aY - currentChunk.y);
      const distB = Math.abs(bX - currentChunk.x) + Math.abs(bY - currentChunk.y);
      return distB - distA;
    });
    
    // Remove chunks gradually to avoid frame drops
    const maxRemovalPerFrame = Math.min(5, chunksToRemove.length);
    for (let i = 0; i < maxRemovalPerFrame; i++) {
      this.loadedChunks.delete(chunksToRemove[i]);
    }
    
    // Log streaming activity for debugging
    if (chunksToRemove.length > 0) {
      console.log(`Environment streaming: removed ${maxRemovalPerFrame}/${chunksToRemove.length} chunks, ${this.loadedChunks.size} chunks remaining`);
    }
  }

  /**
   * Calculate maximum chunks based on current performance
   */
  getMaxChunksForPerformance() {
    const currentFPS = 1000 / this.avgFrameTime;
    
    if (currentFPS >= this.performanceThreshold) {
      return 25; // High performance - more chunks
    } else if (currentFPS >= this.performanceThreshold * 0.8) {
      return 16; // Good performance - moderate chunks
    } else if (currentFPS >= this.performanceThreshold * 0.6) {
      return 12; // Poor performance - fewer chunks
    } else {
      return 9; // Very poor performance - minimal chunks
    }
  }

  /**
   * Get biome information at specific coordinates
   */
  getBiomeInfo(worldX, worldY) {
    const biome = this.getBiome(worldX, worldY);
    const noiseValue = this.octaveNoise(
      worldX * this.biomeNoiseScale,
      worldY * this.biomeNoiseScale,
      3,
      0.6,
      1
    );
    
    return {
      biome: biome,
      noiseValue: noiseValue,
      density: biome.density * this.getPerformanceDensityModifier()
    };
  }

  /**
   * Force regeneration of specific chunk
   */
  regenerateChunk(chunkX, chunkY) {
    const chunkKey = this.getChunkKey(chunkX, chunkY);
    this.loadedChunks.delete(chunkKey);
    return this.generateChunkObjects(chunkX, chunkY);
  }

  /**
   * Get statistics about the environment system
   */
  getStats() {
    return {
      loadedChunks: this.loadedChunks.size,
      avgFrameTime: this.avgFrameTime,
      currentFPS: 1000 / this.avgFrameTime,
      performanceModifier: this.getPerformanceDensityModifier(),
      totalObjects: Array.from(this.loadedChunks.values())
        .reduce((sum, objects) => sum + objects.length, 0)
    };
  }
}

// Global instance
export const globalEnvironmentSystem = new ProceduralEnvironmentSystem({
  chunkSize: 512,
  maxObjectsPerChunk: 40,
  performanceThreshold: 50,
  seed: Date.now()
});

/**
 * React hook for using the procedural environment system
 */
export function useProceduralEnvironment(options = {}) {
  const [environmentSystem] = React.useState(() => 
    options.useGlobal !== false ? globalEnvironmentSystem : new ProceduralEnvironmentSystem(options)
  );
  
  const getObjectsInView = React.useCallback((cameraX, cameraY, viewWidth, viewHeight) => {
    return environmentSystem.getObjectsInView(cameraX, cameraY, viewWidth, viewHeight);
  }, [environmentSystem]);
  
  const updatePerformance = React.useCallback((frameTime) => {
    environmentSystem.updatePerformance(frameTime);
  }, [environmentSystem]);
  
  const getBiomeInfo = React.useCallback((worldX, worldY) => {
    return environmentSystem.getBiomeInfo(worldX, worldY);
  }, [environmentSystem]);
  
  const getStats = React.useCallback(() => {
    return environmentSystem.getStats();
  }, [environmentSystem]);
  
  return {
    getObjectsInView,
    updatePerformance,
    getBiomeInfo,
    getStats,
    environmentSystem
  };
}