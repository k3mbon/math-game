import { GAME_CONFIG } from '../config/gameConfig';
import { seededRandom, isWalkable } from './terrainGenerator';

// Generate treasure boxes for a chunk
export const generateTreasureBoxes = (chunkX, chunkY, depthLevel, worldSeed, terrain) => {
  const treasureBoxes = [];
  // Reduced treasure count: 0-2 treasures per chunk (roughly 10-15 per map)
  const maxTreasuresPerChunk = depthLevel === 0 ? 1 : 2;
  
  // Use chunk-based seeding for consistent generation
  const chunkSeed = worldSeed + chunkX * 1000 + chunkY * 1000 + depthLevel * 100000;
  const treasureCount = Math.floor(seededRandom(chunkSeed) * (maxTreasuresPerChunk + 1));
  
  for (let i = 0; i < treasureCount; i++) {
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
      // Generate random position within chunk
      const x = Math.floor(seededRandom(chunkSeed + i * 100 + attempts) * GAME_CONFIG.CHUNK_SIZE);
      const y = Math.floor(seededRandom(chunkSeed + i * 200 + attempts + 50) * GAME_CONFIG.CHUNK_SIZE);
      
      const worldX = chunkX * GAME_CONFIG.CHUNK_SIZE + x;
      const worldY = chunkY * GAME_CONFIG.CHUNK_SIZE + y;
      const treasureX = worldX * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
      const treasureY = worldY * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
      
      // Check if position is walkable
      if (isWalkable(treasureX, treasureY, terrain)) {
        treasureBoxes.push({
          id: `treasure_${chunkX}_${chunkY}_${i}_${depthLevel}`,
          x: treasureX,
          y: treasureY,
          collected: false,
          opened: false,
          depthLevel: depthLevel,
          interactable: true,
          showingQuestion: false
        });
        break;
      }
      attempts++;
    }
  }
  
  return treasureBoxes;
};

// Generate monsters for a chunk
export const generateMonsters = (chunkX, chunkY, depthLevel, worldSeed, terrain) => {
  const monsters = [];
  const monsterSpawnRate = depthLevel === 0 ? 0.01 : 0.025; // Higher spawn rate in caves
  
  // Don't spawn monsters too close to spawn point
  const spawnCenterX = GAME_CONFIG.WORLD_SIZE / 2;
  const spawnCenterY = GAME_CONFIG.WORLD_SIZE / 2;
  const chunkCenterX = chunkX * GAME_CONFIG.CHUNK_SIZE + GAME_CONFIG.CHUNK_SIZE / 2;
  const chunkCenterY = chunkY * GAME_CONFIG.CHUNK_SIZE + GAME_CONFIG.CHUNK_SIZE / 2;
  const distanceFromSpawn = Math.sqrt(
    (chunkCenterX - spawnCenterX) ** 2 + (chunkCenterY - spawnCenterY) ** 2
  );
  
  // No monsters within 5 chunks of spawn
  if (distanceFromSpawn < 5 * GAME_CONFIG.CHUNK_SIZE) {
    return monsters;
  }
  
  for (let x = 0; x < GAME_CONFIG.CHUNK_SIZE; x += 3) { // Check every 3 tiles
    for (let y = 0; y < GAME_CONFIG.CHUNK_SIZE; y += 3) {
      const worldX = chunkX * GAME_CONFIG.CHUNK_SIZE + x;
      const worldY = chunkY * GAME_CONFIG.CHUNK_SIZE + y;
      
      // Use seeded random for consistent generation
      const monsterSeed = worldSeed + worldX * 2000 + worldY * 3 + depthLevel * 200000;
      const spawnChance = seededRandom(monsterSeed);
      
      if (spawnChance < monsterSpawnRate) {
        const monsterX = worldX * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
        const monsterY = worldY * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
        
        // Check if position is walkable
        if (isWalkable(monsterX, monsterY, terrain)) {
          // Determine monster type based on depth level
          const monsterTypes = depthLevel === 0 
            ? ['goblin', 'orc']
            : ['dragon', 'goblin', 'orc'];
          
          const typeIndex = Math.floor(seededRandom(monsterSeed + 1000) * monsterTypes.length);
          const monsterType = monsterTypes[typeIndex];
          
          monsters.push({
            id: `monster_${chunkX}_${chunkY}_${x}_${y}_${depthLevel}`,
            x: monsterX,
            y: monsterY,
            type: monsterType,
            health: 50 + depthLevel * 25,
            maxHealth: 50 + depthLevel * 25,
            damage: 10 + depthLevel * 5,
            speed: 1 + depthLevel * 0.5,
            depthLevel: depthLevel,
            lastMoveTime: 0,
            direction: Math.floor(seededRandom(monsterSeed + 2000) * 4) // 0=up, 1=right, 2=down, 3=left
          });
        }
      }
    }
  }
  
  return monsters;
};

// Get all objects (treasure boxes and monsters) for a chunk
export const generateChunkObjects = (chunkX, chunkY, depthLevel, worldSeed, terrain) => {
  const treasureBoxes = generateTreasureBoxes(chunkX, chunkY, depthLevel, worldSeed, terrain);
  const monsters = generateMonsters(chunkX, chunkY, depthLevel, worldSeed, terrain);
  
  return {
    treasureBoxes,
    monsters
  };
};