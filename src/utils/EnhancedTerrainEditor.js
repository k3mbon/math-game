import { getGrassTileByPosition, PIXEL_TERRAIN_CATEGORIES } from './pixelTerrainAssets.js';

export class EnhancedTerrainEditor {
  constructor(gridWidth = 20, gridHeight = 20) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.terrainGrid = this.initializeGrid();
  }

  // Initialize empty grid
  initializeGrid() {
    const grid = [];
    for (let y = 0; y < this.gridHeight; y++) {
      const row = [];
      for (let x = 0; x < this.gridWidth; x++) {
        row.push({
          x,
          y,
          terrainType: 'GRASS',
          customAsset: null, // Allow manual override
          walkable: true
        });
      }
      grid.push(row);
    }
    return grid;
  }

  // Get tile at specific position
  getTile(x, y) {
    if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) {
      return null;
    }
    return this.terrainGrid[y][x];
  }

  // Set tile at specific position
  setTile(x, y, terrainType, customAsset = null) {
    const tile = this.getTile(x, y);
    if (tile) {
      tile.terrainType = terrainType;
      tile.customAsset = customAsset;
      
      // Update walkable property based on terrain type
      const category = PIXEL_TERRAIN_CATEGORIES[terrainType];
      if (category) {
        tile.walkable = category.walkable;
      }
    }
  }

  // Get the actual asset path for a tile (with border pattern support)
  getTileAsset(x, y) {
    const tile = this.getTile(x, y);
    if (!tile) return null;

    // If custom asset is set, use that
    if (tile.customAsset) {
      return tile.customAsset;
    }

    const category = PIXEL_TERRAIN_CATEGORIES[tile.terrainType];
    if (!category) return null;

    // Use border pattern for grass tiles
    if (category.useBorderPattern && category.getBorderAsset) {
      return category.getBorderAsset(x, y, this.gridWidth, this.gridHeight);
    }

    // Default to first tile in category
    const tileNumber = category.tiles[0];
    return `public/assets/terrain/1 Tiles/Map_tile_${String(tileNumber).padStart(2, '0')}.png`;
  }

  // Generate terrain data with border patterns
  generateTerrainData() {
    const terrainData = {
      gridWidth: this.gridWidth,
      gridHeight: this.gridHeight,
      tiles: []
    };

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const tile = this.getTile(x, y);
        if (tile) {
          terrainData.tiles.push({
            x,
            y,
            asset: this.getTileAsset(x, y),
            walkable: tile.walkable,
            terrainType: tile.terrainType
          });
        }
      }
    }

    return terrainData;
  }

  // Create a grass border around the entire map
  createGrassBorder() {
    // Fill entire map with grass first
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        this.setTile(x, y, 'GRASS');
      }
    }
  }

  // Add obstacles or special terrain inside the border
  addObstacles(obstacles = []) {
    obstacles.forEach(obstacle => {
      const { x, y, terrainType } = obstacle;
      this.setTile(x, y, terrainType);
    });
  }

  // Export for JSON
  exportToJSON() {
    return JSON.stringify(this.generateTerrainData(), null, 2);
  }

  // Import from JSON
  importFromJSON(jsonData) {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      this.gridWidth = data.gridWidth || 20;
      this.gridHeight = data.gridHeight || 20;
      this.terrainGrid = this.initializeGrid();

      if (data.tiles) {
        data.tiles.forEach(tileData => {
          const { x, y, terrainType, walkable } = tileData;
          if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
            this.setTile(x, y, terrainType || 'GRASS');
            const tile = this.getTile(x, y);
            if (tile && walkable !== undefined) {
              tile.walkable = walkable;
            }
          }
        });
      }
    } catch (error) {
      console.error('Error importing terrain data:', error);
    }
  }
}

// Helper function to create a default grass-bordered level
export function createDefaultGrassLevel(width = 20, height = 20, obstacles = []) {
  const editor = new EnhancedTerrainEditor(width, height);
  editor.createGrassBorder();
  editor.addObstacles(obstacles);
  return editor.generateTerrainData();
}

// Example usage:
// const editor = new EnhancedTerrainEditor(20, 20);
// editor.createGrassBorder();
// editor.addObstacles([
//   { x: 5, y: 5, terrainType: 'WATER' },
//   { x: 10, y: 10, terrainType: 'ROCK' }
// ]);
// const terrainData = editor.generateTerrainData();