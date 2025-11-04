import { useEffect, useRef } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { globalEnvironmentSystem } from '../utils/proceduralEnvironment';

export const useGameLoop = (keys, gameState, updateGameState, checkWalkable, generateTerrain) => {
  const animationIdRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const frameIntervalRef = useRef(1000 / GAME_CONFIG.MAX_FRAME_RATE); // Target frame interval
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const positionHistoryRef = useRef([]);
  const lastDebugLogRef = useRef(0);

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
        // Debug: no keys registered
        const now = performance.now();
        if (import.meta.env?.DEV && now - lastDebugLogRef.current > 500) {
          console.log('⌨️ No input keys registered');
          lastDebugLogRef.current = now;
        }
        // Record UI-visible debug when keys are missing
        updateGameState(prev => {
          const logs = Array.isArray(prev.debugLogs) ? prev.debugLogs.slice(-49) : [];
          logs.push({
            t: Date.now(),
            type: 'input',
            msg: 'No input keys registered',
            keys: [],
          });
          return { ...prev, debugLogs: logs, status: { ...(prev.status||{}), inputActive: false } };
        });
        animationIdRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      
      // Handle movement input with enhanced position tracking
      updateGameState(prev => {
        let newX = prev.player.x;
        let newY = prev.player.y;
        const moveSpeed = GAME_CONFIG.PLAYER_SPEED * frameMultiplier;
        
        // Movement input detection with improved key handling
        let inputX = 0;
        let inputY = 0;
        let hasInput = false;
        
        if (keys['ArrowUp'] || keys['KeyW']) {
          inputY = -1;
          hasInput = true;
        }
        if (keys['ArrowDown'] || keys['KeyS']) {
          inputY = 1;
          hasInput = true;
        }
        if (keys['ArrowLeft'] || keys['KeyA']) {
          inputX = -1;
          hasInput = true;
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
          inputX = 1;
          hasInput = true;
        }
        
        // Skip movement if no input
        if (!hasInput) {
          const now = performance.now();
          if (import.meta.env?.DEV && now - lastDebugLogRef.current > 500) {
            const pressed = Object.keys(keys).filter(k => keys[k]);
            console.log('🕹️ No movement input detected. Pressed keys:', pressed);
            lastDebugLogRef.current = now;
          }
          const pressed = Object.keys(keys).filter(k => keys[k]);
          return {
            ...prev,
            player: {
              ...prev.player,
              isMoving: false
            },
            status: { ...(prev.status||{}), inputActive: false },
            debugLogs: (() => {
              const logs = Array.isArray(prev.debugLogs) ? prev.debugLogs.slice(-49) : [];
              logs.push({ t: Date.now(), type: 'movement', msg: 'No movement input detected', keys: pressed });
              return logs;
            })()
          };
        }
        
        // Normalize diagonal movement
        if (inputX !== 0 && inputY !== 0) {
          inputX *= 0.707; // 1/sqrt(2) for diagonal normalization
          inputY *= 0.707;
        }
        
        // Apply movement with enhanced collision detection
        const proposedX = newX + inputX * moveSpeed;
        const proposedY = newY + inputY * moveSpeed;
        
        // Calculate world boundaries in pixels - allow precise edge movement
        const worldPixelSize = GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE;
        const playerHalfSize = GAME_CONFIG.PLAYER_SIZE / 2;
        
        // Precise boundary checking - allow movement exactly to the visible map edges
        const minBoundary = playerHalfSize;
        const maxBoundaryX = worldPixelSize - playerHalfSize;
        const maxBoundaryY = worldPixelSize - playerHalfSize;
        
        // Enhanced collision detection with multiple fallback strategies
        let finalX = proposedX;
        let finalY = proposedY;
        let movementBlocked = false;
        let blockedReason = '';
        
        // First attempt: Check the proposed position
        if (!checkWalkable(proposedX, proposedY)) {
          movementBlocked = true;
          blockedReason = 'proposed_position_blocked';
          if (import.meta.env?.DEV) {
            console.log('⛔ Movement blocked at proposed position:', { proposedX, proposedY });
          }
          
          // Second attempt: Try horizontal movement only
          if (inputX !== 0) {
            const testX = newX + inputX * moveSpeed;
            const clampedTestX = Math.max(minBoundary, Math.min(maxBoundaryX, testX));
            if (checkWalkable(clampedTestX, newY)) {
              finalX = clampedTestX;
              finalY = newY;
              movementBlocked = false;
              blockedReason = '';
              if (import.meta.env?.DEV) {
                console.log('➡️ Horizontal move succeeds at:', { finalX, finalY });
              }
            }
          }
          
          // Third attempt: Try vertical movement only (if horizontal failed)
          if (movementBlocked && inputY !== 0) {
            const testY = newY + inputY * moveSpeed;
            const clampedTestY = Math.max(minBoundary, Math.min(maxBoundaryY, testY));
            if (checkWalkable(newX, clampedTestY)) {
              finalX = newX;
              finalY = clampedTestY;
              movementBlocked = false;
              blockedReason = '';
              if (import.meta.env?.DEV) {
                console.log('⬇️ Vertical move succeeds at:', { finalX, finalY });
              }
            }
          }
          
          // Fourth attempt: Try smaller steps (reduced movement)
          if (movementBlocked) {
            const reducedSpeed = moveSpeed * 0.5;
            const reducedX = newX + inputX * reducedSpeed;
            const reducedY = newY + inputY * reducedSpeed;
            
            if (checkWalkable(reducedX, reducedY)) {
              finalX = reducedX;
              finalY = reducedY;
              movementBlocked = false;
              blockedReason = '';
              if (import.meta.env?.DEV) {
                console.log('🐢 Reduced-step move succeeds at:', { finalX, finalY });
              }
            }
          }
        }
        
        // Apply boundary constraints
        finalX = Math.max(minBoundary, Math.min(maxBoundaryX, finalX));
        finalY = Math.max(minBoundary, Math.min(maxBoundaryY, finalY));
        
        // Enhanced position tracking and validation
        const positionChanged = Math.abs(finalX - newX) > 0.1 || Math.abs(finalY - newY) > 0.1;
        const pressedKeys = Object.keys(keys).filter(k => keys[k]);
        
        // Track position history for debugging
        if (positionChanged) {
          positionHistoryRef.current.push({
            x: finalX,
            y: finalY,
            timestamp: currentTime,
            inputX,
            inputY
          });
          
          // Keep only last 10 positions for performance
          if (positionHistoryRef.current.length > 10) {
            positionHistoryRef.current.shift();
          }
        }
        
        // Simple camera follow
        const cameraX = Math.max(0, Math.min(finalX - GAME_CONFIG.CANVAS_WIDTH / 2, worldPixelSize - GAME_CONFIG.CANVAS_WIDTH));
        const cameraY = Math.max(0, Math.min(finalY - GAME_CONFIG.CANVAS_HEIGHT / 2, worldPixelSize - GAME_CONFIG.CANVAS_HEIGHT));
        
        // Load terrain chunks around camera
        const cameraChunkX = Math.floor((cameraX + GAME_CONFIG.CANVAS_WIDTH / 2) / (GAME_CONFIG.CHUNK_SIZE * GAME_CONFIG.TILE_SIZE));
        const cameraChunkY = Math.floor((cameraY + GAME_CONFIG.CANVAS_HEIGHT / 2) / (GAME_CONFIG.CHUNK_SIZE * GAME_CONFIG.TILE_SIZE));
        
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
        
        // Update treasure box proximity detection
        const proximityDistance = 2 * GAME_CONFIG.TILE_SIZE;
        const updatedTreasureBoxes = prev.treasureBoxes.map(treasure => {
          if (treasure.collected) {
            return { ...treasure, nearPlayer: false };
          }
          
          const playerCenterX = finalX + GAME_CONFIG.PLAYER_SIZE / 2;
          const playerCenterY = finalY + GAME_CONFIG.PLAYER_SIZE / 2;
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
        
        // Edge status for UI reporting
        const atEdge = {
          left: finalX <= minBoundary + 0.1,
          right: finalX >= maxBoundaryX - 0.1,
          top: finalY <= minBoundary + 0.1,
          bottom: finalY >= maxBoundaryY - 0.1
        };

        // Build UI-visible debug logs (limited)
        const logs = Array.isArray(prev.debugLogs) ? prev.debugLogs.slice(-49) : [];
        logs.push({
          t: Date.now(),
          type: 'movement',
          msg: movementBlocked ? 'Movement blocked' : (positionChanged ? 'Movement applied' : 'No position change'),
          from: { x: newX, y: newY },
          proposed: { x: proposedX, y: proposedY },
          final: { x: finalX, y: finalY },
          input: { x: inputX, y: inputY },
          keys: pressedKeys,
          reason: blockedReason
        });

        return {
          ...prev,
          player: {
            ...prev.player,
            x: finalX,
            y: finalY,
            isMoving: positionChanged,
            lastMovement: positionChanged ? { inputX, inputY } : null,
            positionHistory: positionHistoryRef.current,
            lastMoveDebug: {
              from: { x: newX, y: newY },
              proposed: { x: proposedX, y: proposedY },
              final: { x: finalX, y: finalY },
              input: { x: inputX, y: inputY },
              keys: pressedKeys,
              blocked: movementBlocked,
              reason: blockedReason,
              timestamp: Date.now(),
              atEdge
            },
            atEdge
          },
          camera: {
            x: cameraX,
            y: cameraY
          },
          treasureBoxes: updatedTreasureBoxes,
          status: { inputActive: true, movementBlocked, positionChanged },
          debugLogs: logs
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
  }, [keys, updateGameState, checkWalkable, generateTerrain]);

  return animationIdRef;
};