// Game configuration constants
export const GAME_CONFIG = {
  // Canvas dimensions
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  // Game object sizes - Made larger for kids
  TILE_SIZE: 50,
  PLAYER_SIZE: 50,
  TREASURE_SIZE: 40,
  MONSTER_SIZE: 35,
  
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

// Terrain type definitions - More colorful and kid-friendly
export const TERRAIN_TYPES = {
  GRASS: { color: '#7ED321', walkable: true, elevation: 0 }, // Bright green
  WATER: { color: '#50E3C2', walkable: false, elevation: -1 }, // Turquoise
  MOUNTAIN: { color: '#9013FE', walkable: false, elevation: 3 }, // Purple mountains
  FOREST: { color: '#417505', walkable: true, elevation: 0 }, // Forest green
  DESERT: { color: '#F5A623', walkable: true, elevation: 0 }, // Golden yellow
  BRIDGE: { color: '#D0021B', walkable: true, elevation: 0 }, // Red bridge
  STAIRS_DOWN: { color: '#8B572A', walkable: true, elevation: 0 }, // Brown stairs
  STAIRS_UP: { color: '#FFD700', walkable: true, elevation: 0 }, // Gold stairs
  // Elevated terrain types - Bright and colorful
  CLIFF: { color: '#BD10E0', walkable: false, elevation: 2 }, // Magenta cliffs
  HIGH_GRASS: { color: '#B8E986', walkable: true, elevation: 1 }, // Light green
  ROCKY_GROUND: { color: '#F8E71C', walkable: true, elevation: 1 }, // Bright yellow rocks
  CAVE_ENTRANCE: { color: '#4A4A4A', walkable: true, elevation: 0 }, // Dark gray
  // Cave world specific terrains - More vibrant
  CAVE_FLOOR: { color: '#7B68EE', walkable: true, elevation: 0 }, // Medium slate blue
  CAVE_WALL: { color: '#483D8B', walkable: false, elevation: 0 }, // Dark slate blue
  LAVA: { color: '#FF6347', walkable: false, elevation: 0 }, // Tomato red
  CRYSTAL: { color: '#DA70D6', walkable: true, elevation: 0 }, // Orchid
  UNDERGROUND_WATER: { color: '#00CED1', walkable: false, elevation: 0 }, // Dark turquoise
  MUSHROOM: { color: '#FF69B4', walkable: true, elevation: 0 } // Hot pink mushrooms
};

// Color schemes for different world types - Kid-friendly colors
export const WORLD_COLORS = {
  surface: '#7ED321', // Bright green
  cave: '#7B68EE' // Medium slate blue
};