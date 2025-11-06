import { GAME_CONFIG, TERRAIN_TYPES } from '../config/gameConfig.js';
import { terrainBoundarySystem, enhancedBushCollisionSystem } from './terrainBoundarySystem.js';

// Seeded random function for consistent world generation
export const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Check if a position is walkable with improved collision detection
export const isWalkable = (x, y, terrain, customWorld = null, bushObstacles = null) => {
  // First check terrain boundary collision
  if (terrainBoundarySystem.checkBoundaryCollision(x, y)) {
    return false;
  }

  // Immediate bush collision guard using player center
  // Ensures bushes from the Bushes directory are always non-walkable
  if (bushObstacles && bushObstacles.length > 0) {
    for (const bush of bushObstacles) {
      const assetPath = String(bush.asset || '').toLowerCase();
      const isBushesDir = assetPath.includes('/assets/characters/terrain-object/bushes/');
      if (!isBushesDir) continue;

      const bushPixelX = bush.x * GAME_CONFIG.TILE_SIZE;
      const bushPixelY = bush.y * GAME_CONFIG.TILE_SIZE;

      if (enhancedBushCollisionSystem.checkBushCollision(x, y, bushPixelX, bushPixelY)) {
        return false;
      }
    }
  }

  // Calculate player bounds for better collision detection
  const playerSize = GAME_CONFIG.PLAYER_SIZE;
  const halfSize = playerSize / 2;
  
  // Improved collision detection with more precise boundary checking
  const checkPoints = [
    { x: x - halfSize + 8, y: y - halfSize + 8 }, // Top-left corner (increased margin)
    { x: x + halfSize - 8, y: y - halfSize + 8 }, // Top-right corner
    { x: x - halfSize + 8, y: y + halfSize - 8 }, // Bottom-left corner
    { x: x + halfSize - 8, y: y + halfSize - 8 }, // Bottom-right corner
    { x: x, y: y - halfSize + 4 }, // Top center
    { x: x, y: y + halfSize - 4 }, // Bottom center
    { x: x - halfSize + 4, y: y }, // Left center
    { x: x + halfSize - 4, y: y }, // Right center
    { x: x, y: y } // Center point
  ];
  
  // All check points must be walkable for the position to be valid
  for (const point of checkPoints) {
    if (!isPointWalkable(point.x, point.y, terrain, customWorld, bushObstacles)) {
      return false;
    }
  }
  
  return true;
};

// Helper function to check if a single point is walkable
const isPointWalkable = (x, y, terrain, customWorld = null, bushObstacles = null) => {
  const tileX = Math.floor(x / GAME_CONFIG.TILE_SIZE);
  const tileY = Math.floor(y / GAME_CONFIG.TILE_SIZE);
  const chunkX = Math.floor(tileX / GAME_CONFIG.CHUNK_SIZE);
  const chunkY = Math.floor(tileY / GAME_CONFIG.CHUNK_SIZE);
  const chunkKey = `${chunkX},${chunkY}`;
  
  const chunk = terrain?.get(chunkKey);
  if (!chunk) {
    // Instead of blocking movement, allow it for missing chunks (they'll be generated)
    return true;
  }
  
  const localX = tileX % GAME_CONFIG.CHUNK_SIZE;
  const localY = tileY % GAME_CONFIG.CHUNK_SIZE;
  const tile = chunk.find(t => t.x % GAME_CONFIG.CHUNK_SIZE === localX && t.y % GAME_CONFIG.CHUNK_SIZE === localY);
  
  if (!tile) {
    // Instead of blocking movement, allow it for missing tiles (default to walkable)
    return true;
  }
  
  const terrainWalkable = tile ? TERRAIN_TYPES[tile.type].walkable : true;
  if (!terrainWalkable) {
    return false;
  }
  
  // Check for tree collision on FOREST tiles
  if (tile.type === 'FOREST') {
    // Use the same seeded random logic as the renderer to determine if there's a tree
    const seedValue = (tileX * 73 + tileY * 37) % 1000;
    const hasTree = seedValue > 600; // 40% chance of tree (same as renderer)
    
    if (hasTree) {
      // Calculate tree position and size (matching renderer logic)
      const treeWorldX = tileX * GAME_CONFIG.TILE_SIZE;
      const treeWorldY = tileY * GAME_CONFIG.TILE_SIZE;
      const sizeVariation = 0.7 + (seedValue / 1000) * 0.5;
      const treeSize = Math.floor(GAME_CONFIG.TILE_SIZE * 1.3 * sizeVariation);
      
      // Center the tree with slight random offset (matching renderer)
      const offsetVariationX = ((seedValue * 7) % 100 - 50) / 8;
      const offsetVariationY = ((seedValue * 11) % 100 - 50) / 8;
      const treeCenterX = treeWorldX + (GAME_CONFIG.TILE_SIZE - treeSize) / 2 + offsetVariationX + treeSize / 2;
      const treeCenterY = treeWorldY + (GAME_CONFIG.TILE_SIZE - treeSize) / 2 + offsetVariationY + treeSize / 2;
      
      // Check if player point collides with tree (using circular collision for more natural feel)
      const distanceToTree = Math.sqrt((x - treeCenterX) ** 2 + (y - treeCenterY) ** 2);
      const collisionRadius = treeSize * 0.4; // 40% of tree size for collision
      
      if (distanceToTree <= collisionRadius) {
        return false; // Tree blocks movement
      }
    }
  }

  // Enhanced bush obstacle checking with improved collision system
  // Only block bushes from the specific Bushes directory
  if (bushObstacles && bushObstacles.length > 0) {
    for (const bush of bushObstacles) {
      // Filter to only bushes coming from the Bushes asset directory
      const assetPath = String(bush.asset || '').toLowerCase();
      const isBushesDir = assetPath.includes('/assets/characters/terrain-object/bushes/');
      if (!isBushesDir) continue;

      const bushPixelX = bush.x * GAME_CONFIG.TILE_SIZE;
      const bushPixelY = bush.y * GAME_CONFIG.TILE_SIZE;

      // Use enhanced bush collision system for better hitbox detection
      if (enhancedBushCollisionSystem.checkBushCollision(x, y, bushPixelX, bushPixelY)) {
        return false;
      }
    }
  }
  
  // Enhanced custom world object collision detection
  // Restrict blocking strictly to Bushes directory assets and the Box Idle chest asset
  if (customWorld && customWorld.objects) {
    const gridSize = 32;

    for (const obj of customWorld.objects) {
      if (!obj) continue;

      const idLower = String(obj.assetId || obj.type || '').toLowerCase();
      const pathLower = String(obj.asset || obj.icon || obj.properties?.asset || '').toLowerCase();

      // Only block if the object is a bush from Bushes directory
      const isBushByPath = pathLower.includes('/assets/characters/terrain-object/bushes/');
      const isBushById = idLower === 'bush' || idLower === 'bushes';

      // Or if it’s the specific kings-and-pigs Box Idle asset
      const isBoxIdle = pathLower.includes('/assets/characters/kings-and-pigs/08-box/idle.png');

      // If none of the above, do not block this custom object
      if (!(isBushByPath || isBushById || isBoxIdle)) continue;

      const w = obj.width || gridSize;
      const h = obj.height || gridSize;
      const left = obj.x;
      const top = obj.y;
      const right = left + w;
      const bottom = top + h;

      if (x >= left && x <= right && y >= top && y <= bottom) {
        return false;
      }
    }
  }
  
  return true;
};

// Check if position is accessible for treasure placement
export const isAccessibleForTreasure = (x, y, terrain) => {
  // Check if there's enough clearance around the treasure position
  // Treasure boxes are typically 32x32 pixels, so we need clearance around that
  const treasureSize = 32; // pixels
  const clearance = treasureSize / 2; // Half the treasure size for clearance
  
  // Check multiple points around the treasure position for better coverage
  const checkPoints = [
    // Center point
    { x, y },
    // Cardinal directions
    { x: x - clearance, y },
    { x: x + clearance, y },
    { x, y: y - clearance },
    { x, y: y + clearance },
    // Diagonal directions
    { x: x - clearance * 0.7, y: y - clearance * 0.7 },
    { x: x + clearance * 0.7, y: y - clearance * 0.7 },
    { x: x - clearance * 0.7, y: y + clearance * 0.7 },
    { x: x + clearance * 0.7, y: y + clearance * 0.7 }
  ];
  
  // Count how many points are walkable
  let walkablePoints = 0;
  for (const point of checkPoints) {
    if (isWalkable(point.x, point.y, terrain)) {
      walkablePoints++;
    }
  }
  
  // Require at least 60% of points to be walkable for good accessibility
  const requiredWalkableRatio = 0.6;
  return walkablePoints >= checkPoints.length * requiredWalkableRatio;
};

// Force safe walkable terrain around spawn and stairs
export const createSafeArea = (spawnX, spawnY, stairX, stairY, depthLevel, forcedSafePositions, setForcedSafePositions) => {
  const newForcedSafePositions = new Map(forcedSafePositions);
  const spawnTileX = Math.floor(spawnX / GAME_CONFIG.TILE_SIZE);
  const spawnTileY = Math.floor(spawnY / GAME_CONFIG.TILE_SIZE);
  const stairTileX = Math.floor(stairX / GAME_CONFIG.TILE_SIZE);
  const stairTileY = Math.floor(stairY / GAME_CONFIG.TILE_SIZE);
  const safeTerrainType = depthLevel === 0 ? 'GRASS' : 'CAVE_FLOOR';

  // Create safe areas around spawn and stairs
  const areas = [
    { x: spawnTileX, y: spawnTileY, name: 'spawn' },
    { x: stairTileX, y: stairTileY, name: 'stair' }
  ];

  areas.forEach(area => {
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const tileX = area.x + dx;
        const tileY = area.y + dy;
        const positionKey = `${tileX},${tileY},${depthLevel}`;
        if (!newForcedSafePositions.has(positionKey)) {
          newForcedSafePositions.set(positionKey, safeTerrainType);
        }
      }
    }
  });

  setForcedSafePositions(newForcedSafePositions);
  return { x: spawnX, y: spawnY };
};

// Generate terrain for a specific chunk
export const generateTerrainChunk = (chunkX, chunkY, depthLevel, worldSeed, forcedSafePositions, stairConnections) => {
  const terrain = [];
  
  for (let x = 0; x < GAME_CONFIG.CHUNK_SIZE; x++) {
    for (let y = 0; y < GAME_CONFIG.CHUNK_SIZE; y++) {
      const worldX = chunkX * GAME_CONFIG.CHUNK_SIZE + x;
      const worldY = chunkY * GAME_CONFIG.CHUNK_SIZE + y;
      
      let terrainType = generateTerrainType(worldX, worldY, depthLevel, worldSeed, forcedSafePositions, stairConnections);
      terrain.push({ x: worldX, y: worldY, type: terrainType });
    }
  }
  
  // Add connectivity for cave levels
  if (depthLevel > 0) {
    addCaveConnectivity(terrain, chunkX, chunkY, depthLevel);
  }
  
  return terrain;
};

// Generate terrain type for a specific tile
const generateTerrainType = (worldX, worldY, depthLevel, worldSeed, forcedSafePositions, stairConnections) => {
  // Check for forced safe terrain first
  const positionKey = `${worldX},${worldY},${depthLevel}`;
  const forcedSafeTerrain = forcedSafePositions.get(positionKey);
  if (forcedSafeTerrain) {
    return forcedSafeTerrain;
  }
  
  // Check for forced stair placement
  const forcedStairType = checkForForcedStair(worldX, worldY, depthLevel, stairConnections);
  if (forcedStairType) {
    return forcedStairType;
  }
  
  // Generate terrain based on depth level
  if (depthLevel === 0) {
    return generateSurfaceTerrain(worldX, worldY, worldSeed);
  } else {
    return generateCaveTerrain(worldX, worldY, depthLevel, worldSeed);
  }
};

// Generate surface terrain
const generateSurfaceTerrain = (worldX, worldY, worldSeed) => {
  const seedX = worldSeed + worldX * 0.1;
  const seedY = worldSeed + worldY * 0.1;
  const noise = Math.sin(seedX) * Math.cos(seedY);
  const elevationNoise = Math.sin(seedX * 0.5) * Math.cos(seedY * 0.5);
  const distance = Math.sqrt((worldX - GAME_CONFIG.WORLD_SIZE/2) ** 2 + (worldY - GAME_CONFIG.WORLD_SIZE/2) ** 2);
  
  let terrainType;
  
  // Generate elevation-based terrain
  if (elevationNoise > 0.6) {
    // High elevation areas
    if (noise > 0.3) terrainType = 'MOUNTAIN';
    else if (noise > -0.1) terrainType = 'CLIFF';
    else terrainType = 'ROCKY_GROUND';
  } else if (elevationNoise > 0.2) {
    // Medium elevation areas
    if (noise > 0.4) terrainType = 'HIGH_GRASS';
    else if (noise > 0.7) terrainType = 'FOREST'; // Made forests even less common
    else terrainType = 'ROCKY_GROUND';
  } else if (elevationNoise < -0.3) {
    // Low elevation areas (water)
    terrainType = 'WATER';
  } else {
    // Ground level terrain
    if (noise > 0.75) terrainType = 'FOREST'; // Made forests much less common
    else if (distance > GAME_CONFIG.WORLD_SIZE * 0.45) terrainType = 'DESERT';
    else terrainType = 'GRASS';
  }
  
  // Add cave entrances near cliff areas
  const caveNoise = Math.sin(seedX * 2) * Math.cos(seedY * 2);
  if (terrainType === 'CLIFF' && caveNoise > 0.7) {
    terrainType = 'CAVE_ENTRANCE';
  }
  
  // Add bridges over water
  if (terrainType === 'WATER' && (worldX % 10 === 0 || worldY % 10 === 0)) {
    terrainType = 'BRIDGE';
  }
  
  // Add stairs down at specific location
  const spawnCenterX = GAME_CONFIG.WORLD_SIZE / 2;
  const spawnCenterY = GAME_CONFIG.WORLD_SIZE / 2;
  const stairDownX = Math.floor(spawnCenterX) + 15;
  const stairDownY = Math.floor(spawnCenterY) + 10;
  
  if (worldX === stairDownX && worldY === stairDownY && 
      ['GRASS', 'FOREST', 'DESERT', 'BRIDGE', 'HIGH_GRASS', 'ROCKY_GROUND'].includes(terrainType)) {
    terrainType = 'STAIRS_DOWN';
  }
  
  return terrainType;
};

// Generate cave terrain
const generateCaveTerrain = (worldX, worldY, depthLevel, worldSeed) => {
  const seedX = worldSeed + worldX * 0.1 + depthLevel * 1000;
  const seedY = worldSeed + worldY * 0.1 + depthLevel * 1000;
  const noise = Math.sin(seedX) * Math.cos(seedY);
  const depthFactor = Math.min(depthLevel / 3, 1);
  
  const spawnCenterX = GAME_CONFIG.WORLD_SIZE / 2;
  const spawnCenterY = GAME_CONFIG.WORLD_SIZE / 2;
  const distanceFromSpawn = Math.sqrt((worldX - spawnCenterX) ** 2 + (worldY - spawnCenterY) ** 2);
  const isInSafeZone = distanceFromSpawn < GAME_CONFIG.SAFE_ZONE_RADIUS;
  const isInClearanceZone = distanceFromSpawn < GAME_CONFIG.CLEARANCE_ZONE_RADIUS;
  
  const randomValue = seededRandom(worldSeed + worldX * 1000 + worldY + depthLevel * 10000);
  
  let terrainType;
  
  if (isInSafeZone) {
    if (randomValue < 0.3) terrainType = 'CRYSTAL';
    else if (randomValue < 0.6) terrainType = 'MUSHROOM';
    else terrainType = 'CAVE_FLOOR';
  } else if (isInClearanceZone) {
    if (noise > 0.7) terrainType = 'LAVA';
    else if (noise > 0.5) terrainType = 'CAVE_WALL';
    else if (noise < -0.6) terrainType = 'UNDERGROUND_WATER';
    else if (randomValue < 0.15 + depthFactor * 0.05) terrainType = 'CRYSTAL';
    else if (randomValue < 0.25 + depthFactor * 0.05) terrainType = 'MUSHROOM';
    else terrainType = 'CAVE_FLOOR';
  } else {
    if (noise > 0.4 - depthFactor * 0.1) terrainType = 'LAVA';
    else if (noise > 0.2 - depthFactor * 0.1) terrainType = 'CAVE_WALL';
    else if (noise < -0.3 + depthFactor * 0.1) terrainType = 'UNDERGROUND_WATER';
    else if (randomValue < 0.1 + depthFactor * 0.05) terrainType = 'CRYSTAL';
    else if (randomValue < 0.15 + depthFactor * 0.05) terrainType = 'MUSHROOM';
    else terrainType = 'CAVE_FLOOR';
  }
  
  // Add crystal bridges over lava
  if (!isInSafeZone && terrainType === 'LAVA' && (worldX % 8 === 0 || worldY % 8 === 0)) {
    terrainType = 'CRYSTAL';
  }
  
  // Add stairs
  terrainType = addCaveStairs(worldX, worldY, depthLevel, worldSeed, terrainType, spawnCenterX, spawnCenterY);
  
  return terrainType;
};

// Add stairs to cave levels
const addCaveStairs = (worldX, worldY, depthLevel, worldSeed, terrainType, spawnCenterX, spawnCenterY) => {
  const stairSeed = worldSeed + depthLevel * 12345;
  const stairRandomX = seededRandom(stairSeed + 1000);
  const stairRandomY = seededRandom(stairSeed + 2000);
  const stairRandomX2 = seededRandom(stairSeed + 3000);
  const stairRandomY2 = seededRandom(stairSeed + 4000);
  
  const stairUpX = Math.floor(spawnCenterX) + Math.floor((stairRandomX - 0.5) * 60);
  const stairUpY = Math.floor(spawnCenterY) + Math.floor((stairRandomY - 0.5) * 60);
  const stairDownX = Math.floor(spawnCenterX) + Math.floor((stairRandomX2 - 0.5) * 60);
  const stairDownY = Math.floor(spawnCenterY) + Math.floor((stairRandomY2 - 0.5) * 60);
  
  // Place stairs up
  if (worldX === stairUpX && worldY === stairUpY && 
      ['CAVE_FLOOR', 'CRYSTAL', 'MUSHROOM'].includes(terrainType)) {
    return 'STAIRS_UP';
  }
  
  // Place stairs down (only if not at max depth)
  if (depthLevel < GAME_CONFIG.MAX_DEPTH_LEVEL && 
      worldX === stairDownX && worldY === stairDownY && 
      ['CAVE_FLOOR', 'CRYSTAL', 'MUSHROOM'].includes(terrainType)) {
    return 'STAIRS_DOWN';
  }
  
  return terrainType;
};

// Check for forced stair placement based on connections
const checkForForcedStair = (worldX, worldY, depthLevel, stairConnections) => {
  if (!stairConnections) return null;
  
  for (const [connectionKey, connection] of stairConnections) {
    const [connectionDepth, connectionTileX, connectionTileY] = connectionKey.split('-').map(Number);
    if (connectionDepth === depthLevel && 
        connectionTileX === worldX && 
        connectionTileY === worldY) {
      return connection.stairType;
    }
  }
  return null;
};

// Add connectivity corridors for cave levels
const addCaveConnectivity = (terrain, chunkX, chunkY, depthLevel) => {
  const spawnCenterX = GAME_CONFIG.WORLD_SIZE / 2;
  const spawnCenterY = GAME_CONFIG.WORLD_SIZE / 2;
  const spawnTileX = Math.floor(spawnCenterX);
  const spawnTileY = Math.floor(spawnCenterY);
  const corridorLength = 20;
  
  // Create horizontal corridor
  for (let i = -corridorLength; i <= corridorLength; i++) {
    const corridorX = spawnTileX + i;
    if (corridorX >= chunkX * GAME_CONFIG.CHUNK_SIZE && 
        corridorX < (chunkX + 1) * GAME_CONFIG.CHUNK_SIZE) {
      const tileIndex = terrain.findIndex(t => t.x === corridorX && t.y === spawnTileY);
      if (tileIndex !== -1) {
        terrain[tileIndex].type = 'CAVE_FLOOR';
      }
    }
  }
  
  // Create vertical corridor
  for (let i = -corridorLength; i <= corridorLength; i++) {
    const corridorY = spawnTileY + i;
    if (corridorY >= chunkY * GAME_CONFIG.CHUNK_SIZE && 
        corridorY < (chunkY + 1) * GAME_CONFIG.CHUNK_SIZE) {
      const tileIndex = terrain.findIndex(t => t.x === spawnTileX && t.y === corridorY);
      if (tileIndex !== -1) {
        terrain[tileIndex].type = 'CAVE_FLOOR';
      }
    }
  }
};