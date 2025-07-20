import React, { useEffect, useRef, useState } from 'react';
import { GAME_CONFIG, TERRAIN_TYPES, WORLD_COLORS } from '../config/gameConfig';
import { useSproutLandsAssets, getAssetPath } from '../utils/sproutLandsAssets';

const SproutLandsRenderer = ({ 
  gameState, 
  canvasRef
}) => {
  const { assets, loading, error } = useSproutLandsAssets();
  const frameCountRef = useRef(0);
  const [loadedImages, setLoadedImages] = useState({});

  // Load images when assets are available
  useEffect(() => {
    if (!assets) return;

    const loadImages = async () => {
      const imagePromises = {};
      
      // Load character images
      if (assets.characters) {
        Object.entries(assets.characters).forEach(([key, src]) => {
          imagePromises[`character_${key}`] = loadImage(src);
        });
      }
      
      // Load terrain images
      if (assets.terrain) {
        Object.entries(assets.terrain).forEach(([key, src]) => {
          imagePromises[`terrain_${key}`] = loadImage(src);
        });
      }
      
      // Load decoration images
      if (assets.decorations) {
        Object.entries(assets.decorations).forEach(([key, src]) => {
          imagePromises[`decoration_${key}`] = loadImage(src);
        });
      }
      
      // Load item images
      if (assets.items) {
        Object.entries(assets.items).forEach(([key, src]) => {
          imagePromises[`item_${key}`] = loadImage(src);
        });
      }
      
      // Load building images
      if (assets.buildings) {
        Object.entries(assets.buildings).forEach(([key, src]) => {
          imagePromises[`building_${key}`] = loadImage(src);
        });
      }
      
      // Load UI images
      if (assets.ui) {
        if (assets.ui.icons) {
          Object.entries(assets.ui.icons).forEach(([key, src]) => {
            imagePromises[`ui_icon_${key}`] = loadImage(src);
          });
        }
        if (assets.ui.banners) {
          imagePromises[`ui_banner`] = loadImage(assets.ui.banners);
        }
      }
      
      // Load effect images
      if (assets.effects) {
        Object.entries(assets.effects).forEach(([key, src]) => {
          imagePromises[`effect_${key}`] = loadImage(src);
        });
      }

      try {
        const resolvedImages = {};
        for (const [key, promise] of Object.entries(imagePromises)) {
          resolvedImages[key] = await promise;
        }
        setLoadedImages(resolvedImages);
      } catch (err) {
        console.error('Failed to load Sprout Lands images:', err);
      }
    };

    loadImages();
  }, [assets]);

  // Helper function to load an image
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  useEffect(() => {
    if (loading || error || !assets || Object.keys(loadedImages).length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    frameCountRef.current++;
    
    // Clear canvas with a beautiful gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.CANVAS_HEIGHT);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue
    gradient.addColorStop(0.7, '#98FB98'); // Pale green
    gradient.addColorStop(1, '#90EE90'); // Light green
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    // Save context for camera transformation
    ctx.save();
    ctx.translate(-gameState.camera.x, -gameState.camera.y);

    // Calculate visible area for viewport culling
    const visibleArea = {
      startTileX: Math.floor(gameState.camera.x / GAME_CONFIG.TILE_SIZE),
      endTileX: Math.ceil((gameState.camera.x + GAME_CONFIG.CANVAS_WIDTH) / GAME_CONFIG.TILE_SIZE),
      startTileY: Math.floor(gameState.camera.y / GAME_CONFIG.TILE_SIZE),
      endTileY: Math.ceil((gameState.camera.y + GAME_CONFIG.CANVAS_HEIGHT) / GAME_CONFIG.TILE_SIZE)
    };

    // Render terrain with Sprout Lands assets
    renderSproutLandsTerrain(ctx, gameState, visibleArea, loadedImages, frameCountRef.current);

    // Render world boundaries
    renderWorldBoundaries(ctx, gameState);

    // Render game objects with Sprout Lands style
    renderSproutLandsObjects(ctx, gameState, visibleArea, loadedImages);
    renderSproutLandsPlayer(ctx, gameState, loadedImages);

    // Restore context
    ctx.restore();

    // Render UI elements with Sprout Lands style
    renderSproutLandsUI(ctx, gameState, loadedImages);

  }, [gameState, assets, loadedImages, loading, error]);

  if (loading) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#4CAF50',
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif'
      }}>
        Loading Sprout Lands Assets... 🌱
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: '#F44336',
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif'
      }}>
        Error loading assets: {error}
      </div>
    );
  }

  return null; // This component only handles rendering
};

// Enhanced terrain rendering with Sprout Lands assets
const renderSproutLandsTerrain = (ctx, gameState, visibleArea, loadedImages, frameCount) => {
  const { startTileX, endTileX, startTileY, endTileY } = visibleArea;

  for (let tileX = startTileX; tileX <= endTileX; tileX++) {
    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
      const chunkX = Math.floor(tileX / GAME_CONFIG.CHUNK_SIZE);
      const chunkY = Math.floor(tileY / GAME_CONFIG.CHUNK_SIZE);
      const chunkKey = `${chunkX},${chunkY}`;
      
      const chunk = gameState.terrain.get(chunkKey);
      
      // Force render grass tiles if no terrain data (for testing)
      if (!chunk) {
        const x = tileX * GAME_CONFIG.TILE_SIZE;
        const y = tileY * GAME_CONFIG.TILE_SIZE;
        
        // Create a simple grass pattern
        const grassGradient = ctx.createRadialGradient(
          x + GAME_CONFIG.TILE_SIZE/2, y + GAME_CONFIG.TILE_SIZE/2, 0,
          x + GAME_CONFIG.TILE_SIZE/2, y + GAME_CONFIG.TILE_SIZE/2, GAME_CONFIG.TILE_SIZE/2
        );
        grassGradient.addColorStop(0, '#90EE90');
        grassGradient.addColorStop(1, '#228B22');
        ctx.fillStyle = grassGradient;
        ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
        continue;
      }
      
      const localX = tileX % GAME_CONFIG.CHUNK_SIZE;
      const localY = tileY % GAME_CONFIG.CHUNK_SIZE;
      const tile = chunk.find(t => 
        t.x % GAME_CONFIG.CHUNK_SIZE === localX && 
        t.y % GAME_CONFIG.CHUNK_SIZE === localY
      );
      
      if (!tile) {
        // Render default grass tile if no tile data
        const x = tileX * GAME_CONFIG.TILE_SIZE;
        const y = tileY * GAME_CONFIG.TILE_SIZE;
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
        continue;
      }
      
      const x = tileX * GAME_CONFIG.TILE_SIZE;
      const y = tileY * GAME_CONFIG.TILE_SIZE;
      
      // Render terrain with Sprout Lands style
      renderSproutLandsTerrainTile(ctx, tile, x, y, tileX, tileY, loadedImages, frameCount);
    }
  }
};

// Render individual terrain tiles with Sprout Lands assets
const renderSproutLandsTerrainTile = (ctx, tile, x, y, tileX, tileY, loadedImages, frameCount) => {
  const time = frameCount * 0.02;
  
  switch (tile.type) {
    case 'GRASS':
      // Use downloaded grass tileset if available
      if (loadedImages.terrain_grass) {
        // Extract a single tile from the grass tileset (assuming 16x16 tiles)
        const tileSize = 16;
        const tilesPerRow = Math.floor(loadedImages.terrain_grass.width / tileSize);
        const grassVariant = (tileX + tileY) % (tilesPerRow * Math.floor(loadedImages.terrain_grass.height / tileSize));
        const srcX = (grassVariant % tilesPerRow) * tileSize;
        const srcY = Math.floor(grassVariant / tilesPerRow) * tileSize;
        
        ctx.drawImage(
          loadedImages.terrain_grass,
          srcX, srcY, tileSize, tileSize,
          x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE
        );
      } else {
        // Fallback to enhanced grass rendering
        const grassGradient = ctx.createRadialGradient(
          x + GAME_CONFIG.TILE_SIZE/2, y + GAME_CONFIG.TILE_SIZE/2, 0,
          x + GAME_CONFIG.TILE_SIZE/2, y + GAME_CONFIG.TILE_SIZE/2, GAME_CONFIG.TILE_SIZE/2
        );
        grassGradient.addColorStop(0, '#90EE90');
        grassGradient.addColorStop(1, '#228B22');
        ctx.fillStyle = grassGradient;
        ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
        
        // Add grass details
        const grassSeed = (tileX * 67 + tileY * 43) % 1000;
        if (grassSeed > 600) {
          ctx.fillStyle = grassSeed > 800 ? '#FFEB3B' : '#4CAF50';
          const detailX = x + (grassSeed % 20) + 10;
          const detailY = y + ((grassSeed * 7) % 20) + 10;
          ctx.beginPath();
          ctx.arc(detailX, detailY, grassSeed > 800 ? 2 : 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
      
    case 'WATER':
      // Use downloaded water tileset if available
      if (loadedImages.terrain_water) {
        // Extract a single tile from the water tileset (assuming 16x16 tiles)
        const tileSize = 16;
        const tilesPerRow = Math.floor(loadedImages.terrain_water.width / tileSize);
        const waterVariant = (tileX + tileY) % (tilesPerRow * Math.floor(loadedImages.terrain_water.height / tileSize));
        const srcX = (waterVariant % tilesPerRow) * tileSize;
        const srcY = Math.floor(waterVariant / tilesPerRow) * tileSize;
        
        ctx.drawImage(
          loadedImages.terrain_water,
          srcX, srcY, tileSize, tileSize,
          x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE
        );
      } else {
        // Enhanced water rendering
        const waterGradient = ctx.createLinearGradient(x, y, x, y + GAME_CONFIG.TILE_SIZE);
        waterGradient.addColorStop(0, '#87CEEB');
        waterGradient.addColorStop(0.5, '#4682B4');
        waterGradient.addColorStop(1, '#191970');
        ctx.fillStyle = waterGradient;
        ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
        
        // Animated waves
        const waveOffset = Math.sin(time + (tileX + tileY) * 0.2) * 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + 10 + waveOffset);
        ctx.lineTo(x + GAME_CONFIG.TILE_SIZE, y + 10 + waveOffset);
        ctx.stroke();
      }
      break;
      
    case 'FOREST':
      // Grass background
      if (loadedImages.terrain_grass) {
        const tileSize = 16;
        const tilesPerRow = Math.floor(loadedImages.terrain_grass.width / tileSize);
        const grassVariant = (tileX + tileY) % (tilesPerRow * Math.floor(loadedImages.terrain_grass.height / tileSize));
        const srcX = (grassVariant % tilesPerRow) * tileSize;
        const srcY = Math.floor(grassVariant / tilesPerRow) * tileSize;
        
        ctx.drawImage(
          loadedImages.terrain_grass,
          srcX, srcY, tileSize, tileSize,
          x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE
        );
      } else {
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
      }
      
      // Add trees using downloaded assets
      const treeSeed = (tileX * 73 + tileY * 37) % 1000;
      if (treeSeed > 500) {
        if (loadedImages.decoration_tree) {
          // Extract a tree from the spritesheet (assuming 32x32 trees)
          const treeSize = 32;
          const treesPerRow = Math.floor(loadedImages.decoration_tree.width / treeSize);
          const treeVariant = (tileX + tileY) % treesPerRow;
          const srcX = treeVariant * treeSize;
          
          const renderSize = 32 + (treeSeed % 16);
          const offsetX = (GAME_CONFIG.TILE_SIZE - renderSize) / 2 + ((treeSeed * 7) % 8 - 4);
          const offsetY = (GAME_CONFIG.TILE_SIZE - renderSize) / 2 + ((treeSeed * 11) % 8 - 4);
          
          ctx.drawImage(
            loadedImages.decoration_tree,
            srcX, 0, treeSize, treeSize,
            x + offsetX, y + offsetY - 16, renderSize, renderSize + 16
          );
        } else {
          // Enhanced tree rendering fallback
          // Tree trunk
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(x + 12, y + 20, 8, 12);
          
          // Tree foliage with multiple shades
          const foliageColors = ['#228B22', '#32CD32', '#90EE90'];
          foliageColors.forEach((color, index) => {
            ctx.fillStyle = color;
            const radius = 12 - index * 2;
            ctx.beginPath();
            ctx.arc(x + GAME_CONFIG.TILE_SIZE/2, y + 16 - index * 2, radius, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }
      break;
      
    default:
      // Default terrain rendering with enhanced colors
      const terrainColor = TERRAIN_TYPES[tile.type]?.color || '#8B4513';
      ctx.fillStyle = terrainColor;
      ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
      
      // Add subtle border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
      break;
  }
};

// Render game objects with Sprout Lands style
const renderSproutLandsObjects = (ctx, gameState, visibleArea, loadedImages) => {
  // Render buildings first
  if (gameState.buildings) {
    gameState.buildings.forEach(building => {
      const buildingX = building.x * GAME_CONFIG.TILE_SIZE;
      const buildingY = building.y * GAME_CONFIG.TILE_SIZE;
      
      // Check if in visible area
      if (buildingX < (visibleArea.startTileX - 1) * GAME_CONFIG.TILE_SIZE || 
          buildingX > (visibleArea.endTileX + 1) * GAME_CONFIG.TILE_SIZE ||
          buildingY < (visibleArea.startTileY - 1) * GAME_CONFIG.TILE_SIZE || 
          buildingY > (visibleArea.endTileY + 1) * GAME_CONFIG.TILE_SIZE) {
        return;
      }
      
      renderBuilding(building, buildingX, buildingY);
    });
  }
  
  // Helper function to render buildings
  const renderBuilding = (building, x, y) => {
    if (!building) return;
    
    switch (building.type) {
      case 'HOUSE':
        if (loadedImages.building_wooden_house) {
          // Extract house from tileset (assuming 32x32 tiles)
          const houseSize = 32;
          ctx.drawImage(
            loadedImages.building_wooden_house,
            0, 0, houseSize, houseSize,
            x, y - 16, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE + 16
          );
        } else {
          // Fallback house rendering
          // House base
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(x + 4, y + 12, 24, 20);
          
          // Roof
          ctx.fillStyle = '#DC143C';
          ctx.beginPath();
          ctx.moveTo(x + GAME_CONFIG.TILE_SIZE/2, y + 4);
          ctx.lineTo(x + 2, y + 16);
          ctx.lineTo(x + GAME_CONFIG.TILE_SIZE - 2, y + 16);
          ctx.closePath();
          ctx.fill();
          
          // Door
          ctx.fillStyle = '#654321';
          ctx.fillRect(x + 12, y + 20, 8, 12);
          
          // Window
          ctx.fillStyle = '#87CEEB';
          ctx.fillRect(x + 20, y + 16, 6, 6);
        }
        break;
      case 'GOLD_MINE':
        if (loadedImages.building_gold_mine) {
          ctx.drawImage(loadedImages.building_gold_mine, x, y - 16, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE + 16);
        } else {
          // Fallback mine rendering
          ctx.fillStyle = '#8B7355';
          ctx.fillRect(x + 2, y + 8, GAME_CONFIG.TILE_SIZE - 4, GAME_CONFIG.TILE_SIZE - 8);
          
          // Mine entrance
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(x + GAME_CONFIG.TILE_SIZE/2, y + 20, 8, 0, Math.PI);
          ctx.fill();
        }
        break;
      default:
        // Generic building rendering
        ctx.fillStyle = '#696969';
        ctx.fillRect(x + 2, y + 2, GAME_CONFIG.TILE_SIZE - 4, GAME_CONFIG.TILE_SIZE - 4);
    }
  };
  
  // Render treasure boxes as gems
  gameState.treasureBoxes.forEach(box => {
    const boxX = box.x * GAME_CONFIG.TILE_SIZE;
    const boxY = box.y * GAME_CONFIG.TILE_SIZE;
    
    // Check if in visible area
    if (boxX < (visibleArea.startTileX - 1) * GAME_CONFIG.TILE_SIZE || 
        boxX > (visibleArea.endTileX + 1) * GAME_CONFIG.TILE_SIZE ||
        boxY < (visibleArea.startTileY - 1) * GAME_CONFIG.TILE_SIZE || 
        boxY > (visibleArea.endTileY + 1) * GAME_CONFIG.TILE_SIZE) {
      return;
    }
    
    // Render items with enhanced assets
    const renderItem = (item, x, y) => {
      if (!item) return;
      
      switch (item.type) {
        case 'COIN':
          if (loadedImages.item_coin) {
            // Extract a single coin frame from spritesheet (assuming 16x16 frames)
            const frameSize = 16;
            const animFrame = Math.floor(Date.now() / 200) % 4; // Simple animation
            
            ctx.drawImage(
              loadedImages.item_coin,
              animFrame * frameSize, 0, frameSize, frameSize,
              x + 8, y + 8, 16, 16
            );
          } else {
            // Fallback coin rendering
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x + GAME_CONFIG.TILE_SIZE/2, y + GAME_CONFIG.TILE_SIZE/2, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          break;
        case 'GEM':
          if (loadedImages.item_big_diamond) {
            ctx.drawImage(loadedImages.item_big_diamond, x + 4, y + 4, 24, 24);
          } else {
            // Fallback gem rendering
            ctx.fillStyle = '#9C27B0';
            ctx.beginPath();
            ctx.moveTo(x + GAME_CONFIG.TILE_SIZE/2, y + 8);
            ctx.lineTo(x + GAME_CONFIG.TILE_SIZE - 8, y + GAME_CONFIG.TILE_SIZE/2);
            ctx.lineTo(x + GAME_CONFIG.TILE_SIZE/2, y + GAME_CONFIG.TILE_SIZE - 8);
            ctx.lineTo(x + 8, y + GAME_CONFIG.TILE_SIZE/2);
            ctx.closePath();
            ctx.fill();
          }
          break;
        case 'HEART':
          if (loadedImages.item_heart) {
            ctx.drawImage(loadedImages.item_heart, x + 6, y + 6, 20, 20);
          } else {
            // Fallback heart rendering
            ctx.fillStyle = '#E91E63';
            ctx.beginPath();
            ctx.arc(x + 12, y + 12, 4, 0, Math.PI * 2);
            ctx.arc(x + 20, y + 12, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x + 8, y + 14);
            ctx.lineTo(x + 16, y + 22);
            ctx.lineTo(x + 24, y + 14);
            ctx.fill();
          }
          break;
        default:
          // Generic item rendering
          ctx.fillStyle = '#4CAF50';
          ctx.fillRect(x + 10, y + 10, 12, 12);
      }
    };
    
    if (loadedImages.item_big_diamond) {
      ctx.drawImage(loadedImages.item_big_diamond, boxX + 8, boxY + 8, 24, 24);
    } else {
      // Fallback gem rendering
      ctx.fillStyle = '#9C27B0';
      ctx.beginPath();
      ctx.moveTo(boxX + 20, boxY + 8);
      ctx.lineTo(boxX + 12, boxY + 16);
      ctx.lineTo(boxX + 20, boxY + 32);
      ctx.lineTo(boxX + 28, boxY + 16);
      ctx.closePath();
      ctx.fill();
    }
  });
  
  // Render monsters with enhanced style
  gameState.monsters.forEach(monster => {
    const monsterX = monster.x * GAME_CONFIG.TILE_SIZE;
    const monsterY = monster.y * GAME_CONFIG.TILE_SIZE;
    
    // Check if in visible area
    if (monsterX < (visibleArea.startTileX - 1) * GAME_CONFIG.TILE_SIZE || 
        monsterX > (visibleArea.endTileX + 1) * GAME_CONFIG.TILE_SIZE ||
        monsterY < (visibleArea.startTileY - 1) * GAME_CONFIG.TILE_SIZE || 
        monsterY > (visibleArea.endTileY + 1) * GAME_CONFIG.TILE_SIZE) {
      return;
    }
    
    // Enhanced monster rendering
    const gradient = ctx.createRadialGradient(
      monsterX + 20, monsterY + 20, 0,
      monsterX + 20, monsterY + 20, 15
    );
    gradient.addColorStop(0, '#FF6B6B');
    gradient.addColorStop(1, '#D32F2F');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(monsterX + 20, monsterY + 20, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Monster eyes
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(monsterX + 15, monsterY + 15, 3, 0, Math.PI * 2);
    ctx.arc(monsterX + 25, monsterY + 15, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(monsterX + 15, monsterY + 15, 1, 0, Math.PI * 2);
    ctx.arc(monsterX + 25, monsterY + 15, 1, 0, Math.PI * 2);
    ctx.fill();
  });
};

// Render player with Sprout Lands character
const renderSproutLandsPlayer = (ctx, gameState, loadedImages) => {
  const playerX = gameState.player.x * GAME_CONFIG.TILE_SIZE;
  const playerY = gameState.player.y * GAME_CONFIG.TILE_SIZE;
  
  if (loadedImages.character_king) {
    // Extract idle frame from character spritesheet (assuming 78x58 frames)
    const frameWidth = 78;
    const frameHeight = 58;
    const idleFrame = 0; // Use first frame for idle
    
    ctx.drawImage(
      loadedImages.character_king,
      idleFrame * frameWidth, 0, frameWidth, frameHeight,
      playerX - 10, playerY - 10, GAME_CONFIG.TILE_SIZE + 20, GAME_CONFIG.TILE_SIZE + 20
    );
  } else {
    // Enhanced fallback player rendering
    const gradient = ctx.createRadialGradient(
      playerX + 20, playerY + 20, 0,
      playerX + 20, playerY + 20, 15
    );
    gradient.addColorStop(0, '#4CAF50');
    gradient.addColorStop(1, '#2E7D32');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(playerX + 20, playerY + 20, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Player face
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(playerX + 16, playerY + 16, 2, 0, Math.PI * 2);
    ctx.arc(playerX + 24, playerY + 16, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(playerX + 16, playerY + 16, 1, 0, Math.PI * 2);
    ctx.arc(playerX + 24, playerY + 16, 1, 0, Math.PI * 2);
    ctx.fill();
    
    // Smile
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(playerX + 20, playerY + 22, 6, 0, Math.PI);
    ctx.stroke();
  }
};

// Render UI with Sprout Lands style
const renderSproutLandsUI = (ctx, gameState, loadedImages) => {
  // Enhanced health bar
  const healthBarX = 20;
  const healthBarY = 20;
  const healthBarWidth = 200;
  const healthBarHeight = 20;
  
  // Health bar background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(healthBarX - 2, healthBarY - 2, healthBarWidth + 4, healthBarHeight + 4);
  
  // Health bar border
  ctx.strokeStyle = '#8D6E63';
  ctx.lineWidth = 2;
  ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
  
  // Health bar fill
  const healthRatio = gameState.player.health / 100;
  const healthGradient = ctx.createLinearGradient(healthBarX, healthBarY, healthBarX + healthBarWidth, healthBarY);
  healthGradient.addColorStop(0, '#4CAF50');
  healthGradient.addColorStop(0.5, '#8BC34A');
  healthGradient.addColorStop(1, '#CDDC39');
  ctx.fillStyle = healthGradient;
  ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthRatio, healthBarHeight);
  
  // Health text
  ctx.fillStyle = '#FFF';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Health: ${gameState.player.health}`, healthBarX + healthBarWidth/2, healthBarY + 14);
  
  // Score with coin icon
  const scoreX = GAME_CONFIG.CANVAS_WIDTH - 150;
  const scoreY = 20;
  
  if (loadedImages.item_coin) {
    ctx.drawImage(loadedImages.item_coin, scoreX, scoreY, 20, 20);
  }
  
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${gameState.score}`, scoreX + 25, scoreY + 15);
  
  // Depth level
  ctx.fillStyle = '#8D6E63';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Depth: ${gameState.depthLevel}`, 20, GAME_CONFIG.CANVAS_HEIGHT - 20);
};

// World boundaries rendering
const renderWorldBoundaries = (ctx, gameState) => {
  const worldSize = GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE;
  
  ctx.strokeStyle = 'rgba(139, 69, 19, 0.8)';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 5]);
  ctx.strokeRect(0, 0, worldSize, worldSize);
  ctx.setLineDash([]);
};

export default SproutLandsRenderer;