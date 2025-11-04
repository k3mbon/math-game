import { useState, useCallback } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { generateTerrainChunk } from '../utils/terrainGenerator';
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
        allMonsters.push(...chunkObjects.monsters);
      }
    }
    
    return { terrain, worldSeed, stairConnections, treasureBoxes: allTreasureBoxes, monsters: allMonsters };
  };
  
  const { terrain: initialTerrain, worldSeed, stairConnections, treasureBoxes: initialTreasureBoxes, monsters: initialMonsters } = generateInitialTerrain();
  
  const [gameState, setGameState] = useState({
    player: { 
      x: initialPlayerX, 
      y: initialPlayerY, 
      health: 100, 
      maxHealth: 100 
    },
    camera: { 
      x: Math.max(0, Math.min(
        GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE - GAME_CONFIG.CANVAS_WIDTH, 
        initialPlayerX - GAME_CONFIG.CANVAS_WIDTH / 2
      )), 
      y: Math.max(0, Math.min(
        GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE - GAME_CONFIG.CANVAS_HEIGHT, 
        initialPlayerY - GAME_CONFIG.CANVAS_HEIGHT / 2
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
    lastCheckpoint: null,
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