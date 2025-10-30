// Game configuration constants
export const GAME_CONFIG = {
  // Canvas dimensions
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  // Game object sizes - Made larger for kids
  TILE_SIZE: 50,
  PLAYER_SIZE: 70, // Increased from 50 to 70 for better visibility
  TREASURE_SIZE: 45, // Slightly increased to maintain proportion
  MONSTER_SIZE: 40, // Slightly increased to maintain proportion
  
  // World generation
  WORLD_SIZE: 300, // Expanded from 200 to 300 tiles (50% increase)
  CHUNK_SIZE: 20, // Load world in chunks
  
  // Performance settings
  MAX_VISIBLE_CHUNKS: 25, // Increased for seamless terrain coverage
  RENDER_DISTANCE: 3, // Increased chunks around camera for seamless filling
  PATTERN_RENDER_FREQUENCY: 4, // Render patterns every N tiles (increased from 3)
  MAX_FRAME_RATE: 60, // Target FPS
  PERFORMANCE_MODE: true, // Enable performance optimizations
  
  // Game mechanics
  PLAYER_SPEED: 2.5, // Reduced from 3 to 2.5 for smoother movement with larger character
  MONSTER_SPEED: 1,
  INTERACTION_COOLDOWN: 1000, // ms
  
  // World generation seeds
  MAX_DEPTH_LEVEL: 5,
  SAFE_ZONE_RADIUS: 25,
  CLEARANCE_ZONE_RADIUS: 40
};

// Terrain type definitions - More colorful and kid-friendly with clear walkability rules
export const TERRAIN_TYPES = {
  // Walkable terrain types - Safe for character movement
  GRASS: { color: '#7ED321', walkable: true, elevation: 0, description: 'Safe grass terrain' }, // Bright green
  FOREST: { color: '#417505', walkable: true, elevation: 0, description: 'Forest paths' }, // Forest green
  DESERT: { color: '#F5A623', walkable: true, elevation: 0, description: 'Sandy desert' }, // Golden yellow
  BRIDGE: { color: '#D0021B', walkable: true, elevation: 0, description: 'Crossing bridge' }, // Red bridge
  STAIRS_DOWN: { color: '#8B572A', walkable: true, elevation: 0, description: 'Stairs going down' }, // Brown stairs
  STAIRS_UP: { color: '#FFD700', walkable: true, elevation: 0, description: 'Stairs going up' }, // Gold stairs
  HIGH_GRASS: { color: '#B8E986', walkable: true, elevation: 1, description: 'Elevated grass' }, // Light green
  ROCKY_GROUND: { color: '#F8E71C', walkable: true, elevation: 1, description: 'Rocky but passable' }, // Bright yellow rocks
  CAVE_ENTRANCE: { color: '#4A4A4A', walkable: true, elevation: 0, description: 'Cave entrance' }, // Dark gray
  CAVE_FLOOR: { color: '#7B68EE', walkable: true, elevation: 0, description: 'Cave floor' }, // Medium slate blue
  CRYSTAL: { color: '#DA70D6', walkable: true, elevation: 0, description: 'Crystal formations' }, // Orchid
  MUSHROOM: { color: '#FF69B4', walkable: true, elevation: 0, description: 'Mushroom patches' }, // Hot pink mushrooms
  
  // Non-walkable terrain types - Blocked for character movement
  WATER: { color: '#50E3C2', walkable: false, elevation: -1, description: 'Deep water - impassable' }, // Turquoise
  MOUNTAIN: { color: '#9013FE', walkable: false, elevation: 3, description: 'High mountains - impassable' }, // Purple mountains
  CLIFF: { color: '#BD10E0', walkable: false, elevation: 2, description: 'Steep cliffs - impassable' }, // Magenta cliffs
  CAVE_WALL: { color: '#483D8B', walkable: false, elevation: 0, description: 'Solid cave walls' }, // Dark slate blue
  LAVA: { color: '#FF6347', walkable: false, elevation: 0, description: 'Dangerous lava - impassable' }, // Tomato red
  UNDERGROUND_WATER: { color: '#00CED1', walkable: false, elevation: 0, description: 'Underground water - impassable' } // Dark turquoise
};

// Color schemes for different world types - Kid-friendly colors
export const WORLD_COLORS = {
  surface: '#7ED321', // Bright green
  cave: '#7B68EE' // Medium slate blue
};