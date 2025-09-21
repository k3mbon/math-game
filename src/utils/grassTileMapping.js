/**
 * Grass tile mapping utility for terrain generation
 */

// Grass tile mapping constants
export const GRASS_TILES = {
  TOP_LEFT: '/assets/terrain_tileset/grass1.png',
  TOP: '/assets/terrain_tileset/grass2.png',
  TOP_RIGHT: '/assets/terrain_tileset/grass3.png',
  LEFT: '/assets/terrain_tileset/grass4.png',
  CENTER: '/assets/terrain_tileset/grass5.png',
  RIGHT: '/assets/terrain_tileset/grass6.png',
  BOTTOM_LEFT: '/assets/terrain_tileset/grass7.png',
  BOTTOM: '/assets/terrain_tileset/grass8.png',
  BOTTOM_RIGHT: '/assets/terrain_tileset/grass9.png'
};

// Character sprite
export const SWORDSMAN_SPRITE = '/assets/characters/swordsman.png';

/**
 * Generates a terrain map based on width and height
 * @param {number} width - Width of the terrain in tiles
 * @param {number} height - Height of the terrain in tiles
 * @returns {Array<Array<string>>} 2D array representing the terrain map with tile paths
 */
export const generateTerrainMap = (width, height) => {
  const map = [];
  
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      // Determine tile type based on position
      let tileType;
      
      if (x === 0 && y === 0) {
        tileType = GRASS_TILES.TOP_LEFT;
      } else if (x === width - 1 && y === 0) {
        tileType = GRASS_TILES.TOP_RIGHT;
      } else if (x === 0 && y === height - 1) {
        tileType = GRASS_TILES.BOTTOM_LEFT;
      } else if (x === width - 1 && y === height - 1) {
        tileType = GRASS_TILES.BOTTOM_RIGHT;
      } else if (y === 0) {
        tileType = GRASS_TILES.TOP;
      } else if (y === height - 1) {
        tileType = GRASS_TILES.BOTTOM;
      } else if (x === 0) {
        tileType = GRASS_TILES.LEFT;
      } else if (x === width - 1) {
        tileType = GRASS_TILES.RIGHT;
      } else {
        tileType = GRASS_TILES.CENTER;
      }
      
      row.push(tileType);
    }
    map.push(row);
  }
  
  return map;
};

/**
 * Preloads all tile images and returns them as a promise
 * @returns {Promise<Object>} Promise that resolves with loaded images
 */
export const preloadTileImages = () => {
  const tileImages = {};
  const imagePromises = [];
  
  // Load grass tiles
  Object.entries(GRASS_TILES).forEach(([key, src]) => {
    const img = new Image();
    const promise = new Promise((resolve) => {
      img.onload = resolve;
      img.src = src;
    });
    tileImages[src] = img;
    imagePromises.push(promise);
  });
  
  return Promise.all(imagePromises).then(() => tileImages);
};

/**
 * Preloads character sprite
 * @returns {Promise<HTMLImageElement>} Promise that resolves with loaded character image
 */
export const preloadCharacterSprite = () => {
  const characterImg = new Image();
  return new Promise((resolve) => {
    characterImg.onload = () => resolve(characterImg);
    characterImg.src = SWORDSMAN_SPRITE;
  });
};