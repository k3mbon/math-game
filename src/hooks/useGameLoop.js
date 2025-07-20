import { useEffect, useRef } from 'react';
import { GAME_CONFIG } from '../config/gameConfig';
import { generateChunkObjects } from '../utils/objectGenerator';

export const useGameLoop = (keys, gameState, updateGameState, isWalkable, generateTerrain, customWorld = null) => {
  const animationIdRef = useRef(null);
  const lastFrameTimeRef = useRef(0);
  const frameIntervalRef = useRef(1000 / GAME_CONFIG.MAX_FRAME_RATE); // Target frame interval
  const frameCountRef = useRef(0);

  useEffect(() => {
    
    const gameLoop = (currentTime) => {
      // Frame rate limiting
      if (currentTime - lastFrameTimeRef.current < frameIntervalRef.current) {
        animationIdRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      lastFrameTimeRef.current = currentTime;
      frameCountRef.current++;
      
      if (!keys || Object.keys(keys).length === 0) {
        animationIdRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      
      // Handle movement input

      updateGameState(prev => {
        let newX = prev.player.x;
        let newY = prev.player.y;
        const speed = GAME_CONFIG.PLAYER_SPEED;

        // Handle player movement
        if (keys['ArrowUp'] || keys['KeyW']) newY -= speed;
        if (keys['ArrowDown'] || keys['KeyS']) newY += speed;
        if (keys['ArrowLeft'] || keys['KeyA']) newX -= speed;
        if (keys['ArrowRight'] || keys['KeyD']) newX += speed;
        
        // Position updated

        // Boundary checking
        const worldPixelSize = GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE;
        newX = Math.max(GAME_CONFIG.PLAYER_SIZE / 2, Math.min(worldPixelSize - GAME_CONFIG.PLAYER_SIZE / 2, newX));
        newY = Math.max(GAME_CONFIG.PLAYER_SIZE / 2, Math.min(worldPixelSize - GAME_CONFIG.PLAYER_SIZE / 2, newY));

        // Collision detection
        if (!isWalkable(newX, newY, prev.terrain, customWorld)) {
          newX = prev.player.x;
          newY = prev.player.y;
        }

        // Update camera to follow player
        const newCamera = {
          x: Math.max(0, Math.min(
            worldPixelSize - GAME_CONFIG.CANVAS_WIDTH,
            newX - GAME_CONFIG.CANVAS_WIDTH / 2
          )),
          y: Math.max(0, Math.min(
            worldPixelSize - GAME_CONFIG.CANVAS_HEIGHT,
            newY - GAME_CONFIG.CANVAS_HEIGHT / 2
          ))
        };

        // Load terrain chunks around camera
        const cameraChunkX = Math.floor(newCamera.x / (GAME_CONFIG.CHUNK_SIZE * GAME_CONFIG.TILE_SIZE));
        const cameraChunkY = Math.floor(newCamera.y / (GAME_CONFIG.CHUNK_SIZE * GAME_CONFIG.TILE_SIZE));
        const updatedTerrain = new Map(prev.terrain);
        let newTreasureBoxes = [...prev.treasureBoxes];
        let newMonsters = [...prev.monsters];

        // Load chunks in render distance
        for (let dx = -GAME_CONFIG.RENDER_DISTANCE; dx <= GAME_CONFIG.RENDER_DISTANCE; dx++) {
          for (let dy = -GAME_CONFIG.RENDER_DISTANCE; dy <= GAME_CONFIG.RENDER_DISTANCE; dy++) {
            const chunkX = cameraChunkX + dx;
            const chunkY = cameraChunkY + dy;
            const chunkKey = `${chunkX},${chunkY}`;
            
            if (!updatedTerrain.has(chunkKey)) {
              const chunkTerrain = generateTerrain(chunkX, chunkY, prev.depthLevel);
              updatedTerrain.set(chunkKey, chunkTerrain);
              
              // Generate objects for new chunk
              const chunkObjects = generateChunkObjects(
                chunkX,
                chunkY,
                prev.depthLevel,
                prev.worldSeed,
                updatedTerrain
              );
              
              // Add new treasure boxes and monsters
              newTreasureBoxes.push(...chunkObjects.treasureBoxes);
              newMonsters.push(...chunkObjects.monsters);
            }
          }
        }

        // Cleanup distant chunks to prevent memory leaks
        const chunksToRemove = [];
        for (const [chunkKey] of updatedTerrain) {
          const [chunkX, chunkY] = chunkKey.split(',').map(Number);
          const distance = Math.max(
            Math.abs(chunkX - cameraChunkX),
            Math.abs(chunkY - cameraChunkY)
          );
          if (distance > GAME_CONFIG.RENDER_DISTANCE + 1) {
            chunksToRemove.push(chunkKey);
          }
        }
        chunksToRemove.forEach(key => updatedTerrain.delete(key));

        // Optimized treasure box interaction check
        const interactionDistanceSquared = 3600; // 60^2 = 3600
        const updatedTreasureBoxes = newTreasureBoxes.map(treasure => {
          if (treasure.collected) return treasure; // Skip collected treasures
          
          const dx = newX - treasure.x;
          const dy = newY - treasure.y;
          const distanceSquared = dx * dx + dy * dy;
          
          const isNearby = distanceSquared <= interactionDistanceSquared;
          
          return {
            ...treasure,
            nearPlayer: isNearby
          };
        });

        // Optimized monster AI with reduced calculations
        const updatedMonsters = newMonsters.map((monster, index) => {
          // Skip monster updates every other frame for performance (stagger updates)
          if (GAME_CONFIG.PERFORMANCE_MODE && (frameCountRef.current + index) % 2 !== 0) {
            return monster;
          }
          
          const dx = newX - monster.x;
          const dy = newY - monster.y;
          const distanceSquared = dx * dx + dy * dy; // Avoid sqrt for performance
          
          // Only update monsters within reasonable distance (using squared distance)
          if (distanceSquared > 90000) return monster; // 300^2 = 90000
          
          if (distanceSquared > 2500) { // 50^2 = 2500
            const distance = Math.sqrt(distanceSquared); // Only calculate sqrt when needed
            const moveX = (dx / distance) * GAME_CONFIG.MONSTER_SPEED;
            const moveY = (dy / distance) * GAME_CONFIG.MONSTER_SPEED;
            const newMonsterX = monster.x + moveX;
            const newMonsterY = monster.y + moveY;
            
            if (isWalkable(newMonsterX, newMonsterY, updatedTerrain, customWorld)) {
              return { ...monster, x: newMonsterX, y: newMonsterY };
            }
          }
          return monster;
        });

        return {
          ...prev,
          player: { ...prev.player, x: newX, y: newY },
          camera: newCamera,
          terrain: updatedTerrain,
          treasureBoxes: updatedTreasureBoxes,
          monsters: updatedMonsters
        };
      });
      
      animationIdRef.current = requestAnimationFrame(gameLoop);
    };

    animationIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [keys, updateGameState, isWalkable, generateTerrain]);

  return animationIdRef;
};