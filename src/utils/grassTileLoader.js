// Grass Tile Loader Utility
// Handles loading and caching of grass tile images for seamless terrain

import { GRASS_BORDER_MAPPING } from './pixelTerrainAssets';

// Cache for loaded grass tile images (stores actual Image objects)
const grassTileCache = new Map();
const grassTilePromises = new Map();

// Load a single grass tile image
export const loadGrassTile = (tilePath) => {
  if (grassTilePromises.has(tilePath)) {
    return grassTilePromises.get(tilePath);
  }
  
  const img = new Image();
  img.src = tilePath;
  
  const promise = new Promise((resolve, reject) => {
    img.onload = () => {
      grassTileCache.set(tilePath, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load grass tile: ${tilePath}`));
  });
  
  grassTilePromises.set(tilePath, promise);
  return promise;
};

// Load all grass tiles used in the border pattern
export const loadAllGrassTiles = async () => {
  const loadPromises = Object.values(GRASS_BORDER_MAPPING).map(loadGrassTile);
  
  try {
    const loadedImages = await Promise.all(loadPromises);
    console.log('✅ All grass tiles loaded successfully');
    return loadedImages;
  } catch (error) {
    console.error('❌ Failed to load some grass tiles:', error);
    return [];
  }
};

// Get a loaded grass tile image synchronously (returns null if not loaded)
export const getGrassTileImage = (tilePath) => {
  // Check if image is already loaded in cache
  if (grassTileCache.has(tilePath)) {
    const img = grassTileCache.get(tilePath);
    if (img.complete && img.naturalWidth !== 0) {
      return img;
    }
  }
  
  // If not cached, start loading it now for future use
  if (!grassTilePromises.has(tilePath)) {
    loadGrassTile(tilePath);
  }
  
  return null;
};

// Preload grass tiles for better performance
export const preloadGrassTiles = () => {
  console.log('🌱 Preloading grass tiles...');
  loadAllGrassTiles().then(() => {
    console.log('🌱 Grass tiles preloaded successfully');
  });
};

// Get grass tile image by position using the border mapping
export const getGrassTileByPosition = (x, y, gridWidth, gridHeight) => {
  // Corner positions
  if (x === 0 && y === 0) {
    return GRASS_BORDER_MAPPING.TOP_LEFT;        // grass1.png
  }
  if (x === gridWidth - 1 && y === 0) {
    return GRASS_BORDER_MAPPING.TOP_RIGHT;       // grass3.png
  }
  if (x === 0 && y === gridHeight - 1) {
    return GRASS_BORDER_MAPPING.BOTTOM_LEFT;     // grass7.png
  }
  if (x === gridWidth - 1 && y === gridHeight - 1) {
    return GRASS_BORDER_MAPPING.BOTTOM_RIGHT;    // grass9.png
  }
  
  // Edge positions
  if (y === 0) {
    return GRASS_BORDER_MAPPING.TOP_EDGE;        // grass2.png (top edge)
  }
  if (y === gridHeight - 1) {
    return GRASS_BORDER_MAPPING.BOTTOM_EDGE;     // grass8.png (bottom edge)
  }
  if (x === 0) {
    return GRASS_BORDER_MAPPING.LEFT_EDGE;       // grass4.png (left edge)
  }
  if (x === gridWidth - 1) {
    return GRASS_BORDER_MAPPING.RIGHT_EDGE;      // grass6.png (right edge)
  }
  
  // Center fill
  return GRASS_BORDER_MAPPING.CENTER;            // grass5.png (center)
};

export default {
  loadGrassTile,
  loadAllGrassTiles,
  getGrassTileImage,
  preloadGrassTiles,
  getGrassTileByPosition
};