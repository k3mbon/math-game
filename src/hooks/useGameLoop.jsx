import { useEffect, useRef } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { globalEnvironmentSystem } from '../utils/proceduralEnvironment';

export const useGameLoop = (keys, gameState, updateGameState, checkWalkable, generateTerrain) => {
  const animationIdRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const frameIntervalRef = useRef(1000 / GAME_CONFIG.MAX_FRAME_RATE); // Target frame interval

  useEffect(() => {
    const gameLoop = (currentTime) => {
      // Calculate delta time for frame-rate independent movement
      const deltaTime = currentTime - lastFrameTimeRef.current;
      
      // Frame rate limiting - ensure consistent 60fps
      if (deltaTime < frameIntervalRef.current) {
        animationIdRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      
      // Calculate frame rate multiplier for smooth movement
      const frameMultiplier = Math.min(deltaTime / (1000 / 60), 2); // Cap at 2x for stability
      
      lastFrameTimeRef.current = currentTime;
      
      if (!keys || Object.keys(keys).length === 0) {
        animationIdRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      
      // Handle movement input with simple smooth movement
      updateGameState(prev => {
        let newX = prev.player.x;
        let newY = prev.player.y;
        const moveSpeed = GAME_CONFIG.PLAYER_SPEED * frameMultiplier;
        
        // Movement input detection
        let inputX = 0;
        let inputY = 0;
        
        if (keys['ArrowUp'] || keys['KeyW']) {
          inputY = -1;
        }
        if (keys['ArrowDown'] || keys['KeyS']) {
          inputY = 1;
        }
        if (keys['ArrowLeft'] || keys['KeyA']) {
          inputX = -1;
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
          inputX = 1;
        }
        
        // Normalize diagonal movement
        if (inputX !== 0 && inputY !== 0) {
          inputX *= 0.707; // 1/sqrt(2) for diagonal normalization
          inputY *= 0.707;
        }
        
        // Apply movement directly
        newX += inputX * moveSpeed;
        newY += inputY * moveSpeed;
        
        // Calculate world boundaries in pixels - allow precise edge movement
        const worldPixelSize = GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE;
        const playerHalfSize = GAME_CONFIG.PLAYER_SIZE / 2;
        
        // Precise boundary checking - allow movement exactly to the visible map edges
        // Remove the additional margin to enable walking on border edges
        const minBoundary = playerHalfSize; // Exact edge of the world
        const maxBoundaryX = worldPixelSize - playerHalfSize; // Exact opposite edge
        const maxBoundaryY = worldPixelSize - playerHalfSize; // Exact opposite edge
        
        // Store original position for edge detection
        const wasAtEdge = {
          left: prev.player.x <= minBoundary + 5,
          right: prev.player.x >= maxBoundaryX - 5,
          top: prev.player.y <= minBoundary + 5,
          bottom: prev.player.y >= maxBoundaryY - 5
        };
        
        newX = Math.max(minBoundary, Math.min(maxBoundaryX, newX));
        newY = Math.max(minBoundary, Math.min(maxBoundaryY, newY));
        
        // Check if player is now at the exact edge
        const isAtEdge = {
          left: newX <= minBoundary + 1,
          right: newX >= maxBoundaryX - 1,
          top: newY <= minBoundary + 1,
          bottom: newY >= maxBoundaryY - 1
        };

        // Collision detection - simplified walkable check with enhanced edge handling
        if (!checkWalkable(newX, newY)) {
          // Enhanced collision handling for edge cases
          let horizontalMovePossible = false;
          let verticalMovePossible = false;
          
          // Try horizontal movement only
          if (inputX !== 0) {
            const testX = prev.player.x + inputX * moveSpeed;
            const clampedTestX = Math.max(minBoundary, Math.min(maxBoundaryX, testX));
            if (checkWalkable(clampedTestX, prev.player.y)) {
              newX = clampedTestX;
              newY = prev.player.y;
              horizontalMovePossible = true;
            }
          }
          
          // Try vertical movement only
          if (inputY !== 0 && !horizontalMovePossible) {
            const testY = prev.player.y + inputY * moveSpeed;
            const clampedTestY = Math.max(minBoundary, Math.min(maxBoundaryY, testY));
            if (checkWalkable(prev.player.x, clampedTestY)) {
              newX = prev.player.x;
              newY = clampedTestY;
              verticalMovePossible = true;
            }
          }
          
          // If no movement is possible, stay in place
          if (!horizontalMovePossible && !verticalMovePossible) {
            newX = prev.player.x;
            newY = prev.player.y;
          }
        }
        
        // Simple camera follow
        const cameraX = Math.max(0, Math.min(newX - GAME_CONFIG.CANVAS_WIDTH / 2, worldPixelSize - GAME_CONFIG.CANVAS_WIDTH));
        const cameraY = Math.max(0, Math.min(newY - GAME_CONFIG.CANVAS_HEIGHT / 2, worldPixelSize - GAME_CONFIG.CANVAS_HEIGHT));
        
        const newCamera = {
          x: cameraX,
          y: cameraY
        };



        // Load terrain chunks around camera - use tile-based coordinates for chunk calculation
        const cameraChunkX = Math.floor((newCamera.x + GAME_CONFIG.CANVAS_WIDTH / 2) / (GAME_CONFIG.CHUNK_SIZE * GAME_CONFIG.TILE_SIZE));
        const cameraChunkY = Math.floor((newCamera.y + GAME_CONFIG.CANVAS_HEIGHT / 2) / (GAME_CONFIG.CHUNK_SIZE * GAME_CONFIG.TILE_SIZE));
        const updatedTerrain = new Map(prev.terrain);
        let newTreasureBoxes = [...prev.treasureBoxes];
        let newMonsters = [...prev.monsters];

        // Update procedural environment system performance
        globalEnvironmentSystem.updatePerformance(deltaTime);
        
        // Get procedural environment objects in view
        const environmentObjects = globalEnvironmentSystem.getObjectsInView(
          newCamera.x,
          newCamera.y,
          GAME_CONFIG.CANVAS_WIDTH,
          GAME_CONFIG.CANVAS_HEIGHT
        );

        // Generate terrain chunks in a 3x3 grid around the camera
        const renderDistance = 1;
        for (let dx = -renderDistance; dx <= renderDistance; dx++) {
          for (let dy = -renderDistance; dy <= renderDistance; dy++) {
            const chunkX = cameraChunkX + dx;
            const chunkY = cameraChunkY + dy;
            const chunkKey = `${chunkX},${chunkY}`;
            
            if (!prev.terrain?.has(chunkKey)) {
              const chunk = generateTerrain(chunkX, chunkY, prev.depthLevel);
              prev.terrain?.set(chunkKey, chunk);
            }
          }
        }

        // Update treasure box proximity detection (2 units = 2 * TILE_SIZE pixels)
        const proximityDistance = 2 * GAME_CONFIG.TILE_SIZE;
        const updatedTreasureBoxes = prev.treasureBoxes.map(treasure => {
          if (treasure.collected) {
            return { ...treasure, nearPlayer: false };
          }
          
          // Calculate distance between player center and treasure center
          const playerCenterX = newX + GAME_CONFIG.PLAYER_SIZE / 2;
          const playerCenterY = newY + GAME_CONFIG.PLAYER_SIZE / 2;
          const treasureCenterX = treasure.x + GAME_CONFIG.TREASURE_SIZE / 2;
          const treasureCenterY = treasure.y + GAME_CONFIG.TREASURE_SIZE / 2;
          
          const distance = Math.sqrt(
            Math.pow(playerCenterX - treasureCenterX, 2) + 
            Math.pow(playerCenterY - treasureCenterY, 2)
          );
          
          return {
            ...treasure,
            nearPlayer: distance <= proximityDistance
          };
        });
        
        return {
          ...prev,
          player: {
            ...prev.player,
            x: newX,
            y: newY,
            isMoving: inputX !== 0 || inputY !== 0,
            // Add edge detection state for visual feedback
            atEdge: isAtEdge,
            wasAtEdge: wasAtEdge
          },
          camera: newCamera,
          treasureBoxes: updatedTreasureBoxes
        };
      });
      
      // Continue game loop
      animationIdRef.current = requestAnimationFrame(gameLoop);
    };

    animationIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [keys, gameState, updateGameState, checkWalkable, generateTerrain]);

  return animationIdRef;
};