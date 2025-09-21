// Seamless Terrain Renderer for Kubo Games
// Handles visual rendering with alpha blending, seamless borders, and vibrant colors

import React, { useEffect, useRef, useState } from 'react';
import {
  SEAMLESS_TERRAIN_CONFIG,
  BLEND_MODES,
  TARGET_ASSETS
} from '../utils/seamlessTerrainAssets.js';

const SeamlessTerrainRenderer = ({ 
  terrainData, 
  width,
  height,
  cellSize = 32, 
  playerPosition, 
  targetPosition,
  initialSpawnPosition,
  collectedCrystals = new Set(),
  onTileClick,
  className = '',
  style = {} 
}) => {
  const canvasRef = useRef(null);
  const [loadedImages, setLoadedImages] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Preload all terrain assets
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = [];
      const imageMap = new Map();

      // Collect all unique image paths from terrain data
      const imagePaths = new Set();
      
      if (terrainData && terrainData.length > 0) {
        terrainData.forEach(row => {
          row.forEach(tile => {
            if (tile.baseTexture) {
              imagePaths.add(tile.baseTexture);
            }
            
            if (tile.decorations) {
              tile.decorations.forEach(decoration => {
                if (decoration.asset) {
                  imagePaths.add(decoration.asset);
                }
              });
            }
            
            if (tile.obstacle && tile.obstacle.asset) {
              imagePaths.add(tile.obstacle.asset);
            }
            
            if (tile.transition && tile.transition.asset) {
              imagePaths.add(tile.transition.asset);
            }
          });
        });
        
        // Add house asset for target position
        imagePaths.add(TARGET_ASSETS.HOUSE.asset);
      }

      // Load all images
      imagePaths.forEach(path => {
        const promise = new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            imageMap.set(path, img);
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to load image: ${path}`);
            resolve(); // Continue even if some images fail
          };
          img.src = path;
        });
        imagePromises.push(promise);
      });

      await Promise.all(imagePromises);
      setLoadedImages(imageMap);
      setIsLoading(false);
    };

    if (terrainData && terrainData.length > 0) {
      loadImages();
    }
  }, [terrainData]);

  // Render terrain to canvas
  useEffect(() => {
    if (!terrainData || terrainData.length === 0 || isLoading) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const canvasWidth = width * cellSize;
    const canvasHeight = height * cellSize;

    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Enable smooth rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Render terrain layers
    renderTerrainLayers(ctx, terrainData, cellSize, loadedImages);

    // Render special positions
    if (targetPosition) {
      renderTarget(ctx, targetPosition, cellSize, loadedImages);
    }
    if (initialSpawnPosition) {
      renderSpawn(ctx, initialSpawnPosition, cellSize);
    }
  }, [terrainData, width, height, cellSize, loadedImages, isLoading, targetPosition, initialSpawnPosition]);

  // Handle canvas click events
  const handleCanvasClick = (event) => {
    if (!onTileClick) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const tileX = Math.floor(x / cellSize);
    const tileY = Math.floor(y / cellSize);

    if (tileX >= 0 && tileX < width && tileY >= 0 && tileY < height) {
      onTileClick(tileX, tileY, terrainData[tileY][tileX]);
    }
  };

  if (isLoading) {
    return (
      <div className={`seamless-terrain-loading ${className}`} style={style}>
        <div className="loading-spinner">Loading seamless terrain...</div>
      </div>
    );
  }

  return (
    <div className={`seamless-terrain-container ${className}`} style={style}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          border: 'none',
          display: 'block',
          imageRendering: 'pixelated',
          ...style
        }}
      />
    </div>
  );
};

// Render all terrain layers with seamless blending
const renderTerrainLayers = (ctx, terrain, cellSize, loadedImages) => {
  const height = terrain.length;
  const width = terrain[0].length;

  // Layer 1: Base terrain textures
  renderBaseTerrainLayer(ctx, terrain, cellSize, loadedImages, width, height);
  
  // Layer 2: Terrain transitions (shorelines)
  renderTransitionLayer(ctx, terrain, cellSize, loadedImages, width, height);
  
  // Layer 3: Grass decorations
  renderGrassDecorationLayer(ctx, terrain, cellSize, loadedImages, width, height);
  
  // Layer 4: Obstacles with vibrant backgrounds
  renderObstacleLayer(ctx, terrain, cellSize, loadedImages, width, height);
};

// Render base terrain textures
const renderBaseTerrainLayer = (ctx, terrain, cellSize, loadedImages, width, height) => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = terrain[y][x];
      const pixelX = x * cellSize;
      const pixelY = y * cellSize;

      // Set blend mode
      ctx.globalCompositeOperation = tile.blendMode || 'source-over';
      ctx.globalAlpha = 1.0;

      if (tile.baseTexture && loadedImages.has(tile.baseTexture)) {
        const img = loadedImages.get(tile.baseTexture);
        
        // Render with seamless borders (overlap slightly to remove gaps)
        ctx.drawImage(
          img,
          pixelX - 0.5,
          pixelY - 0.5,
          cellSize + 1,
          cellSize + 1
        );
      } else {
        // Fallback color rendering
        const fallbackColor = tile.type === 'water' ? '#4A90E2' : '#7CB342';
        ctx.fillStyle = fallbackColor;
        ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
      }
    }
  }
  
  // Reset blend mode
  ctx.globalCompositeOperation = 'source-over';
};

// Render terrain transitions (shorelines)
const renderTransitionLayer = (ctx, terrain, cellSize, loadedImages, width, height) => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = terrain[y][x];
      
      if (tile.transition) {
        const pixelX = x * cellSize;
        const pixelY = y * cellSize;
        
        // Set blend mode for transitions
        ctx.globalCompositeOperation = tile.transition.blendMode || 'overlay';
        ctx.globalAlpha = tile.transition.opacity || 0.7;
        
        if (tile.transition.asset && loadedImages.has(tile.transition.asset)) {
          const img = loadedImages.get(tile.transition.asset);
          ctx.drawImage(img, pixelX, pixelY, cellSize, cellSize);
        }
      }
    }
  }
  
  // Reset blend mode and alpha
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1.0;
};

// Render grass decorations with natural distribution
const renderGrassDecorationLayer = (ctx, terrain, cellSize, loadedImages, width, height) => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = terrain[y][x];
      
      if (tile.decorations && tile.decorations.length > 0) {
        const pixelX = x * cellSize;
        const pixelY = y * cellSize;
        
        tile.decorations.forEach(decoration => {
          if (decoration.type === 'grass' && decoration.asset && loadedImages.has(decoration.asset)) {
            // Set blend mode for grass
            ctx.globalCompositeOperation = decoration.blendMode || 'multiply';
            ctx.globalAlpha = decoration.opacity || 0.8;
            
            const img = loadedImages.get(decoration.asset);
            
            // Add slight random offset for natural look
            const offsetX = (Math.sin(x * 0.7 + y * 0.3) * 2);
            const offsetY = (Math.cos(x * 0.3 + y * 0.7) * 2);
            
            ctx.drawImage(
              img,
              pixelX + offsetX,
              pixelY + offsetY,
              cellSize,
              cellSize
            );
          }
        });
      }
    }
  }
  
  // Reset blend mode and alpha
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1.0;
};

// Render obstacles with vibrant background colors
const renderObstacleLayer = (ctx, terrain, cellSize, loadedImages, width, height) => {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tile = terrain[y][x];
      
      if (tile.obstacle) {
        const pixelX = x * cellSize;
        const pixelY = y * cellSize;
        
        // Render vibrant background color
        if (tile.obstacle.vibrantColor) {
          ctx.fillStyle = tile.obstacle.vibrantColor;
          ctx.globalAlpha = 0.3;
          
          // Create rounded background
          const padding = 2;
          const radius = 4;
          const x = pixelX + padding;
          const y = pixelY + padding;
          const w = cellSize - padding * 2;
          const h = cellSize - padding * 2;
          
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + w - radius, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
          ctx.lineTo(x + w, y + h - radius);
          ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
          ctx.lineTo(x + radius, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.fill();
          
          ctx.globalAlpha = 1.0;
        }
        
        // Render obstacle asset with alpha blending
        if (tile.obstacle.asset && loadedImages.has(tile.obstacle.asset)) {
          ctx.globalCompositeOperation = 'source-over';
          ctx.globalAlpha = 1.0;
          
          const img = loadedImages.get(tile.obstacle.asset);
          ctx.drawImage(img, pixelX, pixelY, cellSize, cellSize);
        }
      }
    }
  }
  
  // Reset blend mode and alpha
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1.0;
};

// Render player position indicator
const renderPlayer = (ctx, playerPosition, cellSize) => {
  const pixelX = playerPosition.x * cellSize + cellSize / 2;
  const pixelY = playerPosition.y * cellSize + cellSize / 2;
  const radius = cellSize / 3; // Increased from cellSize / 4 to make character bigger
  
  // Player indicator with glow effect
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.8;
  
  // Outer glow - bigger
  ctx.beginPath();
  ctx.arc(pixelX, pixelY, radius + 4, 0, Math.PI * 2); // Increased glow size
  ctx.fillStyle = '#FFD700';
  ctx.fill();
  
  // Inner circle - bigger
  ctx.beginPath();
  ctx.arc(pixelX, pixelY, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#FF6B35';
  ctx.fill();
  
  ctx.globalAlpha = 1.0;
};

// Render target position indicator
const renderTarget = (ctx, targetPosition, cellSize, loadedImages) => {
  if (!targetPosition) return;
  
  const pixelX = targetPosition.x * cellSize;
  const pixelY = targetPosition.y * cellSize;
  
  // Render house asset for target
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1.0;
  
  if (loadedImages && loadedImages.has(TARGET_ASSETS.HOUSE.asset)) {
    const houseImg = loadedImages.get(TARGET_ASSETS.HOUSE.asset);
    
    // Draw vibrant background for the house
    ctx.fillStyle = TARGET_ASSETS.HOUSE.vibrantColor;
    ctx.globalAlpha = 0.3;
    
    // Create rounded background
    const padding = 2;
    const radius = 6;
    const x = pixelX + padding;
    const y = pixelY + padding;
    const w = cellSize - padding * 2;
    const h = cellSize - padding * 2;
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    
    ctx.globalAlpha = 1.0;
    
    // Draw the house asset
    ctx.drawImage(houseImg, pixelX, pixelY, cellSize, cellSize);
  } else {
    // Fallback to original circle design if house asset fails to load
    const radius = cellSize / 3;
    const centerX = pixelX + cellSize / 2;
    const centerY = pixelY + cellSize / 2;
    
    // Target indicator with pulsing effect
    ctx.globalAlpha = 0.9;
    
    // Outer ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 3, 0, Math.PI * 2);
    ctx.strokeStyle = '#FF4444';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Inner circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FF6666';
    ctx.fill();
    
    ctx.globalAlpha = 1.0;
  }
};

// Render spawn position indicator
const renderSpawn = (ctx, spawnPosition, cellSize) => {
  if (!spawnPosition) return;
  
  const pixelX = spawnPosition.x * cellSize + cellSize / 2;
  const pixelY = spawnPosition.y * cellSize + cellSize / 2;
  const radius = cellSize / 3;
  
  // Spawn indicator with green glow
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.8;
  
  // Outer glow
  ctx.beginPath();
  ctx.arc(pixelX, pixelY, radius + 2, 0, Math.PI * 2);
  ctx.fillStyle = '#44FF44';
  ctx.fill();
  
  // Inner circle
  ctx.beginPath();
  ctx.arc(pixelX, pixelY, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#22AA22';
  ctx.fill();
  
  ctx.globalAlpha = 1.0;
};

// Add CSS for loading spinner
const styles = `
.seamless-terrain-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: linear-gradient(135deg, #7CB342, #4A90E2);
  border-radius: 8px;
}

.loading-spinner {
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.seamless-terrain-container {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default SeamlessTerrainRenderer;
