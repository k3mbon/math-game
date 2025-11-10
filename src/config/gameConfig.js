// Game configuration constants
export const GAME_CONFIG = {
  // Canvas dimensions
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  
  // Game object sizes - Made larger for kids
  TILE_SIZE: 50,
  PLAYER_SIZE: 140, // 2x bigger character for clearer visuals
  TREASURE_SIZE: 50, // Align chest size with tile for consistent collision
  MONSTER_SIZE: 140, // Match monster size to player for consistent visuals
  // Collision tuning (precise chest hitbox + player collision scale)
  PLAYER_COLLISION_SCALE: 0.8, // fraction of PLAYER_SIZE used for collisions
  TREASURE_HITBOX_WIDTH_RATIO: 0.72, // width fraction of TREASURE_SIZE used for collision
  TREASURE_HITBOX_HEIGHT_RATIO: 0.70, // height fraction of TREASURE_SIZE used for collision
  TREASURE_HITBOX_Y_OFFSET_RATIO: 0.06, // offset chest hitbox slightly downward to match base
  SHOW_COLLISION_DEBUG: false, // draw collision boxes for debugging when true
  
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
  RUN_MULTIPLIER: 1.6, // Speed multiplier when holding Shift to run
  MONSTER_SPEED: 1,
  INTERACTION_COOLDOWN: 1000, // ms
  // Interaction tuning
  INTERACTION_RADIUS: 100, // pixels (~2 tiles) for easier chest interaction
  INTERACTION_FACING_COS: 0.35, // widen facing cone (~69°)

  // Treasure distribution and debugging
  TREASURE_MIN_DISTANCE: 200, // Minimum distance between chests (pixels)
  // Increase chest presence by easing spacing and density
  TREASURE_MIN_DISTANCE: 160, // Minimum distance between chests (pixels)
  TREASURE_MAX_DISTANCE: 600, // Maximum preferred distance to nearest chest (pixels)
  TREASURE_TARGET_COUNT: null, // Let generator compute from density when not a fixed count
  TREASURE_TARGET_DENSITY: 0.85, // ~85% of chunks contain a chest
  TREASURE_MAX_PER_CHUNK_SURFACE: 1, // Surface max per chunk
  TREASURE_MAX_PER_CHUNK_CAVE: 2, // Cave max per chunk
  TREASURE_JITTER_PX: 30, // Random jitter applied around grid sampling centers
  TREASURE_TERRAIN_WEIGHTS: {
    GRASS: 1.0,
    FOREST: 0.9,
    HIGH_GRASS: 0.8,
    ROCKY_GROUND: 0.7,
    DESERT: 0.7,
    CAVE_FLOOR: 0.9
  },
  TREASURE_AVOID_NEAR_SPAWN_RADIUS_TILES: 4, // Allow chests closer to spawn for accessibility
  TREASURE_WEIGHTED_SAMPLING: true, // Use farthest-point sampling to avoid clustering
  SHOW_TREASURE_DEBUG: false, // Enable visual spacing overlay for chests
  SHOW_TREASURE_DEBUG_GRID: false, // Show grid overlay based on optimal world spacing
  
  // World generation seeds
  MAX_DEPTH_LEVEL: 5,
  SAFE_ZONE_RADIUS: 25,
  CLEARANCE_ZONE_RADIUS: 40
  ,
  // Wildrealm behavior
  // When true, treasure chests in /wildrealm show the question modal first,
  // then award loot after the player solves it. When false, chests show loot-only.
  WILDREALM_SHOW_QUESTIONS: true
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