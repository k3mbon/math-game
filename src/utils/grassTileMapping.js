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
// Enhanced bush obstacles from the specified directory
export const BUSH_OBSTACLES = {
  BUSH_1: '/assets/characters/terrain-object/Bushes/1.png',
  BUSH_2: '/assets/characters/terrain-object/Bushes/2.png',
  BUSH_3: '/assets/characters/terrain-object/Bushes/3.png'
};

// Character sprite
export const SWORDSMAN_SPRITE = '/assets/characters/swordsman.png';

/**
 * Enhanced terrain map generation with legacy layout proportions
 * @param {number} width - Width of the terrain in tiles
 * @param {number} height - Height of the terrain in tiles
 * @param {Object} [options] - Optional generation options
 * @param {number} [options.bushDensity] - Desired bush grid occupancy (0..1). ~0.7 = 70% of available bush cells
 * @returns {Object} Object containing terrain map and bush obstacles
 */
export const generateTerrainMap = (width, height, options = {}) => {
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
  
  // Enhanced bush obstacle generation with even distribution and minimum spacing
  const minSpacing = 3; // Minimum tiles between bushes
  // New: allow caller to request a grid occupancy density (0..1)
  // Default keeps previous behavior (~1.2% of tiles ≈ ~1000 bushes on 300x300)
  const bushGridDensity = typeof options.bushDensity === 'number'
    ? Math.max(0, Math.min(1, options.bushDensity))
    : 0.012; // fallback to prior low density

  // Grid-based placement to ensure even distribution
  const gridSize = minSpacing + 1;
  const gridWidth = Math.floor(scaledWidth / gridSize);
  const gridHeight = Math.floor(scaledHeight / gridSize);

  // Calculate target number of bushes based on available grid cells and requested occupancy
  const targetBushCount = Math.floor(gridWidth * gridHeight * bushGridDensity);
  const maxAttempts = Math.max(1000, targetBushCount * 2); // scale attempts with desired count
  
  // Create placement grid to track occupied areas
  const placementGrid = Array(gridHeight).fill(null).map(() => Array(gridWidth).fill(false));
  
  let attempts = 0;
  let placedBushes = 0;
  
  while (placedBushes < targetBushCount && attempts < maxAttempts) {
    attempts++;
    
    // Random grid cell selection
    const gridX = Math.floor(Math.random() * gridWidth);
    const gridY = Math.floor(Math.random() * gridHeight);
    
    // Skip if grid cell already occupied
    if (placementGrid[gridY][gridX]) {
      continue;
    }
    
    // Convert grid position to map coordinates with random offset within cell
    const baseX = gridX * gridSize;
    const baseY = gridY * gridSize;
    const offsetX = Math.floor(Math.random() * (gridSize - 1));
    const offsetY = Math.floor(Math.random() * (gridSize - 1));
    
    const x = Math.min(baseX + offsetX, scaledWidth - 1);
    const y = Math.min(baseY + offsetY, scaledHeight - 1);
    
    // Avoid placing bushes too close to map edges (maintain 2-tile border)
    if (x < 2 || x >= scaledWidth - 2 || y < 2 || y >= scaledHeight - 2) {
      continue;
    }
    
    // Avoid blocking critical path points (corners and center areas)
    const centerX = Math.floor(scaledWidth / 2);
    const centerY = Math.floor(scaledHeight / 2);
    const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    
    // Keep center area relatively clear for movement
    if (distanceFromCenter < Math.min(scaledWidth, scaledHeight) * 0.15) {
      continue;
    }
    
    // Select random bush type for visual variety
    const bushTypes = Object.values(BUSH_OBSTACLES);
    const selectedBush = bushTypes[Math.floor(Math.random() * bushTypes.length)];
    
    const bush = {
      // Store bush coordinates in TILE units to align with renderer and collision systems
      x: x,
      y: y,
      width: LEGACY_LAYOUT_DIMENSIONS.TILE_SIZE,
      height: LEGACY_LAYOUT_DIMENSIONS.TILE_SIZE,
      type: 'bush',
      asset: selectedBush,
      walkable: false,
      collidable: true,
      enhanced: true,
      legacyProportions: true,
      id: `bush_${x}_${y}_${placedBushes}`
    };
    
    bushObstacles.push(bush);
    
    // Mark grid cell as occupied
    placementGrid[gridY][gridX] = true;
    placedBushes++;
  }
  
  console.log(`🌿 Generated enhanced terrain map: ${scaledWidth}x${scaledHeight} with ${placedBushes} bush obstacles (${Math.round(bushGridDensity * 100)}% grid occupancy)`);
  console.log(`📐 Legacy layout proportions applied: ${LEGACY_LAYOUT_DIMENSIONS.CANVAS_WIDTH}x${LEGACY_LAYOUT_DIMENSIONS.CANVAS_HEIGHT}`);
  console.log(`🎯 Bush placement: ${attempts} attempts, ${placedBushes}/${targetBushCount} bushes placed with ${minSpacing}-tile spacing`);
  console.log('🧭 Bush obstacle coordinates stored in TILE units (renderer multiplies by TILE_SIZE)');
  
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