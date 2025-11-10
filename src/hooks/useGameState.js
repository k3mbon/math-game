import { useState, useCallback } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { generateTerrainChunk, isWalkable, seededRandom } from '../utils/terrainGenerator';
import { generateChunkObjects } from '../utils/objectGenerator';

export const useGameState = (initialPlayerX, initialPlayerY) => {
  // Generate initial terrain chunks around player spawn
  const generateInitialTerrain = () => {
    const terrain = new Map();
    const worldSeed = Math.random() * 10000;
    const forcedSafePositions = new Map();
    const stairConnections = new Map();
    const allTreasureBoxes = [];
    const allMonsters = [];
    
    // Helper: read terrain type at a pixel coordinate from generated chunks
    const getTerrainTypeAtPx = (x, y) => {
      const tileX = Math.floor(x / GAME_CONFIG.TILE_SIZE);
      const tileY = Math.floor(y / GAME_CONFIG.TILE_SIZE);
      const chunkX = Math.floor(tileX / GAME_CONFIG.CHUNK_SIZE);
      const chunkY = Math.floor(tileY / GAME_CONFIG.CHUNK_SIZE);
      const chunkKey = `${chunkX},${chunkY}`;
      const chunk = terrain.get(chunkKey);
      if (!chunk) return null;
      const tile = chunk.find(t => t.x === tileX && t.y === tileY);
      return tile ? tile.type : null;
    };
    
    // Calculate initial camera position
    const initialCameraX = Math.max(0, Math.min(
      GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE - GAME_CONFIG.CANVAS_WIDTH, 
      initialPlayerX - GAME_CONFIG.CANVAS_WIDTH / 2
    ));
    const initialCameraY = Math.max(0, Math.min(
      GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE - GAME_CONFIG.CANVAS_HEIGHT, 
      initialPlayerY - GAME_CONFIG.CANVAS_HEIGHT / 2
    ));
    
    // Calculate chunks around initial camera position
    const cameraChunkX = Math.floor(initialCameraX / (GAME_CONFIG.CHUNK_SIZE * GAME_CONFIG.TILE_SIZE));
    const cameraChunkY = Math.floor(initialCameraY / (GAME_CONFIG.CHUNK_SIZE * GAME_CONFIG.TILE_SIZE));
    
    // Generate initial chunks in render distance
    for (let dx = -GAME_CONFIG.RENDER_DISTANCE; dx <= GAME_CONFIG.RENDER_DISTANCE; dx++) {
      for (let dy = -GAME_CONFIG.RENDER_DISTANCE; dy <= GAME_CONFIG.RENDER_DISTANCE; dy++) {
        const chunkX = cameraChunkX + dx;
        const chunkY = cameraChunkY + dy;
        const chunkKey = `${chunkX},${chunkY}`;
        
        const chunkTerrain = generateTerrainChunk(
          chunkX, 
          chunkY, 
          0, // Initial depth level
          worldSeed, 
          forcedSafePositions, 
          stairConnections
        );
        terrain.set(chunkKey, chunkTerrain);
        
        // Generate objects for this chunk (pass existing chests to enforce spacing)
        const chunkObjects = generateChunkObjects(
          chunkX,
          chunkY,
          0, // Initial depth level
          worldSeed,
          terrain,
          allTreasureBoxes
        );
        
        allTreasureBoxes.push(...chunkObjects.treasureBoxes);
        // Keep chest generation as-is; we'll override monsters globally below
        allMonsters.push(...chunkObjects.monsters);
      }
    }
    
    // Ensure spawn starts on GRASS. If not, relocate to nearest GRASS in radius.
    let spawnX = initialPlayerX;
    let spawnY = initialPlayerY;
    if (getTerrainTypeAtPx(spawnX, spawnY) !== 'GRASS') {
      const maxRadiusTiles = 12;
      let found = false;
      for (let r = 1; r <= maxRadiusTiles && !found; r++) {
        for (let dx = -r; dx <= r && !found; dx++) {
          for (let dy = -r; dy <= r && !found; dy++) {
            const px = spawnX + dx * GAME_CONFIG.TILE_SIZE;
            const py = spawnY + dy * GAME_CONFIG.TILE_SIZE;
            if (getTerrainTypeAtPx(px, py) === 'GRASS') {
              spawnX = px;
              spawnY = py;
              found = true;
            }
          }
        }
      }
    }
    
    // Override: spawn exactly 24 monsters globally across the map, random areas
    const spawnGlobalMonsters = (count) => {
      const monsters = [];
      const attempts = Math.max(1000, count * 100);
      let tries = 0;
      const worldPixelSize = GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE;
      const safeRadiusPx = GAME_CONFIG.CHUNK_SIZE * 5 * GAME_CONFIG.TILE_SIZE; // match chunk-based safe zone

      while (monsters.length < count && tries < attempts) {
        const px = Math.floor(seededRandom(worldSeed + tries * 97) * worldPixelSize);
        const py = Math.floor(seededRandom(worldSeed + tries * 193) * worldPixelSize);

        // Keep away from spawn safe zone
        const dx = px - worldPixelSize / 2;
        const dy = py - worldPixelSize / 2;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < safeRadiusPx) { tries++; continue; }

        // Place only on walkable tiles
        if (!isWalkable(px, py, terrain)) { tries++; continue; }

        // Randomize type; include pig-themed monster mapping via renderer
        const typePool = ['goblin', 'orc', 'dragon'];
        const typeIndex = Math.floor(seededRandom(worldSeed + tries * 379) * typePool.length);
        const monsterType = typePool[typeIndex];

        monsters.push({
          id: `monster_global_${monsters.length}_${Math.floor(worldSeed)}`,
          x: px,
          y: py,
          type: monsterType,
          health: 100,
          maxHealth: 100,
          damage: 12,
          speed: 1,
          depthLevel: 0,
          lastMoveTime: 0,
          direction: Math.floor(seededRandom(worldSeed + tries * 523) * 4)
        });
        tries++;
      }
      return monsters;
    };

    const globalMonsters = spawnGlobalMonsters(24);

    return { terrain, worldSeed, stairConnections, treasureBoxes: allTreasureBoxes, monsters: globalMonsters, spawnX, spawnY };
  };
  
  const { terrain: initialTerrain, worldSeed, stairConnections, treasureBoxes: initialTreasureBoxes, monsters: initialMonsters, spawnX, spawnY } = generateInitialTerrain();
  
  const [gameState, setGameState] = useState({
    player: { 
      x: spawnX, 
      y: spawnY, 
      health: 100, 
      maxHealth: 100 
    },
    camera: { 
      x: Math.max(0, Math.min(
        GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE - GAME_CONFIG.CANVAS_WIDTH, 
        spawnX - GAME_CONFIG.CANVAS_WIDTH / 2
      )), 
      y: Math.max(0, Math.min(
        GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE - GAME_CONFIG.CANVAS_HEIGHT, 
        spawnY - GAME_CONFIG.CANVAS_HEIGHT / 2
      ))
    },
    treasureBoxes: initialTreasureBoxes,
    monsters: initialMonsters,
    terrain: initialTerrain,
    showProblemPopup: false,
    currentProblem: null,
    solvedProblems: new Set(),
    score: 0,
    crystalsCollected: 0,
    checkpoints: [],
    lastCheckpoint: { x: spawnX, y: spawnY },
    problemStartTime: null,
    lastInteractionTime: 0,
    worldSeed: worldSeed,
    worldType: Math.random() > 0.5 ? 'surface' : 'cave',
    depthLevel: 0,
    stairConnections: stairConnections
  });

  const updateGameState = useCallback((updater) => {
    setGameState(prev => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return { ...prev, ...updater };
    });
  }, []);

  const updatePlayer = useCallback((playerUpdate) => {
    setGameState(prev => ({
      ...prev,
      player: { ...prev.player, ...playerUpdate }
    }));
  }, []);

  const updateCamera = useCallback((cameraUpdate) => {
    setGameState(prev => ({
      ...prev,
      camera: { ...prev.camera, ...cameraUpdate }
    }));
  }, []);

  const addTerrain = useCallback((chunkKey, terrainData) => {
    setGameState(prev => {
      const newTerrain = new Map(prev.terrain);
      newTerrain.set(chunkKey, terrainData);
      return { ...prev, terrain: newTerrain };
    });
  }, []);

  const updateTreasureBox = useCallback((treasureId, update) => {
    setGameState(prev => ({
      ...prev,
      treasureBoxes: prev.treasureBoxes.map(treasure => 
        treasure.id === treasureId ? { ...treasure, ...update } : treasure
      )
    }));
  }, []);

  return {
    gameState,
    updateGameState,
    updatePlayer,
    updateCamera,
    addTerrain,
    updateTreasureBox
  };
};