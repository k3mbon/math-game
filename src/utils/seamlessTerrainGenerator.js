// Seamless Terrain Generator for Kubo Games
// Implements grass distribution, terrain textures, obstacles, and seamless borders

import {
  GRASS_SPRITES,
  TERRAIN_TEXTURES,
  OBSTACLE_ASSETS,
  TARGET_ASSETS,
  SEAMLESS_TERRAIN_CONFIG,
  SEAMLESS_TERRAIN_TYPES,
  getPositionalGrassSprite,
  shouldHaveGrassDecoration,
  getObstacleForPosition,
  getCrystalPositions,
  getTerrainTransition,
  getVibrantTerrainTexture,
  seededRandom
} from './seamlessTerrainAssets.js';

export class SeamlessTerrainGenerator {
  constructor() {
    this.terrainCache = new Map();
    this.grassCache = new Map();
    this.obstacleCache = new Map();
  }

  // Generate seamless terrain with all features
  generateSeamlessTerrain(width, height, startPos, targetPos, options = {}) {
    const {
      useWaterFeatures = true,
      grassDensity = SEAMLESS_TERRAIN_CONFIG.GRASS_DISTRIBUTION.DENSITY,
      obstacleEnabled = true,
      ensurePath = true,
      crystalCount = 3 // Always exactly 3 crystals per level
    } = options;

    // Ensure spawn point is walkable
    const safeStartPos = this.findNearestWalkablePosition(width, height, startPos);
    
    // Create base terrain grid
    const terrain = this.createBaseTerrainGrid(width, height, safeStartPos, targetPos, useWaterFeatures);
    
    // Add seamless grass distribution
    this.addSeamlessGrassDistribution(terrain, width, height, grassDensity);
    
    // Get crystal positions AFTER terrain is created to avoid obstacles
    const crystalPositions = getCrystalPositions(width, height, safeStartPos, targetPos, terrain);
    
    // Add obstacles with vibrant colors (rocks, bushes, trees) - avoid crystal positions
    if (obstacleEnabled) {
      this.addObstaclesWithVibrantColors(terrain, width, height, safeStartPos, targetPos, crystalPositions);
    }
    
    // Add exactly 3 crystals for collection (after obstacles are placed)
    this.addCrystalsForCollection(terrain, width, height, safeStartPos, targetPos, crystalPositions);
    
    // Apply seamless transitions
    this.applySeamlessTransitions(terrain, width, height);
    
    // Ensure path exists if required (including crystal collection)
    if (ensurePath) {
      this.ensureWalkablePathWithCrystals(terrain, width, height, safeStartPos, targetPos);
    }

    return terrain;
  }

  // Create base terrain grid with primary textures
  createBaseTerrainGrid(width, height, startPos, targetPos, useWaterFeatures) {
    const terrain = Array(height).fill().map(() => Array(width).fill(null));
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let terrainType = 'grass';
        
        // Add water features using noise-based generation
        if (useWaterFeatures) {
          const waterNoise = this.generateWaterNoise(x, y, width, height);
          if (waterNoise > 0.7) {
            terrainType = 'water';
          }
        }
        
        // Ensure start and target positions are always walkable grass
        if ((x === startPos.x && y === startPos.y) || (x === targetPos.x && y === targetPos.y)) {
          terrainType = 'grass';
        }
        
        terrain[y][x] = this.createSeamlessTerrainTile(terrainType, x, y);
      }
    }
    
    return terrain;
  }

  // Generate water noise for natural water placement
  generateWaterNoise(x, y, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
    const normalizedDistance = distance / maxDistance;
    
    // Use multiple octaves of noise for natural water placement
    const noise1 = seededRandom(x * 0.1, y * 0.1, 12345);
    const noise2 = seededRandom(x * 0.05, y * 0.05, 54321);
    const noise3 = seededRandom(x * 0.2, y * 0.2, 98765);
    
    const combinedNoise = (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2);
    
    // Bias towards edges for water placement
    return combinedNoise * (1 - normalizedDistance * 0.5);
  }

  // Add seamless grass distribution across terrain
  addSeamlessGrassDistribution(terrain, width, height, density) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = terrain[y][x];
        
        // Only add grass decorations to grass terrain
        if (tile.type === 'grass' && shouldHaveGrassDecoration(x, y)) {
          const grassSprite = getPositionalGrassSprite(x, y);
          
          if (!tile.decorations) {
            tile.decorations = [];
          }
          
          tile.decorations.push({
            type: 'grass',
            asset: grassSprite,
            opacity: 0.8,
            blendMode: 'multiply',
            seamless: true
          });
        }
      }
    }
  }

  // Add obstacles with vibrant background colors
  addObstaclesWithVibrantColors(terrain, width, height, startPos, targetPos, crystalPositions = []) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = terrain[y][x];
        
        // Skip if this position is reserved for crystals
        const isCrystalPosition = crystalPositions.some(pos => pos.x === x && pos.y === y);
        if (isCrystalPosition) continue;
        
        // Only add obstacles to walkable grass terrain
        if (tile.type === 'grass' && tile.walkable) {
          // Check minimum distance from start and target positions
          const distanceFromStart = Math.abs(x - startPos.x) + Math.abs(y - startPos.y);
          const distanceFromTarget = Math.abs(x - targetPos.x) + Math.abs(y - targetPos.y);
          const minDistance = SEAMLESS_TERRAIN_CONFIG.OBSTACLE_SETTINGS.MIN_DISTANCE_FROM_PATH;
          
          if (distanceFromStart > minDistance && distanceFromTarget > minDistance) {
            const obstacle = getObstacleForPosition(x, y);
            
            if (obstacle) {
              tile.obstacle = {
                type: obstacle.type,
                asset: obstacle.asset,
                vibrantColor: obstacle.vibrantColor,
                walkable: obstacle.walkable,
                collectible: obstacle.collectible,
                alphaBlending: true,
                seamless: true
              };
              
              // Make tile unwalkable if obstacle blocks movement
              if (!obstacle.walkable) {
                tile.walkable = false;
              }
            }
          }
        }
      }
    }
  }

  // Apply seamless transitions between terrain types
  applySeamlessTransitions(terrain, width, height) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = terrain[y][x];
        const neighbors = this.getNeighbors(terrain, x, y, width, height);
        
        // Check for terrain transitions
        const hasWaterNeighbor = neighbors.some(neighbor => neighbor && neighbor.type === 'water');
        const hasGrassNeighbor = neighbors.some(neighbor => neighbor && neighbor.type === 'grass');
        
        // Apply shoreline transition
        if (tile.type === 'grass' && hasWaterNeighbor) {
          tile.transition = {
            type: 'shoreline',
            asset: TERRAIN_TEXTURES.SHORELINE_TRANSITION,
            blendMode: 'overlay',
            opacity: 0.7,
            seamless: true
          };
        }
        
        // Remove grid borders by applying seamless blending
        tile.seamlessBorders = true;
        tile.borderRadius = 0;
        tile.smoothEdges = true;
      }
    }
  }

  // Get neighboring tiles for transition detection
  getNeighbors(terrain, x, y, width, height) {
    const neighbors = [];
    const directions = [
      [-1, -1], [0, -1], [1, -1],
      [-1, 0],           [1, 0],
      [-1, 1],  [0, 1],  [1, 1]
    ];
    
    directions.forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        neighbors.push(terrain[ny][nx]);
      } else {
        neighbors.push(null);
      }
    });
    
    return neighbors;
  }

  // Ensure walkable path exists between start and target
  ensureWalkablePath(terrain, width, height, startPos, targetPos) {
    const path = this.findPath(terrain, width, height, startPos, targetPos);
    
    if (!path || path.length === 0) {
      // Create guaranteed L-shaped path
      this.createGuaranteedPath(terrain, startPos, targetPos);
    }
  }

  // Create guaranteed walkable path
  createGuaranteedPath(terrain, startPos, targetPos) {
    const pathCells = [];
    let currentX = startPos.x;
    let currentY = startPos.y;
    
    // Horizontal path
    while (currentX !== targetPos.x) {
      pathCells.push({ x: currentX, y: currentY });
      currentX += currentX < targetPos.x ? 1 : -1;
    }
    
    // Vertical path
    while (currentY !== targetPos.y) {
      pathCells.push({ x: currentX, y: currentY });
      currentY += currentY < targetPos.y ? 1 : -1;
    }
    
    pathCells.push({ x: targetPos.x, y: targetPos.y });
    
    // Make path tiles walkable
    pathCells.forEach(({ x, y }) => {
      if (terrain[y] && terrain[y][x]) {
        terrain[y][x].walkable = true;
        terrain[y][x].type = 'grass';
        terrain[y][x].baseTexture = TERRAIN_TEXTURES.PRIMARY_GROUND;
        
        // Remove obstacles from path
        if (terrain[y][x].obstacle) {
          delete terrain[y][x].obstacle;
        }
      }
    });
  }

  // Simple pathfinding to check if path exists
  findPath(terrain, width, height, startPos, targetPos) {
    const visited = new Set();
    const queue = [{ x: startPos.x, y: startPos.y, path: [] }];
    
    while (queue.length > 0) {
      const { x, y, path } = queue.shift();
      const key = `${x},${y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      if (x === targetPos.x && y === targetPos.y) {
        return [...path, { x, y }];
      }
      
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      
      directions.forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const tile = terrain[ny][nx];
          if (tile && tile.walkable && !visited.has(`${nx},${ny}`)) {
            queue.push({
              x: nx,
              y: ny,
              path: [...path, { x, y }]
            });
          }
        }
      });
    }
    
    return null;
  }

  // Create seamless terrain tile
  createSeamlessTerrainTile(terrainType, x, y) {
    const terrainConfig = SEAMLESS_TERRAIN_TYPES[terrainType] || SEAMLESS_TERRAIN_TYPES.grass;
    
    // Use vibrant terrain texture for grass tiles
    let baseTexture = terrainConfig.baseTexture;
    if (terrainType === 'grass') {
      baseTexture = getVibrantTerrainTexture(x, y);
    }
    
    return {
      type: terrainType,
      baseTexture: baseTexture,
      walkable: terrainConfig.walkable,
      collectible: terrainConfig.collectible,
      seamless: terrainConfig.seamless,
      blendMode: terrainConfig.blendMode,
      x: x,
      y: y,
      decorations: [],
      alphaBlending: true,
      smoothTransitions: true,
      seamlessBorders: true
    };
  }

  // Find nearest walkable position for safe spawning
  findNearestWalkablePosition(width, height, pos) {
    // Start with the original position
    const queue = [pos];
    const visited = new Set();
    
    while (queue.length > 0) {
      const current = queue.shift();
      const key = `${current.x},${current.y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      // Check bounds
      if (current.x >= 0 && current.x < width && current.y >= 0 && current.y < height) {
        // This position is valid and within bounds - we'll make it walkable
        return current;
      }
      
      // Add adjacent positions to search
      const adjacent = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];
      
      queue.push(...adjacent);
    }
    
    // Fallback to center if no walkable position found
    return { x: Math.floor(width / 2), y: Math.floor(height / 2) };
  }

  // Add crystals for collection with strategic placement
  addCrystalsForCollection(terrain, width, height, startPos, targetPos, crystalPositions) {
    const validatedPositions = [];
    
    crystalPositions.forEach(pos => {
      if (pos.x >= 0 && pos.x < width && pos.y >= 0 && pos.y < height) {
        const tile = terrain[pos.y][pos.x];
        
        // Double-check that this position is safe for crystal placement
        const isWalkable = tile.walkable && tile.type !== 'water';
        const hasNoObstacle = !tile.obstacle || tile.obstacle.walkable;
        
        if (isWalkable && hasNoObstacle) {
          // Ensure tile is walkable grass terrain and add crystal
          tile.type = 'grass';
          tile.walkable = true;
          tile.obstacle = {
            ...OBSTACLE_ASSETS.CRYSTAL,
            position: pos
          };
          tile.collectible = true;
          validatedPositions.push(pos);
        }
      }
    });
    
    // If we don't have enough valid positions, find new safe ones
    while (validatedPositions.length < 3) {
      const newPos = this.findSafeCrystalPosition(terrain, width, height, startPos, targetPos, validatedPositions);
      if (newPos) {
        const tile = terrain[newPos.y][newPos.x];
        tile.type = 'grass';
        tile.walkable = true;
        tile.obstacle = {
          ...OBSTACLE_ASSETS.CRYSTAL,
          position: newPos
        };
        tile.collectible = true;
        validatedPositions.push(newPos);
      } else {
        break; // Prevent infinite loop if no safe positions found
      }
    }
  }

  // Find a safe position for crystal placement
  findSafeCrystalPosition(terrain, width, height, startPos, targetPos, existingPositions) {
    const maxAttempts = width * height;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      
      // Check if position is safe
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const tile = terrain[y][x];
        const isStart = x === startPos.x && y === startPos.y;
        const isTarget = x === targetPos.x && y === targetPos.y;
        const isNearStart = Math.abs(x - startPos.x) <= 1 && Math.abs(y - startPos.y) <= 1;
        const isNearTarget = Math.abs(x - targetPos.x) <= 1 && Math.abs(y - targetPos.y) <= 1;
        const alreadyExists = existingPositions.some(pos => pos.x === x && pos.y === y);
        
        const isWalkable = tile.walkable && tile.type === 'grass';
        const hasNoObstacle = !tile.obstacle || tile.obstacle.walkable;
        
        if (!isStart && !isTarget && !isNearStart && !isNearTarget && !alreadyExists && isWalkable && hasNoObstacle) {
          return { x, y };
        }
      }
      
      attempts++;
    }
    
    return null; // No safe position found
  }

  // Ensure walkable path exists including crystal collection
  ensureWalkablePathWithCrystals(terrain, width, height, startPos, targetPos) {
    // First ensure basic path from start to target
    this.ensureWalkablePath(terrain, width, height, startPos, targetPos);
    
    // Find all crystal positions
    const crystalPositions = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = terrain[y][x];
        if (tile.obstacle && tile.obstacle.type === 'crystal') {
          crystalPositions.push({ x, y });
        }
      }
    }
    
    // Ensure path from start to at least one crystal, then to target
    if (crystalPositions.length > 0) {
      // Find the closest crystal to start position
      let closestCrystal = crystalPositions[0];
      let minDistance = this.getDistance(startPos, closestCrystal);
      
      crystalPositions.forEach(crystal => {
        const distance = this.getDistance(startPos, crystal);
        if (distance < minDistance) {
          minDistance = distance;
          closestCrystal = crystal;
        }
      });
      
      // Ensure path: start -> closest crystal -> target
      this.ensureWalkablePath(terrain, width, height, startPos, closestCrystal);
      this.ensureWalkablePath(terrain, width, height, closestCrystal, targetPos);
    }
  }

  // Calculate distance between two points
  getDistance(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }

  // Convert to legacy format for compatibility
  convertToLegacyFormat(seamlessTerrain) {
    return seamlessTerrain.map(row => 
      row.map(tile => {
        const legacyType = tile.type === 'water' ? 'water' : 'grass';
        return legacyType;
      })
    );
  }
}

// Export singleton instance
export const seamlessTerrainGenerator = new SeamlessTerrainGenerator();

export default seamlessTerrainGenerator;