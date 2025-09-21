import React, { useEffect, useRef, useState } from 'react';

/**
 * TerrainRenderer - Renders terrain designs created by TerrainDesigner
 * Integrates with the open-world game to display custom terrain layouts
 */
const TerrainRenderer = ({ 
  terrainData = null, 
  currentLevel = 0, 
  canvasWidth = 800, 
  canvasHeight = 600,
  tileSize = 32,
  onTerrainLoad = null,
  className = ''
}) => {
  const canvasRef = useRef(null);
  const [loadedImages, setLoadedImages] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const animationFrameRef = useRef(null);

  // Terrain asset mappings
  const TERRAIN_ASSETS = {
    0: { // Surface level
      grass: '/assets/terrain/1 Tiles/Map_tile_01.png',
      tree: '/assets/terrain/Objects/Tree.png',
      crystal: '/assets/terrain/Objects/Crystal.png',
      treasure: '/assets/terrain/Objects/Chest_01.png',
      rock: '/assets/terrain/Objects/Rock.png',
      flower: '/assets/terrain/Objects/Flower_01.png',
      bush: '/assets/terrain/Objects/Bush_01.png',
      water: '/assets/terrain/Tilesets/Water.png',
      path: '/assets/terrain/1 Tiles/Map_tile_02.png',
      fence: '/assets/terrain/Tilesets/Fence.png'
    },
    1: { // Cave level
      stone: '/assets/terrain/1 Tiles/Map_tile_15.png',
      stalactite: '/assets/terrain/Objects/Rock.png',
      crystal: '/assets/terrain/Objects/Crystal.png',
      treasure: '/assets/terrain/Objects/Chest_02.png',
      torch: '/assets/terrain/Objects/Torch.png',
      bones: '/assets/terrain/Objects/Skull.png',
      mushroom: '/assets/terrain/Objects/Mushroom.png',
      water: '/assets/terrain/Tilesets/Water.png',
      path: '/assets/terrain/1 Tiles/Map_tile_16.png',
      wall: '/assets/terrain/1 Tiles/Map_tile_17.png'
    }
  };

  // Load terrain images
  const loadTerrainImages = async (level) => {
    setIsLoading(true);
    const assets = TERRAIN_ASSETS[level] || TERRAIN_ASSETS[0];
    const imagePromises = [];
    const newLoadedImages = {};

    for (const [key, src] of Object.entries(assets)) {
      const promise = new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          newLoadedImages[key] = img;
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load terrain asset: ${src}`);
          // Create a fallback colored rectangle
          const canvas = document.createElement('canvas');
          canvas.width = tileSize;
          canvas.height = tileSize;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = getTerrainColor(key);
          ctx.fillRect(0, 0, tileSize, tileSize);
          newLoadedImages[key] = canvas;
          resolve();
        };
        img.src = src;
      });
      imagePromises.push(promise);
    }

    try {
      await Promise.all(imagePromises);
      setLoadedImages(newLoadedImages);
    } catch (error) {
      console.error('Error loading terrain images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get fallback colors for terrain types
  const getTerrainColor = (terrainType) => {
    const colors = {
      grass: '#4CAF50',
      tree: '#2E7D32',
      crystal: '#9C27B0',
      treasure: '#FF9800',
      rock: '#795548',
      flower: '#E91E63',
      bush: '#388E3C',
      water: '#2196F3',
      path: '#8D6E63',
      fence: '#5D4037',
      stone: '#607D8B',
      stalactite: '#455A64',
      torch: '#FF5722',
      bones: '#F5F5F5',
      mushroom: '#8BC34A',
      wall: '#424242'
    };
    return colors[terrainType] || '#CCCCCC';
  };

  // Render terrain on canvas
  const renderTerrain = () => {
    const canvas = canvasRef.current;
    if (!canvas || !terrainData) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Get terrain data for current level
    const levelData = terrainData.levels?.[currentLevel];
    if (!levelData || !levelData.tiles) {
      // Render default background
      ctx.fillStyle = currentLevel === 0 ? '#87CEEB' : '#2F2F2F';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      return;
    }

    // Calculate grid dimensions
    const gridWidth = Math.floor(canvasWidth / tileSize);
    const gridHeight = Math.floor(canvasHeight / tileSize);

    // Render background
    ctx.fillStyle = currentLevel === 0 ? '#87CEEB' : '#1A1A1A';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Render tiles
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const tileKey = `${x},${y}`;
        const tile = levelData.tiles[tileKey];
        
        if (tile && tile.type) {
          const image = loadedImages[tile.type];
          const drawX = x * tileSize;
          const drawY = y * tileSize;

          if (image) {
            // Draw the terrain tile
            ctx.drawImage(image, drawX, drawY, tileSize, tileSize);
            
            // Add visual effects for special tiles
            if (tile.type === 'crystal') {
              // Add sparkle effect
              ctx.save();
              ctx.globalAlpha = 0.6;
              ctx.fillStyle = '#FFFFFF';
              const sparkleSize = 2;
              ctx.fillRect(drawX + tileSize - 6, drawY + 4, sparkleSize, sparkleSize);
              ctx.fillRect(drawX + 4, drawY + tileSize - 6, sparkleSize, sparkleSize);
              ctx.restore();
            } else if (tile.type === 'treasure') {
              // Add glow effect
              ctx.save();
              ctx.shadowColor = '#FFD700';
              ctx.shadowBlur = 8;
              ctx.strokeStyle = '#FFD700';
              ctx.lineWidth = 1;
              ctx.strokeRect(drawX + 2, drawY + 2, tileSize - 4, tileSize - 4);
              ctx.restore();
            } else if (tile.type === 'water') {
              // Add wave effect
              ctx.save();
              ctx.globalAlpha = 0.3;
              ctx.fillStyle = '#FFFFFF';
              const waveOffset = Math.sin(Date.now() * 0.003 + x + y) * 2;
              ctx.fillRect(drawX, drawY + tileSize/2 + waveOffset, tileSize, 2);
              ctx.restore();
            }
          } else {
            // Fallback: draw colored rectangle
            ctx.fillStyle = getTerrainColor(tile.type);
            ctx.fillRect(drawX, drawY, tileSize, tileSize);
            
            // Add border
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1;
            ctx.strokeRect(drawX, drawY, tileSize, tileSize);
          }
        }
      }
    }

    // Render grid overlay (optional)
    if (terrainData.showGrid) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;
      
      for (let x = 0; x <= gridWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * tileSize, 0);
        ctx.lineTo(x * tileSize, canvasHeight);
        ctx.stroke();
      }
      
      for (let y = 0; y <= gridHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * tileSize);
        ctx.lineTo(canvasWidth, y * tileSize);
        ctx.stroke();
      }
    }
  };

  // Animation loop for dynamic effects
  const animate = () => {
    renderTerrain();
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Load images when level changes
  useEffect(() => {
    loadTerrainImages(currentLevel);
  }, [currentLevel]);

  // Start rendering when images are loaded
  useEffect(() => {
    if (Object.keys(loadedImages).length > 0 && !isLoading) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animate();
      
      if (onTerrainLoad) {
        onTerrainLoad(terrainData, currentLevel);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [loadedImages, terrainData, currentLevel, isLoading]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }
  }, [canvasWidth, canvasHeight]);

  return (
    <div className={`terrain-renderer ${className}`}>
      {isLoading && (
        <div className="terrain-loading">
          <div className="loading-spinner"></div>
          <p>Loading terrain assets...</p>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          border: '2px solid #ccc',
          borderRadius: '8px',
          background: currentLevel === 0 ? '#87CEEB' : '#1A1A1A',
          display: isLoading ? 'none' : 'block'
        }}
      />
      {terrainData && (
        <div className="terrain-info">
          <p>
            Level: {currentLevel} | 
            Tiles: {Object.keys(terrainData.levels?.[currentLevel]?.tiles || {}).length} | 
            Size: {Math.floor(canvasWidth / tileSize)} × {Math.floor(canvasHeight / tileSize)}
          </p>
        </div>
      )}
    </div>
  );
};

export default TerrainRenderer;

// Utility function to get terrain data from localStorage
export const getStoredTerrainData = () => {
  try {
    const stored = localStorage.getItem('terrainDesign');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading terrain data:', error);
    return null;
  }
};

// Utility function to check if terrain data exists
export const hasStoredTerrain = () => {
  return localStorage.getItem('terrainDesign') !== null;
};

// Utility function to get walkable tiles for game logic
export const getWalkableTiles = (terrainData, level = 0) => {
  const walkableTiles = new Set();
  const levelData = terrainData?.levels?.[level];
  
  if (levelData && levelData.tiles) {
    Object.entries(levelData.tiles).forEach(([key, tile]) => {
      // Define which terrain types are walkable
      const walkableTypes = ['grass', 'path', 'stone', 'flower'];
      if (walkableTypes.includes(tile.type)) {
        walkableTiles.add(key);
      }
    });
  }
  
  return walkableTiles;
};

// Utility function to get collision tiles for game logic
export const getCollisionTiles = (terrainData, level = 0) => {
  const collisionTiles = new Set();
  const levelData = terrainData?.levels?.[level];
  
  if (levelData && levelData.tiles) {
    Object.entries(levelData.tiles).forEach(([key, tile]) => {
      // Define which terrain types block movement
      const collisionTypes = ['tree', 'rock', 'fence', 'wall', 'water'];
      if (collisionTypes.includes(tile.type)) {
        collisionTiles.add(key);
      }
    });
  }
  
  return collisionTiles;
};