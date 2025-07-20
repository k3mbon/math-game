// Game configuration constants
export const GAME_CONFIG = {
  // Canvas dimensions
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  // Game object sizes
  TILE_SIZE: 40,
  PLAYER_SIZE: 40,
  TREASURE_SIZE: 30,
  MONSTER_SIZE: 25,
  
  // World generation
  WORLD_SIZE: 200, // 200x200 tiles
  CHUNK_SIZE: 20, // Load world in chunks
  
  // Performance settings
  MAX_VISIBLE_CHUNKS: 16, // Limit loaded chunks (reduced from 25)
  RENDER_DISTANCE: 1, // Chunks around camera (reduced from 2)
  PATTERN_RENDER_FREQUENCY: 4, // Render patterns every N tiles (increased from 3)
  MAX_FRAME_RATE: 60, // Target FPS
  PERFORMANCE_MODE: true, // Enable performance optimizations
  
  // Game mechanics
  PLAYER_SPEED: 3,
  MONSTER_SPEED: 1,
  INTERACTION_COOLDOWN: 1000, // ms
  
  // World generation seeds
  MAX_DEPTH_LEVEL: 5,
  SAFE_ZONE_RADIUS: 25,
  CLEARANCE_ZONE_RADIUS: 40
};

// Terrain type definitions
export const TERRAIN_TYPES = {
  GRASS: { color: '#4a9', walkable: true, elevation: 0 },
  WATER: { color: '#4af', walkable: false, elevation: -1 },
  MOUNTAIN: { color: '#888', walkable: false, elevation: 3 },
  FOREST: { color: '#2a5', walkable: true, elevation: 0 },
  DESERT: { color: '#da5', walkable: true, elevation: 0 },
  BRIDGE: { color: '#a84', walkable: true, elevation: 0 },
  STAIRS_DOWN: { color: '#654321', walkable: true, elevation: 0 },
  STAIRS_UP: { color: '#ffd700', walkable: true, elevation: 0 },
  // Elevated terrain types
  CLIFF: { color: '#8B7355', walkable: false, elevation: 2 },
  HIGH_GRASS: { color: '#5a8a5a', walkable: true, elevation: 1 },
  ROCKY_GROUND: { color: '#9a8a7a', walkable: true, elevation: 1 },
  CAVE_ENTRANCE: { color: '#2a2a2a', walkable: true, elevation: 0 },
  // Cave world specific terrains
  CAVE_FLOOR: { color: '#2a2a2a', walkable: true, elevation: 0 },
  CAVE_WALL: { color: '#1a1a1a', walkable: false, elevation: 0 },
  LAVA: { color: '#ff4500', walkable: false, elevation: 0 },
  CRYSTAL: { color: '#9370db', walkable: true, elevation: 0 },
  UNDERGROUND_WATER: { color: '#1e90ff', walkable: false, elevation: 0 },
  MUSHROOM: { color: '#8b4513', walkable: true, elevation: 0 }
};

// Color schemes for different world types
export const WORLD_COLORS = {
  surface: '#4a9', // Green
  cave: '#2a2a2a' // Dark gray
};