import React, { useRef, useEffect, useState, useCallback } from 'react';
import './OpenWorldGame.css';
import { GAME_CONFIG } from '../config/gameConfig';
import { useGameState } from '../hooks/useGameState';
import { useGameLoop } from '../hooks/useGameLoop';
import { generateTerrainChunk, isWalkable } from '../utils/terrainGenerator';
import CanvasRenderer from './CanvasRenderer';
import TreasureQuestionModal from './TreasureQuestionModal';
import GameStartMenu from './GameStartMenu';
import numerationProblems from '../data/NumerationProblem.json';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [keys, setKeys] = useState({});
  const [playerDirection, setPlayerDirection] = useState('front'); // front, back, left, right
  const [forcedSafePositions, setForcedSafePositions] = useState(new Map());
  const [stairConnections, setStairConnections] = useState(new Map());
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackTarget, setAttackTarget] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentTreasureBox, setCurrentTreasureBox] = useState(null);
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
    grassWaterShorelineCorner: useRef(null)
  });

  // Initialize player at center of world
  const initialPlayerX = (GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE) / 2;
  const initialPlayerY = (GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE) / 2;
  
  const { gameState, updateGameState } = useGameState(initialPlayerX, initialPlayerY);

  // Terrain generation function
  const generateTerrain = useCallback((chunkX, chunkY, depthLevel) => {
    return generateTerrainChunk(
      chunkX, 
      chunkY, 
      depthLevel, 
      gameState.worldSeed, 
      forcedSafePositions, 
      stairConnections
    );
  }, [gameState.worldSeed, forcedSafePositions, stairConnections]);

  // Walkable check function
  const checkWalkable = useCallback((x, y, terrain) => {
    return isWalkable(x, y, terrain);
  }, []);

  // Game loop
  useGameLoop(keys, gameState, updateGameState, checkWalkable, generateTerrain);

  // Load game assets
  useEffect(() => {
    const loadImage = (src, ref) => {
      const img = new Image();
      img.onload = () => {
        ref.current = img;
      };
      img.onerror = () => {
        console.warn(`Failed to load image: ${src}`);
      };
      img.src = src;
    };

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
      
      // Reduce monster HP
      updateGameState(prev => ({
        ...prev,
        monsters: prev.monsters.map(m => 
          m.id === monster.id 
            ? { ...m, health: Math.max(0, m.health - 25) }
            : m
        ).filter(m => m.health > 0) // Remove dead monsters
      }));
      
      // Reset attack animation after 300ms
      setTimeout(() => {
        setIsAttacking(false);
        setAttackTarget(null);
      }, 300);
    }
  }, [gameState.player, updateGameState]);

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
      updateGameState(prev => ({
        ...prev,
        treasureBoxes: prev.treasureBoxes.map(treasure => 
          treasure.id === currentTreasureBox.id 
            ? { ...treasure, collected: true }
            : treasure
        ),
        score: prev.score + 100 // Add points for solving the question
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

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Handle treasure interaction with 'E' key
      if (e.code === 'KeyE') {
        const nearbyTreasure = gameState.treasureBoxes.find(treasure => 
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
        // Clear all movement keys first
        setKeys(prev => {
          const newKeys = { ...prev };
          movementKeys.forEach(key => {
            newKeys[key] = false;
          });
          // Set only the current key to true
          newKeys[e.code] = true;
          return newKeys;
        });
        
        // Update player direction based on movement keys
        switch(e.code) {
          case 'KeyW':
          case 'ArrowUp':
            setPlayerDirection('back');
            break;
          case 'KeyS':
          case 'ArrowDown':
            setPlayerDirection('front');
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
        setKeys(prev => ({ ...prev, [e.code]: true }));
      }
    };

    const handleKeyUp = (e) => {
      // Handle movement keys - clear the specific key
      const movementKeys = ['KeyW', 'ArrowUp', 'KeyS', 'ArrowDown', 'KeyA', 'ArrowLeft', 'KeyD', 'ArrowRight'];
      
      if (movementKeys.includes(e.code)) {
        setKeys(prev => ({ ...prev, [e.code]: false }));
      } else {
        // For non-movement keys, use normal behavior
        setKeys(prev => ({ ...prev, [e.code]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.treasureBoxes, handleTreasureInteraction]);

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
      <div className="game-container">
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
          isAttacking={isAttacking}
          attackTarget={attackTarget}
          onTreasureInteraction={handleTreasureInteraction}
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
        </div>
      </div>
      
      <TreasureQuestionModal 
        isOpen={showQuestionModal}
        question={currentQuestion}
        onClose={handleQuestionClose}
        onSolve={handleQuestionSolve}
      />
    </div>
  );
};

export default OpenWorldGame;