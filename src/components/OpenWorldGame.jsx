import React, { useRef, useEffect, useState, useCallback } from 'react';
import './OpenWorldGame.css';
import { GAME_CONFIG } from '../config/gameConfig';
import { useGameState } from '../hooks/useGameState';
import { useGameLoop } from '../hooks/useGameLoop.jsx';
import { generateTerrainChunk, isWalkable } from '../utils/terrainGenerator';
import { generateTerrainMap, preloadTileImages, preloadCharacterSprite, GRASS_TILES } from '../utils/grassTileMapping';
import { loadAllGrassTiles } from '../utils/grassTileLoader';
import { terrainBoundarySystem } from '../utils/terrainBoundarySystem';
import CanvasRenderer from './CanvasRenderer';
import HumanCharacter from './HumanCharacter';
import TreasureQuestionModal from './TreasureQuestionModal';
import GameStartMenu from './GameStartMenu';
import GameMenu from './GameMenu';
import TerrainRenderer, { getStoredTerrainData, hasStoredTerrain, getWalkableTiles, getCollisionTiles } from './TerrainRenderer';
import numerationProblems from '../data/NumerationProblem.json';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { gameProfiler, usePerformanceMonitor } from '../utils/performanceProfiler';
import { useResourceManager } from '../utils/resourceManager';
import PerformanceMonitor from './PerformanceMonitor';
import { soundEffects } from '../utils/soundEffects';

// Import testing framework in development mode
if (process.env.NODE_ENV === 'development') {
  import('../tests/index.js').then(tests => {
    window.mathGameTestFramework = tests;
    console.log('🧪 Math Game Test Framework loaded and available at window.mathGameTestFramework');
  });
}

// Import SVG assets using Vite's asset handling
import playerSvg from '../assets/player.svg';
import playerFrontSvg from '../assets/player-front.svg';
import playerBackSvg from '../assets/player-back.svg';
import playerLeftSvg from '../assets/player-left.svg';
import playerRightSvg from '../assets/player-right.svg';
import treeSvg from '../assets/forest-tree.svg';
import realisticTreeSvg from '../assets/realistic-tree.svg';
import bridgeSvg from '../assets/wooden-bridge.svg';
import cliffSvg from '../assets/cliff.svg';
import highGrassSvg from '../assets/high-grass.svg';
import rockyGroundSvg from '../assets/rocky-ground.svg';
import caveEntranceSvg from '../assets/cave-entrance.svg';
import realisticWaterSvg from '../assets/realistic-water.svg';
import realisticRockSvg from '../assets/realistic-rock.svg';
import realisticTreasureSvg from '../assets/realistic-treasure.svg';
import realisticTreasureOpenedSvg from '../assets/realistic-treasure-opened.svg';
import sproutPlayerSvg from '../assets/sprout-lands/character-player.svg';
import sproutCoinSvg from '../assets/sprout-lands/item-coin.svg';

// Import water-grass shoreline assets
import waterGrassShorelineVerticalSvg from '../assets/realistic-water-grass-shoreline-vertical.svg';
import waterGrassShorelineSvg from '../assets/realistic-water-grass-shoreline.svg';
import realisticGrassSvg from '../assets/realistic-grass.svg';
import grassWaterShorelineCornerSvg from '../assets/realistic-grass-water-shoreline-corner.svg';

// Import monster assets
import monsterGoblinSvg from '/assets/monster-goblin.svg';
import monsterDragonSvg from '/assets/monster-dragon.svg';
import monsterOrcSvg from '/assets/monster-orc.svg';

const OpenWorldGame = () => {
  console.log('🔍 OpenWorldGame component is rendering');
  
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  
  // Initialize performance monitoring with null checks
  const performanceMonitor = usePerformanceMonitor(true);
  const { profiler, startTimer, endTimer, getReport, getSuggestions } = performanceMonitor || {
    profiler: null,
    startTimer: () => {},
    endTimer: () => {},
    getReport: () => null,
    getSuggestions: () => []
  };
  
  // Initialize resource management
  const resourceManager = useResourceManager();
  
  const [gameStarted, setGameStarted] = useState(true); // Start directly in game
  const [gamePaused, setGamePaused] = useState(false); // Game pause state
  const [keys, setKeys] = useState({});
  const [playerDirection, setPlayerDirection] = useState('front'); // front, back, left, right
  const [grassTilesLoaded, setGrassTilesLoaded] = useState(false); // Track grass tile loading
  
  // Add debug rendering state
  const [debugMode, setDebugMode] = useState(false);
  const [renderingStats, setRenderingStats] = useState({
    imagesLoaded: 0,
    totalImages: 0,
    canvasReady: false,
    lastRenderTime: 0
  });
  const [forcedSafePositions, setForcedSafePositions] = useState(new Map());
  const [stairConnections, setStairConnections] = useState(new Map());
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackTarget, setAttackTarget] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentTreasureBox, setCurrentTreasureBox] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [animationState, setAnimationState] = useState('idle');
  const [customTerrain, setCustomTerrain] = useState(null);
  const [useCustomTerrain, setUseCustomTerrain] = useState(false);
  const [terrainLevel, setTerrainLevel] = useState(0);
  const [loadedTerrainFile, setLoadedTerrainFile] = useState(null);
  const [terrainType, setTerrainType] = useState('grass'); // Options: 'default', 'grass' - Start with grass to show tile assignments
  const [grassTerrainMap, setGrassTerrainMap] = useState(null);
  const [bushObstacles, setBushObstacles] = useState([]);
  const [grassTileImages, setGrassTileImages] = useState({
    grassTopLeft: null,
    grassTop: null,
    grassTopRight: null,
    grassLeft: null,
    grassCenter: null,
    grassRight: null,
    grassBottomLeft: null,
    grassBottom: null,
    grassBottomRight: null
  });
  const [loadedImages, setLoadedImages] = useState({
    player: useRef(null),
    playerFront: useRef(null),
    playerBack: useRef(null),
    playerLeft: useRef(null),
    playerRight: useRef(null),
    playerSprite: useRef(null),
    tree: useRef(null),
    realisticTree: useRef(null),
    bridge: useRef(null),
    cliff: useRef(null),
    highGrass: useRef(null),
    rockyGround: useRef(null),
    caveEntrance: useRef(null),
    realisticWater: useRef(null),
    realisticRock: useRef(null),
    realisticTreasure: useRef(null),
    treasureOpened: useRef(null),
    sproutPlayer: useRef(null),
    sproutCoin: useRef(null),
    monsterGoblin: useRef(null),
    monsterDragon: useRef(null),
    monsterOrc: useRef(null),
    waterGrassShorelineVertical: useRef(null),
    waterGrassShoreline: useRef(null),
    realisticGrass: useRef(null),
    grassWaterShorelineCorner: useRef(null),
    // Grass terrain tiles
    grassTopLeft: useRef(null),
    grassTop: useRef(null),
    grassTopRight: useRef(null),
    grassLeft: useRef(null),
    grassCenter: useRef(null),
    grassRight: useRef(null),
    grassBottomLeft: useRef(null),
    grassBottom: useRef(null),
    grassBottomRight: useRef(null)
  });

  // Initialize player position - start at reasonable position
  const initialPlayerX = 500; // Start at a more central position
  const initialPlayerY = 500;
  
  const { gameState, updateGameState } = useGameState(initialPlayerX, initialPlayerY);

  // Load grass terrain tiles
  useEffect(() => {
    const loadGrassTiles = async () => {
      try {
        console.log('🌱 Loading grass tiles for border pattern system...');
        
        // Use the new grass tile loader for proper border pattern support
        await loadAllGrassTiles();
        
        console.log('✅ All grass tile images loaded via grass tile loader');
        
        // Set grass tiles loaded state to trigger re-render
        setGrassTilesLoaded(true);
        console.log('🔄 Grass tiles loaded state set to true - triggering re-render');
        
        // Generate a default grass terrain map (20x20) with bush obstacles
        const terrainData = generateTerrainMap(20, 20);
        setGrassTerrainMap(terrainData.map);
        setBushObstacles(terrainData.bushObstacles);
        
        console.log('✅ Grass terrain map generated:', terrainData.map);
        console.log('📊 Grass map dimensions:', terrainData.dimensions);
        console.log('🌿 Bush obstacles:', terrainData.bushObstacles.length);
        
        // Initialize terrain boundary system
        terrainBoundarySystem.initialize();
        console.log('🛡️ Terrain boundary system initialized');
      } catch (error) {
        console.error("Error loading grass tiles:", error);
      }
    };
    
    loadGrassTiles();
  }, []);

  // Monitor grass tile loading status
  useEffect(() => {
    const allImagesLoaded = Object.values(grassTileImages).every(img => img !== null);
    if (allImagesLoaded && grassTileImages.grassCenter) {
      console.log('🎉 All grass tile images loaded in state:', {
        grassTopLeft: !!grassTileImages.grassTopLeft,
        grassTop: !!grassTileImages.grassTop,
        grassTopRight: !!grassTileImages.grassTopRight,
        grassLeft: !!grassTileImages.grassLeft,
        grassCenter: !!grassTileImages.grassCenter,
        grassRight: !!grassTileImages.grassRight,
        grassBottomLeft: !!grassTileImages.grassBottomLeft,
        grassBottom: !!grassTileImages.grassBottom,
        grassBottomRight: !!grassTileImages.grassBottomRight
      });
      console.log('🔍 Sample grass image properties:', {
        centerComplete: grassTileImages.grassCenter?.complete,
        centerNaturalWidth: grassTileImages.grassCenter?.naturalWidth,
        centerNaturalHeight: grassTileImages.grassCenter?.naturalHeight
      });
    }
  }, [grassTileImages]);

  // Load custom terrain data on component mount
  useEffect(() => {
    const loadTerrainData = async () => {
      // FIRST: Try to auto-load from terrain-data folder (highest priority)
      const commonFilenames = [
        'terrain-seamless-20x20-1757078777334.json', // Match the actual file in the folder
        'terrain-seamless-30x30-1757064238777.json', // Previous files as fallback
        'terrain-seamless-30x30-1757059823695.json',
        'terrain.json',
        'custom-terrain.json',
        'level-design.json',
        'world.json'
      ];

      // Try to load any terrain-seamless files with wildcard pattern
      const seamlessPatterns = [
        'terrain-seamless-20x20-1757078777334.json', // Updated to match the actual file
        'terrain-seamless-30x30-1757064238777.json',
        'terrain-seamless-30x30-1757059823695.json'
      ];

      for (const filename of commonFilenames) {
        try {
          console.log(`Trying to load: /terrain-data/${filename}`);
          const response = await fetch(`/terrain-data/${filename}`);
          if (response.ok) {
            const terrainData = await response.json();
            console.log('Auto-loaded terrain from:', filename, terrainData);
            
            // Validate terrain data structure
            if (terrainData.levels) {
              // Clear all existing terrain state first
              setCustomTerrain(null);
              setUseCustomTerrain(false);
              
              // Force immediate re-render by clearing terrain chunks
              updateGameState(prevState => ({
                ...prevState,
                terrainChunks: new Map(),
                currentTerrain: null,
                worldSeed: Math.random() + Date.now()
              }));
              
                  // Then set the new terrain data after a brief delay
                setTimeout(() => {
                  console.log('Setting custom terrain data:', terrainData);
                  console.log('Terrain data keys:', Object.keys(terrainData));
                  console.log('Terrain data.levels:', terrainData.levels);
                  console.log('Terrain data.levels type:', typeof terrainData.levels);
                  console.log('Terrain data.levels keys:', terrainData.levels ? Object.keys(terrainData.levels) : 'no levels');
                  
                  setCustomTerrain(terrainData);
                  setLoadedTerrainFile(filename);
                  setUseCustomTerrain(true);                  // Store in localStorage for persistence
                  localStorage.setItem('terrainDesign', JSON.stringify(terrainData));
                  localStorage.setItem('useCustomTerrain', 'true');
                  
                  // Also store in TerrainRenderer format for compatibility
                  localStorage.setItem('terrainData', JSON.stringify(terrainData));
                  localStorage.setItem('customTerrain', JSON.stringify(terrainData));
                  
                  // Force complete terrain regeneration and reset player position
                  updateGameState(prevState => ({
                    ...prevState,
                    terrainChunks: new Map(),
                    currentTerrain: null,
                    worldSeed: Math.random() + Date.now(),
                    // Reset player to start of custom terrain world
                    player: {
                      ...prevState.player,
                      x: 500, // Start at a more central position
                      y: 500
                    },
                    camera: {
                      x: 500 - GAME_CONFIG.CANVAS_WIDTH / 2,
                      y: 500 - GAME_CONFIG.CANVAS_HEIGHT / 2
                    }
                  }));
                  
                  console.log('✅ Successfully auto-loaded terrain from:', filename);
                  console.log('Custom terrain enabled:', true);
                  console.log('Terrain data structure:', Object.keys(terrainData));
                  console.log('Level 0 data sample:', terrainData.levels[0]?.[0]?.[0]);
                  
                  // Force immediate terrain generation for current view
                  setTimeout(() => {
                    console.log('🔧 Forcing terrain regeneration...');
                    const playerChunkX = Math.floor(gameState.player.x / GAME_CONFIG.CHUNK_SIZE);
                    const playerChunkY = Math.floor(gameState.player.y / GAME_CONFIG.CHUNK_SIZE);
                    
                    // Generate terrain around player
                    for (let dx = -1; dx <= 1; dx++) {
                      for (let dy = -1; dy <= 1; dy++) {
                        const chunkX = playerChunkX + dx;
                        const chunkY = playerChunkY + dy;
                        const terrain = generateCustomTerrain(chunkX, chunkY, 0);
                        console.log(`Generated terrain for chunk ${chunkX},${chunkY}:`, terrain.size, 'tiles');
                      }
                    }
                  }, 200);
                }, 100);              return; // Exit early - terrain loaded successfully
            }
          }
        } catch (error) {
          // Continue to next filename
          console.log(`File ${filename} not found, trying next...`);
        }
      }
      
      // SECOND: Fallback to stored terrain if no files found in folder
      let storedTerrain = getStoredTerrainData();
      
      // Check for terrain data in the old key (migration support)
      if (!storedTerrain) {
        try {
          const oldTerrain = localStorage.getItem('customTerrainData');
          if (oldTerrain) {
            storedTerrain = JSON.parse(oldTerrain);
            // Migrate to new key
            localStorage.setItem('terrainDesign', oldTerrain);
            localStorage.removeItem('customTerrainData');
          }
        } catch (error) {
          console.error('Error migrating old terrain data:', error);
        }
      }
      
      if (storedTerrain && hasStoredTerrain()) {
        setCustomTerrain(storedTerrain);
        setUseCustomTerrain(true);
        console.log('Loaded stored terrain design:', storedTerrain);
      } else {
        console.log('No terrain files found - using default terrain generation');
      }
    };

    loadTerrainData();
  }, []);

  // Progress saving functionality
  useEffect(() => {
    // Load saved progress on component mount
    const loadSavedProgress = () => {
      try {
        const savedProgress = localStorage.getItem('openWorldGameProgress');
        if (savedProgress) {
          const progress = JSON.parse(savedProgress);
          updateGameState(prev => ({
            ...prev,
            crystalsCollected: progress.crystalsCollected || 0,
            treasureBoxes: prev.treasureBoxes.map(treasure => {
              const savedTreasure = progress.completedTreasures?.find(t => t.id === treasure.id);
              return savedTreasure ? { ...treasure, collected: true } : treasure;
            }),
            score: progress.score || 0
          }));
          console.log('✅ Loaded saved progress:', progress);
        }
      } catch (error) {
        console.error('Failed to load saved progress:', error);
      }
    };

    loadSavedProgress();
  }, [updateGameState]);

  // Save progress whenever game state changes
  useEffect(() => {
    const saveProgress = () => {
      try {
        const completedTreasures = gameState.treasureBoxes
          .filter(treasure => treasure.collected)
          .map(treasure => ({ id: treasure.id, collected: true }));
        
        const progress = {
          crystalsCollected: gameState.crystalsCollected,
          completedTreasures,
          score: gameState.score,
          lastSaved: Date.now()
        };
        
        localStorage.setItem('openWorldGameProgress', JSON.stringify(progress));
        console.log('💾 Progress saved:', progress);
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    };

    // Debounce saving to avoid excessive localStorage writes
    const timeoutId = setTimeout(saveProgress, 1000);
    return () => clearTimeout(timeoutId);
  }, [gameState.crystalsCollected, gameState.treasureBoxes, gameState.score]);

  // Handle terrain file upload
  const handleTerrainFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const terrainData = JSON.parse(e.target.result);
          console.log('Loaded terrain file:', terrainData);
          
          // Validate terrain data structure
          if (terrainData.levels && terrainData.dimensions) {
            setCustomTerrain(terrainData);
            setLoadedTerrainFile(file.name);
            setUseCustomTerrain(true);
            
            // Store in localStorage for persistence (using the same key as TerrainRenderer)
            localStorage.setItem('terrainDesign', JSON.stringify(terrainData));
            
            // Force terrain regeneration without page reload
            updateGameState(prevState => ({
              ...prevState,
              currentTerrain: null,
              terrainChunks: new Map(),
              worldSeed: Math.random() // Force new terrain generation
            }));
          } else {
            alert('Invalid terrain file format. Please use a file exported from the Terrain Designer.');
          }
        } catch (error) {
          console.error('Error parsing terrain file:', error);
          alert('Error reading terrain file. Please check the file format.');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid JSON file.');
    }
  };

  // Load terrain from public directory
  const loadPresetTerrain = async (filename) => {
    try {
      const response = await fetch(`/terrain-data/${filename}`);
      if (response.ok) {
        const terrainData = await response.json();
        console.log('Loaded preset terrain:', terrainData);
        
        setCustomTerrain(terrainData);
        setLoadedTerrainFile(filename);
        setUseCustomTerrain(true);
        
        // Store in localStorage for persistence (using the same key as TerrainRenderer)
        localStorage.setItem('terrainDesign', JSON.stringify(terrainData));
        
        // Force terrain regeneration without page reload
        updateGameState(prevState => ({
          ...prevState,
          currentTerrain: null,
          terrainChunks: new Map(),
          worldSeed: Math.random() // Force new terrain generation
        }));
      } else {
        alert(`Failed to load terrain file: ${filename}`);
      }
    } catch (error) {
      console.error('Error loading preset terrain:', error);
      alert('Error loading terrain file.');
    }
  };

  // Force player position reset when custom terrain is available
  useEffect(() => {
    if (useCustomTerrain && customTerrain) {
      console.log('🔄 Custom terrain detected, resetting player position immediately');
      const newPlayerX = 500; // Start at a more central position  
      const newPlayerY = 500;
      const newCameraX = newPlayerX - GAME_CONFIG.CANVAS_WIDTH / 2;
      const newCameraY = newPlayerY - GAME_CONFIG.CANVAS_HEIGHT / 2;
      
      console.log('🎯 Setting player position to:', { x: newPlayerX, y: newPlayerY });
      console.log('📷 Setting camera position to:', { x: newCameraX, y: newCameraY });
      console.log('🖼️ Canvas size:', { width: GAME_CONFIG.CANVAS_WIDTH, height: GAME_CONFIG.CANVAS_HEIGHT });
      console.log('🧩 Player chunk:', { x: Math.floor(newPlayerX / (GAME_CONFIG.CHUNK_SIZE * GAME_CONFIG.TILE_SIZE)), y: Math.floor(newPlayerY / (GAME_CONFIG.CHUNK_SIZE * GAME_CONFIG.TILE_SIZE)) });
      
      updateGameState(prevState => ({
        ...prevState,
        player: {
          ...prevState.player,
          x: newPlayerX,
          y: newPlayerY
        },
        camera: {
          x: newCameraX,
          y: newCameraY
        },
        terrain: new Map(), // Clear terrain to force regeneration
        currentTerrain: null
      }));
    }
  }, [useCustomTerrain, customTerrain, updateGameState]);

  // Terrain generation function
  const generateTerrain = useCallback((chunkX, chunkY, depthLevel) => {
    // Debug logging
    console.log('🗺️ generateTerrain called:', { 
      chunkX, 
      chunkY, 
      depthLevel, 
      useCustomTerrain, 
      hasCustomTerrain: !!customTerrain,
      customTerrainLevels: customTerrain ? Object.keys(customTerrain.levels || {}) : 'none',
      playerPos: gameState?.player ? `(${gameState.player.x}, ${gameState.player.y})` : 'unknown',
      cameraPos: gameState?.camera ? `(${gameState.camera.x}, ${gameState.camera.y})` : 'unknown'
    });
    
    // Use custom terrain if available and enabled
    if (useCustomTerrain && customTerrain) {
      console.log('🎯 Using custom terrain generation for chunk', chunkX, chunkY);
      return generateCustomTerrain(chunkX, chunkY, depthLevel);
    }
    
    console.log('🌱 Using default terrain generation for chunk', chunkX, chunkY);
    const defaultTerrain = generateTerrainChunk(
      chunkX, 
      chunkY, 
      depthLevel, 
      gameState.worldSeed, 
      forcedSafePositions, 
      stairConnections
    );
    
    // TEMPORARY FIX: Force all terrain to be walkable
    return defaultTerrain.map(tile => ({
      ...tile,
      type: tile.type === 'WATER' || tile.type === 'MOUNTAIN' || tile.type === 'CLIFF' || tile.type === 'LAVA' || tile.type === 'CAVE_WALL' 
        ? (depthLevel === 0 ? 'GRASS' : 'CAVE_FLOOR')
        : tile.type
    }));
  }, [gameState.worldSeed, forcedSafePositions, stairConnections, useCustomTerrain, customTerrain]);

  // Generate terrain from custom design
  const generateCustomTerrain = useCallback((chunkX, chunkY, depthLevel) => {
    console.log('🎮 generateCustomTerrain called:', { chunkX, chunkY, depthLevel });
    console.log('🗂️ customTerrain object:', customTerrain);
    console.log('🗂️ customTerrain.levels:', customTerrain?.levels);
    
    // Check if we have valid custom terrain data
    if (!customTerrain || !customTerrain.levels) {
      console.log('❌ No valid custom terrain data, falling back to default generation');
      return generateTerrainChunk(
        chunkX, 
        chunkY, 
        depthLevel, 
        gameState.worldSeed, 
        forcedSafePositions, 
        stairConnections
      );
    }
    
    const terrain = []; // Use array like default terrain generation
    const levelData = customTerrain.levels[depthLevel] || customTerrain.levels[depthLevel?.toString()] || customTerrain.levels['0'];
    console.log('📊 Custom terrain levelData:', levelData ? 'found' : 'not found', 'depthLevel:', depthLevel);
    console.log('📊 levelData type:', typeof levelData, 'isArray:', Array.isArray(levelData));
    
    if (levelData && Array.isArray(levelData)) {
      console.log('📊 levelData length:', levelData.length);
      console.log('📊 First row:', levelData[0]);
      console.log('📊 First cell of first row:', levelData[0]?.[0]);
    }
    
    if (!levelData) {
      console.log('❌ No levelData, falling back to default generation');
      // Fallback to default terrain generation
      return generateTerrainChunk(
        chunkX, 
        chunkY, 
        depthLevel, 
        gameState.worldSeed, 
        forcedSafePositions, 
        stairConnections
      );
    }

    const chunkSize = GAME_CONFIG.CHUNK_SIZE;
    
    // Handle both old format (levelData.tiles) and new format (direct array)
    let tilesData;
    if (Array.isArray(levelData)) {
      // New format: levelData is directly a 2D array
      tilesData = levelData;
      console.log('Using new format (direct array), size:', tilesData.length, 'x', tilesData[0]?.length);
    } else if (levelData.tiles) {
      // Old format: levelData has a tiles property
      tilesData = levelData.tiles;
      console.log('Using old format (tiles property)');
    } else {
      // Unknown format, fallback
      console.log('Unknown format, falling back to default generation');
      return generateTerrainChunk(
        chunkX, 
        chunkY, 
        depthLevel, 
        gameState.worldSeed, 
        forcedSafePositions, 
        stairConnections
      );
    }

    const terrainWidth = tilesData[0]?.length || 0;
    const terrainHeight = tilesData.length;
    console.log('🗺️ Terrain dimensions:', terrainWidth, 'x', terrainHeight);
    
    // Check if we have valid terrain data
    if (terrainWidth === 0 || terrainHeight === 0) {
      console.log('❌ Invalid terrain dimensions, falling back to default generation');
      return generateTerrainChunk(
        chunkX, 
        chunkY, 
        depthLevel, 
        gameState.worldSeed, 
        forcedSafePositions, 
        stairConnections
      );
    }

    let tilesGenerated = 0;
    const chunkWorldStartX = chunkX * chunkSize;
    const chunkWorldStartY = chunkY * chunkSize;
    
    console.log(`🔄 Generating chunk ${chunkX},${chunkY}`);
    console.log(`🎯 Chunk covers tile coords: (${chunkWorldStartX}-${chunkWorldStartX + chunkSize - 1}, ${chunkWorldStartY}-${chunkWorldStartY + chunkSize - 1})`);
    
    for (let tileY = 0; tileY < chunkSize; tileY++) {
      for (let tileX = 0; tileX < chunkSize; tileX++) {
        const worldTileX = chunkWorldStartX + tileX;
        const worldTileY = chunkWorldStartY + tileY;
        const worldPixelX = worldTileX * GAME_CONFIG.TILE_SIZE;
        const worldPixelY = worldTileY * GAME_CONFIG.TILE_SIZE;
        
        // Wrap coordinates to fit within the custom terrain data (seamless tiling)
        const customX = worldTileX % terrainWidth;
        const customY = worldTileY % terrainHeight;
        
        // Debug first few tiles
        if (tileX < 3 && tileY < 3) {
          console.log(`🎯 Tile ${tileX},${tileY} -> world tile ${worldTileX},${worldTileY} -> pixel ${worldPixelX},${worldPixelY} -> custom ${customX},${customY}`);
        }
        
        const customTile = tilesData[customY]?.[customX];
        if (customTile) {
          // Handle both terrain property and type property
          let terrainType = 'GRASS'; // Default base terrain
          
          // Check if there's a specific terrain defined
          const customType = customTile.terrain || customTile.type;
          if (customType && customType !== null) {
            terrainType = mapCustomTerrainType(customType, depthLevel);
          }
          
          // Check for obstacles that should override terrain type
          if (customTile.obstacle && customTile.obstacle !== null) {
            const obstaclePath = customTile.obstacle;
            
            // Debug obstacle detection for first few tiles
            if (tileX < 2 && tileY < 2) {
              console.log('🚧 Found obstacle:', obstaclePath);
            }
            
            // Check if obstacle blocks movement - only allow bushes
            if (obstaclePath.includes('Bushes')) {
              terrainType = 'FOREST'; // Treat bushes as forest for collision
            } else {
              // Temporarily disable all other terrain objects
              terrainType = 'GRASS'; // Convert all other obstacles to walkable grass
            }
          }
          
          // Add to terrain array using tile coordinates (like default generation)
          terrain.push({ 
            x: worldTileX, // Store tile coordinates, not pixel coordinates
            y: worldTileY, 
            type: terrainType 
          });
          tilesGenerated++;
        } else {
          // Default terrain for empty areas
          terrain.push({ 
            x: worldTileX, // Store tile coordinates, not pixel coordinates
            y: worldTileY, 
            type: depthLevel === 0 ? 'GRASS' : 'CAVE_FLOOR' 
          });
          tilesGenerated++;
        }
      }
    }
    
    console.log(`✅ Generated custom terrain chunk ${chunkX},${chunkY} with ${tilesGenerated} tiles`);
    console.log(`📊 Terrain array length: ${terrain.length}`);
    
    // Log more detailed sample tiles for debugging
    const sampleTiles = terrain.slice(0, 5);
    sampleTiles.forEach((tile, index) => {
      console.log(`🔍 Sample tile ${index}: tile (${tile.x},${tile.y}) = ${tile.type}`);
    });
    
    // Count different terrain types
    const terrainCounts = {};
    terrain.forEach(tile => {
      terrainCounts[tile.type] = (terrainCounts[tile.type] || 0) + 1;
    });
    console.log('🏞️ Terrain type counts:', terrainCounts);
    
    return terrain; // Return array like default terrain generation
  }, [customTerrain, gameState.worldSeed, forcedSafePositions, stairConnections]);

  // Map custom terrain types to game terrain types
  const mapCustomTerrainType = useCallback((customType, level) => {
    console.log('Mapping terrain type:', customType, 'for level:', level);
    
    // Handle null terrain
    if (!customType || customType === null) {
      return level === 0 ? 'GRASS' : 'CAVE_FLOOR';
    }
    
    // Handle image paths from terrain designer
    if (typeof customType === 'string' && customType.includes('/')) {
      // Extract tile name from path like "/assets/terrain/1 Tiles/Map_tile_04.png"
      const tileName = customType.split('/').pop().replace('.png', '').toLowerCase();
      console.log('Extracted tile name:', tileName);
      
      // Map based on tile numbers - more specific mappings for your terrain
      if (tileName.includes('map_tile_04') || tileName.includes('map_tile_11') || tileName.includes('map_tile_23')) {
        return 'GRASS'; // Main grass tile (including tile 23 which is used in your terrain)
      } else if (tileName.includes('map_tile_35')) {
        return 'FOREST'; // Another grass variant
      } else if (tileName.includes('map_tile_50')) {
        return 'WATER'; // Water tile
      } else if (tileName.includes('map_tile_47')) {
        return 'BRIDGE'; // Bridge tile
      } else if (tileName.includes('map_tile_131')) {
        return 'CRYSTAL'; // Crystal/special tile
      } else if (tileName.includes('map_tile_110')) {
        return 'WATER'; // Water tile
      } else if (tileName.includes('map_tile_03')) {
        return 'FOREST'; // Tree/forest tile
      } else if (tileName.includes('map_tile_121') || tileName.includes('map_tile_135') || tileName.includes('map_tile_116')) {
        return 'ROCKY_GROUND'; // Rock/stone tiles
      } else if (tileName.includes('map_tile_30') || tileName.includes('map_tile_109')) {
        return 'GRASS'; // Path tiles
      } else if (tileName.includes('map_tile_111') || tileName.includes('map_tile_141')) {
        return 'BRIDGE'; // Bridge/special tiles
      } else if (tileName.includes('map_tile_123') || tileName.includes('map_tile_114')) {
        return 'CRYSTAL'; // Special/treasure tiles
      } else if (tileName.includes('grass')) {
        return 'GRASS';
      } else if (tileName.includes('water')) {
        return 'WATER';
      } else if (tileName.includes('tree') || tileName.includes('bush')) {
        return 'FOREST';
      } else if (tileName.includes('rock') || tileName.includes('stone')) {
        return 'ROCKY_GROUND';
      } else if (tileName.includes('treasure') || tileName.includes('crystal')) {
        return 'CRYSTAL';
      }
    }
    
    // Fallback mappings for simple keywords
    const mappings = {
      0: { // Surface level
        grass: 'GRASS',
        tree: 'FOREST',
        crystal: 'CRYSTAL',
        treasure: 'CRYSTAL',
        rock: 'ROCKY_GROUND',
        flower: 'GRASS',
        bush: 'FOREST',
        water: 'WATER',
        path: 'GRASS',
        fence: 'ROCKY_GROUND',
        bridge: 'BRIDGE',
        caveEntrance: 'CAVE_ENTRANCE'
      },
      1: { // Cave level
        stone: 'CAVE_FLOOR',
        stalactite: 'CAVE_WALL',
        crystal: 'CRYSTAL',
        treasure: 'CRYSTAL',
        torch: 'CAVE_FLOOR',
        bones: 'CAVE_WALL',
        mushroom: 'CAVE_FLOOR',
        water: 'UNDERGROUND_WATER',
        path: 'CAVE_FLOOR',
        wall: 'CAVE_WALL',
        caveEntrance: 'CAVE_ENTRANCE'
      }
    };
    
    // Map custom terrain types to game terrain types - FORCE ALL TO BE WALKABLE for debugging
    const result = mappings[level]?.[customType] || (level === 0 ? 'GRASS' : 'CAVE_FLOOR');
    
    // TEMPORARY FIX: Convert non-walkable terrain to walkable alternatives
    if (result === 'MOUNTAIN' || result === 'CLIFF' || result === 'WATER' || result === 'LAVA' || result === 'CAVE_WALL') {
      const walkableAlternative = level === 0 ? 'GRASS' : 'CAVE_FLOOR';
      console.log('🔧 Converting non-walkable terrain:', result, '→', walkableAlternative);
      return walkableAlternative;
    }
    
    console.log('Final mapped terrain type:', result);
    return result;
  }, []);

  // Walkable check function
  const checkWalkable = useCallback((x, y, terrain) => {
    // Use custom terrain walkability if available
    if (useCustomTerrain && customTerrain) {
      const tileKey = `${Math.floor(x / 32)},${Math.floor(y / 32)}`;
      const walkableTiles = getWalkableTiles(customTerrain, terrainLevel);
      const collisionTiles = getCollisionTiles(customTerrain, terrainLevel);
      
      if (collisionTiles.has(tileKey)) {
        return false;
      }
      if (walkableTiles.has(tileKey)) {
        return true;
      }
    }
    
    // Enhanced collision detection for all environmental objects
    const tileX = Math.floor(x / 32);
    const tileY = Math.floor(y / 32);
    
    // Check for custom terrain obstacles first
    if (useCustomTerrain && customTerrain) {
      const tileData = customTerrain.levels?.[terrainLevel]?.tiles?.[`${tileX},${tileY}`];
      if (tileData && tileData.obstacle) {
        const obstaclePath = tileData.obstacle;
        // Check if obstacle blocks movement - only allow bushes
        if (obstaclePath.includes('Bushes')) {
          return false; // Bushes block movement
        }
        // All other obstacles are disabled - allow movement
        return true;
      }
    }
    
    // For grass terrain, pass bush obstacles to collision detection
    const bushObstaclesForCollision = terrainType === 'grass' ? bushObstacles : null;
    return isWalkable(x, y, terrain, null, bushObstaclesForCollision);
  }, [useCustomTerrain, customTerrain, terrainLevel, terrainType, bushObstacles]);

  // Game loop
  useGameLoop(keys, gameState, updateGameState, checkWalkable, generateTerrain);
  
  // Debug: Log when generateTerrain function changes
  useEffect(() => {
    console.log('🎮 generateTerrain function updated. useCustomTerrain:', useCustomTerrain, 'customTerrain available:', !!customTerrain);
  }, [generateTerrain, useCustomTerrain, customTerrain]);

  // Load game assets
  useEffect(() => {
    const loadImage = (src, ref) => {
      const img = new Image();
      img.onload = () => {
        ref.current = img;
        setRenderingStats(prev => ({
          ...prev,
          imagesLoaded: prev.imagesLoaded + 1
        }));
      };
      img.onerror = () => {
        console.warn(`Failed to load image: ${src}`);
        setRenderingStats(prev => ({
          ...prev,
          imagesLoaded: prev.imagesLoaded + 1
        }));
      };
      img.src = src;
    };

    // Count total images to load
    const totalImageCount = 23; // Update this count based on actual images
    setRenderingStats(prev => ({
      ...prev,
      totalImages: totalImageCount,
      imagesLoaded: 0
    }));

    // Load SVG assets
     loadImage(playerSvg, loadedImages.player);
     loadImage(playerFrontSvg, loadedImages.playerFront);
     loadImage(playerBackSvg, loadedImages.playerBack);
     loadImage(playerLeftSvg, loadedImages.playerLeft);
     loadImage(playerRightSvg, loadedImages.playerRight);
     loadImage(sproutPlayerSvg, loadedImages.playerSprite);
     loadImage(treeSvg, loadedImages.tree);
     loadImage(realisticTreeSvg, loadedImages.realisticTree);
     loadImage(bridgeSvg, loadedImages.bridge);
     loadImage(cliffSvg, loadedImages.cliff);
     loadImage(highGrassSvg, loadedImages.highGrass);
     loadImage(rockyGroundSvg, loadedImages.rockyGround);
     loadImage(caveEntranceSvg, loadedImages.caveEntrance);
     loadImage(realisticWaterSvg, loadedImages.realisticWater);
     loadImage(realisticRockSvg, loadedImages.realisticRock);
     loadImage(realisticTreasureSvg, loadedImages.realisticTreasure);
     loadImage(realisticTreasureOpenedSvg, loadedImages.treasureOpened);
     loadImage(sproutCoinSvg, loadedImages.sproutCoin);
     loadImage(monsterGoblinSvg, loadedImages.monsterGoblin);
     loadImage(monsterDragonSvg, loadedImages.monsterDragon);
     loadImage(monsterOrcSvg, loadedImages.monsterOrc);
     loadImage(waterGrassShorelineVerticalSvg, loadedImages.waterGrassShorelineVertical);
     loadImage(waterGrassShorelineSvg, loadedImages.waterGrassShoreline);
     loadImage(realisticGrassSvg, loadedImages.realisticGrass);
     loadImage(grassWaterShorelineCornerSvg, loadedImages.grassWaterShorelineCorner);
  }, []);

  // Attack function
  const attackMonster = useCallback((monster) => {
    const distance = Math.sqrt(
      (gameState.player.x - monster.x) ** 2 + (gameState.player.y - monster.y) ** 2
    );
    
    // Check if monster is within attack range (2 tiles)
    if (distance <= GAME_CONFIG.TILE_SIZE * 2) {
      setIsAttacking(true);
      setAttackTarget(monster);
      
      // Set appropriate attack animation based on movement state
      if (isRunning) {
        setAnimationState('runAttack');
      } else if (isMoving) {
        setAnimationState('walkAttack');
      } else {
        setAnimationState('idleAttack');
      }
      
      // Reduce monster HP
      updateGameState(prev => ({
        ...prev,
        monsters: prev.monsters.map(m => 
          m.id === monster.id 
            ? { ...m, health: Math.max(0, m.health - 25) }
            : m
        ).filter(m => m.health > 0) // Remove dead monsters
      }));
      
      // Reset attack animation with smooth transition
      setTimeout(() => {
        setIsAttacking(false);
        setAttackTarget(null);
        
        // Add a brief pause before transitioning to allow for smooth animation blend
        setTimeout(() => {
          // Return to appropriate movement state based on current input
          if (isRunning) {
            setAnimationState('running');
          } else if (isMoving) {
            setAnimationState('walking');
          } else {
            setAnimationState('idle');
          }
        }, 100); // Small delay for smoother transition
      }, 700); // Slightly shorter attack duration for better responsiveness
    }
  }, [gameState.player, updateGameState, isMoving, isRunning]);

  // Handle mouse click for attacks
  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left + gameState.camera.x;
    const clickY = e.clientY - rect.top + gameState.camera.y;
    
    // Find closest monster to click position
    let closestMonster = null;
    let closestDistance = Infinity;
    
    gameState.monsters.forEach(monster => {
      const distance = Math.sqrt(
        (clickX - monster.x) ** 2 + (clickY - monster.y) ** 2
      );
      
      if (distance < GAME_CONFIG.TILE_SIZE && distance < closestDistance) {
        closestMonster = monster;
        closestDistance = distance;
      }
    });
    
    if (closestMonster) {
      attackMonster(closestMonster);
    }
  }, [gameState.camera, gameState.monsters, attackMonster]);

  // Handle treasure box interaction
  const handleTreasureInteraction = useCallback((treasureId) => {
    const treasureBox = gameState.treasureBoxes.find(t => t.id === treasureId);
    if (treasureBox && !treasureBox.collected) {
      // Use problems from NumerationProblem.json based on depth level
      const levelProblems = numerationProblems.filter(p => p.level <= Math.max(1, gameState.depthLevel + 1));
      const randomQuestion = levelProblems[Math.floor(Math.random() * levelProblems.length)];
      setCurrentQuestion(randomQuestion);
      setCurrentTreasureBox(treasureBox);
      setShowQuestionModal(true);
    }
  }, [gameState.treasureBoxes, gameState.depthLevel]);

  // Handle question solve
  const handleQuestionSolve = useCallback(() => {
    if (currentTreasureBox) {
      // Play success sound for correct answer
      soundEffects.playSuccess();
      
      updateGameState(prev => ({
        ...prev,
        treasureBoxes: prev.treasureBoxes.map(treasure => 
          treasure.id === currentTreasureBox.id 
            ? { ...treasure, collected: true }
            : treasure
        ),
        score: prev.score + 100, // Add points for solving the question
        crystalsCollected: prev.crystalsCollected + 1 // Award 1 crystal for correct answer
      }));
    }
    setShowQuestionModal(false);
    setCurrentQuestion(null);
    setCurrentTreasureBox(null);
  }, [currentTreasureBox, updateGameState]);

  // Handle question modal close
  const handleQuestionClose = useCallback(() => {
    setShowQuestionModal(false);
    setCurrentQuestion(null);
    setCurrentTreasureBox(null);
  }, []);

  // Handle start game
  const handleStartGame = useCallback(() => {
    setGameStarted(true);
  }, []);

  // Handle back to home
  const handleBackToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // GameMenu handlers
  const handleResumeGame = useCallback(() => {
    soundEffects.playResume();
    setGamePaused(false);
  }, []);

  const handleRestartGame = useCallback(() => {
    soundEffects.playMenuClick();
    setGamePaused(false);
    // Reset game state
    updateGameState(prevState => ({
      ...prevState,
      player: {
        ...prevState.player,
        x: 500,
        y: 500
      },
      camera: {
        x: 500 - GAME_CONFIG.CANVAS_WIDTH / 2,
        y: 500 - GAME_CONFIG.CANVAS_HEIGHT / 2
      },
      treasureBoxes: [],
      score: 0
    }));
  }, [updateGameState]);

  const handleQuitToMenu = useCallback(() => {
    soundEffects.playMenuClick();
    setGamePaused(false);
    setGameStarted(false);
  }, []);

  // Keyboard event handlers
  useEffect(() => {
    console.log('🎮 Setting up keyboard event listeners, gameStarted:', gameStarted);
    const handleKeyDown = (e) => {
      // Remove the raw key event console log for better performance
      
      // Handle ESC key for pause menu
      if (e.code === 'Escape') {
        setGamePaused(prev => {
          const newPaused = !prev;
          if (newPaused) {
            soundEffects.playPause();
          } else {
            soundEffects.playResume();
          }
          return newPaused;
        });
        return;
      }
      
      // Don't process other keys if game is paused
      if (gamePaused) {
        return;
      }
      
      // Handle treasure interaction with 'E' key
      if (e.code === 'KeyE') {
        const nearbyTreasure = gameState.treasureBoxes?.find(treasure => 
          treasure.nearPlayer && !treasure.collected
        );
        if (nearbyTreasure) {
          handleTreasureInteraction(nearbyTreasure.id);
        }
        return;
      }
      
      // Handle movement keys - only allow one direction at a time
      const movementKeys = ['KeyW', 'ArrowUp', 'KeyS', 'ArrowDown', 'KeyA', 'ArrowLeft', 'KeyD', 'ArrowRight'];
      
      if (movementKeys.includes(e.code)) {
        // Check if Shift is held for running
        const isShiftHeld = e.shiftKey;
        setIsRunning(isShiftHeld);
        setIsMoving(true);
        
        // Set animation state based on movement type (only if not attacking)
        if (!isAttacking) {
          setAnimationState(isShiftHeld ? 'running' : 'walking');
        }
        
        // Clear all movement keys first
        setKeys(prev => {
          const currentKeys = prev || {}; // Ensure prev is not undefined
          const newKeys = { ...currentKeys };
          movementKeys.forEach(key => {
            newKeys[key] = false;
          });
          // Set only the current key to true
          newKeys[e.code] = true;
          // Debug key state only in development mode
          if (process.env.NODE_ENV === 'development') {
            console.log('🔑 Key pressed:', e.code, 'Keys state:', Object.keys(newKeys).filter(k => newKeys[k]));
          }
          return newKeys;
        });
        
        // Update player direction based on movement keys
        switch(e.code) {
          case 'KeyW':
          case 'ArrowUp':
            setPlayerDirection('up');
            break;
          case 'KeyS':
          case 'ArrowDown':
            setPlayerDirection('down');
            break;
          case 'KeyA':
          case 'ArrowLeft':
            setPlayerDirection('left');
            break;
          case 'KeyD':
          case 'ArrowRight':
            setPlayerDirection('right');
            break;
        }
      } else {
        // For non-movement keys, use normal behavior
        setKeys(prev => ({ ...(prev || {}), [e.code]: true }));
      }
    };

    const handleKeyUp = (e) => {
      // Don't process key releases if game is paused (except ESC)
      if (gamePaused && e.code !== 'Escape') {
        return;
      }
      
      // Handle movement keys - clear the specific key
      const movementKeys = ['KeyW', 'ArrowUp', 'KeyS', 'ArrowDown', 'KeyA', 'ArrowLeft', 'KeyD', 'ArrowRight'];
      
      if (movementKeys.includes(e.code)) {
        setKeys(prev => ({ ...(prev || {}), [e.code]: false }));
        
        // Check if any movement keys are still pressed - add null check for keys
        const currentKeys = keys || {};
        const stillMoving = movementKeys.some(key => key !== e.code && currentKeys[key]);
        
        if (!stillMoving) {
          setIsMoving(false);
          setIsRunning(false);
          // Set to idle animation only if not attacking
          if (!isAttacking) {
            setAnimationState('idle');
          }
        }
      } else {
        // For non-movement keys, use normal behavior
        setKeys(prev => ({ ...(prev || {}), [e.code]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.treasureBoxes, handleTreasureInteraction, keys, isAttacking, gamePaused]);

  // Mouse event handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('click', handleCanvasClick);
      return () => {
        canvas.removeEventListener('click', handleCanvasClick);
      };
    }
  }, [handleCanvasClick]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = GAME_CONFIG.CANVAS_WIDTH;
      canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
      
      // Update canvas ready status
      setRenderingStats(prev => ({
        ...prev,
        canvasReady: true
      }));
    }
  }, []);

  // Show start menu if game hasn't started
  if (!gameStarted) {
    return (
      <GameStartMenu 
        onPlay={handleStartGame}
        onBack={handleBackToHome}
      />
    );
  }

  return (
    <div className="open-world-game">
      <Navbar />
      <div className="game-container">
        <div className="game-ui">
          <div className="controls-info">
            <h3>Controls</h3>
            <p>WASD or Arrow Keys: Move</p>
            <p>E: Interact with treasure boxes</p>
            <p>Explore the world and find treasures!</p>
          </div>
          
          {/* Debug Information Panel */}
          <div className="debug-panel" style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            minWidth: '200px'
          }}>
            <h4>Rendering Debug Info</h4>
            <p>Images Loaded: {renderingStats.imagesLoaded}/{renderingStats.totalImages}</p>
            <p>Canvas Ready: {renderingStats.canvasReady ? 'Yes' : 'No'}</p>
            <p>Last Render: {renderingStats.lastRenderTime}ms</p>
            <p>Player Position: ({Math.round(gameState.player.x)}, {Math.round(gameState.player.y)})</p>
            <p>Player Direction: {playerDirection}</p>
            {/* Edge Detection Status */}
            {gameState.player.atEdge && (
              <div style={{ marginTop: '10px', padding: '5px', background: 'rgba(255,255,0,0.3)', borderRadius: '3px' }}>
                <p style={{ color: '#ffff00', fontWeight: 'bold', margin: '0' }}>
                  🏔️ At Map Edge: {
                    Object.entries(gameState.player.atEdge)
                      .filter(([_, value]) => value)
                      .map(([key, _]) => key)
                      .join(', ')
                  }
                </p>
              </div>
            )}
            <button 
              onClick={() => setDebugMode(!debugMode)}
              style={{
                marginTop: '5px',
                padding: '5px 10px',
                background: debugMode ? '#ff4444' : '#44ff44',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              {debugMode ? 'Disable Debug' : 'Enable Debug'}
            </button>
          </div>
          
          {/* Edge Warning Overlay */}
          {gameState.player.atEdge && (Object.values(gameState.player.atEdge).some(edge => edge)) && (
            <div className="edge-warning-overlay" style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255, 165, 0, 0.9)',
              color: 'white',
              padding: '15px 25px',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              border: '2px solid #ff8c00',
              zIndex: 1000,
              animation: 'edgePulse 2s infinite'
            }}>
              🏔️ World Boundary Reached
              <div style={{ fontSize: '12px', marginTop: '5px', fontWeight: 'normal' }}>
                You are at the edge of the map
              </div>
            </div>
          )}
          
          <div className="terrain-controls">
            <select 
              value={terrainType} 
              onChange={(e) => setTerrainType(e.target.value)}
              className="terrain-type-selector"
            >
              <option value="default">Default Terrain</option>
              <option value="grass">Grass Terrain</option>
            </select>
          </div>
        </div>
        <canvas 
          ref={canvasRef}
          className="game-canvas"
          width={GAME_CONFIG.CANVAS_WIDTH}
          height={GAME_CONFIG.CANVAS_HEIGHT}
        />
        
        <CanvasRenderer 
          gameState={gameState}
          canvasRef={canvasRef}
          playerImage={loadedImages.player}
          playerFrontImage={loadedImages.playerFront}
          playerBackImage={loadedImages.playerBack}
          playerLeftImage={loadedImages.playerLeft}
          playerRightImage={loadedImages.playerRight}
          playerDirection={playerDirection}
          playerSpriteImage={loadedImages.playerSprite}
          treeImage={loadedImages.tree}
          realisticTreeImage={loadedImages.realisticTree}
          bridgeImage={loadedImages.bridge}
          cliffImage={loadedImages.cliff}
          highGrassImage={loadedImages.highGrass}
          rockyGroundImage={loadedImages.rockyGround}
          caveEntranceImage={loadedImages.caveEntrance}
          realisticWaterImage={loadedImages.realisticWater}
          realisticRockImage={loadedImages.realisticRock}
          realisticTreasureImage={loadedImages.realisticTreasure}
          treasureOpenedImage={loadedImages.treasureOpened}
          sproutPlayerImage={loadedImages.sproutPlayer}
          sproutCoinImage={loadedImages.sproutCoin}
          monsterGoblinImage={loadedImages.monsterGoblin}
          monsterDragonImage={loadedImages.monsterDragon}
          monsterOrcImage={loadedImages.monsterOrc}
          waterGrassShorelineVerticalImage={loadedImages.waterGrassShorelineVertical}
          waterGrassShorelineImage={loadedImages.waterGrassShoreline}
          realisticGrassImage={loadedImages.realisticGrass}
          grassWaterShorelineCornerImage={loadedImages.grassWaterShorelineCorner}
          // Grass terrain props
          grassTopLeftImage={grassTileImages.grassTopLeft}
          grassTopImage={grassTileImages.grassTop}
          grassTopRightImage={grassTileImages.grassTopRight}
          grassLeftImage={grassTileImages.grassLeft}
          grassCenterImage={grassTileImages.grassCenter}
          grassRightImage={grassTileImages.grassRight}
          grassBottomLeftImage={grassTileImages.grassBottomLeft}
          grassBottomImage={grassTileImages.grassBottom}
          grassBottomRightImage={grassTileImages.grassBottomRight}
          terrainType={terrainType}
          grassTerrainMap={grassTerrainMap}
          bushObstacles={bushObstacles}
          isAttacking={isAttacking}
          attackTarget={attackTarget}
          onTreasureInteraction={handleTreasureInteraction}
          skipPlayerRendering={true}
        />
        
        {/* Kubo Character Overlay - positioned relative to canvas */}
        <HumanCharacter
          x={GAME_CONFIG.CANVAS_WIDTH / 2 - GAME_CONFIG.PLAYER_SIZE / 2}
          y={GAME_CONFIG.CANVAS_HEIGHT / 2 - GAME_CONFIG.PLAYER_SIZE / 2}
          size={GAME_CONFIG.PLAYER_SIZE}
          animationState={animationState}
          direction={playerDirection}
          isAnimating={gameState.player.isMoving}
        />
        
        <div className="game-ui">
          <div className="player-stats">
            <div className="health-bar">
              <div className="health-label">Health</div>
              <div className="health-bar-container">
                <div 
                  className="health-bar-fill"
                  style={{ width: `${(gameState.player.health / gameState.player.maxHealth) * 100}%` }}
                />
              </div>
              <div className="health-text">{gameState.player.health}/{gameState.player.maxHealth}</div>
            </div>
            
            <div className="score-display">
              Score: {gameState.score}
            </div>
            
            <div className="crystal-display">
              💎 Crystals: {gameState.crystalsCollected}
            </div>
            
            <div className="position-display">
              Position: ({Math.floor(gameState.player.x)}, {Math.floor(gameState.player.y)})
            </div>
            
            <div className="depth-display">
              Depth Level: {gameState.depthLevel}
            </div>
          </div>
          
          <div className="controls-info">
            <h3>Controls</h3>
            <p>WASD or Arrow Keys: Move</p>
            <p>E: Interact with treasure boxes</p>
            <p>Explore the world and find treasures!</p>
            {gameState.treasureBoxes.some(treasure => treasure.nearPlayer && !treasure.collected) && (
              <div className="interaction-prompt">
                <p style={{color: '#ffff00', fontWeight: 'bold'}}>Press E to open treasure box!</p>
              </div>
            )}
          </div>
          
          <div className="terrain-controls">
            <h3>Terrain</h3>
            
            {loadedTerrainFile && (
              <div className="loaded-terrain-info">
                <small>Loaded: {loadedTerrainFile}</small>
              </div>
            )}
            
            {loadedTerrainFile && (
              <div className="terrain-status" style={{
                background: 'rgba(40, 167, 69, 0.8)',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                marginBottom: '10px'
              }}>
                ✅ Loaded: {loadedTerrainFile}
              </div>
            )}
            
            <div className="terrain-mode-status" style={{
              background: useCustomTerrain ? 'rgba(40, 167, 69, 0.8)' : 'rgba(220, 53, 69, 0.8)',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '4px',
              fontSize: '12px',
              marginBottom: '10px'
            }}>
              {useCustomTerrain ? '🎯 Custom Terrain Active' : '🌱 Default Terrain Active'}
            </div>
            
            <div className="terrain-upload">
              <label htmlFor="terrain-file-input" className="terrain-upload-btn">
                📁 Load Terrain File
              </label>
              <input
                id="terrain-file-input"
                type="file"
                accept=".json"
                onChange={handleTerrainFileUpload}
                style={{ display: 'none' }}
              />
            </div>
            
            <div className="terrain-controls">
              <button 
                onClick={() => {
                  // Force reload terrain data
                  setCustomTerrain(null);
                  setUseCustomTerrain(false);
                  updateGameState(prevState => ({
                    ...prevState,
                    terrainChunks: new Map(),
                    currentTerrain: null,
                    worldSeed: Math.random() + Date.now()
                  }));
                  
                  // Reload terrain after a brief delay
                  setTimeout(() => {
                    window.location.reload();
                  }, 100);
                }}
                className="reload-btn"
                style={{
                  background: '#ff6b35',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginBottom: '10px'
                }}
              >
                🔄 Force Reload Terrain
              </button>
              
              <button 
                onClick={() => {
                  // Force custom terrain to be used
                  console.log('🔧 Forcing custom terrain usage');
                  console.log('Current state:', { useCustomTerrain, customTerrain: !!customTerrain });
                  
                  // Try to reload from localStorage if needed
                  const storedTerrain = localStorage.getItem('terrainDesign');
                  if (storedTerrain && !customTerrain) {
                    try {
                      const parsedTerrain = JSON.parse(storedTerrain);
                      setCustomTerrain(parsedTerrain);
                      console.log('🔄 Restored terrain from localStorage');
                    } catch (e) {
                      console.error('Failed to parse stored terrain:', e);
                    }
                  }
                  
                  setUseCustomTerrain(true);
                  localStorage.setItem('useCustomTerrain', 'true');
                  
                  // Clear terrain cache and regenerate
                  updateGameState(prevState => ({
                    ...prevState,
                    terrainChunks: new Map(),
                    currentTerrain: null,
                    worldSeed: Math.random() + Date.now(),
                    player: {
                      ...prevState.player,
                      x: Math.floor(prevState.player.x) + 0.5,
                      y: Math.floor(prevState.player.y) + 0.5
                    }
                  }));
                  
                  console.log('✅ Custom terrain should now be active');
                }}
                className="custom-terrain-btn"
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginBottom: '10px',
                  marginLeft: '10px'
                }}
              >
                🎯 Force Custom Terrain
              </button>
              
              <button 
                onClick={() => {
                  console.log('🔍 === TERRAIN DEBUG INFO ===');
                  console.log('useCustomTerrain:', useCustomTerrain);
                  console.log('customTerrain available:', !!customTerrain);
                  console.log('loadedTerrainFile:', loadedTerrainFile);
                  console.log('localStorage terrainDesign:', !!localStorage.getItem('terrainDesign'));
                  console.log('localStorage useCustomTerrain:', localStorage.getItem('useCustomTerrain'));
                  console.log('gameState.terrainChunks size:', gameState.terrainChunks?.size || 0);
                  console.log('gameState.player position:', gameState.player);
                  if (customTerrain) {
                    console.log('customTerrain structure:', Object.keys(customTerrain));
                    console.log('customTerrain.levels:', Object.keys(customTerrain.levels || {}));
                    console.log('Level 0 sample data:', customTerrain.levels?.[0]?.[0]?.[0]);
                  }
                  
                  // Test terrain generation for current player position
                  const chunkX = Math.floor(gameState.player.x / GAME_CONFIG.CHUNK_SIZE);
                  const chunkY = Math.floor(gameState.player.y / GAME_CONFIG.CHUNK_SIZE);
                  console.log('Player chunk position:', { chunkX, chunkY });
                  
                  const testTerrain = generateTerrain(chunkX, chunkY, 0);
                  console.log('Test terrain generation result:', testTerrain?.size, 'tiles');
                  if (testTerrain?.size > 0) {
                    const sampleEntries = Array.from(testTerrain.entries()).slice(0, 5);
                    console.log('Sample terrain tiles:', sampleEntries);
                  }
                }}
                className="debug-btn"
                style={{
                  background: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginBottom: '10px',
                  marginLeft: '10px'
                }}
              >
                🔍 Debug Terrain
              </button>
            </div>
            
            <div className="terrain-presets">
              <button 
                onClick={() => loadPresetTerrain('sample-terrain.json')}
                className="preset-btn"
              >
                Load Sample Terrain
              </button>
              
              <button 
                onClick={() => {
                  // Clear stored terrain to force reload from folder
                  localStorage.removeItem('terrainDesign');
                  localStorage.removeItem('customTerrainData');
                  
                  // Clear all terrain state
                  setCustomTerrain(null);
                  setUseCustomTerrain(false);
                  setLoadedTerrainFile(null);
                  
                  // Force immediate terrain regeneration
                  updateGameState(prevState => ({
                    ...prevState,
                    terrainChunks: new Map(),
                    currentTerrain: null,
                    worldSeed: Math.random() + Date.now()
                  }));
                  
                  // Reload the page to restart the auto-loading process
                  setTimeout(() => {
                    window.location.reload();
                  }, 100);
                }}
                className="preset-btn"
                style={{ backgroundColor: '#f44336', marginTop: '0.5rem' }}
              >
                🔄 Reload from Folder
              </button>
            </div>
            
            <div className="terrain-buttons">
              <button 
                className={`terrain-toggle ${useCustomTerrain ? 'active' : ''}`}
                onClick={() => {
                  setUseCustomTerrain(!useCustomTerrain);
                  // Reload terrain when toggling
                  window.location.reload();
                }}
                disabled={!customTerrain}
              >
                {useCustomTerrain ? 'Using Custom' : 'Using Default'}
              </button>
              
              <button 
                className="terrain-designer-btn"
                onClick={() => navigate('/terrain-designer')}
              >
                Design Terrain
              </button>
              
              <button 
                className="reset-player-btn"
                onClick={() => {
                  console.log('🔄 Manually resetting player position and terrain...');
                  updateGameState(prevState => ({
                    ...prevState,
                    player: {
                      ...prevState.player,
                      x: 500,
                      y: 500
                    },
                    camera: {
                      x: 500 - GAME_CONFIG.CANVAS_WIDTH / 2,
                      y: 500 - GAME_CONFIG.CANVAS_HEIGHT / 2
                    },
                    terrain: new Map(), // Clear all terrain
                    currentTerrain: null // Force regeneration
                  }));
                }}
                style={{ backgroundColor: '#FF9800', margin: '2px' }}
              >
                📍 Reset Position & Terrain
              </button>
              
              {customTerrain && (
                <button 
                  className="terrain-reload-btn"
                  onClick={() => {
                    const storedTerrain = getStoredTerrainData();
                    if (storedTerrain) {
                      setCustomTerrain(storedTerrain);
                      window.location.reload();
                    }
                  }}
                >
                  Reload Design
                </button>
              )}
            </div>
            
            {customTerrain && (
              <div className="terrain-info">
                <p>Custom terrain loaded!</p>
                <p>Levels: {Object.keys(customTerrain.levels || {}).length}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <TreasureQuestionModal 
        isOpen={showQuestionModal}
        question={currentQuestion}
        onClose={handleQuestionClose}
        onSolve={handleQuestionSolve}
      />
      
      {gamePaused && (
        <GameMenu
          onResume={handleResumeGame}
          onRestart={handleRestartGame}
          onQuit={handleQuitToMenu}
        />
      )}
      
      <PerformanceMonitor />
    </div>
  );
};

export default OpenWorldGame;