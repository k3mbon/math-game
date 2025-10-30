// Physics optimization utilities for improved game performance
import { GAME_CONFIG } from '../config/gameConfig';

// Spatial hash grid for efficient collision detection
export class SpatialHashGrid {
  constructor(cellSize = GAME_CONFIG.TILE_SIZE) {
    this.cellSize = cellSize;
    this.grid = new Map();
    this.objects = new Map();
  }

  // Hash function to convert world coordinates to grid coordinates
  hash(x, y) {
    const gridX = Math.floor(x / this.cellSize);
    const gridY = Math.floor(y / this.cellSize);
    return `${gridX},${gridY}`;
  }

  // Get all grid cells that an object occupies
  getObjectCells(x, y, width, height) {
    const cells = [];
    const startX = Math.floor(x / this.cellSize);
    const endX = Math.floor((x + width) / this.cellSize);
    const startY = Math.floor(y / this.cellSize);
    const endY = Math.floor((y + height) / this.cellSize);

    for (let gridX = startX; gridX <= endX; gridX++) {
      for (let gridY = startY; gridY <= endY; gridY++) {
        cells.push(`${gridX},${gridY}`);
      }
    }
    return cells;
  }

  // Insert object into spatial hash
  insert(id, x, y, width = GAME_CONFIG.TILE_SIZE, height = GAME_CONFIG.TILE_SIZE) {
    const cells = this.getObjectCells(x, y, width, height);
    
    // Store object data
    this.objects.set(id, { x, y, width, height, cells });

    // Add to grid cells
    cells.forEach(cell => {
      if (!this.grid.has(cell)) {
        this.grid.set(cell, new Set());
      }
      this.grid.get(cell).add(id);
    });
  }

  // Remove object from spatial hash
  remove(id) {
    const obj = this.objects.get(id);
    if (obj) {
      obj.cells.forEach(cell => {
        const cellObjects = this.grid.get(cell);
        if (cellObjects) {
          cellObjects.delete(id);
          if (cellObjects.size === 0) {
            this.grid.delete(cell);
          }
        }
      });
      this.objects.delete(id);
    }
  }

  // Update object position
  update(id, x, y, width, height) {
    this.remove(id);
    this.insert(id, x, y, width, height);
  }

  // Get potential collision candidates for a given area
  query(x, y, width = GAME_CONFIG.TILE_SIZE, height = GAME_CONFIG.TILE_SIZE) {
    const cells = this.getObjectCells(x, y, width, height);
    const candidates = new Set();

    cells.forEach(cell => {
      const cellObjects = this.grid.get(cell);
      if (cellObjects) {
        cellObjects.forEach(id => candidates.add(id));
      }
    });

    return Array.from(candidates);
  }

  // Clear all objects
  clear() {
    this.grid.clear();
    this.objects.clear();
  }

  // Get statistics
  getStats() {
    return {
      totalCells: this.grid.size,
      totalObjects: this.objects.size,
      averageObjectsPerCell: this.grid.size > 0 ? 
        Array.from(this.grid.values()).reduce((sum, set) => sum + set.size, 0) / this.grid.size : 0
    };
  }
}

// Optimized collision detection system
export class CollisionSystem {
  constructor() {
    this.spatialHash = new SpatialHashGrid();
    this.staticObjects = new Map(); // Objects that don't move
    this.dynamicObjects = new Map(); // Objects that move
    this.collisionCache = new Map();
    this.cacheFrameLimit = 5; // Cache results for 5 frames
    this.currentFrame = 0;
  }

  // Add static object (terrain, buildings, etc.)
  addStaticObject(id, x, y, width, height, type = 'static') {
    this.staticObjects.set(id, { x, y, width, height, type });
    this.spatialHash.insert(id, x, y, width, height);
  }

  // Add dynamic object (player, monsters, etc.)
  addDynamicObject(id, x, y, width, height, type = 'dynamic') {
    this.dynamicObjects.set(id, { x, y, width, height, type });
    this.spatialHash.insert(id, x, y, width, height);
  }

  // Update dynamic object position
  updateDynamicObject(id, x, y, width, height) {
    if (this.dynamicObjects.has(id)) {
      this.dynamicObjects.set(id, { ...this.dynamicObjects.get(id), x, y, width, height });
      this.spatialHash.update(id, x, y, width, height);
    }
  }

  // Remove object
  removeObject(id) {
    this.staticObjects.delete(id);
    this.dynamicObjects.delete(id);
    this.spatialHash.remove(id);
  }

  // Check collision with caching
  checkCollision(x, y, width = GAME_CONFIG.TILE_SIZE, height = GAME_CONFIG.TILE_SIZE, excludeId = null) {
    const cacheKey = `${Math.floor(x)},${Math.floor(y)},${width},${height},${excludeId || 'null'}`;
    const cached = this.collisionCache.get(cacheKey);
    
    if (cached && this.currentFrame - cached.frame < this.cacheFrameLimit) {
      return cached.result;
    }

    const candidates = this.spatialHash.query(x, y, width, height);
    let hasCollision = false;

    for (const candidateId of candidates) {
      if (candidateId === excludeId) continue;

      const obj = this.staticObjects.get(candidateId) || this.dynamicObjects.get(candidateId);
      if (obj && this.aabbCollision(x, y, width, height, obj.x, obj.y, obj.width, obj.height)) {
        hasCollision = true;
        break;
      }
    }

    // Cache result
    this.collisionCache.set(cacheKey, { result: hasCollision, frame: this.currentFrame });
    return hasCollision;
  }

  // AABB collision detection
  aabbCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1);
  }

  // Get all objects in a region
  getObjectsInRegion(x, y, width, height) {
    const candidates = this.spatialHash.query(x, y, width, height);
    const objects = [];

    for (const candidateId of candidates) {
      const obj = this.staticObjects.get(candidateId) || this.dynamicObjects.get(candidateId);
      if (obj && this.aabbCollision(x, y, width, height, obj.x, obj.y, obj.width, obj.height)) {
        objects.push({ id: candidateId, ...obj });
      }
    }

    return objects;
  }

  // Update frame counter and clean cache
  nextFrame() {
    this.currentFrame++;
    
    // Clean old cache entries every 60 frames
    if (this.currentFrame % 60 === 0) {
      for (const [key, value] of this.collisionCache.entries()) {
        if (this.currentFrame - value.frame >= this.cacheFrameLimit) {
          this.collisionCache.delete(key);
        }
      }
    }
  }

  // Clear all objects and cache
  clear() {
    this.staticObjects.clear();
    this.dynamicObjects.clear();
    this.spatialHash.clear();
    this.collisionCache.clear();
  }

  // Get performance statistics
  getStats() {
    return {
      staticObjects: this.staticObjects.size,
      dynamicObjects: this.dynamicObjects.size,
      cacheSize: this.collisionCache.size,
      spatialHash: this.spatialHash.getStats()
    };
  }
}

// Movement prediction and interpolation
export class MovementPredictor {
  constructor() {
    this.positions = new Map(); // Store position history
    this.velocities = new Map(); // Store velocity history
    this.maxHistory = 5; // Keep last 5 positions
  }

  // Update object position and calculate velocity
  updatePosition(id, x, y, timestamp = performance.now()) {
    if (!this.positions.has(id)) {
      this.positions.set(id, []);
      this.velocities.set(id, []);
    }

    const positions = this.positions.get(id);
    const velocities = this.velocities.get(id);

    // Add new position
    positions.push({ x, y, timestamp });

    // Calculate velocity if we have previous position
    if (positions.length > 1) {
      const prev = positions[positions.length - 2];
      const dt = (timestamp - prev.timestamp) / 1000; // Convert to seconds
      
      if (dt > 0) {
        const vx = (x - prev.x) / dt;
        const vy = (y - prev.y) / dt;
        velocities.push({ vx, vy, timestamp });
      }
    }

    // Limit history size
    if (positions.length > this.maxHistory) {
      positions.shift();
    }
    if (velocities.length > this.maxHistory) {
      velocities.shift();
    }
  }

  // Predict future position
  predictPosition(id, deltaTime) {
    const positions = this.positions.get(id);
    const velocities = this.velocities.get(id);

    if (!positions || positions.length === 0) return null;

    const currentPos = positions[positions.length - 1];
    
    if (!velocities || velocities.length === 0) {
      return { x: currentPos.x, y: currentPos.y };
    }

    // Use average velocity for prediction
    const avgVelocity = velocities.reduce(
      (acc, vel) => ({ vx: acc.vx + vel.vx, vy: acc.vy + vel.vy }),
      { vx: 0, vy: 0 }
    );
    avgVelocity.vx /= velocities.length;
    avgVelocity.vy /= velocities.length;

    return {
      x: currentPos.x + avgVelocity.vx * deltaTime,
      y: currentPos.y + avgVelocity.vy * deltaTime
    };
  }

  // Interpolate between positions for smooth movement
  interpolatePosition(id, alpha) {
    const positions = this.positions.get(id);
    if (!positions || positions.length < 2) return null;

    const current = positions[positions.length - 1];
    const previous = positions[positions.length - 2];

    return {
      x: previous.x + (current.x - previous.x) * alpha,
      y: previous.y + (current.y - previous.y) * alpha
    };
  }

  // Clear history for object
  clearObject(id) {
    this.positions.delete(id);
    this.velocities.delete(id);
  }

  // Clear all history
  clear() {
    this.positions.clear();
    this.velocities.clear();
  }
}

// Physics world manager
export class PhysicsWorld {
  constructor() {
    this.collisionSystem = new CollisionSystem();
    this.movementPredictor = new MovementPredictor();
    this.gravity = { x: 0, y: 0 }; // No gravity by default for top-down game
    this.friction = 0.8; // Friction coefficient
    this.timeStep = 1/60; // 60 FPS physics
    this.accumulator = 0;
  }

  // Add static collision object
  addStaticCollider(id, x, y, width, height, type = 'wall') {
    this.collisionSystem.addStaticObject(id, x, y, width, height, type);
  }

  // Add dynamic physics object
  addDynamicObject(id, x, y, width, height, mass = 1) {
    this.collisionSystem.addDynamicObject(id, x, y, width, height, 'dynamic');
    this.movementPredictor.updatePosition(id, x, y);
  }

  // Update physics simulation
  update(deltaTime) {
    this.accumulator += deltaTime;

    // Fixed timestep physics
    while (this.accumulator >= this.timeStep) {
      this.collisionSystem.nextFrame();
      this.accumulator -= this.timeStep;
    }
  }

  // Check if movement is valid (no collision)
  canMoveTo(id, newX, newY, width, height) {
    return !this.collisionSystem.checkCollision(newX, newY, width, height, id);
  }

  // Move object with collision response
  moveObject(id, newX, newY, width, height) {
    if (this.canMoveTo(id, newX, newY, width, height)) {
      this.collisionSystem.updateDynamicObject(id, newX, newY, width, height);
      this.movementPredictor.updatePosition(id, newX, newY);
      return { x: newX, y: newY, collided: false };
    }

    // Try sliding along walls
    const currentObj = this.collisionSystem.dynamicObjects.get(id);
    if (!currentObj) return { x: newX, y: newY, collided: true };

    // Try X movement only
    if (this.canMoveTo(id, newX, currentObj.y, width, height)) {
      this.collisionSystem.updateDynamicObject(id, newX, currentObj.y, width, height);
      this.movementPredictor.updatePosition(id, newX, currentObj.y);
      return { x: newX, y: currentObj.y, collided: true };
    }

    // Try Y movement only
    if (this.canMoveTo(id, currentObj.x, newY, width, height)) {
      this.collisionSystem.updateDynamicObject(id, currentObj.x, newY, width, height);
      this.movementPredictor.updatePosition(id, currentObj.x, newY);
      return { x: currentObj.x, y: newY, collided: true };
    }

    // No movement possible
    return { x: currentObj.x, y: currentObj.y, collided: true };
  }

  // Get objects in region
  getObjectsInRegion(x, y, width, height) {
    return this.collisionSystem.getObjectsInRegion(x, y, width, height);
  }

  // Remove object
  removeObject(id) {
    this.collisionSystem.removeObject(id);
    this.movementPredictor.clearObject(id);
  }

  // Clear all objects
  clear() {
    this.collisionSystem.clear();
    this.movementPredictor.clear();
  }

  // Get performance statistics
  getStats() {
    return {
      collision: this.collisionSystem.getStats(),
      timeStep: this.timeStep,
      accumulator: this.accumulator
    };
  }
}

// Global physics world instance
export const globalPhysicsWorld = new PhysicsWorld();

// Hook for using physics optimization
export const usePhysicsOptimization = () => {
  return globalPhysicsWorld;
};