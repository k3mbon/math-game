import { useEffect, useRef } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { globalEnvironmentSystem } from '../utils/proceduralEnvironment';

export const useGameLoop = (keys, gameState, updateGameState, checkWalkable, generateTerrain, options) => {
  const animationIdRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const frameIntervalRef = useRef(1000 / GAME_CONFIG.MAX_FRAME_RATE); // Target frame interval
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const positionHistoryRef = useRef([]);
  const lastDebugLogRef = useRef(0);

  // Mode options
  const isWildrealmMode = !!(options && options.isWildrealm);
  // Optional collision resolver for bushes supplied by caller
  const bushCollisionResolver = options && options.bushCollisionResolver;

  // Monster AI tunables (localized to avoid config churn)
  const MONSTER_ATTACK_RANGE = GAME_CONFIG.TILE_SIZE * 1.2;
  const MONSTER_CHASE_RANGE = GAME_CONFIG.TILE_SIZE * 8;
  const MONSTER_ATTACK_COOLDOWN_MS = 1000;
  const MONSTER_ATTACK_DURATION_MS = 350;
  const PLAYER_DAMAGE_COOLDOWN_MS = 350;

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
        // Record UI-visible debug when keys are missing (DEV only) to reduce re-render lag
        updateGameState(prev => {
          const statusUpdate = { ...(prev.status||{}), inputActive: false };
          if (import.meta.env?.DEV) {
            const logs = Array.isArray(prev.debugLogs) ? prev.debugLogs.slice(-49) : [];
            logs.push({ t: Date.now(), type: 'input', msg: 'No input keys registered', keys: [] });
            return { ...prev, debugLogs: logs, status: statusUpdate };
          }
          return { ...prev, status: statusUpdate };
        });
        animationIdRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      
      // Handle movement input with enhanced position tracking
      updateGameState(prev => {
        let newX = prev.player.x;
        let newY = prev.player.y;
        const baseSpeed = GAME_CONFIG.PLAYER_SPEED * frameMultiplier;
        const running = keys['ShiftLeft'] || keys['ShiftRight'];
        const runMultiplier = (GAME_CONFIG.RUN_MULTIPLIER ?? 1.5);
        const moveSpeed = baseSpeed * (running ? runMultiplier : 1);
        
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
          const baseState = {
            ...prev,
            player: { ...prev.player, isMoving: false },
            status: { ...(prev.status||{}), inputActive: false }
          };
          if (import.meta.env?.DEV) {
            const logs = Array.isArray(prev.debugLogs) ? prev.debugLogs.slice(-49) : [];
            logs.push({ t: Date.now(), type: 'movement', msg: 'No movement input detected', keys: pressed });
            return { ...baseState, debugLogs: logs };
          }
          return baseState;
        }
        
        // Normalize diagonal movement
        if (inputX !== 0 && inputY !== 0) {
          inputX *= 0.707; // 1/sqrt(2) for diagonal normalization
          inputY *= 0.707;
        }
        
        // Apply movement with enhanced collision detection
        const proposedX = newX + inputX * moveSpeed;
        const proposedY = newY + inputY * moveSpeed;

        // Helper: check collision against treasure chests (block if not collected)
        const isChestBlockingAtPosition = (px, py, treasure) => {
          if (!treasure || treasure.collected) return false;
          // Precise hitboxes: player uses collision scale; chest uses configured width/height ratios
          const playerHalf = (GAME_CONFIG.PLAYER_SIZE * (GAME_CONFIG.PLAYER_COLLISION_SCALE ?? 0.8)) / 2;
          const chestHalfW = (GAME_CONFIG.TREASURE_SIZE * (GAME_CONFIG.TREASURE_HITBOX_WIDTH_RATIO ?? 0.72)) / 2;
          const chestHalfH = (GAME_CONFIG.TREASURE_SIZE * (GAME_CONFIG.TREASURE_HITBOX_HEIGHT_RATIO ?? 0.70)) / 2;
          const chestCenterY = treasure.y + (GAME_CONFIG.TREASURE_SIZE * (GAME_CONFIG.TREASURE_HITBOX_Y_OFFSET_RATIO ?? 0));
          const intersectsX = Math.abs(px - treasure.x) < (playerHalf + chestHalfW);
          const intersectsY = Math.abs(py - chestCenterY) < (playerHalf + chestHalfH);
          return intersectsX && intersectsY;
        };
        const isAnyChestBlocking = (px, py, treasures) => {
          if (!Array.isArray(treasures)) return false;
          for (const t of treasures) {
            if (isChestBlockingAtPosition(px, py, t)) return true;
          }
          return false;
        };

        // Compute a push-back response to separate player from a chest
        const getChestCollisionResponse = (px, py, treasure) => {
          // Axis-Aligned Bounding Box separation for crisp chest blocking
          const playerHalf = (GAME_CONFIG.PLAYER_SIZE * (GAME_CONFIG.PLAYER_COLLISION_SCALE ?? 0.8)) / 2;
          const chestHalfW = (GAME_CONFIG.TREASURE_SIZE * (GAME_CONFIG.TREASURE_HITBOX_WIDTH_RATIO ?? 0.72)) / 2;
          const chestHalfH = (GAME_CONFIG.TREASURE_SIZE * (GAME_CONFIG.TREASURE_HITBOX_HEIGHT_RATIO ?? 0.70)) / 2;
          const chestCenterY = treasure.y + (GAME_CONFIG.TREASURE_SIZE * (GAME_CONFIG.TREASURE_HITBOX_Y_OFFSET_RATIO ?? 0));
          const dx = px - treasure.x;
          const dy = py - chestCenterY;
          const overlapX = (playerHalf + chestHalfW) - Math.abs(dx);
          const overlapY = (playerHalf + chestHalfH) - Math.abs(dy);
          if (overlapX <= 0 || overlapY <= 0) {
            return { x: px, y: py, blocked: false };
          }
          // Resolve along the axis of least penetration
          const buffer = 2; // small separation buffer to avoid jitter
          if (overlapX < overlapY) {
            const signX = dx === 0 ? 1 : Math.sign(dx);
            const targetX = treasure.x + signX * (playerHalf + chestHalfW + buffer);
            return { x: targetX, y: py, blocked: true };
          } else {
            const signY = dy === 0 ? 1 : Math.sign(dy);
            const targetY = chestCenterY + signY * (playerHalf + chestHalfH + buffer);
            return { x: px, y: targetY, blocked: true };
          }
        };
        
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
        
        // First attempt: Check the proposed position for terrain or chest collision
        const terrainBlocked = !checkWalkable(proposedX, proposedY);
        const chestBlocked = isAnyChestBlocking(proposedX, proposedY, prev.treasureBoxes);
        if (terrainBlocked || chestBlocked) {
          movementBlocked = true;
          blockedReason = terrainBlocked ? 'proposed_position_blocked' : 'treasure_collision';
          if (import.meta.env?.DEV) {
            console.log('⛔ Movement blocked at proposed position:', { proposedX, proposedY, terrainBlocked, chestBlocked });
          }

          // Special handling: if chest causes the block, apply AABB push-back immediately
          if (!terrainBlocked && chestBlocked) {
            const blockingChest = prev.treasureBoxes.find(t => isChestBlockingAtPosition(proposedX, proposedY, t));
            if (blockingChest) {
              const response = getChestCollisionResponse(proposedX, proposedY, blockingChest);
              const respX = Math.max(minBoundary, Math.min(maxBoundaryX, response.x));
              const respY = Math.max(minBoundary, Math.min(maxBoundaryY, response.y));
              // Apply push-back unconditionally to prevent overlap; subsequent checks will adjust if needed
              finalX = respX;
              finalY = respY;
              movementBlocked = false;
              blockedReason = '';
              if (import.meta.env?.DEV) {
                console.log('🟨 Chest push-back applied (unconditional):', { finalX, finalY });
              }
            }
          }

          // Special handling: if terrain is blocked by a bush, apply bush push-back
          // Use optional resolver provided by the caller to detect bush collisions precisely
          if (terrainBlocked && typeof bushCollisionResolver === 'function') {
            try {
              const bushResponse = bushCollisionResolver(proposedX, proposedY);
              if (bushResponse && bushResponse.blocked) {
                const respX = Math.max(minBoundary, Math.min(maxBoundaryX, bushResponse.x));
                const respY = Math.max(minBoundary, Math.min(maxBoundaryY, bushResponse.y));
                finalX = respX;
                finalY = respY;
                movementBlocked = false;
                blockedReason = '';
                if (import.meta.env?.DEV) {
                  console.log('🟩 Bush push-back applied (unconditional):', { finalX, finalY });
                }
              }
            } catch (e) {
              if (import.meta.env?.DEV) {
                console.warn('Bush collision resolver error:', e);
              }
            }
          }

          // Second attempt: Try horizontal movement only
          if (inputX !== 0) {
            const testX = newX + inputX * moveSpeed;
            const clampedTestX = Math.max(minBoundary, Math.min(maxBoundaryX, testX));
            const terrainOK = checkWalkable(clampedTestX, newY);
            const chestOK = !isAnyChestBlocking(clampedTestX, newY, prev.treasureBoxes);
            if (terrainOK && chestOK) {
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
            const terrainOK = checkWalkable(newX, clampedTestY);
            const chestOK = !isAnyChestBlocking(newX, clampedTestY, prev.treasureBoxes);
            if (terrainOK && chestOK) {
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
            const terrainOK = checkWalkable(reducedX, reducedY);
            const chestOK = !isAnyChestBlocking(reducedX, reducedY, prev.treasureBoxes);
            if (terrainOK && chestOK) {
              finalX = reducedX;
              finalY = reducedY;
              movementBlocked = false;
              blockedReason = '';
              if (import.meta.env?.DEV) {
                console.log('🐢 Reduced-step move succeeds at:', { finalX, finalY });
              }
            }
          }

          // If still blocked after all fallback attempts (non-chest obstacles), revert to original position
          if (movementBlocked) {
            finalX = newX;
            finalY = newY;
            if (import.meta.env?.DEV) {
              console.log('🔙 Movement remains blocked; reverting to previous position');
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
        
        // Update treasure box proximity detection (fix: use center positions)
        const proximityDistance = 2 * GAME_CONFIG.TILE_SIZE;
        const updatedTreasureBoxes = prev.treasureBoxes.map(treasure => {
          if (treasure.collected) {
            return { ...treasure, nearPlayer: false };
          }
          const playerCenterX = finalX;
          const playerCenterY = finalY;
          const treasureCenterX = treasure.x;
          const treasureCenterY = treasure.y;
          const dx = playerCenterX - treasureCenterX;
          const dy = playerCenterY - treasureCenterY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
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

        // Build UI-visible debug logs (DEV only) to reduce re-render lag
        const logs = (() => {
          if (!import.meta.env?.DEV) return prev.debugLogs;
          const l = Array.isArray(prev.debugLogs) ? prev.debugLogs.slice(-49) : [];
          l.push({
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
          return l;
        })();

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

      // Monster AI: chase player and attack within range
      updateGameState(prev => {
        const now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
        const frameMultiplier = 1; // steady AI step regardless of render delta
        const worldPixelSize = GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE;
        const halfSize = GAME_CONFIG.MONSTER_SIZE / 2;

        // Throttle player damage to avoid instant depletion
        const lastDamaged = prev.player.lastDamagedTime || 0;
        let nextPlayerHealth = prev.player.health;
        let playerWasDamaged = false;

        const updatedMonsters = prev.monsters.map(m => {
          // Preserve dead monsters (death animation handled elsewhere)
          if (m.isDead) {
            return { ...m, isMoving: false, isAttacking: false };
          }

          const dx = prev.player.x - m.x;
          const dy = prev.player.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let newX = m.x;
          let newY = m.y;
          let isMoving = false;
          let isAttacking = false;
          let lastAttackTime = m.lastAttackTime || 0;
          let attackStartTime = m.attackStartTime || 0;

          // Attack if in range and off cooldown
          if (dist <= MONSTER_ATTACK_RANGE) {
            if (now - lastAttackTime >= MONSTER_ATTACK_COOLDOWN_MS) {
              // Start attack and apply damage (respecting player damage cooldown)
              attackStartTime = now;
              lastAttackTime = now;
              if (now - lastDamaged >= PLAYER_DAMAGE_COOLDOWN_MS) {
                nextPlayerHealth = Math.max(0, nextPlayerHealth - (m.damage || 1));
                playerWasDamaged = true;
              }
            }
            // Keep showing attack animation for a short duration
            if (now - attackStartTime < MONSTER_ATTACK_DURATION_MS) {
              isAttacking = true;
            }
          } else if (dist <= MONSTER_CHASE_RANGE) {
            // Chase player toward position (simple steering)
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);
            const step = (m.speed || 1) * frameMultiplier;
            const proposedX = m.x + nx * step;
            const proposedY = m.y + ny * step;
            // Constrain within world bounds
            const clampedX = Math.max(halfSize, Math.min(worldPixelSize - halfSize, proposedX));
            const clampedY = Math.max(halfSize, Math.min(worldPixelSize - halfSize, proposedY));
            // Terrain collision
            if (checkWalkable(clampedX, clampedY)) {
              newX = clampedX;
              newY = clampedY;
              isMoving = true;
            }
          }

          return {
            ...m,
            x: newX,
            y: newY,
            isMoving,
            isAttacking,
            lastAttackTime,
            attackStartTime,
            direction: dx < 0 ? 'left' : 'right'
          };
        });

        // Update player health and brief status flag
        const updatedPlayer = {
          ...prev.player,
          health: nextPlayerHealth,
          lastDamagedTime: playerWasDamaged ? now : prev.player.lastDamagedTime
        };

        // DEV logs for AI
        const logs = (() => {
          if (!import.meta.env?.DEV) return prev.debugLogs;
          const l = Array.isArray(prev.debugLogs) ? prev.debugLogs.slice(-49) : [];
          if (playerWasDamaged) {
            l.push({ t: Date.now(), type: 'combat', msg: 'Player damaged by monster', health: nextPlayerHealth });
          }
          return l;
        })();

        return {
          ...prev,
          player: updatedPlayer,
          monsters: updatedMonsters,
          status: { ...(prev.status||{}), playerHit: playerWasDamaged }
          ,
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