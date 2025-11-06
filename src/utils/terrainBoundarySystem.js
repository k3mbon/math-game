import { GAME_CONFIG } from '../config/gameConfig.js';

/**
 * Terrain Boundary System
 * Creates invisible collision boundaries using grass asset perimeter
 * Implements efficient spatial partitioning for collision detection
 */
export class TerrainBoundarySystem {
  constructor() {
    this.boundaries = new Map(); // Spatial hash for boundary segments
    this.grassBoundaryWidth = 3; // Width of grass boundary in tiles
    this.cellSize = GAME_CONFIG.TILE_SIZE * 4; // Spatial partitioning cell size
    this.worldSize = GAME_CONFIG.WORLD_SIZE; // World size in tiles
    this.expandedWorldSize = this.worldSize * 1.5; // Expanded terrain size
    this.boundarySegments = [];
    this.initialized = false;
  }

  /**
   * Initialize the boundary system with grass asset perimeter
   */
  initialize() {
    if (this.initialized) return;
    
    console.log('🌱 Initializing Terrain Boundary System...');
    
    // Create boundary segments around the expanded world perimeter
    this.createGrassBoundaryPerimeter();
    
    // Build spatial hash for efficient collision detection
    this.buildSpatialHash();
    
    this.initialized = true;
    console.log(`✅ Boundary system initialized with ${this.boundarySegments.length} segments`);
  }

  /**
   * Create grass boundary perimeter around the expanded world
   */
  createGrassBoundaryPerimeter() {
    const worldPixelSize = this.expandedWorldSize * GAME_CONFIG.TILE_SIZE;
    const boundaryThickness = this.grassBoundaryWidth * GAME_CONFIG.TILE_SIZE;
    
    // Create boundary segments for each side of the world
    const segments = [
      // Top boundary
      {
        x: -boundaryThickness,
        y: -boundaryThickness,
        width: worldPixelSize + (boundaryThickness * 2),
        height: boundaryThickness,
        side: 'top'
      },
      // Bottom boundary
      {
        x: -boundaryThickness,
        y: worldPixelSize,
        width: worldPixelSize + (boundaryThickness * 2),
        height: boundaryThickness,
        side: 'bottom'
      },
      // Left boundary
      {
        x: -boundaryThickness,
        y: 0,
        width: boundaryThickness,
        height: worldPixelSize,
        side: 'left'
      },
      // Right boundary
      {
        x: worldPixelSize,
        y: 0,
        width: boundaryThickness,
        height: worldPixelSize,
        side: 'right'
      }
    ];

    this.boundarySegments = segments;
  }

  /**
   * Build spatial hash for efficient boundary collision detection
   */
  buildSpatialHash() {
    this.boundaries.clear();
    
    this.boundarySegments.forEach((segment, index) => {
      // Calculate which cells this segment occupies
      const startCellX = Math.floor(segment.x / this.cellSize);
      const endCellX = Math.floor((segment.x + segment.width) / this.cellSize);
      const startCellY = Math.floor(segment.y / this.cellSize);
      const endCellY = Math.floor((segment.y + segment.height) / this.cellSize);
      
      // Add segment to all cells it occupies
      for (let cellX = startCellX; cellX <= endCellX; cellX++) {
        for (let cellY = startCellY; cellY <= endCellY; cellY++) {
          const cellKey = `${cellX},${cellY}`;
          if (!this.boundaries.has(cellKey)) {
            this.boundaries.set(cellKey, []);
          }
          this.boundaries.get(cellKey).push({ ...segment, index });
        }
      }
    });
  }

  /**
   * Check if a position collides with terrain boundaries
   * @param {number} x - X coordinate in pixels
   * @param {number} y - Y coordinate in pixels
   * @param {number} width - Object width (default: player size)
   * @param {number} height - Object height (default: player size)
   * @returns {boolean} True if collision detected
   */
  checkBoundaryCollision(x, y, width = GAME_CONFIG.PLAYER_SIZE, height = GAME_CONFIG.PLAYER_SIZE) {
    if (!this.initialized) {
      this.initialize();
    }

    // Calculate object bounds
    const objLeft = x - width / 2;
    const objRight = x + width / 2;
    const objTop = y - height / 2;
    const objBottom = y + height / 2;

    // Get cells that the object occupies
    const startCellX = Math.floor(objLeft / this.cellSize);
    const endCellX = Math.floor(objRight / this.cellSize);
    const startCellY = Math.floor(objTop / this.cellSize);
    const endCellY = Math.floor(objBottom / this.cellSize);

    // Check collision with boundary segments in relevant cells
    for (let cellX = startCellX; cellX <= endCellX; cellX++) {
      for (let cellY = startCellY; cellY <= endCellY; cellY++) {
        const cellKey = `${cellX},${cellY}`;
        const segments = this.boundaries.get(cellKey);
        
        if (segments) {
          for (const segment of segments) {
            if (this.aabbCollision(
              objLeft, objTop, width, height,
              segment.x, segment.y, segment.width, segment.height
            )) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * AABB collision detection
   */
  aabbCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1);
  }

  /**
   * Get the expanded world size in pixels
   */
  getExpandedWorldSize() {
    return this.expandedWorldSize * GAME_CONFIG.TILE_SIZE;
  }

  /**
   * Get boundary information for rendering (if needed for debugging)
   */
  getBoundarySegments() {
    return this.boundarySegments;
  }

  /**
   * Check if a position is within the playable area (not in boundary)
   */
  isWithinPlayableArea(x, y, width = GAME_CONFIG.PLAYER_SIZE, height = GAME_CONFIG.PLAYER_SIZE) {
    return !this.checkBoundaryCollision(x, y, width, height);
  }

  /**
   * Get the closest valid position within playable area
   * @param {number} x - Desired X coordinate
   * @param {number} y - Desired Y coordinate
   * @returns {object} Valid position {x, y}
   */
  getValidPosition(x, y, width = GAME_CONFIG.PLAYER_SIZE, height = GAME_CONFIG.PLAYER_SIZE) {
    const worldPixelSize = this.expandedWorldSize * GAME_CONFIG.TILE_SIZE;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const margin = this.grassBoundaryWidth * GAME_CONFIG.TILE_SIZE;

    // Clamp to playable area bounds
    const validX = Math.max(margin + halfWidth, Math.min(worldPixelSize - margin - halfWidth, x));
    const validY = Math.max(margin + halfHeight, Math.min(worldPixelSize - margin - halfHeight, y));

    return { x: validX, y: validY };
  }

  /**
   * Enhanced boundary collision detection with adjusted constraints
   * Respects popup layout requirements and maintains proper game boundaries
   * @param {number} x - X coordinate in pixels
   * @param {number} y - Y coordinate in pixels
   * @param {number} width - Object width
   * @param {number} height - Object height
   * @param {object} layoutConstraints - Optional layout constraints for popup visibility
   * @returns {boolean} True if collision detected
   */
  checkEnhancedBoundaryCollision(x, y, width = GAME_CONFIG.PLAYER_SIZE, height = GAME_CONFIG.PLAYER_SIZE, layoutConstraints = null) {
    if (!this.initialized) {
      this.initialize();
    }

    // Apply layout constraints if provided (for popup visibility)
    let adjustedBounds = {
      minX: this.grassBoundaryWidth * GAME_CONFIG.TILE_SIZE,
      minY: this.grassBoundaryWidth * GAME_CONFIG.TILE_SIZE,
      maxX: this.expandedWorldSize * GAME_CONFIG.TILE_SIZE - this.grassBoundaryWidth * GAME_CONFIG.TILE_SIZE,
      maxY: this.expandedWorldSize * GAME_CONFIG.TILE_SIZE - this.grassBoundaryWidth * GAME_CONFIG.TILE_SIZE
    };

    if (layoutConstraints) {
      // Adjust boundaries to ensure popup visibility
      adjustedBounds.minX = Math.max(adjustedBounds.minX, layoutConstraints.minX || 0);
      adjustedBounds.minY = Math.max(adjustedBounds.minY, layoutConstraints.minY || 0);
      adjustedBounds.maxX = Math.min(adjustedBounds.maxX, layoutConstraints.maxX || adjustedBounds.maxX);
      adjustedBounds.maxY = Math.min(adjustedBounds.maxY, layoutConstraints.maxY || adjustedBounds.maxY);
    }

    // Calculate object bounds
    const objLeft = x - width / 2;
    const objRight = x + width / 2;
    const objTop = y - height / 2;
    const objBottom = y + height / 2;

    // Check against adjusted boundaries
    if (objLeft < adjustedBounds.minX || objRight > adjustedBounds.maxX ||
        objTop < adjustedBounds.minY || objBottom > adjustedBounds.maxY) {
      return true; // Collision with boundary
    }

    // Use existing spatial hash collision detection
    return this.checkBoundaryCollision(x, y, width, height);
  }

  /**
   * Get layout-aware valid position
   * @param {number} x - Desired X coordinate
   * @param {number} y - Desired Y coordinate
   * @param {object} layoutConstraints - Layout constraints for popup visibility
   * @returns {object} Valid position {x, y}
   */
  getLayoutAwareValidPosition(x, y, width = GAME_CONFIG.PLAYER_SIZE, height = GAME_CONFIG.PLAYER_SIZE, layoutConstraints = null) {
    const worldPixelSize = this.expandedWorldSize * GAME_CONFIG.TILE_SIZE;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const margin = this.grassBoundaryWidth * GAME_CONFIG.TILE_SIZE;

    // Default bounds
    let minX = margin + halfWidth;
    let maxX = worldPixelSize - margin - halfWidth;
    let minY = margin + halfHeight;
    let maxY = worldPixelSize - margin - halfHeight;

    // Apply layout constraints if provided
    if (layoutConstraints) {
      minX = Math.max(minX, (layoutConstraints.minX || 0) + halfWidth);
      maxX = Math.min(maxX, (layoutConstraints.maxX || worldPixelSize) - halfWidth);
      minY = Math.max(minY, (layoutConstraints.minY || 0) + halfHeight);
      maxY = Math.min(maxY, (layoutConstraints.maxY || worldPixelSize) - halfHeight);
    }

    // Clamp to adjusted bounds
    const validX = Math.max(minX, Math.min(maxX, x));
    const validY = Math.max(minY, Math.min(maxY, y));

    return { x: validX, y: validY };
  }

  /**
   * Update world size (for dynamic terrain expansion)
   */
  updateWorldSize(newSize) {
    this.expandedWorldSize = newSize;
    this.initialized = false; // Force re-initialization
    this.initialize();
  }
}

// Singleton instance
export const terrainBoundarySystem = new TerrainBoundarySystem();

/**
 * Enhanced Bush Collision System
 * Improves collision detection between player and bushes
 */
export class EnhancedBushCollisionSystem {
  constructor() {
    this.bushHitboxScale = 0.85; // Tighten: bushes use 85% of visual size for collision
    this.playerHitboxScale = 0.85; // Tighten: player uses 85% of visual size for collision
    // Align collision hitbox with renderer's ground alignment offset
    // CanvasRenderer draws bushes with a slight downward offset (~10% of tile size)
    this.bushGroundOffsetFactor = 0.1;
  }

  /**
   * Check collision between player and bush with improved hitboxes
   * @param {number} playerX - Player X coordinate
   * @param {number} playerY - Player Y coordinate
   * @param {number} bushX - Bush X coordinate
   * @param {number} bushY - Bush Y coordinate
   * @param {number} bushSize - Bush size (default: tile size)
   * @returns {boolean} True if collision detected
   */
  checkBushCollision(playerX, playerY, bushX, bushY, bushSize = GAME_CONFIG.TILE_SIZE) {
    // Inputs bushX/bushY are the bush's TILE origin (top-left) in world pixels.
    // Convert to visual center and apply renderer's ground alignment offset.
    const bushCenterX = bushX + bushSize / 2;
    const bushCenterY = bushY + bushSize / 2 + (bushSize * this.bushGroundOffsetFactor);

    // Calculate adjusted hitbox sizes
    const playerHitboxSize = GAME_CONFIG.PLAYER_SIZE * this.playerHitboxScale;
    const bushHitboxSize = bushSize * this.bushHitboxScale;

    // Calculate hitbox bounds (AABB around centers)
    const playerLeft = playerX - playerHitboxSize / 2;
    const playerRight = playerX + playerHitboxSize / 2;
    const playerTop = playerY - playerHitboxSize / 2;
    const playerBottom = playerY + playerHitboxSize / 2;

    const bushLeft = bushCenterX - bushHitboxSize / 2;
    const bushRight = bushCenterX + bushHitboxSize / 2;
    const bushTop = bushCenterY - bushHitboxSize / 2;
    const bushBottom = bushCenterY + bushHitboxSize / 2;

    // AABB collision detection
    return !(playerRight <= bushLeft || 
             bushRight <= playerLeft || 
             playerBottom <= bushTop || 
             bushBottom <= playerTop);
  }

  /**
   * Get collision response for smooth movement
   * @param {number} playerX - Player X coordinate
   * @param {number} playerY - Player Y coordinate
   * @param {number} bushX - Bush X coordinate
   * @param {number} bushY - Bush Y coordinate
   * @param {number} bushSize - Bush size
   * @returns {object} Collision response {x, y, blocked}
   */
  getCollisionResponse(playerX, playerY, bushX, bushY, bushSize = GAME_CONFIG.TILE_SIZE) {
    if (!this.checkBushCollision(playerX, playerY, bushX, bushY, bushSize)) {
      return { x: playerX, y: playerY, blocked: false };
    }

    // Use bush visual center with ground offset for response vector
    const bushCenterX = bushX + bushSize / 2;
    const bushCenterY = bushY + bushSize / 2 + (bushSize * this.bushGroundOffsetFactor);

    // Calculate separation vector
    const dx = playerX - bushCenterX;
    const dy = playerY - bushCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
      // Player exactly on bush center, nudge diagonally
      return { x: playerX + 10, y: playerY + 10, blocked: true };
    }

    // Calculate minimum separation distance
    const playerHitboxRadius = (GAME_CONFIG.PLAYER_SIZE * this.playerHitboxScale) / 2;
    const bushHitboxRadius = (bushSize * this.bushHitboxScale) / 2;
    const minDistance = playerHitboxRadius + bushHitboxRadius + 2; // small buffer

    // Calculate push-back position
    const pushX = bushCenterX + (dx / distance) * minDistance;
    const pushY = bushCenterY + (dy / distance) * minDistance;

    return { x: pushX, y: pushY, blocked: true };
  }
}

// Singleton instance
export const enhancedBushCollisionSystem = new EnhancedBushCollisionSystem();