// Rendering optimization utilities for improved game performance
import { GAME_CONFIG } from '../config/gameConfig.js';

// Object Pool for reusable objects to reduce garbage collection
export class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.active = [];
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  get() {
    let obj;
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.createFn();
    }
    this.active.push(obj);
    return obj;
  }

  release(obj) {
    const index = this.active.indexOf(obj);
    if (index > -1) {
      this.active.splice(index, 1);
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }

  releaseAll() {
    while (this.active.length > 0) {
      const obj = this.active.pop();
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }

  getStats() {
    return {
      poolSize: this.pool.length,
      activeCount: this.active.length,
      totalCreated: this.pool.length + this.active.length
    };
  }
}

// Frustum culling for efficient rendering
export class FrustumCuller {
  constructor() {
    this.viewBounds = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    };
  }

  updateViewBounds(cameraX, cameraY, viewWidth, viewHeight, margin = 100) {
    this.viewBounds.left = cameraX - margin;
    this.viewBounds.right = cameraX + viewWidth + margin;
    this.viewBounds.top = cameraY - margin;
    this.viewBounds.bottom = cameraY + viewHeight + margin;
  }

  isVisible(x, y, width = GAME_CONFIG.TILE_SIZE, height = GAME_CONFIG.TILE_SIZE) {
    return !(
      x + width < this.viewBounds.left ||
      x > this.viewBounds.right ||
      y + height < this.viewBounds.top ||
      y > this.viewBounds.bottom
    );
  }

  cullObjects(objects, getPosition) {
    return objects.filter(obj => {
      const pos = getPosition(obj);
      return this.isVisible(pos.x, pos.y, pos.width, pos.height);
    });
  }

  getVisibleTileRange(cameraX, cameraY, viewWidth, viewHeight) {
    const tileSize = GAME_CONFIG.TILE_SIZE;
    return {
      startX: Math.floor(cameraX / tileSize),
      endX: Math.ceil((cameraX + viewWidth) / tileSize),
      startY: Math.floor(cameraY / tileSize),
      endY: Math.ceil((cameraY + viewHeight) / tileSize)
    };
  }
}

// Batch renderer for efficient draw calls
export class BatchRenderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.batches = new Map();
    this.currentBatch = null;
  }

  startBatch(type) {
    if (!this.batches.has(type)) {
      this.batches.set(type, []);
    }
    this.currentBatch = this.batches.get(type);
    this.currentBatch.length = 0; // Clear previous batch
  }

  addToBatch(drawCall) {
    if (this.currentBatch) {
      this.currentBatch.push(drawCall);
    }
  }

  renderBatch(type) {
    const batch = this.batches.get(type);
    if (batch && batch.length > 0 && this.ctx) {
      // Sort by texture/image for better batching
      batch.sort((a, b) => {
        if (a.image && b.image) {
          return a.image.src.localeCompare(b.image.src);
        }
        return 0;
      });

      // Execute all draw calls in batch
      batch.forEach(drawCall => {
        drawCall.execute(this.ctx);
      });
    }
  }

  renderAllBatches() {
    for (const [type] of this.batches) {
      this.renderBatch(type);
    }
  }

  clearBatches() {
    for (const [, batch] of this.batches) {
      batch.length = 0;
    }
  }
}

// Sprite animation optimizer
export class SpriteAnimationOptimizer {
  constructor() {
    this.animationCache = new Map();
    this.frameSkipCounter = 0;
    this.frameSkipRate = 2; // Skip every 2nd frame for non-critical animations
  }

  shouldUpdateAnimation(animationId, isCritical = false) {
    if (isCritical) return true;
    
    this.frameSkipCounter++;
    if (this.frameSkipCounter >= this.frameSkipRate) {
      this.frameSkipCounter = 0;
      return true;
    }
    return false;
  }

  cacheAnimationFrame(animationId, frame, canvas) {
    if (!this.animationCache.has(animationId)) {
      this.animationCache.set(animationId, new Map());
    }
    this.animationCache.get(animationId).set(frame, canvas);
  }

  getCachedFrame(animationId, frame) {
    const animation = this.animationCache.get(animationId);
    return animation ? animation.get(frame) : null;
  }

  clearCache() {
    this.animationCache.clear();
  }
}

// Level of Detail (LOD) system
export class LODSystem {
  constructor() {
    this.lodLevels = {
      HIGH: 0,    // Full detail, close to player
      MEDIUM: 1,  // Reduced detail, medium distance
      LOW: 2      // Minimal detail, far from player
    };
  }

  getLODLevel(objectX, objectY, playerX, playerY) {
    const distance = Math.sqrt(
      Math.pow(objectX - playerX, 2) + Math.pow(objectY - playerY, 2)
    );

    if (distance < GAME_CONFIG.TILE_SIZE * 5) {
      return this.lodLevels.HIGH;
    } else if (distance < GAME_CONFIG.TILE_SIZE * 10) {
      return this.lodLevels.MEDIUM;
    } else {
      return this.lodLevels.LOW;
    }
  }

  shouldRenderAtLOD(lodLevel, currentLOD) {
    return currentLOD <= lodLevel;
  }
}

// Texture atlas for efficient texture management
export class TextureAtlas {
  constructor() {
    this.atlas = null;
    this.textureMap = new Map();
    this.loaded = false;
  }

  async createAtlas(textures) {
    // Create a large canvas to hold all textures
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Calculate atlas size (simple grid layout)
    const textureSize = 64; // Standard texture size
    const cols = Math.ceil(Math.sqrt(textures.length));
    const rows = Math.ceil(textures.length / cols);
    
    canvas.width = cols * textureSize;
    canvas.height = rows * textureSize;
    
    // Load and place textures
    let index = 0;
    for (const [name, src] of textures) {
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = () => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const x = col * textureSize;
          const y = row * textureSize;
          
          ctx.drawImage(img, x, y, textureSize, textureSize);
          
          // Store texture coordinates
          this.textureMap.set(name, {
            x, y, width: textureSize, height: textureSize,
            u: x / canvas.width,
            v: y / canvas.height,
            uWidth: textureSize / canvas.width,
            vHeight: textureSize / canvas.height
          });
          
          resolve();
        };
        img.src = src;
      });
      index++;
    }
    
    this.atlas = canvas;
    this.loaded = true;
  }

  getTexture(name) {
    return this.textureMap.get(name);
  }

  drawFromAtlas(ctx, textureName, dx, dy, dw, dh) {
    if (!this.loaded) return;
    
    const texture = this.getTexture(textureName);
    if (texture) {
      ctx.drawImage(
        this.atlas,
        texture.x, texture.y, texture.width, texture.height,
        dx, dy, dw, dh
      );
    }
  }
}

// Main rendering optimizer
export class RenderingOptimizer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    
    this.culler = new FrustumCuller();
    this.batchRenderer = new BatchRenderer(this.ctx);
    this.animationOptimizer = new SpriteAnimationOptimizer();
    this.lodSystem = new LODSystem();
    this.textureAtlas = new TextureAtlas();
    
    // Object pools
    this.particlePool = new ObjectPool(
      () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 1, maxLife: 1 }),
      (obj) => { obj.x = 0; obj.y = 0; obj.vx = 0; obj.vy = 0; obj.life = 1; }
    );
    
    this.renderStats = {
      objectsRendered: 0,
      objectsCulled: 0,
      batchesMade: 0,
      frameTime: 0
    };
  }

  updateViewport(cameraX, cameraY, viewWidth, viewHeight) {
    this.culler.updateViewBounds(cameraX, cameraY, viewWidth, viewHeight);
  }

  optimizedRender(gameState, renderFunction) {
    const startTime = performance.now();
    
    // Reset stats
    this.renderStats.objectsRendered = 0;
    this.renderStats.objectsCulled = 0;
    this.renderStats.batchesMade = 0;
    
    // Update viewport for culling
    this.updateViewport(
      gameState.camera.x,
      gameState.camera.y,
      GAME_CONFIG.CANVAS_WIDTH,
      GAME_CONFIG.CANVAS_HEIGHT
    );
    
    // Clear batches
    this.batchRenderer.clearBatches();
    
    // Execute optimized render function
    renderFunction(this);
    
    // Render all batches
    this.batchRenderer.renderAllBatches();
    
    // Update stats
    this.renderStats.frameTime = performance.now() - startTime;
  }

  cullAndRender(objects, renderFn, batchType = 'default') {
    this.batchRenderer.startBatch(batchType);
    
    objects.forEach(obj => {
      if (this.culler.isVisible(obj.x, obj.y, obj.width, obj.height)) {
        this.renderStats.objectsRendered++;
        this.batchRenderer.addToBatch({
          execute: (ctx) => renderFn(ctx, obj)
        });
      } else {
        this.renderStats.objectsCulled++;
      }
    });
    
    this.renderStats.batchesMade++;
  }

  getStats() {
    return { ...this.renderStats };
  }
}

// Global rendering optimizer instance
export const globalRenderingOptimizer = new RenderingOptimizer(null);

// Hook for using rendering optimization
export const useRenderingOptimization = (canvasRef) => {
  if (canvasRef.current && globalRenderingOptimizer.canvas !== canvasRef.current) {
    globalRenderingOptimizer.canvas = canvasRef.current;
    globalRenderingOptimizer.ctx = canvasRef.current.getContext('2d');
    globalRenderingOptimizer.batchRenderer.ctx = globalRenderingOptimizer.ctx;
  }
  
  return globalRenderingOptimizer;
};