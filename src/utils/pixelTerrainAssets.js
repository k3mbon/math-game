// Pixel Terrain Assets Mapping System
// Maps the 143 pixel terrain tiles to terrain types and categories

// Base path for pixel terrain assets
const PIXEL_TERRAIN_BASE_PATH = '/assets/terrain/1 Tiles';

// Enhanced grass decoration assets with improved scale and proportions
export const GRASS_ASSETS = {
  GRASS_1: '/assets/terrain_tileset/grass1.png',
  GRASS_2: '/assets/terrain_tileset/grass2.png',
  GRASS_3: '/assets/terrain_tileset/grass3.png',
  GRASS_4: '/assets/terrain_tileset/grass4.png',
  GRASS_5: '/assets/terrain_tileset/grass5.png',
  GRASS_6: '/assets/terrain_tileset/grass6.png',
  GRASS_7: '/assets/terrain_tileset/grass7.png',
  GRASS_8: '/assets/terrain_tileset/grass8.png',
  GRASS_9: '/assets/terrain_tileset/grass9.png',
};

// Function to get random grass decoration asset
export const getRandomGrassAsset = (seed) => {
  const grassKeys = Object.keys(GRASS_ASSETS);
  if (seed !== undefined) {
    // Use seed for deterministic selection
    const index = seed % grassKeys.length;
    return GRASS_ASSETS[grassKeys[index]];
  }
  // Fallback to random selection if no seed provided
  const randomKey = grassKeys[Math.floor(Math.random() * grassKeys.length)];
  return GRASS_ASSETS[randomKey];
};

// Legacy layout dimensions extracted from OpenWorldGame.jsx
export const LEGACY_LAYOUT_DIMENSIONS = {
  // Canvas dimensions from gameConfig.js
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  // Tile and world sizing
  TILE_SIZE: 50,
  WORLD_SIZE: 300, // tiles
  
  // Viewport and responsive constraints
  VIEWPORT_CONSTRAINTS: {
    // Desktop layout (>992px)
    DESKTOP: {
      availableWidth: 'calc(100vw - 320px)', // Account for controls
      availableHeight: 'calc(100vh - 160px)', // Account for programming section
      minMargin: 20
    },
    // Tablet layout (768px - 991px)
    TABLET: {
      availableWidth: 'calc(100vw - 250px)',
      availableHeight: 'calc(100vh - 140px)',
      minMargin: 18
    },
    // Mobile layout (<768px)
    MOBILE: {
      availableWidth: 'calc(100vw - 40px)',
      availableHeight: 'calc(100vh - 300px)',
      minMargin: 16
    }
  },
  
  // Game world boundaries
  WORLD_BOUNDARIES: {
    minX: 0,
    minY: 0,
    maxX: 300 * 50, // WORLD_SIZE * TILE_SIZE
    maxY: 300 * 50,
    grassBoundaryWidth: 3 // tiles
  }
};

// Grass Border Pattern Mapping System with enhanced proportions
// Maps exact positions to specific grass tiles for border pattern
export const GRASS_BORDER_MAPPING = {
  // Corner tiles - optimized for seamless transitions
  TOP_LEFT: '/assets/terrain_tileset/grass1.png',      // grass1.png
  TOP_RIGHT: '/assets/terrain_tileset/grass3.png',     // grass3.png
  BOTTOM_LEFT: '/assets/terrain_tileset/grass7.png',   // grass7.png
  BOTTOM_RIGHT: '/assets/terrain_tileset/grass9.png',  // grass9.png
  
  // Edge pieces (between corners) - enhanced for visual consistency
  TOP_EDGE: '/assets/terrain_tileset/grass2.png',      // grass2.png (between top corners)
  BOTTOM_EDGE: '/assets/terrain_tileset/grass8.png',   // grass8.png (between bottom corners)
  LEFT_EDGE: '/assets/terrain_tileset/grass4.png',     // grass4.png (between left corners)
  RIGHT_EDGE: '/assets/terrain_tileset/grass6.png',    // grass6.png (between right corners)
  
  // Center fill - maintains original scale
  CENTER: '/assets/terrain_tileset/grass5.png'         // grass5.png (center fill)
};

// Enhanced function to get the correct grass tile based on grid position
// Now respects legacy layout proportions and maintains visual consistency
export const getGrassTileByPosition = (x, y, gridWidth, gridHeight) => {
  // Apply legacy layout scaling for proper proportions
  const scaledGridWidth = Math.max(gridWidth, LEGACY_LAYOUT_DIMENSIONS.CANVAS_WIDTH / LEGACY_LAYOUT_DIMENSIONS.TILE_SIZE);
  const scaledGridHeight = Math.max(gridHeight, LEGACY_LAYOUT_DIMENSIONS.CANVAS_HEIGHT / LEGACY_LAYOUT_DIMENSIONS.TILE_SIZE);
  
  // Corner positions with enhanced boundary detection
  if (x === 0 && y === 0) {
    return GRASS_BORDER_MAPPING.TOP_LEFT;        // grass1.png
  }
  if (x === scaledGridWidth - 1 && y === 0) {
    return GRASS_BORDER_MAPPING.TOP_RIGHT;       // grass3.png
  }
  if (x === 0 && y === scaledGridHeight - 1) {
    return GRASS_BORDER_MAPPING.BOTTOM_LEFT;     // grass7.png
  }
  if (x === scaledGridWidth - 1 && y === scaledGridHeight - 1) {
    return GRASS_BORDER_MAPPING.BOTTOM_RIGHT;    // grass9.png
  }
  
  // Edge positions with improved alignment
  if (y === 0) {
    return GRASS_BORDER_MAPPING.TOP_EDGE;        // grass2.png (top edge)
  }
  if (y === scaledGridHeight - 1) {
    return GRASS_BORDER_MAPPING.BOTTOM_EDGE;     // grass8.png (bottom edge)
  }
  if (x === 0) {
    return GRASS_BORDER_MAPPING.LEFT_EDGE;       // grass4.png (left edge)
  }
  if (x === scaledGridWidth - 1) {
    return GRASS_BORDER_MAPPING.RIGHT_EDGE;      // grass6.png (right edge)
  }
  
  // Center fill with enhanced pattern variation
  return GRASS_BORDER_MAPPING.CENTER;            // grass5.png (center)
};

// Terrain type categories based on visual analysis of typical pixel tilesets
// Note: These mappings are based on common pixel tileset patterns
// You may need to adjust based on the actual visual content of your tiles

export const PIXEL_TERRAIN_CATEGORIES = {
  // Ground terrain - now using grass border pattern system
  GRASS: {
    tiles: [4], // Use Map_tile_04.png for compatibility
    walkable: true,
    collectible: false,
    weight: 0.6,
    color: '#4CAF50',
    description: 'Ground terrain with border pattern system',
    // Add border system for automatic grass tile selection
    getBorderAsset: (x, y, gridWidth, gridHeight) => {
      return getGrassTileByPosition(x, y, gridWidth, gridHeight);
    },
    useBorderPattern: true
  },
  
  // Water terrain - using Map_tile_02.png
  WATER: {
    tiles: [2], // Use Map_tile_02.png for water
    walkable: false,
    collectible: false,
    weight: 0.2,
    color: '#2196F3',
    description: 'Water terrain using Map_tile_02.png'
  },
  
  // Shoreline terrain - using Map_tile_28.png
  SHORE: {
    tiles: [28], // Use Map_tile_28.png for shoreline
    walkable: true,
    collectible: false,
    weight: 0.15,
    color: '#FFC107',
    description: 'Shoreline terrain using Map_tile_28.png'
  },
  
  // Special terrain for crystals - uses grass base with crystal overlay
  SPECIAL: {
    tiles: [4], // Use same ground tile as base
    walkable: true,
    collectible: true, // These can contain crystals
    weight: 0.05,
    color: '#E91E63',
    description: 'Special terrain tiles that may contain collectible crystals'
  }
};

// Create reverse mapping from tile number to category
export const TILE_TO_CATEGORY = {};
Object.entries(PIXEL_TERRAIN_CATEGORIES).forEach(([category, config]) => {
  config.tiles.forEach(tileNum => {
    TILE_TO_CATEGORY[tileNum] = category;
  });
});

// Generate asset path for a specific tile number
export const getPixelTileAsset = (tileNumber) => {
  const paddedNumber = tileNumber.toString().padStart(2, '0');
  return `${PIXEL_TERRAIN_BASE_PATH}/Map_tile_${paddedNumber}.png`;
};

// Get random tile from a specific category
export const getRandomTileFromCategory = (category) => {
  const categoryConfig = PIXEL_TERRAIN_CATEGORIES[category];
  if (!categoryConfig || !categoryConfig.tiles.length) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * categoryConfig.tiles.length);
  return categoryConfig.tiles[randomIndex];
};

// Get terrain configuration for a tile number
export const getTerrainConfigForTile = (tileNumber) => {
  const category = TILE_TO_CATEGORY[tileNumber];
  if (!category) {
    return PIXEL_TERRAIN_CATEGORIES.GRASS; // Default fallback
  }
  return {
    ...PIXEL_TERRAIN_CATEGORIES[category],
    asset: getPixelTileAsset(tileNumber),
    tileNumber: tileNumber,
    category: category
  };
};

// Enhanced terrain types for pixel-based rendering
export const ENHANCED_TERRAIN_TYPES = {
  grass: {
    category: 'GRASS',
    walkable: true,
    collectible: false,
    weight: 0.6,
    getTileAsset: () => {
      return getPixelTileAsset(4); // Map_tile_04.png
    },
    color: '#4CAF50'
  },
  
  water: {
    category: 'WATER',
    walkable: false,
    collectible: false,
    weight: 0.2,
    getTileAsset: () => {
      return getPixelTileAsset(2); // Map_tile_02.png
    },
    color: '#2196F3'
  },
  
  shore: {
    category: 'SHORE',
    walkable: true,
    collectible: false,
    weight: 0.15,
    getTileAsset: () => {
      return getPixelTileAsset(28); // Map_tile_28.png
    },
    color: '#FFC107'
  },
  
  crystal: {
    category: 'SPECIAL',
    walkable: true,
    collectible: true,
    weight: 0.05,
    getTileAsset: () => {
      return getPixelTileAsset(4); // Use ground tile as base
    },
    color: '#E91E63'
  }
};

// Seamless terrain system - uses specific tiles for consistent appearance
// Ground: Map_tile_04.png, Water: Map_tile_02.png, Shoreline: Map_tile_28.png

// Validate that all 143 tiles are accounted for
export const validateTileMapping = () => {
  const allMappedTiles = new Set();
  Object.values(PIXEL_TERRAIN_CATEGORIES).forEach(category => {
    category.tiles.forEach(tile => allMappedTiles.add(tile));
  });
  
  const expectedTiles = Array.from({length: 143}, (_, i) => i + 1);
  const missingTiles = expectedTiles.filter(tile => !allMappedTiles.has(tile));
  const extraTiles = Array.from(allMappedTiles).filter(tile => tile > 143 || tile < 1);
  
  return {
    isValid: missingTiles.length === 0 && extraTiles.length === 0,
    missingTiles,
    extraTiles,
    totalMapped: allMappedTiles.size
  };
};

// Terrain Obstacle Assets
// These are decorative/obstacle objects that can be placed on terrain
export const TERRAIN_OBSTACLES = {
  HOUSES: {
    asset: '/assets/characters/terrain-object/Houses/5.png',
    walkable: false,
    collectible: false,
    category: 'structure',
    description: 'House obstacle - blocks movement',
    vibrantColor: '#8B4E85' // Dark magenta for vibrant background
  },
  BUSHES: {
    asset: '/assets/characters/terrain-object/Bushes/2.png',
    walkable: false,
    collectible: false,
    category: 'vegetation',
    description: 'Bush obstacle - blocks movement',
    vibrantColor: '#228B22' // Forest green for vibrant background
  },
  TREES: {
    asset: '/assets/characters/terrain-object/Trees/1.png',
    walkable: false,
    collectible: false,
    category: 'vegetation',
    description: 'Tree obstacle - blocks movement',
    vibrantColor: '#2E7D32' // Dark green for vibrant background
  },
  ROCKS: {
    asset: '/assets/characters/terrain-object/Rocks/3.png',
    walkable: false,
    collectible: false,
    category: 'natural',
    description: 'Rock obstacle - blocks movement',
    vibrantColor: '#8B4513' // Saddle brown for vibrant background
  },
  CRYSTALS: {
    asset: '/assets/characters/terrain-object/Crystals/2.png',
    walkable: true,
    collectible: true,
    category: 'collectible',
    description: 'Collectible crystal - can be picked up for points',
    vibrantColor: '#E91E63' // Pink for vibrant background
  },
  
  // Grass decoration assets for terrain distribution
  GRASS_DECORATIONS: {
    assets: Object.values(GRASS_ASSETS),
    walkable: true,
    collectible: false,
    category: 'decoration',
    description: 'Decorative grass elements scattered across terrain',
    vibrantColor: '#4CAF50' // Green for vibrant background
  }
};

// Function to get random terrain obstacle
export const getRandomTerrainObstacle = () => {
  const obstacles = Object.keys(TERRAIN_OBSTACLES);
  const randomKey = obstacles[Math.floor(Math.random() * obstacles.length)];
  return TERRAIN_OBSTACLES[randomKey];
};

// Function to get terrain obstacle by category
export const getTerrainObstaclesByCategory = (category) => {
  return Object.entries(TERRAIN_OBSTACLES)
    .filter(([key, obstacle]) => obstacle.category === category)
    .reduce((acc, [key, obstacle]) => {
      acc[key] = obstacle;
      return acc;
    }, {});
};

// Function to get transition tile (fallback implementation)
export const getTransitionTile = (fromCategory, toCategory) => {
  // Since we removed TILE_TRANSITIONS, return a default grass tile for seamless terrain
  return 4; // Map_tile_04.png (grass base tile)
};

// Export validation result
export const TILE_MAPPING_VALIDATION = validateTileMapping();