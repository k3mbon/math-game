// Enhanced Terrain Generator with Pixel Assets and Seamless Tile Arrangements
import { 
  ENHANCED_TERRAIN_TYPES, 
  PIXEL_TERRAIN_CATEGORIES,
  getRandomTileFromCategory,
  getPixelTileAsset,
  getTransitionTile,
  TILE_TO_CATEGORY
} from './pixelTerrainAssets.js';

// Enhanced terrain generation with seamless transitions
export class EnhancedTerrainGenerator {
  constructor() {
    this.terrainCache = new Map();
    this.transitionCache = new Map();
  }

  // Generate enhanced terrain with pixel assets and seamless transitions
  generateEnhancedTerrain(width, height, startPos, targetPos, options = {}) {
    const {
      useTransitions = true,
      biomeSize = 3,
      transitionWidth = 1,
      ensurePath = true
    } = options;

    let terrain;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      terrain = this.createBaseTerrain(width, height, startPos, targetPos, {
        biomeSize,
        useTransitions,
        transitionWidth
      });
      attempts++;
    } while (ensurePath && !this.hasValidPath(terrain, startPos, targetPos, width, height) && attempts < maxAttempts);

    // Fallback: create guaranteed path if needed
    if (ensurePath && attempts >= maxAttempts) {
      terrain = this.createGuaranteedPathTerrain(width, height, startPos, targetPos);
    }

    return terrain;
  }

  // Create base terrain with biome-based generation
  createBaseTerrain(width, height, startPos, targetPos, options) {
    const { biomeSize, useTransitions, transitionWidth } = options;
    const terrain = Array(height).fill().map(() => Array(width).fill(null));

    // Generate biome map first
    const biomeMap = this.generateBiomeMap(width, height, biomeSize);

    // Fill terrain based on biomes
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const biome = biomeMap[y][x];
        
        // Ensure start and target positions are always walkable
        if ((x === startPos.x && y === startPos.y) || (x === targetPos.x && y === targetPos.y)) {
          terrain[y][x] = this.createTerrainTile('grass', x, y);
          continue;
        }

        // Check for transitions if enabled
        if (useTransitions) {
          const transitionTile = this.checkForTransition(biomeMap, x, y, transitionWidth);
          if (transitionTile) {
            terrain[y][x] = transitionTile;
            continue;
          }
        }

        // Generate terrain based on biome
        terrain[y][x] = this.generateBiomeTerrain(biome, x, y);
      }
    }

    return terrain;
  }

  // Generate biome map for terrain variety
  generateBiomeMap(width, height, biomeSize) {
    const biomes = ['grassland', 'wetland', 'frozen', 'volcanic', 'rocky'];
    const biomeMap = Array(height).fill().map(() => Array(width).fill(null));

    // Create biome regions
    for (let y = 0; y < height; y += biomeSize) {
      for (let x = 0; x < width; x += biomeSize) {
        const biome = biomes[Math.floor(Math.random() * biomes.length)];
        
        // Fill biome region
        for (let by = y; by < Math.min(y + biomeSize, height); by++) {
          for (let bx = x; bx < Math.min(x + biomeSize, width); bx++) {
            biomeMap[by][bx] = biome;
          }
        }
      }
    }

    return biomeMap;
  }

  // Generate terrain based on biome type
  generateBiomeTerrain(biome, x, y) {
    const seed = x * 0.1 + y * 0.1;
    const noise = Math.sin(seed) * Math.cos(seed * 1.5);
    
    switch (biome) {
      case 'grassland':
        if (noise > 0.7) return this.createTerrainTile('tree', x, y);
        if (noise > 0.5) return this.createTerrainTile('bush', x, y);
        if (noise > -0.3) return this.createTerrainTile('grass', x, y);
        return this.createTerrainTile('crystal', x, y);

      case 'wetland':
        if (noise > 0.3) return this.createTerrainTile('water', x, y);
        if (noise > 0.0) return this.createTerrainTile('shore', x, y);
        return this.createTerrainTile('grass', x, y);

      case 'frozen':
        if (noise > 0.5) return this.createTerrainTile('ice', x, y);
        if (noise > 0.0) return this.createTerrainTile('rock', x, y);
        return this.createTerrainTile('grass', x, y);

      case 'volcanic':
        if (noise > 0.6) return this.createTerrainTile('lava', x, y);
        if (noise > 0.2) return this.createTerrainTile('rock', x, y);
        return this.createTerrainTile('dirt', x, y);

      case 'rocky':
        if (noise > 0.4) return this.createTerrainTile('rock', x, y);
        if (noise > 0.0) return this.createTerrainTile('dirt', x, y);
        return this.createTerrainTile('grass', x, y);

      default:
        return this.createTerrainTile('grass', x, y);
    }
  }

  // Check for terrain transitions between different biomes
  checkForTransition(biomeMap, x, y, transitionWidth) {
    const currentBiome = biomeMap[y][x];
    const height = biomeMap.length;
    const width = biomeMap[0].length;

    // Check neighboring cells for different biomes
    for (let dy = -transitionWidth; dy <= transitionWidth; dy++) {
      for (let dx = -transitionWidth; dx <= transitionWidth; dx++) {
        const ny = y + dy;
        const nx = x + dx;
        
        if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
          const neighborBiome = biomeMap[ny][nx];
          if (neighborBiome !== currentBiome) {
            return this.createTransitionTile(currentBiome, neighborBiome, x, y);
          }
        }
      }
    }

    return null;
  }

  // Create transition tile between two biomes
  createTransitionTile(fromBiome, toBiome, x, y) {
    const fromCategory = this.biomeToCategory(fromBiome);
    const toCategory = this.biomeToCategory(toBiome);
    
    const transitionTileNum = getTransitionTile(fromCategory, toCategory);
    const terrainConfig = ENHANCED_TERRAIN_TYPES.shore; // Use shore as default transition
    
    return {
      type: 'shore',
      asset: getPixelTileAsset(transitionTileNum),
      walkable: true,
      collectible: false,
      x: x,
      y: y,
      tileNumber: transitionTileNum,
      category: 'SHORE',
      color: terrainConfig.color
    };
  }

  // Map biome to terrain category
  biomeToCategory(biome) {
    const mapping = {
      grassland: 'GRASS',
      wetland: 'WATER',
      frozen: 'ICE',
      volcanic: 'LAVA',
      rocky: 'ROCK'
    };
    return mapping[biome] || 'GRASS';
  }

  // Create terrain tile with pixel asset
  createTerrainTile(terrainType, x, y) {
    const terrainConfig = ENHANCED_TERRAIN_TYPES[terrainType] || ENHANCED_TERRAIN_TYPES.grass;
    const tileNumber = getRandomTileFromCategory(terrainConfig.category);
    
    return {
      type: terrainType,
      asset: getPixelTileAsset(tileNumber),
      walkable: terrainConfig.walkable,
      collectible: terrainConfig.collectible || false,
      x: x,
      y: y,
      tileNumber: tileNumber,
      category: terrainConfig.category,
      color: terrainConfig.color
    };
  }

  // Create guaranteed path terrain for fallback
  createGuaranteedPathTerrain(width, height, startPos, targetPos) {
    const terrain = Array(height).fill().map(() => Array(width).fill(null));
    
    // Fill with base terrain
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        terrain[y][x] = this.createTerrainTile('grass', x, y);
      }
    }

    // Create guaranteed L-shaped path
    const pathCells = new Set();
    let currentX = startPos.x;
    let currentY = startPos.y;

    // Horizontal path
    while (currentX !== targetPos.x) {
      pathCells.add(`${currentX},${currentY}`);
      if (currentX < targetPos.x) currentX++;
      else currentX--;
    }

    // Vertical path
    while (currentY !== targetPos.y) {
      pathCells.add(`${currentX},${currentY}`);
      if (currentY < targetPos.y) currentY++;
      else currentY--;
    }
    pathCells.add(`${targetPos.x},${targetPos.y}`);

    // Ensure path is walkable
    pathCells.forEach(cell => {
      const [x, y] = cell.split(',').map(Number);
      terrain[y][x] = this.createTerrainTile('grass', x, y);
    });

    // Add some obstacles away from path
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cellKey = `${x},${y}`;
        if (!pathCells.has(cellKey) && Math.random() < 0.3) {
          const obstacleTypes = ['tree', 'rock', 'water'];
          const obstacleType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          terrain[y][x] = this.createTerrainTile(obstacleType, x, y);
        }
      }
    }

    return terrain;
  }

  // Check if valid path exists (simplified pathfinding)
  hasValidPath(terrain, startPos, targetPos, width, height) {
    const visited = new Set();
    const queue = [startPos];
    
    while (queue.length > 0) {
      const current = queue.shift();
      const key = `${current.x},${current.y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      if (current.x === targetPos.x && current.y === targetPos.y) {
        return true;
      }
      
      // Check adjacent cells
      const directions = [{x: 0, y: 1}, {x: 1, y: 0}, {x: 0, y: -1}, {x: -1, y: 0}];
      
      for (const dir of directions) {
        const newX = current.x + dir.x;
        const newY = current.y + dir.y;
        
        if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
          const terrainTile = terrain[newY][newX];
          if (terrainTile && terrainTile.walkable) {
            queue.push({x: newX, y: newY});
          }
        }
      }
    }
    
    return false;
  }

  // Convert enhanced terrain to legacy format for compatibility
  convertToLegacyFormat(enhancedTerrain) {
    return enhancedTerrain.map(row => 
      row.map(tile => tile ? tile.type : 'grass')
    );
  }

  // Get terrain tile info for rendering
  getTerrainTileInfo(terrain, x, y) {
    if (!terrain[y] || !terrain[y][x]) {
      return this.createTerrainTile('grass', x, y);
    }
    return terrain[y][x];
  }
}

// Export singleton instance
export const enhancedTerrainGenerator = new EnhancedTerrainGenerator();

// Legacy compatibility functions
export const generateEnhancedTerrain = (width, height, startPos, targetPos, options) => {
  return enhancedTerrainGenerator.generateEnhancedTerrain(width, height, startPos, targetPos, options);
};

export const convertToLegacyTerrain = (enhancedTerrain) => {
  return enhancedTerrainGenerator.convertToLegacyFormat(enhancedTerrain);
};