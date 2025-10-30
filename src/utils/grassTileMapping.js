// Enhanced Grass Tile Mapping System with Legacy Layout Support
// Provides seamless grass tile patterns with improved proportions

// Import enhanced grass assets and legacy layout dimensions
import { 
  GRASS_ASSETS, 
  GRASS_BORDER_MAPPING, 
  getGrassTileByPosition,
  LEGACY_LAYOUT_DIMENSIONS 
} from './pixelTerrainAssets.js';

// Enhanced grass tile definitions with legacy layout proportions
export const GRASS_TILES = {
  // Corner tiles - optimized for seamless transitions
  TOP_LEFT: GRASS_BORDER_MAPPING.TOP_LEFT,         // grass1.png
  TOP_RIGHT: GRASS_BORDER_MAPPING.TOP_RIGHT,       // grass3.png
  BOTTOM_LEFT: GRASS_BORDER_MAPPING.BOTTOM_LEFT,   // grass7.png
  BOTTOM_RIGHT: GRASS_BORDER_MAPPING.BOTTOM_RIGHT, // grass9.png
  
  // Edge tiles - enhanced for visual consistency
  TOP: GRASS_BORDER_MAPPING.TOP_EDGE,              // grass2.png
  BOTTOM: GRASS_BORDER_MAPPING.BOTTOM_EDGE,        // grass8.png
  LEFT: GRASS_BORDER_MAPPING.LEFT_EDGE,            // grass4.png
  RIGHT: GRASS_BORDER_MAPPING.RIGHT_EDGE,          // grass6.png
  
  // Center fill - maintains original scale
  CENTER: GRASS_BORDER_MAPPING.CENTER              // grass5.png
};

// Bush obstacle assets
export const BUSH_OBSTACLES = [
  '/assets/characters/terrain-object/Bushes/1.png',
  '/assets/characters/terrain-object/Bushes/2.png',
  '/assets/characters/terrain-object/Bushes/3.png'
];

// Character sprite
export const SWORDSMAN_SPRITE = '/assets/characters/swordsman.png';

/**
 * Enhanced terrain map generation with legacy layout proportions
 * @param {number} width - Width of the terrain in tiles
 * @param {number} height - Height of the terrain in tiles
 * @returns {Object} Object containing terrain map and bush obstacles
 */
export const generateTerrainMap = (width, height) => {
  const map = [];
  const bushObstacles = [];
  
  // Apply legacy layout scaling for proper proportions
  const scaledWidth = Math.max(width, Math.ceil(LEGACY_LAYOUT_DIMENSIONS.CANVAS_WIDTH / LEGACY_LAYOUT_DIMENSIONS.TILE_SIZE));
  const scaledHeight = Math.max(height, Math.ceil(LEGACY_LAYOUT_DIMENSIONS.CANVAS_HEIGHT / LEGACY_LAYOUT_DIMENSIONS.TILE_SIZE));
  
  for (let y = 0; y < scaledHeight; y++) {
    const row = [];
    for (let x = 0; x < scaledWidth; x++) {
      // Use enhanced grass tile mapping for better visual consistency
      const tileType = getGrassTileByPosition(x, y, scaledWidth, scaledHeight);
      row.push(tileType);
    }
    map.push(row);
  }
  
  // Generate bush obstacles with enhanced scattering based on legacy proportions
  const bushDensity = 0.15; // Adjusted for better gameplay
  const minBushDistance = 3; // Minimum distance between bushes
  const placedBushes = [];
  
  for (let attempts = 0; attempts < scaledWidth * scaledHeight * bushDensity; attempts++) {
    const x = Math.floor(Math.random() * (scaledWidth - 2)) + 1; // Avoid edges
    const y = Math.floor(Math.random() * (scaledHeight - 2)) + 1; // Avoid edges
    
    // Check minimum distance from other bushes
    const tooClose = placedBushes.some(bush => {
      const distance = Math.sqrt((bush.x - x) ** 2 + (bush.y - y) ** 2);
      return distance < minBushDistance;
    });
    
    if (!tooClose) {
      const bush = {
        x: x * LEGACY_LAYOUT_DIMENSIONS.TILE_SIZE,
        y: y * LEGACY_LAYOUT_DIMENSIONS.TILE_SIZE,
        width: LEGACY_LAYOUT_DIMENSIONS.TILE_SIZE,
        height: LEGACY_LAYOUT_DIMENSIONS.TILE_SIZE,
        type: 'bush',
        walkable: false,
        enhanced: true, // Mark as enhanced obstacle
        legacyProportions: true
      };
      
      bushObstacles.push(bush);
      placedBushes.push({ x, y });
    }
  }
  
  console.log(`🌿 Generated enhanced terrain map: ${scaledWidth}x${scaledHeight} with ${bushObstacles.length} bush obstacles`);
  console.log(`📐 Legacy layout proportions applied: ${LEGACY_LAYOUT_DIMENSIONS.CANVAS_WIDTH}x${LEGACY_LAYOUT_DIMENSIONS.CANVAS_HEIGHT}`);
  
  return {
    map,
    bushObstacles,
    dimensions: {
      width: scaledWidth,
      height: scaledHeight,
      tileSize: LEGACY_LAYOUT_DIMENSIONS.TILE_SIZE
    },
    enhanced: true,
    legacyProportions: true
  };
};

/**
 * Enhanced preload function for tile images with legacy layout support
 * @returns {Promise<Object>} Promise that resolves with loaded images
 */
export const preloadTileImages = () => {
  const tileImages = {};
  const imagePromises = [];
  
  // Load enhanced grass tiles
  Object.entries(GRASS_TILES).forEach(([key, src]) => {
    const img = new Image();
    const promise = new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = () => {
        console.warn(`Failed to load grass tile: ${src}`);
        resolve(); // Continue even if one image fails
      };
      img.src = src;
    });
    tileImages[src] = img;
    imagePromises.push(promise);
  });
  
  console.log(`🖼️ Preloading ${Object.keys(GRASS_TILES).length} enhanced grass tile images`);
  
  return Promise.all(imagePromises).then(() => {
    console.log(`✅ Successfully loaded ${Object.keys(tileImages).length} grass tile images`);
    return tileImages;
  });
};

/**
 * Enhanced character sprite preloader with error handling
 * @returns {Promise<HTMLImageElement>} Promise that resolves with loaded character image
 */
export const preloadCharacterSprite = () => {
  const characterImg = new Image();
  return new Promise((resolve, reject) => {
    characterImg.onload = () => {
      console.log('✅ Character sprite loaded successfully');
      resolve(characterImg);
    };
    characterImg.onerror = () => {
      console.error('❌ Failed to load character sprite');
      reject(new Error('Character sprite failed to load'));
    };
    characterImg.src = '/assets/characters/player.png'; // Default character sprite
  });
};