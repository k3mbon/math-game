// Seamless Terrain Assets Configuration for Kubo Games
// Enhanced terrain system with grass distribution, terrain textures, and obstacles

// Grass sprite assets (10 variants)
export const GRASS_SPRITES = {
  GRASS_1: '/assets/characters/terrain-object/Grass/1.png',
  GRASS_2: '/assets/characters/terrain-object/Grass/2.png',
  GRASS_3: '/assets/characters/terrain-object/Grass/3.png',
  GRASS_4: '/assets/characters/terrain-object/Grass/4.png',
  GRASS_5: '/assets/characters/terrain-object/Grass/5.png',
  GRASS_6: '/assets/characters/terrain-object/Grass/6.png',
  GRASS_7: '/assets/characters/terrain-object/Grass/7.png',
  GRASS_8: '/assets/characters/terrain-object/Grass/8.png',
  GRASS_9: '/assets/characters/terrain-object/Grass/9.png',
  GRASS_10: '/assets/characters/terrain-object/Grass/10.png'
};

// Terrain texture assets
export const TERRAIN_TEXTURES = {
  PRIMARY_GROUND: '/assets/terrain/1 Tiles/Map_tile_12.png',
  SEAMLESS_GRASS: '/assets/terrain/1 Tiles/Map_tile_12.png',
  WATER_FEATURES: '/assets/terrain/1 Tiles/Map_tile_02.png',
  SHORELINE_TRANSITION: '/assets/terrain/1 Tiles/Map_tile_28.png'
};

// Obstacle assets with vibrant colors
export const OBSTACLE_ASSETS = {
  ROCK: {
    asset: '/assets/characters/terrain-object/Rocks/3.png',
    vibrantColor: '#8B4513', // Saddle brown
    type: 'rock',
    walkable: false,
    collectible: false
  },
  BUSH: {
    asset: '/assets/characters/terrain-object/Bushes/2.png',
    vibrantColor: '#228B22', // Forest green
    type: 'bush',
    walkable: false,
    collectible: false
  },
  TREE: {
    asset: '/assets/characters/terrain-object/Trees/1.png',
    vibrantColor: '#2E7D32', // Dark green
    type: 'tree',
    walkable: false,
    collectible: false
  },
  CRYSTAL: {
    asset: '/assets/characters/terrain-object/Crystals/1.png',
    vibrantColor: '#9932CC', // Dark orchid
    type: 'crystal',
    walkable: true,
    collectible: true
  }
};

// Target assets
export const TARGET_ASSETS = {
  HOUSE: {
    asset: '/assets/characters/terrain-object/Houses/3.png',
    vibrantColor: '#FFD700', // Gold
    type: 'house',
    walkable: true,
    collectible: false
  }
};

// Seamless terrain configuration
export const SEAMLESS_TERRAIN_CONFIG = {
  // Grass distribution settings
  GRASS_DISTRIBUTION: {
    DENSITY: 0.35, // 35% chance of grass decoration per tile
    NATURAL_RANDOMIZATION: true,
    SEAMLESS_BORDERS: true,
    BLEND_MODE: 'multiply'
  },
  
  // Terrain texture settings
  TERRAIN_SETTINGS: {
    TILE_SIZE: 32,
    SEAMLESS_TRANSITIONS: true,
    ALPHA_BLENDING: true,
    SMOOTH_EDGES: true
  },
  
  // Obstacle placement settings
  OBSTACLE_SETTINGS: {
    ROCK_DENSITY: 0.08, // 8% chance
    BUSH_DENSITY: 0.10, // 10% chance
    TREE_DENSITY: 0.06, // 6% chance for trees
    CRYSTAL_DENSITY: 0.15, // 15% chance for crystals
    MIN_DISTANCE_FROM_PATH: 2,
    VIBRANT_BACKGROUNDS: true,
    ALPHA_BLENDING: true
  }
};

// Enhanced terrain types with seamless integration
export const SEAMLESS_TERRAIN_TYPES = {
  grass: {
    baseTexture: TERRAIN_TEXTURES.SEAMLESS_GRASS,
    decorations: Object.values(GRASS_SPRITES),
    walkable: true,
    collectible: false,
    seamless: true,
    blendMode: 'normal'
  },
  water: {
    baseTexture: TERRAIN_TEXTURES.WATER_FEATURES,
    decorations: [],
    walkable: false,
    collectible: false,
    seamless: true,
    blendMode: 'normal'
  },
  shoreline: {
    baseTexture: TERRAIN_TEXTURES.SHORELINE_TRANSITION,
    decorations: [],
    walkable: true,
    collectible: false,
    seamless: true,
    blendMode: 'overlay'
  }
};

// Natural randomization functions
export const getRandomGrassSprite = (seed = Math.random()) => {
  const grassAssets = Object.values(GRASS_SPRITES);
  const index = Math.floor(seed * grassAssets.length);
  return grassAssets[index];
};

// Get seamless grass terrain texture (always use Map_tile_12.png for consistency)
export const getVibrantTerrainTexture = (x, y) => {
  // Always return the seamless grass tile for uniform terrain
  return TERRAIN_TEXTURES.SEAMLESS_GRASS;
};

// Seeded random for consistent terrain generation
export const seededRandom = (x, y, seed = 12345) => {
  const combined = x * 374761393 + y * 668265263 + seed;
  const hash = Math.sin(combined) * 43758.5453;
  return hash - Math.floor(hash);
};

// Get grass sprite based on position for natural distribution
export const getPositionalGrassSprite = (x, y) => {
  const seed = seededRandom(x, y);
  return getRandomGrassSprite(seed);
};

// Check if position should have grass decoration
export const shouldHaveGrassDecoration = (x, y) => {
  const seed = seededRandom(x, y, 54321);
  return seed < SEAMLESS_TERRAIN_CONFIG.GRASS_DISTRIBUTION.DENSITY;
};

// Get obstacle type for position
export const getObstacleForPosition = (x, y) => {
  const rockSeed = seededRandom(x, y, 98765);
  const bushSeed = seededRandom(x, y, 13579);
  const treeSeed = seededRandom(x, y, 24680);
  
  if (rockSeed < SEAMLESS_TERRAIN_CONFIG.OBSTACLE_SETTINGS.ROCK_DENSITY) {
    return OBSTACLE_ASSETS.ROCK;
  }
  
  if (bushSeed < SEAMLESS_TERRAIN_CONFIG.OBSTACLE_SETTINGS.BUSH_DENSITY) {
    return OBSTACLE_ASSETS.BUSH;
  }
  
  if (treeSeed < SEAMLESS_TERRAIN_CONFIG.OBSTACLE_SETTINGS.TREE_DENSITY) {
    return OBSTACLE_ASSETS.TREE;
  }
  
  return null;
};

// Get exactly 3 crystal positions for each level, strategically placed for optimal pathfinding
export const getCrystalPositions = (width, height, startPos, targetPos, terrain = null) => {
  const crystalPositions = [];
  
  // Strategic placement approach: divide map into zones
  const zones = [
    { 
      // Zone 1: Early game area (closer to start)
      minX: Math.floor(width * 0.2), 
      maxX: Math.floor(width * 0.5),
      minY: Math.floor(height * 0.2), 
      maxY: Math.floor(height * 0.8)
    },
    { 
      // Zone 2: Mid game area (middle region)
      minX: Math.floor(width * 0.3), 
      maxX: Math.floor(width * 0.7),
      minY: Math.floor(height * 0.1), 
      maxY: Math.floor(height * 0.6)
    },
    { 
      // Zone 3: End game area (closer to target but not adjacent)
      minX: Math.floor(width * 0.5), 
      maxX: Math.floor(width * 0.8),
      minY: Math.floor(height * 0.3), 
      maxY: Math.floor(height * 0.9)
    }
  ];
  
  // Try to place one crystal in each zone
  for (let zoneIndex = 0; zoneIndex < zones.length && crystalPositions.length < 3; zoneIndex++) {
    const zone = zones[zoneIndex];
    const maxAttempts = 50; // Per zone attempts
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const x = Math.floor(Math.random() * (zone.maxX - zone.minX)) + zone.minX;
      const y = Math.floor(Math.random() * (zone.maxY - zone.minY)) + zone.minY;
      
      // Ensure within bounds
      if (x < 0 || x >= width || y < 0 || y >= height) {
        attempts++;
        continue;
      }
      
      // Avoid start and target positions
      const isStart = x === startPos.x && y === startPos.y;
      const isTarget = x === targetPos.x && y === targetPos.y;
      const isNearStart = Math.abs(x - startPos.x) <= 1 && Math.abs(y - startPos.y) <= 1;
      const isNearTarget = Math.abs(x - targetPos.x) <= 1 && Math.abs(y - targetPos.y) <= 1;
      
      // Check if position is not already taken
      const alreadyExists = crystalPositions.some(pos => pos.x === x && pos.y === y);
      
      // Ensure minimum distance between crystals for better distribution
      const minCrystalDistance = Math.max(2, Math.floor(Math.min(width, height) / 4));
      const tooCloseToOther = crystalPositions.some(pos => 
        Math.abs(pos.x - x) + Math.abs(pos.y - y) < minCrystalDistance
      );
      
      // Check for obstacles and terrain type if terrain data is available
      let isObstaclePosition = false;
      let isWaterPosition = false;
      
      if (terrain && terrain[y] && terrain[y][x]) {
        const tile = terrain[y][x];
        isWaterPosition = tile.type === 'water' || !tile.walkable;
        
        // Check for existing obstacles (rocks, bushes, trees)
        const obstacle = getObstacleForPosition(x, y);
        if (obstacle && !obstacle.walkable) {
          isObstaclePosition = true;
        }
      }
      
      if (!isStart && !isTarget && !isNearStart && !isNearTarget && 
          !alreadyExists && !tooCloseToOther && !isObstaclePosition && !isWaterPosition) {
        crystalPositions.push({ x, y });
        break; // Found valid position for this zone
      }
      
      attempts++;
    }
  }
  
  // Fallback: fill remaining spots with strategic placement
  const maxFallbackAttempts = width * height;
  let fallbackAttempts = 0;
  
  while (crystalPositions.length < 3 && fallbackAttempts < maxFallbackAttempts) {
    // Use a more systematic approach for fallback
    const x = (fallbackAttempts % width);
    const y = Math.floor(fallbackAttempts / width);
    
    // Avoid start and target positions
    const isStart = x === startPos.x && y === startPos.y;
    const isTarget = x === targetPos.x && y === targetPos.y;
    const isNearStart = Math.abs(x - startPos.x) <= 1 && Math.abs(y - startPos.y) <= 1;
    const isNearTarget = Math.abs(x - targetPos.x) <= 1 && Math.abs(y - targetPos.y) <= 1;
    
    // Check if position is not already taken
    const alreadyExists = crystalPositions.some(pos => pos.x === x && pos.y === y);
    
    // Check for obstacles and terrain type if terrain data is available
    let isObstaclePosition = false;
    let isWaterPosition = false;
    
    if (terrain && terrain[y] && terrain[y][x]) {
      const tile = terrain[y][x];
      isWaterPosition = tile.type === 'water' || !tile.walkable;
      
      // Check for existing obstacles (rocks, bushes, trees)
      const obstacle = getObstacleForPosition(x, y);
      if (obstacle && !obstacle.walkable) {
        isObstaclePosition = true;
      }
    }
    
    if (!isStart && !isTarget && !isNearStart && !isNearTarget && 
        !alreadyExists && !isObstaclePosition && !isWaterPosition) {
      crystalPositions.push({ x, y });
    }
    
    fallbackAttempts++;
  }
  
  // Final safety check: ensure we have exactly 3 crystals
  // Force placement in completely safe areas if needed
  while (crystalPositions.length < 3) {
    const safeX = Math.max(2, Math.min(width - 3, Math.floor(Math.random() * (width - 4)) + 2));
    const safeY = Math.max(2, Math.min(height - 3, Math.floor(Math.random() * (height - 4)) + 2));
    
    const alreadyExists = crystalPositions.some(pos => pos.x === safeX && pos.y === safeY);
    const isStart = safeX === startPos.x && safeY === startPos.y;
    const isTarget = safeX === targetPos.x && safeY === targetPos.y;
    
    if (!alreadyExists && !isStart && !isTarget) {
      crystalPositions.push({ x: safeX, y: safeY });
    }
  }
  
  return crystalPositions.slice(0, 3); // Ensure exactly 3
};

// Terrain transition detection
export const getTerrainTransition = (currentTerrain, neighborTerrain) => {
  if (currentTerrain === 'grass' && neighborTerrain === 'water') {
    return 'shoreline';
  }
  if (currentTerrain === 'water' && neighborTerrain === 'grass') {
    return 'shoreline';
  }
  return currentTerrain;
};

// Seamless tile blending configuration
export const BLEND_MODES = {
  NORMAL: 'source-over',
  MULTIPLY: 'multiply',
  OVERLAY: 'overlay',
  SOFT_LIGHT: 'soft-light',
  HARD_LIGHT: 'hard-light'
};

export default {
  GRASS_SPRITES,
  TERRAIN_TEXTURES,
  OBSTACLE_ASSETS,
  TARGET_ASSETS,
  SEAMLESS_TERRAIN_CONFIG,
  SEAMLESS_TERRAIN_TYPES,
  getRandomGrassSprite,
  getVibrantTerrainTexture,
  getPositionalGrassSprite,
  shouldHaveGrassDecoration,
  getObstacleForPosition,
  getCrystalPositions,
  getTerrainTransition,
  seededRandom
};