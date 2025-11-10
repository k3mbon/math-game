import { GAME_CONFIG } from '../config/gameConfig.js';
import { seededRandom, isWalkable, isAccessibleForTreasure } from './terrainGenerator.js';

// Utility: Euclidean distance in pixels
const distance = (ax, ay, bx, by) => Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);

// Compute optimal spacing for a chunk based on area and desired count
const getOptimalSpacingPx = (chunkSizeTiles, tileSizePx, desiredCount) => {
  const chunkAreaPx = (chunkSizeTiles * tileSizePx) ** 2;
  const perChestArea = chunkAreaPx / Math.max(1, desiredCount);
  const baseSpacing = Math.sqrt(perChestArea);
  // Keep spacing in a reasonable range
  return Math.max(100, Math.min(300, baseSpacing * 0.75));
};

// Compute optimal spacing for the whole world
const getWorldOptimalSpacingPx = (worldSizeTiles, tileSizePx, targetCount) => {
  const worldAreaPx = (worldSizeTiles * tileSizePx) ** 2;
  const perChestArea = worldAreaPx / Math.max(1, targetCount);
  const baseSpacing = Math.sqrt(perChestArea);
  return Math.max(120, Math.min(600, baseSpacing * 0.7));
};

// Read terrain type at a pixel coordinate
const getTerrainTypeAtPx = (x, y, terrain) => {
  const tileX = Math.floor(x / GAME_CONFIG.TILE_SIZE);
  const tileY = Math.floor(y / GAME_CONFIG.TILE_SIZE);
  const chunkX = Math.floor(tileX / GAME_CONFIG.CHUNK_SIZE);
  const chunkY = Math.floor(tileY / GAME_CONFIG.CHUNK_SIZE);
  const chunkKey = `${chunkX},${chunkY}`;
  const chunk = terrain?.get(chunkKey);
  if (!chunk) return null;
  const tile = chunk.find(t => t.x === tileX && t.y === tileY);
  return tile ? tile.type : null;
};

// Generate treasure boxes for a chunk
export const generateTreasureBoxes = (chunkX, chunkY, depthLevel, worldSeed, terrain, existingTreasures = []) => {
  const boxes = [];
  const maxTreasuresPerChunk = depthLevel === 0
    ? (GAME_CONFIG.TREASURE_MAX_PER_CHUNK_SURFACE ?? 1)
    : (GAME_CONFIG.TREASURE_MAX_PER_CHUNK_CAVE ?? 2);
  const chunkSeed = worldSeed + chunkX * 1000 + chunkY * 1000 + depthLevel * 100000;
  
  // World-aware expected count per chunk based on target count
  const chunksPerSide = Math.ceil(GAME_CONFIG.WORLD_SIZE / GAME_CONFIG.CHUNK_SIZE);
  const totalChunks = chunksPerSide * chunksPerSide;
  const targetCount = (typeof GAME_CONFIG.TREASURE_TARGET_COUNT === 'number' && GAME_CONFIG.TREASURE_TARGET_COUNT > 0)
    ? GAME_CONFIG.TREASURE_TARGET_COUNT
    : Math.ceil(totalChunks * (typeof GAME_CONFIG.TREASURE_TARGET_DENSITY === 'number' ? GAME_CONFIG.TREASURE_TARGET_DENSITY : 0.5)); // default ~50% of chunks have a chest
  const expectedPerChunk = targetCount / totalChunks;
  
  // Sample desired count using seeded randomness and per-chunk expectation
  const r = seededRandom(chunkSeed + 77);
  let desiredCount = 0;
  if (expectedPerChunk < 1) {
    desiredCount = r < expectedPerChunk ? 1 : 0;
  } else {
    // If expectation is >= 1, occasionally allow 2
    desiredCount = 1 + (r < (expectedPerChunk - 1) && maxTreasuresPerChunk > 1 ? 1 : 0);
    desiredCount = Math.min(desiredCount, maxTreasuresPerChunk);
  }

  if (desiredCount === 0) return boxes;

  // Calculate spacing based on area and desired count
  const optimalSpacingChunk = getOptimalSpacingPx(GAME_CONFIG.CHUNK_SIZE, GAME_CONFIG.TILE_SIZE, Math.max(1, desiredCount));
  const optimalSpacingWorld = getWorldOptimalSpacingPx(GAME_CONFIG.WORLD_SIZE, GAME_CONFIG.TILE_SIZE, targetCount);
  const minDist = GAME_CONFIG.TREASURE_MIN_DISTANCE || Math.min(optimalSpacingChunk, optimalSpacingWorld) * 0.9;
  const maxDist = GAME_CONFIG.TREASURE_MAX_DISTANCE || Math.max(optimalSpacingChunk, optimalSpacingWorld) * 1.6;

  // Build candidate pool using seeded randomness
  const candidates = [];
  
  // Stratified grid sampling aligned to world spacing, with jitter
  const gridStepTiles = Math.max(2, Math.round(optimalSpacingWorld / GAME_CONFIG.TILE_SIZE));
  for (let lx = 0; lx < GAME_CONFIG.CHUNK_SIZE; lx += gridStepTiles) {
    for (let ly = 0; ly < GAME_CONFIG.CHUNK_SIZE; ly += gridStepTiles) {
      const worldX = chunkX * GAME_CONFIG.CHUNK_SIZE + lx;
      const worldY = chunkY * GAME_CONFIG.CHUNK_SIZE + ly;
      let px = worldX * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
      let py = worldY * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
      const jitter = GAME_CONFIG.TREASURE_JITTER_PX ?? 0;
      if (jitter > 0) {
        const jr = (seededRandom(chunkSeed + worldX * 31 + worldY * 17) * 2 - 1);
        const jt = (seededRandom(chunkSeed + worldX * 19 + worldY * 29) * 2 - 1);
        px += jr * jitter;
        py += jt * jitter;
      }

      // Avoid near-spawn cluster
      const spawnCenterPx = (GAME_CONFIG.WORLD_SIZE / 2) * GAME_CONFIG.TILE_SIZE;
      const avoidRadiusPx = (GAME_CONFIG.TREASURE_AVOID_NEAR_SPAWN_RADIUS_TILES ?? 0) * GAME_CONFIG.TILE_SIZE;
      const dxs = px - spawnCenterPx;
      const dys = py - spawnCenterPx; // center is symmetrical in x,y for square worlds
      if (avoidRadiusPx > 0 && Math.sqrt(dxs * dxs + dys * dys) < avoidRadiusPx) {
        continue;
      }

      // Enhanced accessibility check - ensure chest has proper clearance
      const hasClearance = isAccessibleForTreasure(px, py, terrain);
      const isWalkablePosition = isWalkable(px, py, terrain);
      
      if (hasClearance && isWalkablePosition) {
        // Score by nearest distance, weighted by terrain preference
        let nearest = Infinity;
        for (const t of existingTreasures) {
          nearest = Math.min(nearest, distance(px, py, t.x, t.y));
        }
        for (const t of boxes) {
          nearest = Math.min(nearest, distance(px, py, t.x, t.y));
        }
        const tileType = getTerrainTypeAtPx(px, py, terrain);
        const weight = tileType && GAME_CONFIG.TREASURE_TERRAIN_WEIGHTS?.[tileType] ? GAME_CONFIG.TREASURE_TERRAIN_WEIGHTS[tileType] : 0.8;
        // Add tiny randomness to break ties
        const epsilon = seededRandom(chunkSeed + worldX * 13 + worldY * 7) * 0.05;
        candidates.push({ x: px, y: py, score: nearest * weight * (1 + epsilon) });
      }
    }
  }
  
  // Add a few random candidates for diversity
  const randomCandidateCount = 12;
  for (let i = 0; i < randomCandidateCount; i++) {
    const cx = Math.floor(seededRandom(chunkSeed + i * 13 + 7) * GAME_CONFIG.CHUNK_SIZE);
    const cy = Math.floor(seededRandom(chunkSeed + i * 17 + 11) * GAME_CONFIG.CHUNK_SIZE);
    const worldX = chunkX * GAME_CONFIG.CHUNK_SIZE + cx;
    const worldY = chunkY * GAME_CONFIG.CHUNK_SIZE + cy;
    const px = worldX * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
    const py = worldY * GAME_CONFIG.TILE_SIZE + GAME_CONFIG.TILE_SIZE / 2;
    if (isWalkable(px, py, terrain) && isAccessibleForTreasure(px, py, terrain)) {
      let nearest = Infinity;
      for (const t of existingTreasures) nearest = Math.min(nearest, distance(px, py, t.x, t.y));
      for (const t of boxes) nearest = Math.min(nearest, distance(px, py, t.x, t.y));
      const epsilon = seededRandom(chunkSeed + i * 31) * 0.1;
      candidates.push({ x: px, y: py, score: nearest * (1 + epsilon) });
    }
  }

  // Weighted selection: farthest-point sampling to reduce clustering
  candidates.sort((a, b) => b.score - a.score);
  for (let i = 0; i < candidates.length && boxes.length < desiredCount; i++) {
    const c = candidates[i];
    // Validate spacing constraints
    let nearest = Infinity;
    for (const t of existingTreasures) nearest = Math.min(nearest, distance(c.x, c.y, t.x, t.y));
    for (const t of boxes) nearest = Math.min(nearest, distance(c.x, c.y, t.x, t.y));

    if (nearest < minDist) continue; // too close to another chest
    if (nearest > maxDist && GAME_CONFIG.TREASURE_MAX_DISTANCE) {
      // If extremely isolated, skip occasionally to keep density balanced
      const isolationChance = seededRandom(chunkSeed + i * 29);
      if (isolationChance < 0.25) continue;
    }

    boxes.push({
      id: `treasure_${chunkX}_${chunkY}_${i}_${depthLevel}`,
      x: c.x,
      y: c.y,
      collected: false,
      opened: false,
      depthLevel,
      interactable: true,
      showingQuestion: false
    });
  }

  return boxes;
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
export const generateChunkObjects = (chunkX, chunkY, depthLevel, worldSeed, terrain, existingTreasures = []) => {
  const treasureBoxes = generateTreasureBoxes(chunkX, chunkY, depthLevel, worldSeed, terrain, existingTreasures);
  const monsters = generateMonsters(chunkX, chunkY, depthLevel, worldSeed, terrain);
  
  return {
    treasureBoxes,
    monsters
  };
};