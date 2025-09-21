import React, { useEffect, useRef } from 'react';
import { GAME_CONFIG, TERRAIN_TYPES, WORLD_COLORS } from '../config/gameConfig';
import { GRASS_BORDER_MAPPING } from '../utils/pixelTerrainAssets';
import { getGrassTileByPosition, getGrassTileImage, preloadGrassTiles } from '../utils/grassTileLoader';

// Helper function to interpolate between two colors
const interpolateColor = (color1, color2, factor) => {
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);
  
  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);
  
  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Render grass terrain
const renderGrassTerrain = (ctx, grassTerrainMap, visibleArea, tileImages) => {
  const tileSize = 64; // Grass tiles are 64x64 pixels
  
  // Calculate visible area for grass terrain
  const startX = Math.max(0, Math.floor(visibleArea.startTileX));
  const endX = Math.min(grassTerrainMap[0].length, Math.ceil(visibleArea.endTileX));
  const startY = Math.max(0, Math.floor(visibleArea.startTileY));
  const endY = Math.min(grassTerrainMap.length, Math.ceil(visibleArea.endTileY));
  
  // Render only visible tiles
  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const tileType = grassTerrainMap[y][x];
      const tileImage = getTileImageByType(tileType, tileImages);
      
      if (tileImage) {
        ctx.drawImage(
          tileImage,
          x * tileSize, 
          y * tileSize, 
          tileSize, 
          tileSize
        );
      }
    }
  }
};

// Helper function to get the correct tile image based on tile type
const getTileImageByType = (tileType, tileImages) => {
  switch (tileType) {
    case '/assets/terrain_tileset/grass1.png':
      return tileImages.grassTopLeftImage;
    case '/assets/terrain_tileset/grass2.png':
      return tileImages.grassTopImage;
    case '/assets/terrain_tileset/grass3.png':
      return tileImages.grassTopRightImage;
    case '/assets/terrain_tileset/grass4.png':
      return tileImages.grassLeftImage;
    case '/assets/terrain_tileset/grass5.png':
      return tileImages.grassCenterImage;
    case '/assets/terrain_tileset/grass6.png':
      return tileImages.grassRightImage;
    case '/assets/terrain_tileset/grass7.png':
      return tileImages.grassBottomLeftImage;
    case '/assets/terrain_tileset/grass8.png':
      return tileImages.grassBottomImage;
    case '/assets/terrain_tileset/grass9.png':
      return tileImages.grassBottomRightImage;
    default:
      return tileImages.grassCenterImage; // Default to center tile
  }
};

const CanvasRenderer = ({ 
  gameState, 
  canvasRef, 
  playerImage,
  playerSpriteImage,
  playerFrontImage,
  playerBackImage,
  playerLeftImage,
  playerRightImage,
  playerDirection,
  treeImage,
  realisticTreeImage,
  bridgeImage,
  cliffImage,
  highGrassImage,
  rockyGroundImage,
  caveEntranceImage,
  realisticWaterImage,
  realisticRockImage,
  realisticTreasureImage,
  treasureOpenedImage,
  sproutPlayerImage,
  sproutCoinImage,
  monsterGoblinImage,
  monsterDragonImage,
  // Grass terrain tiles
  grassTopLeftImage,
  grassTopImage,
  grassTopRightImage,
  grassLeftImage,
  grassCenterImage,
  grassRightImage,
  grassBottomLeftImage,
  grassBottomImage,
  grassBottomRightImage,
  terrainType,
  grassTerrainMap,
  monsterOrcImage,
  waterGrassShorelineVerticalImage,
    waterGrassShorelineImage,
    realisticGrassImage,
    grassWaterShorelineCornerImage,
  isAttacking,
  attackTarget,
  onTreasureInteraction,
  skipPlayerRendering = false
}) => {
  const frameCountRef = useRef(0);
  const grassTilesInitialized = useRef(false);

  // Initialize grass tiles on first render
  useEffect(() => {
    if (!grassTilesInitialized.current) {
      preloadGrassTiles();
      grassTilesInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    frameCountRef.current++;



    // Clear canvas with appropriate background
    const bgColor = gameState.depthLevel === 0 ? WORLD_COLORS.surface : WORLD_COLORS.cave;
    ctx.fillStyle = bgColor;
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

    // Render terrain based on selected terrain type
    if (terrainType === 'grass' && grassTerrainMap) {
      renderGrassTerrain(ctx, grassTerrainMap, visibleArea, {
        grassTopLeftImage,
        grassTopImage,
        grassTopRightImage,
        grassLeftImage,
        grassCenterImage,
        grassRightImage,
        grassBottomLeftImage,
        grassBottomImage,
        grassBottomRightImage
      });
    } else {
      // Render default terrain with viewport culling
      renderTerrain(ctx, gameState, visibleArea, {
        treeImage,
        realisticTreeImage,
        bridgeImage,
        cliffImage,
        highGrassImage,
        rockyGroundImage,
        caveEntranceImage,
        realisticWaterImage,
        realisticRockImage,
        realisticTreasureImage,
        sproutPlayerImage,
        sproutCoinImage,
        waterGrassShorelineVerticalImage,
        waterGrassShorelineImage,
        realisticGrassImage,
        grassWaterShorelineCornerImage
      }, frameCountRef.current);
    }
    
    // Emergency fallback: Draw a simple grid if no terrain is rendered
    if (gameState.terrain.size === 0) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      for (let x = 0; x < GAME_CONFIG.CANVAS_WIDTH; x += GAME_CONFIG.TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, GAME_CONFIG.CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < GAME_CONFIG.CANVAS_HEIGHT; y += GAME_CONFIG.TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(GAME_CONFIG.CANVAS_WIDTH, y);
        ctx.stroke();
      }
      
      // Draw "NO TERRAIN" message
      ctx.fillStyle = '#ff0000';
      ctx.font = '20px Arial';
      ctx.fillText('NO TERRAIN GENERATED', 50, 50);
    }

    // Render world boundaries
    renderWorldBoundaries(ctx, gameState);

    // Render game objects
    renderTreasureBoxes(ctx, gameState, visibleArea, realisticTreasureImage, treasureOpenedImage);
    renderMonsters(ctx, gameState, visibleArea, {
      goblin: monsterGoblinImage,
      dragon: monsterDragonImage,
      orc: monsterOrcImage
    }, isAttacking, attackTarget);
    
    // Only render player if not using external character component
    if (!skipPlayerRendering) {
      renderPlayer(ctx, gameState, playerImage, playerSpriteImage, playerFrontImage, playerBackImage, playerLeftImage, playerRightImage, playerDirection);
    }

    // Restore context
    ctx.restore();

    // Render UI elements (not affected by camera)
    renderUI(ctx, gameState);

  }, [gameState, playerImage, playerSpriteImage, playerFrontImage, playerBackImage, playerLeftImage, playerRightImage, playerDirection, treeImage, realisticTreeImage, bridgeImage, cliffImage, highGrassImage, rockyGroundImage, caveEntranceImage, realisticWaterImage, realisticRockImage, realisticTreasureImage, treasureOpenedImage, sproutPlayerImage, sproutCoinImage, monsterGoblinImage, monsterDragonImage, monsterOrcImage, waterGrassShorelineVerticalImage, waterGrassShorelineImage, realisticGrassImage, grassWaterShorelineCornerImage, isAttacking, attackTarget]);

  return null; // This component only handles rendering
};

// Helper function to get neighboring tile type
const getNeighborTileType = (tileX, tileY, gameState) => {
  const chunkX = Math.floor(tileX / GAME_CONFIG.CHUNK_SIZE);
  const chunkY = Math.floor(tileY / GAME_CONFIG.CHUNK_SIZE);
  const chunkKey = `${chunkX},${chunkY}`;
  const chunk = gameState?.terrain?.get(chunkKey);
  if (!chunk) return null;
  
  const localX = tileX % GAME_CONFIG.CHUNK_SIZE;
  const localY = tileY % GAME_CONFIG.CHUNK_SIZE;
  const tile = chunk.find(t => 
    t.x % GAME_CONFIG.CHUNK_SIZE === localX && 
    t.y % GAME_CONFIG.CHUNK_SIZE === localY
  );
  return tile ? tile.type : null;
};

// Calculate tile index for seamless tiling based on neighbors
const calculateSeamlessTileIndex = (tileX, tileY, gameState, targetType) => {
  // Get all 8 neighboring tiles
  const neighbors = {
    topLeft: getNeighborTileType(tileX - 1, tileY - 1, gameState),
    top: getNeighborTileType(tileX, tileY - 1, gameState),
    topRight: getNeighborTileType(tileX + 1, tileY - 1, gameState),
    left: getNeighborTileType(tileX - 1, tileY, gameState),
    right: getNeighborTileType(tileX + 1, tileY, gameState),
    bottomLeft: getNeighborTileType(tileX - 1, tileY + 1, gameState),
    bottom: getNeighborTileType(tileX, tileY + 1, gameState),
    bottomRight: getNeighborTileType(tileX + 1, tileY + 1, gameState)
  };
  
  // Calculate bitmask for tile selection (Wang tiles / blob tiles)
  let bitmask = 0;
  if (neighbors.top === targetType) bitmask |= 1;
  if (neighbors.right === targetType) bitmask |= 2;
  if (neighbors.bottom === targetType) bitmask |= 4;
  if (neighbors.left === targetType) bitmask |= 8;
  
  // Map bitmask to tile coordinates in tileset
  const tileMap = {
    0: { x: 0, y: 0 },   // Isolated tile
    1: { x: 1, y: 0 },   // Connected top
    2: { x: 2, y: 0 },   // Connected right
    3: { x: 3, y: 0 },   // Connected top-right
    4: { x: 0, y: 1 },   // Connected bottom
    5: { x: 1, y: 1 },   // Connected top-bottom
    6: { x: 2, y: 1 },   // Connected right-bottom
    7: { x: 3, y: 1 },   // Connected top-right-bottom
    8: { x: 0, y: 2 },   // Connected left
    9: { x: 1, y: 2 },   // Connected top-left
    10: { x: 2, y: 2 },  // Connected right-left
    11: { x: 3, y: 2 },  // Connected top-right-left
    12: { x: 0, y: 3 },  // Connected bottom-left
    13: { x: 1, y: 3 },  // Connected top-bottom-left
    14: { x: 2, y: 3 },  // Connected right-bottom-left
    15: { x: 3, y: 3 }   // Connected all sides
  };
  
  return tileMap[bitmask] || { x: 0, y: 0 };
};

// Render seamless grass tiles with border pattern system
const renderSeamlessGrassTile = (ctx, tile, tileX, tileY, gameState, assets, terrainBounds) => {
  const x = tileX * GAME_CONFIG.TILE_SIZE;
  const y = tileY * GAME_CONFIG.TILE_SIZE;
  
  // Determine the terrain bounds (min/max x/y for the current terrain area)
  // If not provided, use a default area size for border detection
  const bounds = terrainBounds || {
    minX: Math.floor(gameState.camera.x / GAME_CONFIG.TILE_SIZE) - 10,
    maxX: Math.floor(gameState.camera.x / GAME_CONFIG.TILE_SIZE) + 20,
    minY: Math.floor(gameState.camera.y / GAME_CONFIG.TILE_SIZE) - 10,
    maxY: Math.floor(gameState.camera.y / GAME_CONFIG.TILE_SIZE) + 20
  };
  
  const gridWidth = bounds.maxX - bounds.minX + 1;
  const gridHeight = bounds.maxY - bounds.minY + 1;
  const relativeX = tileX - bounds.minX;
  const relativeY = tileY - bounds.minY;
  
  // Get the appropriate grass tile based on position
  const grassAssetPath = getGrassTileByPosition(relativeX, relativeY, gridWidth, gridHeight);
  
  // Try to load and draw the specific grass tile
  const grassTileImage = getGrassTileImage(grassAssetPath);
  
  if (grassTileImage && grassTileImage.complete && grassTileImage.naturalWidth !== 0) {
    // Draw the specific grass tile for this position
    ctx.drawImage(
      grassTileImage,
      x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE
    );
    return true; // Successfully rendered
  } else {
    // Fallback to solid color with grid for visibility
    ctx.fillStyle = '#4CAF50'; // Default grass green
    ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
    
    // Add grid lines for clarity
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
    
    return false; // Used fallback rendering
  }
    const isTopRow = relativeY === 0;
    const isBottomRow = relativeY === gridHeight - 1;
    const isLeftCol = relativeX === 0;
    const isRightCol = relativeX === gridWidth - 1;
    
    let fillColor = '#4CAF50'; // Default center (grass5)
    
    // Apply different colors based on border position for visual testing
    if (isTopRow && isLeftCol) fillColor = '#FF5722'; // Top-left (grass1) - red
    else if (isTopRow && isRightCol) fillColor = '#2196F3'; // Top-right (grass3) - blue
    else if (isBottomRow && isLeftCol) fillColor = '#FF9800'; // Bottom-left (grass7) - orange
    else if (isBottomRow && isRightCol) fillColor = '#9C27B0'; // Bottom-right (grass9) - purple
    else if (isTopRow) fillColor = '#E91E63'; // Top edge (grass2) - pink
    else if (isBottomRow) fillColor = '#009688'; // Bottom edge (grass8) - teal
    else if (isLeftCol) fillColor = '#795548'; // Left edge (grass4) - brown
    else if (isRightCol) fillColor = '#607D8B'; // Right edge (grass6) - blue-gray
    
    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
    
    // Add border for clarity
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
  }
  
  // Add occasional interactive elements (sheep, resources, etc.)
  const grassSeed = (tileX * 67 + tileY * 43) % 1000;
  if (grassSeed > 950) {
    // Rare sprout player on grass
    if (assets.sproutPlayerImage.current && assets.sproutPlayerImage.current.complete && assets.sproutPlayerImage.current.naturalWidth !== 0) {
      const sproutSize = GAME_CONFIG.TILE_SIZE * 0.8;
      const offsetX = (GAME_CONFIG.TILE_SIZE - sproutSize) / 2;
      const offsetY = (GAME_CONFIG.TILE_SIZE - sproutSize) / 2;
      ctx.drawImage(
        assets.sproutPlayerImage.current,
        x + offsetX, y + offsetY, sproutSize, sproutSize
      );
    }
  } else if (grassSeed > 900) {
    // Sprout coins on grass
    if (assets.sproutCoinImage.current && assets.sproutCoinImage.current.complete && assets.sproutCoinImage.current.naturalWidth !== 0) {
      const coinSize = GAME_CONFIG.TILE_SIZE * 0.6;
      const offsetX = (GAME_CONFIG.TILE_SIZE - coinSize) / 2;
      const offsetY = (GAME_CONFIG.TILE_SIZE - coinSize) / 2;
      ctx.drawImage(
        assets.sproutCoinImage.current,
        x + offsetX, y + offsetY, coinSize, coinSize
      );
    }
  } else if (grassSeed > 700) {
    // Small flowers or grass tufts
    ctx.fillStyle = grassSeed > 850 ? 'rgba(255, 255, 0, 0.6)' : 'rgba(34, 139, 34, 0.4)';
    const detailX = x + (grassSeed % 30) + 5;
    const detailY = y + ((grassSeed * 7) % 30) + 5;
    ctx.beginPath();
    ctx.arc(detailX, detailY, grassSeed > 850 ? 2 : 3, 0, Math.PI * 2);
    ctx.fill();
  }
};

// Render seamless walkable terrain (cave floor, rocky ground, etc.)
const renderSeamlessWalkableTile = (ctx, tile, tileX, tileY, gameState, assets) => {
  const x = tileX * GAME_CONFIG.TILE_SIZE;
  const y = tileY * GAME_CONFIG.TILE_SIZE;
  
  // Base terrain color
  ctx.fillStyle = TERRAIN_TYPES[tile.type].color;
  ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
  
  // Add seamless texture pattern based on tile type
  const tileCoords = calculateSeamlessTileIndex(tileX, tileY, gameState, tile.type);
  const pattern = (tileX * 3 + tileY * 5 + tileCoords.x + tileCoords.y) % 8;
  
  // Add subtle texture variations
  if (tile.type === 'CAVE_FLOOR') {
    ctx.fillStyle = pattern < 3 ? 'rgba(139, 69, 19, 0.1)' : 'rgba(160, 82, 45, 0.05)';
    ctx.fillRect(x + pattern * 2, y + pattern * 3, GAME_CONFIG.TILE_SIZE - pattern * 4, GAME_CONFIG.TILE_SIZE - pattern * 6);
  } else if (tile.type === 'ROCKY_GROUND') {
    ctx.fillStyle = pattern < 4 ? 'rgba(105, 105, 105, 0.15)' : 'rgba(128, 128, 128, 0.1)';
    const rockSize = 3 + pattern;
    ctx.fillRect(x + pattern * 4, y + pattern * 2, rockSize, rockSize);
  } else if (tile.type === 'DESERT') {
    ctx.fillStyle = pattern < 5 ? 'rgba(238, 203, 173, 0.2)' : 'rgba(255, 218, 185, 0.1)';
    ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
  } else if (tile.type === 'HIGH_GRASS') {
    // Add grass texture with higher density
    ctx.fillStyle = pattern < 4 ? 'rgba(34, 139, 34, 0.2)' : 'rgba(0, 100, 0, 0.15)';
    ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
    // Add grass blades
    ctx.strokeStyle = 'rgba(34, 139, 34, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const grassX = x + (pattern * 5 + i * 8) % GAME_CONFIG.TILE_SIZE;
      const grassY = y + (pattern * 3 + i * 6) % GAME_CONFIG.TILE_SIZE;
      ctx.beginPath();
      ctx.moveTo(grassX, grassY + 8);
      ctx.lineTo(grassX + 1, grassY);
      ctx.stroke();
    }
  } else if (tile.type === 'BRIDGE') {
    // Add wood plank texture
    ctx.fillStyle = pattern < 3 ? 'rgba(139, 69, 19, 0.2)' : 'rgba(160, 82, 45, 0.15)';
    ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
    // Add wood grain lines
    ctx.strokeStyle = 'rgba(101, 67, 33, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const lineY = y + i * (GAME_CONFIG.TILE_SIZE / 4) + 2;
      ctx.beginPath();
      ctx.moveTo(x, lineY);
      ctx.lineTo(x + GAME_CONFIG.TILE_SIZE, lineY);
      ctx.stroke();
    }
  }
  
  // Add connecting lines for seamless appearance
  if (tileCoords.x > 0 || tileCoords.y > 0) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    if (tileCoords.x > 0) {
      ctx.moveTo(x, y + GAME_CONFIG.TILE_SIZE / 2);
      ctx.lineTo(x + GAME_CONFIG.TILE_SIZE, y + GAME_CONFIG.TILE_SIZE / 2);
    }
    if (tileCoords.y > 0) {
      ctx.moveTo(x + GAME_CONFIG.TILE_SIZE / 2, y);
      ctx.lineTo(x + GAME_CONFIG.TILE_SIZE / 2, y + GAME_CONFIG.TILE_SIZE);
    }
    ctx.stroke();
  }
};

// Optimized terrain rendering with viewport culling
const renderTerrain = (ctx, gameState, visibleArea, assets, frameCount) => {
  const { startTileX, endTileX, startTileY, endTileY } = visibleArea;
  let tilesRendered = 0;

  // Calculate terrain bounds for border pattern detection
  const terrainBounds = {
    minX: startTileX,
    maxX: endTileX,
    minY: startTileY,
    maxY: endTileY
  };

  for (let tileX = startTileX; tileX <= endTileX; tileX++) {
    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
      const chunkX = Math.floor(tileX / GAME_CONFIG.CHUNK_SIZE);
      const chunkY = Math.floor(tileY / GAME_CONFIG.CHUNK_SIZE);
      const chunkKey = `${chunkX},${chunkY}`;
      
      const chunk = gameState.terrain.get(chunkKey);
      if (!chunk) continue;
      
      const localX = tileX % GAME_CONFIG.CHUNK_SIZE;
      const localY = tileY % GAME_CONFIG.CHUNK_SIZE;
      const tile = chunk.find(t => 
        t.x % GAME_CONFIG.CHUNK_SIZE === localX && 
        t.y % GAME_CONFIG.CHUNK_SIZE === localY
      );
      
      if (!tile) continue;
      
      tilesRendered++;
      const x = tileX * GAME_CONFIG.TILE_SIZE;
      const y = tileY * GAME_CONFIG.TILE_SIZE;
      
      // Simplified base terrain rendering
      if (tile.type === 'FOREST') {
        // Render seamless grass background for forest tiles
        renderSeamlessGrassTile(ctx, { type: 'GRASS' }, tileX, tileY, gameState, assets, terrainBounds);
        // Always render trees on forest tiles
        renderTerrainPattern(ctx, tile, tileX, tileY, gameState, assets);
      } else if (tile.type === 'WATER') {
        // Always render water with full effects for realism
        renderTerrainPattern(ctx, tile, tileX, tileY, gameState, assets);
      } else if (tile.type === 'GRASS') {
        // Render seamless grass tiles with proper border pattern
        renderSeamlessGrassTile(ctx, tile, tileX, tileY, gameState, assets, terrainBounds);
      } else {
        // Check if this is a walkable terrain type that should use seamless rendering
        const walkableTerrainTypes = ['CAVE_FLOOR', 'ROCKY_GROUND', 'DESERT', 'HIGH_GRASS', 'BRIDGE'];
        const isWalkableTerrain = walkableTerrainTypes.includes(tile.type);
        
        if (isWalkableTerrain) {
          // Use seamless rendering for walkable terrain
          renderSeamlessWalkableTile(ctx, tile, tileX, tileY, gameState, assets);
        } else {
          // Simple base tile rendering for non-walkable terrain
          ctx.fillStyle = TERRAIN_TYPES[tile.type].color;
          ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
        }
        
        // Always render patterns for special terrain types (excluding BRIDGE as it's handled in seamless rendering)
        const alwaysRenderPattern = ['LAVA', 'CRYSTAL', 'MOUNTAIN', 'STAIRS_DOWN', 'STAIRS_UP'].includes(tile.type);
        const shouldRenderPattern = alwaysRenderPattern || (tileX + tileY) % GAME_CONFIG.PATTERN_RENDER_FREQUENCY === 0;
        
        if (shouldRenderPattern) {
          renderTerrainPattern(ctx, tile, tileX, tileY, gameState, assets);
        }
      }
    }
  }
  
  // Debug: Log tiles rendered
  // Performance: Removed console.log to prevent lag
};

// Render terrain-specific patterns with optimized performance
const renderTerrainPattern = (ctx, tile, tileX, tileY, gameState, assets) => {
  const { treeImage, realisticTreeImage, bridgeImage, cliffImage, highGrassImage, rockyGroundImage, caveEntranceImage, realisticWaterImage, realisticRockImage, realisticTreasureImage, sproutPlayerImage, sproutCoinImage, waterGrassShorelineVerticalImage, waterGrassShorelineImage, realisticGrassImage, grassWaterShorelineCornerImage } = assets;
  const x = tileX * GAME_CONFIG.TILE_SIZE;
  const y = tileY * GAME_CONFIG.TILE_SIZE;
  
  // Reduce animation frequency for better performance
  const time = Math.floor(Date.now() * 0.0005) * 0.002;
  
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  
  switch (tile.type) {
    case 'WATER':
      // Helper function to get neighbor tile type
      const getNeighborTile = (dx, dy) => {
        const neighborX = tileX + dx;
        const neighborY = tileY + dy;
        const neighborChunkX = Math.floor(neighborX / GAME_CONFIG.CHUNK_SIZE);
        const neighborChunkY = Math.floor(neighborY / GAME_CONFIG.CHUNK_SIZE);
        const neighborChunkKey = `${neighborChunkX},${neighborChunkY}`;
        const neighborChunk = gameState?.terrain?.get(neighborChunkKey);
        if (!neighborChunk) return null;
        const neighborLocalX = neighborX % GAME_CONFIG.CHUNK_SIZE;
        const neighborLocalY = neighborY % GAME_CONFIG.CHUNK_SIZE;
        return neighborChunk.find(t => 
          t.x % GAME_CONFIG.CHUNK_SIZE === neighborLocalX && 
          t.y % GAME_CONFIG.CHUNK_SIZE === neighborLocalY
        );
      };
      
      // Check for grass neighbors to determine shoreline type
      const topTile = getNeighborTile(0, -1);
      const bottomTile = getNeighborTile(0, 1);
      const leftTile = getNeighborTile(-1, 0);
      const rightTile = getNeighborTile(1, 0);
      
      const hasGrassTop = topTile && topTile.type === 'GRASS';
      const hasGrassBottom = bottomTile && bottomTile.type === 'GRASS';
      const hasGrassLeft = leftTile && leftTile.type === 'GRASS';
      const hasGrassRight = rightTile && rightTile.type === 'GRASS';
      
      // Determine which shoreline asset to use
      let shorelineImage = null;
      let rotation = 0;
      
      // Check for corner cases (2 adjacent sides with grass)
      const hasCornerTopLeft = hasGrassTop && hasGrassLeft;
      const hasCornerTopRight = hasGrassTop && hasGrassRight;
      const hasCornerBottomLeft = hasGrassBottom && hasGrassLeft;
      const hasCornerBottomRight = hasGrassBottom && hasGrassRight;
      
      if ((hasCornerTopLeft || hasCornerTopRight || hasCornerBottomLeft || hasCornerBottomRight) && grassWaterShorelineCornerImage.current && grassWaterShorelineCornerImage.current.complete) {
        // Corner shoreline (water at corner of grass)
        shorelineImage = grassWaterShorelineCornerImage.current;
        if (hasCornerTopRight) rotation = 90;
        else if (hasCornerBottomRight) rotation = 180;
        else if (hasCornerBottomLeft) rotation = 270;
        // hasCornerTopLeft uses rotation = 0 (default)
      } else if ((hasGrassLeft || hasGrassRight) && waterGrassShorelineVerticalImage.current && waterGrassShorelineVerticalImage.current.complete) {
        // Vertical shoreline (water beside grass horizontally)
        shorelineImage = waterGrassShorelineVerticalImage.current;
        if (hasGrassRight) rotation = 180; // Flip for right-side grass
      } else if ((hasGrassTop || hasGrassBottom) && waterGrassShorelineImage.current && waterGrassShorelineImage.current.complete) {
        // Horizontal shoreline (water above/below grass)
        shorelineImage = waterGrassShorelineImage.current;
        if (hasGrassBottom) rotation = 180; // Flip for bottom grass
      }
      
      // Render shoreline if detected, otherwise use regular water
      if (shorelineImage) {
        ctx.save();
        if (rotation !== 0) {
          ctx.translate(x + GAME_CONFIG.TILE_SIZE / 2, y + GAME_CONFIG.TILE_SIZE / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.drawImage(
            shorelineImage,
            -GAME_CONFIG.TILE_SIZE / 2, -GAME_CONFIG.TILE_SIZE / 2,
            GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE
          );
        } else {
          ctx.drawImage(
            shorelineImage,
            x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE
          );
        }
        ctx.restore();
      } else if (realisticWaterImage.current && realisticWaterImage.current.complete && realisticWaterImage.current.naturalWidth !== 0) {
        // Regular water rendering
        ctx.drawImage(
          realisticWaterImage.current,
          x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE
        );
        
        // Add subtle animated waves on top
        const waveOffset = Math.sin(time + (tileX + tileY) * 0.1) * 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const waveY = y + 15 + waveOffset;
        ctx.moveTo(x + 5, waveY);
        ctx.lineTo(x + 35, waveY);
        ctx.stroke();
      } else {
        // Fallback to complex water rendering
        const getNeighborTile = (dx, dy) => {
          const neighborX = tileX + dx;
          const neighborY = tileY + dy;
          const neighborChunkX = Math.floor(neighborX / GAME_CONFIG.CHUNK_SIZE);
          const neighborChunkY = Math.floor(neighborY / GAME_CONFIG.CHUNK_SIZE);
          const neighborChunkKey = `${neighborChunkX},${neighborChunkY}`;
          const neighborChunk = gameState?.terrain?.get(neighborChunkKey);
          if (!neighborChunk) return null;
          const neighborLocalX = neighborX % GAME_CONFIG.CHUNK_SIZE;
          const neighborLocalY = neighborY % GAME_CONFIG.CHUNK_SIZE;
          return neighborChunk.find(t => 
            t.x % GAME_CONFIG.CHUNK_SIZE === neighborLocalX && 
            t.y % GAME_CONFIG.CHUNK_SIZE === neighborLocalY
          );
        };
        
        // Check surrounding tiles for shore detection
        const neighbors = {
          top: getNeighborTile(0, -1),
          bottom: getNeighborTile(0, 1),
          left: getNeighborTile(-1, 0),
          right: getNeighborTile(1, 0),
          topLeft: getNeighborTile(-1, -1),
          topRight: getNeighborTile(1, -1),
          bottomLeft: getNeighborTile(-1, 1),
          bottomRight: getNeighborTile(1, 1)
        };
        
        // Count water neighbors to determine depth with weighted calculation
        const waterNeighbors = Object.values(neighbors).filter(n => n && n.type === 'WATER').length;
        const isShore = waterNeighbors < 8;
        
        // Simplified depth calculation for better performance
        const centerDistance = Math.abs(tileX - GAME_CONFIG.WORLD_SIZE/2) + Math.abs(tileY - GAME_CONFIG.WORLD_SIZE/2);
        
        // Simplified depth factor
        const depthFactor = waterNeighbors / 8;
        const distanceDepth = Math.min(centerDistance / 50, 1);
        
        // Simplified noise calculation
        const depthNoise = ((tileX + tileY) % 10) * 0.01;
        
        // Combine factors with simple weighting
        const totalDepth = Math.max(0, Math.min(1, depthFactor * 0.7 + distanceDepth * 0.3 + depthNoise));
        
        // Simplified water colors for better performance
        const shallowColor = '#87CEEB';
        const mediumColor = '#4682B4';
        const deepColor = '#191970';
        
        // Simple 3-zone color system
        let waterColor;
        if (totalDepth < 0.33) {
          const ratio = totalDepth / 0.33;
          waterColor = interpolateColor(shallowColor, mediumColor, ratio);
        } else if (totalDepth < 0.66) {
          const ratio = (totalDepth - 0.33) / 0.33;
          waterColor = interpolateColor(mediumColor, deepColor, ratio);
        } else {
          waterColor = deepColor;
        }
        
        // Render water base with depth color
        ctx.fillStyle = waterColor;
        ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
        
        // Add shore effects
        if (isShore) {
          // Lighter shore water
          ctx.fillStyle = 'rgba(135, 206, 235, 0.6)';
          ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
          
          // Shore foam/bubbles
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          const foamSeed = (tileX * 17 + tileY * 23) % 100;
          for (let i = 0; i < 3; i++) {
            const bubbleX = x + ((foamSeed + i * 31) % 30) + 5;
            const bubbleY = y + ((foamSeed + i * 47) % 30) + 5;
            const bubbleSize = 2 + (foamSeed + i * 13) % 4;
            ctx.beginPath();
            ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        // Simplified animated waves with reduced frequency
        const waveOffset = Math.sin(time + (tileX + tileY) * 0.1) * 1;
        
        // Single wave line for performance
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const waveY = y + 15 + waveOffset;
        ctx.moveTo(x + 5, waveY);
        ctx.lineTo(x + 35, waveY);
        ctx.stroke();
        
        // Simplified depth effects
        if (totalDepth > 0.6) {
          ctx.fillStyle = `rgba(0, 0, 50, 0.2)`;
          ctx.fillRect(x + 8, y + 8, GAME_CONFIG.TILE_SIZE - 16, GAME_CONFIG.TILE_SIZE - 16);
        }
      }
      break;
      
    case 'FOREST':
      // Try to use realistic tree asset first, fallback to original SVG
      const activeTreeImage = (realisticTreeImage.current && realisticTreeImage.current.complete && realisticTreeImage.current.naturalWidth !== 0) 
        ? realisticTreeImage 
        : treeImage;
        
      if (activeTreeImage.current && activeTreeImage.current.complete && activeTreeImage.current.naturalWidth !== 0) {
        // Create individual trees with more spacing for less density
        const seedValue = (tileX * 73 + tileY * 37) % 1000;
        const shouldHaveTree = seedValue > 600; // Only 40% of forest tiles have trees
        
        if (shouldHaveTree) {
          // Single large tree centered in the tile
          const sizeVariation = 0.7 + (seedValue / 1000) * 0.5;
          const treeSize = Math.floor(GAME_CONFIG.TILE_SIZE * 1.3 * sizeVariation);
          
          // Center the tree with slight random offset
          const offsetVariationX = ((seedValue * 7) % 100 - 50) / 8;
          const offsetVariationY = ((seedValue * 11) % 100 - 50) / 8;
          const offsetX = (GAME_CONFIG.TILE_SIZE - treeSize) / 2 + offsetVariationX;
          const offsetY = (GAME_CONFIG.TILE_SIZE - treeSize) / 2 + offsetVariationY;
          
          ctx.drawImage(
            activeTreeImage.current,
            x + offsetX,
            y + offsetY,
            treeSize,
            treeSize
          );
        }
      } else {
         // Simplified fallback tree
         const seedValue = (tileX * 73 + tileY * 37) % 1000;
         const shouldHaveTree = seedValue > 600;
         
         if (shouldHaveTree) {
           // Simple tree trunk
           ctx.fillStyle = '#8B4513';
           ctx.fillRect(x + 16, y + 28, 8, 12);
           
           // Simple tree canopy
           ctx.fillStyle = '#228B22';
           ctx.beginPath();
           ctx.arc(x + 20, y + 20, 12, 0, Math.PI * 2);
           ctx.fill();
           
           // Simple highlight
           ctx.fillStyle = 'rgba(144, 238, 144, 0.4)';
           ctx.beginPath();
           ctx.arc(x + 17, y + 17, 6, 0, Math.PI * 2);
           ctx.fill();
         }
       }
      break;
      
    case 'MOUNTAIN':
      // Use realistic rock SVG if available, otherwise fallback to simple rendering
      if (realisticRockImage.current && realisticRockImage.current.complete && realisticRockImage.current.naturalWidth !== 0) {
        ctx.drawImage(
          realisticRockImage.current,
          x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE
        );
      } else {
        // Fallback to simple mountain rendering
        ctx.fillStyle = '#696969';
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 10);
        ctx.lineTo(x + 10, y + 35);
        ctx.lineTo(x + 30, y + 35);
        ctx.closePath();
        ctx.fill();
        
        // Simple snow cap
        ctx.fillStyle = '#F0F8FF';
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 10);
        ctx.lineTo(x + 16, y + 18);
        ctx.lineTo(x + 24, y + 18);
        ctx.closePath();
        ctx.fill();
      }
      
      // Add occasional treasure on mountains
      const mountainSeed = (tileX * 89 + tileY * 67) % 1000;
      if (mountainSeed > 980) {
        // Rare treasure on mountain
        if (realisticTreasureImage.current && realisticTreasureImage.current.complete && realisticTreasureImage.current.naturalWidth !== 0) {
          const treasureSize = GAME_CONFIG.TILE_SIZE * 0.9;
          const offsetX = (GAME_CONFIG.TILE_SIZE - treasureSize) / 2;
          const offsetY = (GAME_CONFIG.TILE_SIZE - treasureSize) / 2;
          ctx.drawImage(
            realisticTreasureImage.current,
            x + offsetX, y + offsetY, treasureSize, treasureSize
          );
        }
      }
      break;
      
    case 'DESERT':
      // Simplified desert rendering
      ctx.fillStyle = '#DEB887';
      ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
      
      // Simple sand pattern
      const seedValue = (tileX * 41 + tileY * 59) % 1000;
      if (seedValue > 800) {
        ctx.fillStyle = 'rgba(210, 180, 140, 0.5)';
        ctx.fillRect(x + 10, y + 15, 20, 10);
      }
      break;
      
    case 'BRIDGE':
      if (bridgeImage.current && bridgeImage.current.complete && bridgeImage.current.naturalWidth !== 0) {
        ctx.drawImage(
          bridgeImage.current,
          x + 4,
          y + 4,
          32,
          32
        );
      } else {
        // Simplified bridge
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + 2, y + 6, 36, 6);
        ctx.fillRect(x + 2, y + 28, 36, 6);
        
        // Simple wood planks
        ctx.fillStyle = '#DEB887';
        for (let i = 0; i < 4; i++) {
          const plankY = y + 12 + i * 4;
          ctx.fillRect(x + 4, plankY, 32, 3);
        }
      }
      break;
      
    case 'STAIRS_DOWN':
      // Simplified stairs down
      for (let i = 0; i < 4; i++) {
        const stepWidth = 25 - i * 5;
        const stepX = x + 5 + i * 6;
        const stepY = y + 5 + i * 7;
        
        ctx.fillStyle = '#808080';
        ctx.fillRect(stepX, stepY, stepWidth, 4);
      }
      break;
      
    case 'STAIRS_UP':
      // Simplified stairs up
      for (let i = 0; i < 4; i++) {
        const stepWidth = 25 - i * 5;
        const stepX = x + 5 + i * 6;
        const stepY = y + 25 - i * 7;
        
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(stepX, stepY, stepWidth, 4);
      }
      break;
      
    case 'LAVA':
      // Simplified lava with basic animation
      const lavaAnimation = Math.sin(time + (tileX + tileY) * 0.1) * 0.1;
      
      // Simple lava base
      ctx.fillStyle = '#FF4500';
      ctx.fillRect(x, y, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
      
      // Simple bubbles
      ctx.fillStyle = `rgba(255, 165, 0, ${0.6 + lavaAnimation})`;
      const bubbleSeed = (tileX * 31 + tileY * 47) % 100;
      if (bubbleSeed > 70) {
        ctx.beginPath();
        ctx.arc(x + 15, y + 15, 3, 0, Math.PI * 2);
        ctx.arc(x + 25, y + 25, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
      
    case 'CRYSTAL':
      // Simplified crystal with basic glow
      const crystalGlow = Math.sin(time + (tileX + tileY) * 0.1) * 0.1;
      
      // Simple crystal body
      ctx.fillStyle = `rgba(200, 200, 255, ${0.8 + crystalGlow})`;
      ctx.beginPath();
      ctx.moveTo(x + 20, y + 8);
      ctx.lineTo(x + 28, y + 20);
      ctx.lineTo(x + 20, y + 32);
      ctx.lineTo(x + 12, y + 20);
      ctx.closePath();
      ctx.fill();
      
      // Simple highlight
      ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + crystalGlow})`;
      ctx.beginPath();
      ctx.moveTo(x + 20, y + 12);
      ctx.lineTo(x + 22, y + 16);
      ctx.lineTo(x + 20, y + 20);
      ctx.lineTo(x + 18, y + 16);
      ctx.closePath();
      ctx.fill();
      break;
      
    case 'CLIFF':
       if (cliffImage.current && cliffImage.current.complete && cliffImage.current.naturalWidth !== 0) {
         ctx.drawImage(
           cliffImage.current,
           x,
           y,
           GAME_CONFIG.TILE_SIZE,
           GAME_CONFIG.TILE_SIZE
         );
       } else {
         // Fallback: Rock ledges and cliff face details
         ctx.fillStyle = 'rgba(0,0,0,0.3)';
         ctx.fillRect(x + 2, y + 8, 36, 4);
         ctx.fillRect(x + 4, y + 16, 32, 3);
         ctx.fillRect(x + 6, y + 24, 28, 3);
         
         // Highlight edges
         ctx.fillStyle = 'rgba(255,255,255,0.2)';
         ctx.fillRect(x, y, 40, 2);
         ctx.fillRect(x, y, 2, 40);
       }
       break;
      
    case 'HIGH_GRASS':
       if (highGrassImage.current && highGrassImage.current.complete && highGrassImage.current.naturalWidth !== 0) {
         ctx.drawImage(
           highGrassImage.current,
           x,
           y,
           GAME_CONFIG.TILE_SIZE,
           GAME_CONFIG.TILE_SIZE
         );
       } else {
         // Fallback: Grass texture with elevation highlights
         ctx.strokeStyle = 'rgba(58,106,58,0.6)';
         ctx.lineWidth = 1;
         for (let i = 0; i < 8; i++) {
           const grassX = x + 4 + i * 4;
           const grassHeight = 6 + (i % 3) * 2;
           ctx.beginPath();
           ctx.moveTo(grassX, y + 35);
           ctx.lineTo(grassX, y + 35 - grassHeight);
           ctx.stroke();
         }
         
         // Elevation highlight
         ctx.fillStyle = 'rgba(122,170,122,0.3)';
         ctx.fillRect(x, y, 40, 3);
       }
       break;
      
    case 'ROCKY_GROUND':
      if (rockyGroundImage.current && rockyGroundImage.current.complete && rockyGroundImage.current.naturalWidth !== 0) {
        ctx.drawImage(
          rockyGroundImage.current,
          x,
          y,
          GAME_CONFIG.TILE_SIZE,
          GAME_CONFIG.TILE_SIZE
        );
      } else {
        // Fallback: Rock patches and pebbles
        ctx.fillStyle = 'rgba(106,90,74,0.4)';
        ctx.fillRect(x + 5, y + 8, 8, 6);
        ctx.fillRect(x + 18, y + 12, 6, 8);
        ctx.fillRect(x + 28, y + 6, 7, 5);
        ctx.fillRect(x + 8, y + 22, 9, 4);
        ctx.fillRect(x + 22, y + 26, 6, 7);
        
        // Small pebbles
        ctx.fillStyle = 'rgba(90,80,70,0.6)';
        ctx.fillRect(x + 12, y + 16, 2, 2);
        ctx.fillRect(x + 25, y + 18, 2, 2);
        ctx.fillRect(x + 15, y + 30, 2, 2);
      }
      break;
      
    case 'CAVE_ENTRANCE':
      if (caveEntranceImage.current && caveEntranceImage.current.complete && caveEntranceImage.current.naturalWidth !== 0) {
        ctx.drawImage(
          caveEntranceImage.current,
          x,
          y,
          GAME_CONFIG.TILE_SIZE,
          GAME_CONFIG.TILE_SIZE
        );
      } else {
        // Fallback: Cave opening shadow
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.beginPath();
        ctx.ellipse(x + 20, y + 20, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner darkness
        ctx.fillStyle = 'rgba(0,0,0,0.9)';
        ctx.beginPath();
        ctx.ellipse(x + 20, y + 20, 10, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Rock formations around entrance
        ctx.fillStyle = 'rgba(122,107,79,0.6)';
        ctx.fillRect(x + 4, y + 12, 6, 8);
        ctx.fillRect(x + 30, y + 10, 6, 10);
      }
      break;
  }
};

// Render world boundaries
const renderWorldBoundaries = (ctx, gameState) => {
  const worldPixelSize = GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE;
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 5]);
  
  // Only render boundaries that are visible
  if (gameState.camera.x <= 50) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, worldPixelSize);
    ctx.stroke();
  }
  
  if (gameState.camera.x + GAME_CONFIG.CANVAS_WIDTH >= worldPixelSize - 50) {
    ctx.beginPath();
    ctx.moveTo(worldPixelSize, 0);
    ctx.lineTo(worldPixelSize, worldPixelSize);
    ctx.stroke();
  }
  
  if (gameState.camera.y <= 50) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(worldPixelSize, 0);
    ctx.stroke();
  }
  
  if (gameState.camera.y + GAME_CONFIG.CANVAS_HEIGHT >= worldPixelSize - 50) {
    ctx.beginPath();
    ctx.moveTo(0, worldPixelSize);
    ctx.lineTo(worldPixelSize, worldPixelSize);
    ctx.stroke();
  }
  
  ctx.setLineDash([]);
};

// Render treasure boxes with viewport culling
const renderTreasureBoxes = (ctx, gameState, visibleArea, treasureImage, treasureOpenedImage) => {
  const { startTileX, endTileX, startTileY, endTileY } = visibleArea;
  const startX = startTileX * GAME_CONFIG.TILE_SIZE;
  const endX = endTileX * GAME_CONFIG.TILE_SIZE;
  const startY = startTileY * GAME_CONFIG.TILE_SIZE;
  const endY = endTileY * GAME_CONFIG.TILE_SIZE;
  
  gameState.treasureBoxes.forEach(treasure => {
    // Only render if in viewport
    if (treasure.x >= startX - GAME_CONFIG.TREASURE_SIZE && 
        treasure.x <= endX + GAME_CONFIG.TREASURE_SIZE &&
        treasure.y >= startY - GAME_CONFIG.TREASURE_SIZE && 
        treasure.y <= endY + GAME_CONFIG.TREASURE_SIZE) {
      
      if (treasure.collected) {
        // Use opened treasure box SVG if available
        if (treasureOpenedImage.current && treasureOpenedImage.current.complete && treasureOpenedImage.current.naturalWidth !== 0) {
          ctx.drawImage(
            treasureOpenedImage.current,
            treasure.x - GAME_CONFIG.TREASURE_SIZE / 2,
            treasure.y - GAME_CONFIG.TREASURE_SIZE / 2,
            GAME_CONFIG.TREASURE_SIZE,
            GAME_CONFIG.TREASURE_SIZE
          );
        } else {
          // Fallback for opened treasure box
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(
            treasure.x - GAME_CONFIG.TREASURE_SIZE / 2, 
            treasure.y - GAME_CONFIG.TREASURE_SIZE / 2 + GAME_CONFIG.TREASURE_SIZE * 0.3, 
            GAME_CONFIG.TREASURE_SIZE, 
            GAME_CONFIG.TREASURE_SIZE * 0.7
          );
          
          // Gold coins inside
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(treasure.x - GAME_CONFIG.TREASURE_SIZE * 0.2, treasure.y + GAME_CONFIG.TREASURE_SIZE * 0.1, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(treasure.x + GAME_CONFIG.TREASURE_SIZE * 0.2, treasure.y + GAME_CONFIG.TREASURE_SIZE * 0.1, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Magical glow for opened boxes
        const glowIntensity = Math.sin(Date.now() * 0.008) * 0.4 + 0.6;
        ctx.fillStyle = `rgba(255, 255, 0, ${glowIntensity * 0.2})`;
        ctx.fillRect(
          treasure.x - GAME_CONFIG.TREASURE_SIZE / 2 + 2, 
          treasure.y - GAME_CONFIG.TREASURE_SIZE / 2 + GAME_CONFIG.TREASURE_SIZE * 0.4, 
          GAME_CONFIG.TREASURE_SIZE - 4, 
          GAME_CONFIG.TREASURE_SIZE * 0.5
        );
      } else {
        // Use closed treasure box SVG if available
        if (treasureImage.current && treasureImage.current.complete && treasureImage.current.naturalWidth !== 0) {
          ctx.drawImage(
            treasureImage.current,
            treasure.x - GAME_CONFIG.TREASURE_SIZE / 2,
            treasure.y - GAME_CONFIG.TREASURE_SIZE / 2,
            GAME_CONFIG.TREASURE_SIZE,
            GAME_CONFIG.TREASURE_SIZE
          );
        } else {
          // Fallback for closed treasure box
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(
            treasure.x - GAME_CONFIG.TREASURE_SIZE / 2, 
            treasure.y - GAME_CONFIG.TREASURE_SIZE / 2, 
            GAME_CONFIG.TREASURE_SIZE, 
            GAME_CONFIG.TREASURE_SIZE
          );
          
          ctx.fillStyle = '#FFA500';
          ctx.fillRect(
            treasure.x - GAME_CONFIG.TREASURE_SIZE / 2 + 5, 
            treasure.y - GAME_CONFIG.TREASURE_SIZE / 2 + 5, 
            GAME_CONFIG.TREASURE_SIZE - 10, 
            GAME_CONFIG.TREASURE_SIZE - 10
          );
        }
        
        // Sparkles for unopened boxes
        if (!treasure.collected) {
          const sparkleCount = 2;
          ctx.fillStyle = '#FFFF00';
          for (let i = 0; i < sparkleCount; i++) {
            const angle = (Date.now() * 0.01 + i * Math.PI) % (Math.PI * 2);
            const sparkleX = treasure.x + Math.cos(angle) * (GAME_CONFIG.TREASURE_SIZE * 0.6);
            const sparkleY = treasure.y + Math.sin(angle) * (GAME_CONFIG.TREASURE_SIZE * 0.6);
            if (Math.sin(Date.now() * 0.01 + i) > 0.3) {
              ctx.fillRect(sparkleX, sparkleY, 2, 2);
            }
          }
        }
        
        // Interaction glow for nearby treasures
        if (treasure.nearPlayer && !treasure.collected) {
          const glowIntensity = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
          ctx.save();
          ctx.shadowColor = '#00FF00';
          ctx.shadowBlur = 20;
          ctx.strokeStyle = `rgba(0, 255, 0, ${glowIntensity})`;
          ctx.lineWidth = 3;
          ctx.strokeRect(
            treasure.x - GAME_CONFIG.TREASURE_SIZE / 2 - 5,
            treasure.y - GAME_CONFIG.TREASURE_SIZE / 2 - 5,
            GAME_CONFIG.TREASURE_SIZE + 10,
            GAME_CONFIG.TREASURE_SIZE + 10
          );
          ctx.restore();
        }
      }
    }
  });
};

// Render monsters with viewport culling
const renderMonsters = (ctx, gameState, visibleArea, monsterImages, isAttacking, attackTarget) => {
  const { startTileX, endTileX, startTileY, endTileY } = visibleArea;
  const startX = startTileX * GAME_CONFIG.TILE_SIZE;
  const endX = endTileX * GAME_CONFIG.TILE_SIZE;
  const startY = startTileY * GAME_CONFIG.TILE_SIZE;
  const endY = endTileY * GAME_CONFIG.TILE_SIZE;
  
  gameState.monsters.forEach(monster => {
    // Only render if in viewport
    if (monster.x >= startX - GAME_CONFIG.MONSTER_SIZE && 
        monster.x <= endX + GAME_CONFIG.MONSTER_SIZE &&
        monster.y >= startY - GAME_CONFIG.MONSTER_SIZE && 
        monster.y <= endY + GAME_CONFIG.MONSTER_SIZE) {
      
      // Determine which monster image to use based on type
      let monsterImage = null;
      if (monster.type === 'goblin' && monsterImages.goblin.current) {
        monsterImage = monsterImages.goblin.current;
      } else if (monster.type === 'dragon' && monsterImages.dragon.current) {
        monsterImage = monsterImages.dragon.current;
      } else if (monster.type === 'orc' && monsterImages.orc.current) {
        monsterImage = monsterImages.orc.current;
      }
      
      // Check if this monster is being attacked
      const isBeingAttacked = isAttacking && attackTarget && attackTarget.id === monster.id;
      
      // Apply attack effect (red tint and shake)
      if (isBeingAttacked) {
        ctx.save();
        const shakeX = (Math.random() - 0.5) * 4;
        const shakeY = (Math.random() - 0.5) * 4;
        ctx.translate(shakeX, shakeY);
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
      }
      
      if (monsterImage && monsterImage.complete && monsterImage.naturalWidth !== 0) {
        // Render realistic monster SVG
        ctx.drawImage(
          monsterImage,
          monster.x - GAME_CONFIG.MONSTER_SIZE / 2,
          monster.y - GAME_CONFIG.MONSTER_SIZE / 2,
          GAME_CONFIG.MONSTER_SIZE,
          GAME_CONFIG.MONSTER_SIZE
        );
      } else {
        // Fallback monster representation
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(
          monster.x, 
          monster.y, 
          GAME_CONFIG.MONSTER_SIZE / 2, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(
          monster.x - 5, 
          monster.y - 3, 
          2, 
          0, 
          Math.PI * 2
        );
        ctx.arc(
          monster.x + 5, 
          monster.y - 3, 
          2, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
      }
      
      // Restore context if attack effect was applied
      if (isBeingAttacked) {
        ctx.restore();
        
        // Add attack impact effect
        ctx.fillStyle = 'rgba(255, 255, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(monster.x, monster.y, GAME_CONFIG.MONSTER_SIZE / 2 + 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Health bar for monsters
      if (monster.health < monster.maxHealth) {
        const barWidth = GAME_CONFIG.MONSTER_SIZE;
        const barHeight = 4;
        const healthPercentage = monster.health / monster.maxHealth;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(
          monster.x - barWidth / 2,
          monster.y - GAME_CONFIG.MONSTER_SIZE / 2 - 10,
          barWidth,
          barHeight
        );
        
        // Health
        ctx.fillStyle = healthPercentage > 0.5 ? '#4CAF50' : healthPercentage > 0.25 ? '#FF9800' : '#F44336';
        ctx.fillRect(
          monster.x - barWidth / 2,
          monster.y - GAME_CONFIG.MONSTER_SIZE / 2 - 10,
          barWidth * healthPercentage,
          barHeight
        );
      }
    }
  });
};

// Render player
const renderPlayer = (ctx, gameState, playerImage, playerSpriteImage, playerFrontImage, playerBackImage, playerLeftImage, playerRightImage, playerDirection) => {
  // Priority: directional sprites > character sprite > original SVG
  let activePlayerImage = null;
  let renderType = 'fallback';
  
  // Select directional sprite based on player direction
  const directionalImages = {
    front: playerFrontImage,
    back: playerBackImage,
    left: playerLeftImage,
    right: playerRightImage
  };
  
  const selectedDirectionalImage = directionalImages[playerDirection];
  
  if (selectedDirectionalImage?.current && selectedDirectionalImage.current.complete && selectedDirectionalImage.current.naturalWidth !== 0) {
    activePlayerImage = selectedDirectionalImage;
    renderType = 'directional';
  } else if (playerSpriteImage.current && playerSpriteImage.current.complete && playerSpriteImage.current.naturalWidth !== 0) {
    activePlayerImage = playerSpriteImage;
    renderType = 'sprite';
  } else if (playerImage.current && playerImage.current.complete && playerImage.current.naturalWidth !== 0) {
    activePlayerImage = playerImage;
    renderType = 'svg';
  }
    
  if (activePlayerImage) {
    if (renderType === 'directional') {
      // Use directional SVG sprite
      ctx.drawImage(
        activePlayerImage.current,
        gameState.player.x - GAME_CONFIG.PLAYER_SIZE / 2,
        gameState.player.y - GAME_CONFIG.PLAYER_SIZE / 2,
        GAME_CONFIG.PLAYER_SIZE,
        GAME_CONFIG.PLAYER_SIZE
      );
    } else if (renderType === 'sprite') {
      // Use character spritesheet - extract idle frame
      const frameWidth = 78; // Assuming character sprite frame width
      const frameHeight = 58; // Assuming character sprite frame height
      const idleFrame = 0; // Use first frame for idle
      
      ctx.drawImage(
        activePlayerImage.current,
        idleFrame * frameWidth, 0, frameWidth, frameHeight,
        gameState.player.x - GAME_CONFIG.PLAYER_SIZE / 2,
        gameState.player.y - GAME_CONFIG.PLAYER_SIZE / 2,
        GAME_CONFIG.PLAYER_SIZE,
        GAME_CONFIG.PLAYER_SIZE
      );
    } else {
      // Use original SVG player image
      ctx.drawImage(
        activePlayerImage.current,
        gameState.player.x - GAME_CONFIG.PLAYER_SIZE / 2,
        gameState.player.y - GAME_CONFIG.PLAYER_SIZE / 2,
        GAME_CONFIG.PLAYER_SIZE,
        GAME_CONFIG.PLAYER_SIZE
      );
    }
  } else {
    // Fallback player representation - make it more visible
    ctx.fillStyle = '#ff0000'; // Red for visibility
    ctx.beginPath();
    ctx.arc(
      gameState.player.x, 
      gameState.player.y, 
      GAME_CONFIG.PLAYER_SIZE / 2, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
    
    // Add a border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add debug text
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText('PLAYER', gameState.player.x - 20, gameState.player.y - 20);
  }
};

// Render UI elements
const renderUI = (ctx, gameState) => {
  // Health bar
  const healthBarWidth = 200;
  const healthBarHeight = 20;
  const healthPercentage = gameState.player.health / gameState.player.maxHealth;
  
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(10, 10, healthBarWidth, healthBarHeight);
  
  ctx.fillStyle = healthPercentage > 0.5 ? '#00ff00' : healthPercentage > 0.25 ? '#ffff00' : '#ff0000';
  ctx.fillRect(10, 10, healthBarWidth * healthPercentage, healthBarHeight);
  
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, healthBarWidth, healthBarHeight);
  
  // Health text
  ctx.fillStyle = '#ffffff';
  ctx.font = '14px Arial';
  ctx.fillText(`Health: ${gameState.player.health}/${gameState.player.maxHealth}`, 15, 25);
  
  // Score
  ctx.fillText(`Score: ${gameState.score}`, 15, 50);
  
  // Depth level
  const levelText = gameState.depthLevel === 0 ? 'Surface' : `Cave Level ${gameState.depthLevel}`;
  ctx.fillText(`Level: ${levelText}`, 15, 75);
  
  // Minimap
  renderMinimap(ctx, gameState);
};

// Render minimap
const renderMinimap = (ctx, gameState) => {
  const minimapSize = 120;
  const minimapX = GAME_CONFIG.CANVAS_WIDTH - minimapSize - 10;
  const minimapY = 10;
  const scale = minimapSize / (GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE);
  
  // Minimap background
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
  
  // Player position on minimap
  const playerMinimapX = minimapX + gameState.player.x * scale;
  const playerMinimapY = minimapY + gameState.player.y * scale;
  
  ctx.fillStyle = '#0066cc';
  ctx.beginPath();
  ctx.arc(playerMinimapX, playerMinimapY, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Camera view rectangle
  const cameraMinimapX = minimapX + gameState.camera.x * scale;
  const cameraMinimapY = minimapY + gameState.camera.y * scale;
  const cameraMinimapWidth = GAME_CONFIG.CANVAS_WIDTH * scale;
  const cameraMinimapHeight = GAME_CONFIG.CANVAS_HEIGHT * scale;
  
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(cameraMinimapX, cameraMinimapY, cameraMinimapWidth, cameraMinimapHeight);
  
  // Minimap border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(minimapX, minimapY, minimapSize, minimapSize);
};

export default CanvasRenderer;