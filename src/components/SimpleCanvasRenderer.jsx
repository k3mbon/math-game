import React, { useEffect, useRef, useState } from 'react';
import { GAME_CONFIG, TERRAIN_TYPES, WORLD_COLORS } from '../config/gameConfig';
import treeSvg from '../assets/forest-tree.svg';

// Draw tree using SVG asset
const drawSvgTree = (ctx, x, y, size, treeImage) => {
  if (!treeImage) {
    // Fallback to simple tree if image not loaded
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + size * 0.4, y + size * 0.6, size * 0.2, size * 0.4);
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y + size * 0.3, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  
  const treeWidth = size;
  const treeHeight = size;
  
  ctx.drawImage(
    treeImage,
    x,
    y,
    treeWidth,
    treeHeight
  );
};

// Render environment objects with pixel-style graphics
const renderPixelEnvironmentObjects = (ctx, gameState, visibleArea) => {
  if (!gameState.environmentObjects || gameState.environmentObjects.length === 0) return;
  
  gameState.environmentObjects.forEach(obj => {
    const screenX = obj.x - gameState.camera.x;
    const screenY = obj.y - gameState.camera.y;
    
    // Only render if visible
    if (screenX >= -obj.size && screenX <= GAME_CONFIG.CANVAS_WIDTH &&
        screenY >= -obj.size && screenY <= GAME_CONFIG.CANVAS_HEIGHT) {
      
      // Render based on object type with pixel art style
      switch (obj.type) {
        case 'tree':
          // Pixel tree trunk
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(screenX - 4, screenY - 4, 8, 16);
          // Pixel tree canopy
          ctx.fillStyle = '#228B22';
          ctx.fillRect(screenX - 8, screenY - 16, 16, 12);
          // Tree highlights
          ctx.fillStyle = '#32CD32';
          ctx.fillRect(screenX - 6, screenY - 14, 4, 4);
          ctx.fillRect(screenX + 2, screenY - 12, 4, 4);
          break;
          
        case 'rock':
          // Pixel rock
          ctx.fillStyle = '#696969';
          ctx.fillRect(screenX - 6, screenY - 4, 12, 8);
          // Rock texture
          ctx.fillStyle = '#A9A9A9';
          ctx.fillRect(screenX - 4, screenY - 2, 3, 3);
          ctx.fillRect(screenX + 2, screenY + 1, 2, 2);
          break;
          
        case 'bush':
          // Pixel bush
          ctx.fillStyle = '#32CD32';
          ctx.fillRect(screenX - 6, screenY - 4, 12, 8);
          // Bush clusters
          ctx.fillStyle = '#228B22';
          ctx.fillRect(screenX - 4, screenY - 2, 3, 3);
          ctx.fillRect(screenX + 2, screenY, 3, 3);
          break;
          
        case 'flower':
          // Pixel flower stem
          ctx.fillStyle = '#228B22';
          ctx.fillRect(screenX - 1, screenY, 2, 6);
          // Pixel flower petals
          ctx.fillStyle = obj.color || '#FF69B4';
          ctx.fillRect(screenX - 3, screenY - 4, 6, 4);
          ctx.fillRect(screenX - 1, screenY - 6, 2, 2);
          // Flower center
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(screenX - 1, screenY - 3, 2, 2);
          break;
          
        case 'mushroom':
          // Pixel mushroom stem
          ctx.fillStyle = '#F5F5DC';
          ctx.fillRect(screenX - 2, screenY - 2, 4, 6);
          // Pixel mushroom cap
          ctx.fillStyle = obj.color || '#DC143C';
          ctx.fillRect(screenX - 4, screenY - 6, 8, 4);
          // Mushroom spots
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(screenX - 2, screenY - 5, 1, 1);
          ctx.fillRect(screenX + 1, screenY - 4, 1, 1);
          break;
          
        default:
          // Generic pixel object
          ctx.fillStyle = obj.color || '#8B4513';
          ctx.fillRect(screenX - 4, screenY - 4, 8, 8);
      }
    }
  });
};

// Render simple bush obstacles passed from game (tile-based positions)
const renderSimpleBushObstacles = (ctx, bushObstacles, gameState) => {
  if (!bushObstacles || bushObstacles.length === 0) return;

  const size = GAME_CONFIG.TILE_SIZE;
  const groundOffset = Math.floor(size * 0.1); // align with collision system

  for (const bush of bushObstacles) {
    const worldX = bush.x * size;
    const worldY = bush.y * size;
    const screenX = worldX - gameState.camera.x;
    const screenY = worldY - gameState.camera.y + groundOffset;

    // Culling
    if (
      screenX < -size || screenX > GAME_CONFIG.CANVAS_WIDTH ||
      screenY < -size || screenY > GAME_CONFIG.CANVAS_HEIGHT
    ) {
      continue;
    }

    // Base bush body
    ctx.fillStyle = '#2E7D32';
    ctx.beginPath();
    ctx.arc(screenX + size * 0.5, screenY + size * 0.5, size * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // Cluster lobes for a bushy look
    ctx.fillStyle = '#388E3C';
    ctx.beginPath();
    ctx.arc(screenX + size * 0.35, screenY + size * 0.45, size * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(screenX + size * 0.65, screenY + size * 0.55, size * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Highlights
    ctx.fillStyle = '#66BB6A';
    ctx.beginPath();
    ctx.arc(screenX + size * 0.52, screenY + size * 0.42, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
};

// Render monsters with pixel-style graphics
const renderPixelMonsters = (ctx, gameState, visibleArea) => {
  gameState.monsters.forEach(monster => {
    const screenX = monster.x - gameState.camera.x;
    const screenY = monster.y - gameState.camera.y;
    
    // Only render if visible
    if (screenX >= -GAME_CONFIG.TILE_SIZE && screenX <= GAME_CONFIG.CANVAS_WIDTH &&
        screenY >= -GAME_CONFIG.TILE_SIZE && screenY <= GAME_CONFIG.CANVAS_HEIGHT) {
      
      const monsterSize = GAME_CONFIG.MONSTER_SIZE;
      
      // Draw different monster types
      switch (monster.type) {
        case 'goblin':
          // Green goblin
          ctx.fillStyle = '#4CAF50';
          ctx.fillRect(screenX - monsterSize/2, screenY - monsterSize/2, monsterSize, monsterSize);
          // Eyes
          ctx.fillStyle = '#FF0000';
          ctx.fillRect(screenX - monsterSize/4, screenY - monsterSize/3, 3, 3);
          ctx.fillRect(screenX + monsterSize/4 - 3, screenY - monsterSize/3, 3, 3);
          break;
          
        case 'wolf':
          // Gray wolf
          ctx.fillStyle = '#757575';
          ctx.fillRect(screenX - monsterSize/2, screenY - monsterSize/2, monsterSize, monsterSize * 0.6);
          // Ears
          ctx.fillStyle = '#424242';
          ctx.fillRect(screenX - monsterSize/3, screenY - monsterSize/2 - 5, 5, 8);
          ctx.fillRect(screenX + monsterSize/3 - 5, screenY - monsterSize/2 - 5, 5, 8);
          break;
          
        case 'spider':
          // Black spider
          ctx.fillStyle = '#212121';
          ctx.beginPath();
          ctx.arc(screenX, screenY, monsterSize/2, 0, Math.PI * 2);
          ctx.fill();
          // Legs
          ctx.strokeStyle = '#212121';
          ctx.lineWidth = 2;
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(
              screenX + Math.cos(angle) * monsterSize,
              screenY + Math.sin(angle) * monsterSize
            );
            ctx.stroke();
          }
          break;
          
        case 'bat':
          // Purple bat
          ctx.fillStyle = '#9C27B0';
          ctx.beginPath();
          ctx.arc(screenX, screenY, monsterSize/2, 0, Math.PI * 2);
          ctx.fill();
          // Wings
          ctx.fillStyle = '#7B1FA2';
          ctx.fillRect(screenX - monsterSize, screenY - 3, monsterSize * 0.8, 6);
          ctx.fillRect(screenX + monsterSize * 0.2, screenY - 3, monsterSize * 0.8, 6);
          break;
          
        case 'skeleton':
          // White skeleton
          ctx.fillStyle = '#FAFAFA';
          ctx.fillRect(screenX - monsterSize/2, screenY - monsterSize/2, monsterSize, monsterSize);
          // Skull details
          ctx.fillStyle = '#212121';
          ctx.fillRect(screenX - monsterSize/4, screenY - monsterSize/3, 3, 3);
          ctx.fillRect(screenX + monsterSize/4 - 3, screenY - monsterSize/3, 3, 3);
          ctx.fillRect(screenX - 2, screenY, 4, 3);
          break;
          
        case 'ghost':
          // Translucent white ghost
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = '#F5F5F5';
          ctx.beginPath();
          ctx.arc(screenX, screenY - monsterSize/4, monsterSize/2, 0, Math.PI * 2);
          ctx.fill();
          // Wavy bottom
          ctx.beginPath();
          ctx.moveTo(screenX - monsterSize/2, screenY);
          for (let i = 0; i <= monsterSize; i += 5) {
            const waveY = screenY + Math.sin((i / 5) * Math.PI) * 3;
            ctx.lineTo(screenX - monsterSize/2 + i, waveY);
          }
          ctx.fill();
          ctx.globalAlpha = 1.0;
          break;
          
        case 'demon':
          // Red demon
          ctx.fillStyle = '#D32F2F';
          ctx.fillRect(screenX - monsterSize/2, screenY - monsterSize/2, monsterSize, monsterSize);
          // Horns
          ctx.fillStyle = '#B71C1C';
          ctx.fillRect(screenX - monsterSize/3, screenY - monsterSize/2 - 5, 3, 8);
          ctx.fillRect(screenX + monsterSize/3 - 3, screenY - monsterSize/2 - 5, 3, 8);
          // Glowing eyes
          ctx.fillStyle = '#FFEB3B';
          ctx.fillRect(screenX - monsterSize/4, screenY - monsterSize/3, 3, 3);
          ctx.fillRect(screenX + monsterSize/4 - 3, screenY - monsterSize/3, 3, 3);
          break;
          
        default:
          // Default monster (simple square)
          ctx.fillStyle = '#FF5722';
          ctx.fillRect(screenX - monsterSize/2, screenY - monsterSize/2, monsterSize, monsterSize);
      }
      
      // Health bar for monsters
      if (monster.health < monster.maxHealth) {
        const barWidth = monsterSize;
        const barHeight = 4;
        const healthPercent = monster.health / monster.maxHealth;
        
        // Background
        ctx.fillStyle = '#424242';
        ctx.fillRect(screenX - barWidth/2, screenY - monsterSize/2 - 8, barWidth, barHeight);
        
        // Health
        ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FF9800' : '#F44336';
        ctx.fillRect(screenX - barWidth/2, screenY - monsterSize/2 - 8, barWidth * healthPercent, barHeight);
      }
      
      // Check for and render shoreline transitions
      const shorelineTransition = detectShorelineTransition(customWorld, obj.x, obj.y, 32);
      if (shorelineTransition) {
        // Determine the correct asset based on orientation
        let assetKey = shorelineTransition.type;
        if (shorelineTransition.orientation === 'vertical') {
          assetKey = shorelineTransition.type + '-vertical';
        }
        
        const shorelineConfig = assetConfig[assetKey];
        const shorelineImage = renderCustomWorld.loadedImages?.[assetKey];
        
        if (shorelineConfig?.svgPath && shorelineImage) {
          // Render shoreline transition overlay
          ctx.globalAlpha = 0.9; // Slightly transparent for blending
          ctx.drawImage(shorelineImage, screenX, screenY, obj.width, obj.height);
          ctx.globalAlpha = 1.0; // Reset alpha
        }
      }
    }
  });
};

const drawPixelCircle = (ctx, centerX, centerY, radius) => {
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      if (dx * dx + dy * dy <= radius * radius) {
        ctx.fillRect(centerX + dx, centerY + dy, 1, 1);
      }
    }
  }
};

const drawSimplePlayer = (ctx, x, y, size) => {
  // Player body (circle)
  ctx.fillStyle = '#4169E1';
  ctx.beginPath();
  ctx.arc(x + size * 0.5, y + size * 0.5, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Player direction indicator
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + size * 0.6, y + size * 0.4, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
};

const drawPixelWater = (ctx, x, y, size, frameCount) => {
  // Base water color layers
  ctx.fillStyle = '#1565C0'; // Deep blue base
  ctx.fillRect(x, y, size, size);
  
  // Animated wave patterns
  const waveOffset1 = Math.sin(frameCount * 0.08 + x * 0.02 + y * 0.015) * 3;
  const waveOffset2 = Math.cos(frameCount * 0.12 + x * 0.015 + y * 0.02) * 2;
  
  // Medium blue layer
  ctx.fillStyle = '#1976D2';
  for (let i = 0; i < size; i += 4) {
    const waveY = y + Math.floor(size * 0.3) + Math.sin((i + frameCount * 0.1) * 0.3) * 2;
    ctx.fillRect(x + i, waveY, 4, Math.floor(size * 0.4));
  }
  
  // Light blue highlights
  ctx.fillStyle = '#42A5F5';
  for (let i = 0; i < size; i += 6) {
    const waveY = y + Math.floor(size * 0.2) + Math.sin((i + frameCount * 0.15) * 0.4) * 1;
    ctx.fillRect(x + i, waveY, 3, Math.floor(size * 0.3));
  }
  
  // Surface sparkles
  ctx.fillStyle = '#E3F2FD';
  const sparkleCount = 3;
  for (let i = 0; i < sparkleCount; i++) {
    const sparkleX = x + (i * size / sparkleCount) + waveOffset1;
    const sparkleY = y + Math.floor(size * 0.1) + waveOffset2;
    if (Math.sin(frameCount * 0.2 + i) > 0.5) {
      ctx.fillRect(sparkleX, sparkleY, 2, 2);
    }
  }
};

const drawSimpleMountain = (ctx, x, y, size) => {
  // Mountain triangle
  ctx.fillStyle = '#696969';
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x + size, y + size);
  ctx.closePath();
  ctx.fill();
  
  // Snow cap
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y);
  ctx.lineTo(x + size * 0.3, y + size * 0.3);
  ctx.lineTo(x + size * 0.7, y + size * 0.3);
  ctx.closePath();
  ctx.fill();
};

const drawSimpleCaveEntrance = (ctx, x, y, size) => {
  // Cave opening (dark circle)
  ctx.fillStyle = '#2F4F4F';
  ctx.fillRect(x, y, size, size);
  
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(x + size * 0.5, y + size * 0.5, size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  
  // Cave entrance highlight
  ctx.fillStyle = '#1C1C1C';
  ctx.beginPath();
  ctx.arc(x + size * 0.4, y + size * 0.3, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
};

const drawSimpleLava = (ctx, x, y, size, frameCount) => {
  // Animated lava
  const bubbleOffset = Math.sin(frameCount * 0.15 + x * 0.02 + y * 0.02) * 3;
  ctx.fillStyle = '#FF4500';
  ctx.fillRect(x, y, size, size);
  
  // Lava bubbles
  ctx.fillStyle = '#FF6347';
  ctx.beginPath();
  ctx.arc(x + size * 0.3 + bubbleOffset, y + size * 0.3 - bubbleOffset, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(x + size * 0.7 - bubbleOffset, y + size * 0.7 + bubbleOffset, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
};

const drawSimpleCrystal = (ctx, x, y, size, frameCount) => {
  // Glowing crystal
  const glow = Math.sin(frameCount * 0.1) * 0.3 + 0.7;
  ctx.fillStyle = '#9370DB';
  ctx.fillRect(x, y, size, size);
  
  // Crystal shape (diamond)
  ctx.fillStyle = `rgba(147, 112, 219, ${glow})`;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y + size * 0.1);
  ctx.lineTo(x + size * 0.8, y + size * 0.4);
  ctx.lineTo(x + size * 0.5, y + size * 0.9);
  ctx.lineTo(x + size * 0.2, y + size * 0.4);
  ctx.closePath();
  ctx.fill();
  
  // Crystal highlight
  ctx.fillStyle = `rgba(255, 255, 255, ${glow * 0.8})`;
  ctx.beginPath();
  ctx.moveTo(x + size * 0.5, y + size * 0.1);
  ctx.lineTo(x + size * 0.6, y + size * 0.3);
  ctx.lineTo(x + size * 0.5, y + size * 0.5);
  ctx.lineTo(x + size * 0.4, y + size * 0.3);
  ctx.closePath();
  ctx.fill();
};

const drawSimpleStairs = (ctx, x, y, size, isDown = true) => {
  // Stairs background
  ctx.fillStyle = '#8B7355';
  ctx.fillRect(x, y, size, size);
  
  // Stair steps
  ctx.fillStyle = '#A0522D';
  const stepHeight = size / 4;
  for (let i = 0; i < 4; i++) {
    const stepY = isDown ? y + i * stepHeight : y + (3 - i) * stepHeight;
    const stepWidth = size - i * (size / 8);
    const stepX = x + i * (size / 16);
    ctx.fillRect(stepX, stepY, stepWidth, stepHeight);
  }
  
  // Arrow indicator
  ctx.fillStyle = isDown ? '#FF0000' : '#00FF00';
  ctx.beginPath();
  if (isDown) {
    ctx.moveTo(x + size * 0.5, y + size * 0.8);
    ctx.lineTo(x + size * 0.3, y + size * 0.6);
    ctx.lineTo(x + size * 0.7, y + size * 0.6);
  } else {
    ctx.moveTo(x + size * 0.5, y + size * 0.2);
    ctx.lineTo(x + size * 0.3, y + size * 0.4);
    ctx.lineTo(x + size * 0.7, y + size * 0.4);
  }
  ctx.closePath();
  ctx.fill();
};

const drawPixelBridge = (ctx, x, y, size) => {
  // Bridge base (stone/wood)
  ctx.fillStyle = '#8D6E63'; // Brown base
  ctx.fillRect(x, y, size, size);
  
  // Wooden planks with pixel detail
  const plankCount = 4;
  const plankHeight = Math.floor(size / plankCount);
  
  for (let i = 0; i < plankCount; i++) {
    const plankY = y + i * plankHeight;
    
    // Main plank color
    ctx.fillStyle = i % 2 === 0 ? '#A1887F' : '#8D6E63';
    ctx.fillRect(x, plankY, size, plankHeight);
    
    // Wood grain texture
    ctx.fillStyle = '#6D4C41';
    for (let j = 0; j < 3; j++) {
      const grainX = x + j * Math.floor(size / 3) + Math.floor(size / 6);
      ctx.fillRect(grainX, plankY + 1, 1, plankHeight - 2);
    }
    
    // Plank separation lines
    if (i < plankCount - 1) {
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(x, plankY + plankHeight - 1, size, 1);
    }
  }
  
  // Bridge supports/posts
  ctx.fillStyle = '#4E342E';
  const postWidth = Math.floor(size * 0.12);
  ctx.fillRect(x + Math.floor(size * 0.1), y, postWidth, size);
  ctx.fillRect(x + size - Math.floor(size * 0.1) - postWidth, y, postWidth, size);
  
  // Post details
  ctx.fillStyle = '#3E2723';
  ctx.fillRect(x + Math.floor(size * 0.1) + 1, y, 1, size);
  ctx.fillRect(x + size - Math.floor(size * 0.1) - postWidth + 1, y, 1, size);
  
  // Bridge rivets/nails
  ctx.fillStyle = '#424242';
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 3; j++) {
      const rivetX = x + Math.floor(size * 0.2) + i * Math.floor(size * 0.6);
      const rivetY = y + Math.floor(size * 0.2) + j * Math.floor(size * 0.3);
      ctx.fillRect(rivetX, rivetY, 2, 2);
    }
  }
};

const SimpleCanvasRenderer = ({ 
  gameState, 
  canvasRef,
  customWorld = null,
  bushObstacles = []
}) => {
  const frameCountRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  const [treeImage, setTreeImage] = useState(null);
  const [shouldRender, setShouldRender] = useState(true);
  
  // Load tree SVG image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setTreeImage(img);
    img.onerror = () => console.warn('Failed to load tree SVG');
    img.src = treeSvg;
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    // Performance optimization: Skip rendering if FPS is too high
    const currentTime = performance.now();
    if (GAME_CONFIG.PERFORMANCE_MODE && currentTime - lastRenderTimeRef.current < 16.67) { // ~60 FPS limit
      return;
    }
    lastRenderTimeRef.current = currentTime;
    
    frameCountRef.current++;

    // Clear canvas with appropriate background
    const bgColor = gameState.depthLevel === 0 ? WORLD_COLORS.surface : WORLD_COLORS.cave;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    // Save context for camera transformation
    ctx.save();
    
    // Apply camera transformation
    ctx.translate(-gameState.camera.x, -gameState.camera.y);

    // Calculate visible area for viewport culling
    const visibleArea = {
      startTileX: Math.floor(gameState.camera.x / GAME_CONFIG.TILE_SIZE),
      endTileX: Math.ceil((gameState.camera.x + GAME_CONFIG.CANVAS_WIDTH) / GAME_CONFIG.TILE_SIZE),
      startTileY: Math.floor(gameState.camera.y / GAME_CONFIG.TILE_SIZE),
      endTileY: Math.ceil((gameState.camera.y + GAME_CONFIG.CANVAS_HEIGHT) / GAME_CONFIG.TILE_SIZE)
    };

    // Render terrain - use custom world if provided, otherwise use generated terrain
    if (customWorld) {
      renderCustomWorld(ctx, customWorld, gameState, visibleArea, frameCountRef.current);
    } else {
      renderSimpleTerrain(ctx, gameState, visibleArea, frameCountRef.current, treeImage);
      
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
    }

    // Render world boundaries
    renderWorldBoundaries(ctx, gameState);

    // Render game objects with pixel-style graphics
    renderPixelTreasureBoxes(ctx, gameState, visibleArea);
    renderPixelEnvironmentObjects(ctx, gameState, visibleArea);
    // Render bush obstacles passed from game (tile-based positions)
    renderSimpleBushObstacles(ctx, bushObstacles, gameState);
    renderPixelMonsters(ctx, gameState, visibleArea);
    renderSimplePlayer(ctx, gameState);

    // Restore context
    ctx.restore();

    // Render UI elements (not affected by camera)
    renderUI(ctx, gameState);

  }, [gameState, bushObstacles]);

  // This component doesn't render anything - it just handles canvas drawing
  return null;
};

// Custom world rendering for editor-designed worlds
// Function to detect shoreline transitions
const detectShorelineTransition = (customWorld, x, y, gridSize) => {
  if (!customWorld || !customWorld.objects) return null;
  
  const gridX = Math.floor(x / gridSize);
  const gridY = Math.floor(y / gridSize);
  
  // Find objects at current position and adjacent positions
  const getObjectAt = (gx, gy) => {
    return customWorld.objects.find(obj => 
      Math.floor(obj.x / gridSize) === gx && Math.floor(obj.y / gridSize) === gy
    );
  };
  
  const currentObj = getObjectAt(gridX, gridY);
  const topObj = getObjectAt(gridX, gridY - 1);
  const bottomObj = getObjectAt(gridX, gridY + 1);
  const leftObj = getObjectAt(gridX - 1, gridY);
  const rightObj = getObjectAt(gridX + 1, gridY);
  // Add diagonal neighbors for diagonal transitions
  const topLeftObj = getObjectAt(gridX - 1, gridY - 1);
  const topRightObj = getObjectAt(gridX + 1, gridY - 1);
  const bottomLeftObj = getObjectAt(gridX - 1, gridY + 1);
  const bottomRightObj = getObjectAt(gridX + 1, gridY + 1);
  
  // Debug logging
  if (currentObj && (currentObj.assetId === 'water' || currentObj.assetId === 'grass' || currentObj.assetId === 'lava' || currentObj.assetId === 'cave-floor')) {
    console.log(`Shoreline check at (${gridX}, ${gridY}):`, {
      current: currentObj?.assetId,
      top: topObj?.assetId,
      bottom: bottomObj?.assetId,
      left: leftObj?.assetId,
      right: rightObj?.assetId,
      gridSize,
      originalPos: { x, y }
    });
  }
  
  // Check for water-grass shoreline transitions
  // Vertical transitions (water above/below grass)
  if (currentObj?.assetId === 'water' && topObj?.assetId === 'grass') {
    const result = { type: 'water-grass-shoreline', orientation: 'horizontal', direction: 'water-below-grass' };
    console.log('Shoreline detected:', result);
    return result;
  }
  if (currentObj?.assetId === 'grass' && bottomObj?.assetId === 'water') {
    const result = { type: 'water-grass-shoreline', orientation: 'horizontal', direction: 'grass-above-water' };
    console.log('Shoreline detected:', result);
    return result;
  }
  
  // Horizontal transitions (water left/right of grass)
  if (currentObj?.assetId === 'water' && leftObj?.assetId === 'grass') {
    const result = { type: 'water-grass-shoreline', orientation: 'vertical', direction: 'water-right-of-grass' };
    console.log('Shoreline detected:', result);
    return result;
  }
  if (currentObj?.assetId === 'grass' && rightObj?.assetId === 'water') {
    const result = { type: 'water-grass-shoreline', orientation: 'vertical', direction: 'grass-left-of-water' };
    console.log('Shoreline detected:', result);
    return result;
  }
  if (currentObj?.assetId === 'water' && rightObj?.assetId === 'grass') {
    const result = { type: 'water-grass-shoreline', orientation: 'vertical', direction: 'water-left-of-grass' };
    console.log('Shoreline detected:', result);
    return result;
  }
  if (currentObj?.assetId === 'grass' && leftObj?.assetId === 'water') {
    const result = { type: 'water-grass-shoreline', orientation: 'vertical', direction: 'grass-right-of-water' };
    console.log('Shoreline detected:', result);
    return result;
  }
  
  // Check for lava-cave floor shoreline transitions
  // Vertical transitions (lava above/below cave floor)
  if (currentObj?.assetId === 'lava' && topObj?.assetId === 'cave-floor') {
    const result = { type: 'lava-cave-shoreline', orientation: 'horizontal', direction: 'lava-below-cave' };
    console.log('Shoreline detected:', result);
    return result;
  }
  if (currentObj?.assetId === 'cave-floor' && bottomObj?.assetId === 'lava') {
    const result = { type: 'lava-cave-shoreline', orientation: 'horizontal', direction: 'cave-above-lava' };
    console.log('Shoreline detected:', result);
    return result;
  }
  
  // Horizontal transitions (lava left/right of cave floor)
  if (currentObj?.assetId === 'lava' && leftObj?.assetId === 'cave-floor') {
    const result = { type: 'lava-cave-shoreline', orientation: 'vertical', direction: 'lava-right-of-cave' };
    console.log('Shoreline detected:', result);
    return result;
  }
  if (currentObj?.assetId === 'cave-floor' && rightObj?.assetId === 'lava') {
    const result = { type: 'lava-cave-shoreline', orientation: 'vertical', direction: 'cave-left-of-lava' };
    console.log('Shoreline detected:', result);
    return result;
  }
  if (currentObj?.assetId === 'lava' && rightObj?.assetId === 'cave-floor') {
    const result = { type: 'lava-cave-shoreline', orientation: 'vertical', direction: 'lava-left-of-cave' };
    console.log('Shoreline detected:', result);
    return result;
  }
  if (currentObj?.assetId === 'cave-floor' && leftObj?.assetId === 'lava') {
    const result = { type: 'lava-cave-shoreline', orientation: 'vertical', direction: 'cave-right-of-lava' };
    console.log('Shoreline detected:', result);
    return result;
  }
  
  // Check for diagonal water-grass shoreline transitions
  // Top-left to bottom-right diagonal (grass top-left, water bottom-right)
  if (currentObj?.assetId === 'grass' && bottomRightObj?.assetId === 'water' && 
      !topObj?.assetId && !leftObj?.assetId) {
    const result = { type: 'water-grass-shoreline-diagonal-tl-br', orientation: 'diagonal', direction: 'grass-tl-water-br' };
    console.log('Diagonal shoreline detected:', result);
    return result;
  }
  
  // Top-right to bottom-left diagonal (grass top-right, water bottom-left)
  if (currentObj?.assetId === 'grass' && bottomLeftObj?.assetId === 'water' && 
      !topObj?.assetId && !rightObj?.assetId) {
    const result = { type: 'water-grass-shoreline-diagonal-tr-bl', orientation: 'diagonal', direction: 'grass-tr-water-bl' };
    console.log('Diagonal shoreline detected:', result);
    return result;
  }
  
  // Inverted corner (water in corner, grass surrounding)
  if (currentObj?.assetId === 'water' && topObj?.assetId === 'grass' && leftObj?.assetId === 'grass' && 
      topLeftObj?.assetId === 'grass') {
    const result = { type: 'water-grass-shoreline-inverted-corner', orientation: 'corner', direction: 'water-corner-grass-surround' };
    console.log('Inverted corner shoreline detected:', result);
    return result;
  }
  
  return null;
};

const renderCustomWorld = (ctx, customWorld, gameState, visibleArea, frameCount) => {
  if (!customWorld || !customWorld.objects) return;

  // Asset configuration with SVG paths
  const assetConfig = {
    grass: { color: '#4CAF50' },
    rock: { color: '#757575', svgPath: '/src/assets/realistic-rock.svg' },
    water: { color: '#2196F3', svgPath: '/src/assets/realistic-water.svg' },
    tree: { color: '#388E3C', svgPath: '/src/assets/realistic-tree.svg' },
    'realistic-tree': { color: '#388E3C', svgPath: '/src/assets/realistic-tree.svg' },
    treasure: { color: '#FFD700', svgPath: '/src/assets/realistic-treasure.svg' },
    spawn: { color: '#FF5722', svgPath: '/src/assets/realistic-spawn.svg' },
    bridge: { color: '#8D6E63', svgPath: '/src/assets/realistic-bridge.svg' },
    cave: { color: '#424242', svgPath: '/src/assets/realistic-cave.svg' },
    'grass-rock-transition': { color: '#7CB342', svgPath: '/src/assets/realistic-grass-rock-transition.svg' },
    'large-tree': { color: '#2E7D32', svgPath: '/assets/large-tree.svg' },
    'large-rock': { color: '#616161', svgPath: '/assets/large-rock.svg' },
    'cave-entrance': { color: '#1A1A1A', svgPath: '/assets/cave-entrance.svg' },
    'monster-goblin': { color: '#8BC34A', svgPath: '/assets/monster-goblin.svg' },
    'monster-orc': { color: '#FF5722', svgPath: '/assets/monster-orc.svg' },
    'monster-dragon': { color: '#F44336', svgPath: '/assets/monster-dragon.svg' },
    // Cave-themed assets
    'cave-water': { color: '#1976D2', svgPath: '/src/assets/realistic-cave-water.svg' },
    'cave-floor': { color: '#3E2723', svgPath: '/src/assets/realistic-cave-floor.svg' },
    'cave-pit': { color: '#212121', svgPath: '/src/assets/realistic-cave-pit.svg' },
    'mushroom': { color: '#FF9800', svgPath: '/src/assets/realistic-cave-mushroom.svg' },
    'stalactite': { color: '#795548', svgPath: '/src/assets/realistic-stalactite.svg' },
    'stalagmite': { color: '#8D6E63', svgPath: '/src/assets/realistic-stalagmite.svg' },
    'cave-wall': { color: '#424242', svgPath: '/src/assets/realistic-cave-wall.svg' },
    'lava-rock': { color: '#BF360C', svgPath: '/src/assets/realistic-lava-rock.svg' },
    'cave-crystal': { color: '#9C27B0', svgPath: '/src/assets/realistic-cave-crystal.svg' },
     lava: { color: '#FF5722', svgPath: '/src/assets/realistic-lava.svg' },
    // Shoreline transition assets
    'water-grass-shoreline': { color: '#4CAF50', svgPath: '/src/assets/realistic-water-grass-shoreline.svg' },
    'water-grass-shoreline-vertical': { color: '#4CAF50', svgPath: '/src/assets/realistic-water-grass-shoreline-vertical.svg' },
    'water-grass-shoreline-diagonal-tl-br': { color: '#4CAF50', svgPath: '/src/assets/realistic-water-grass-shoreline-diagonal-tl-br.svg' },
    'water-grass-shoreline-diagonal-tr-bl': { color: '#4CAF50', svgPath: '/src/assets/realistic-water-grass-shoreline-diagonal-tr-bl.svg' },
    'water-grass-shoreline-inverted-corner': { color: '#4CAF50', svgPath: '/src/assets/realistic-water-grass-shoreline-inverted-corner.svg' },
    'lava-cave-shoreline': { color: '#3E2723', svgPath: '/src/assets/realistic-lava-cave-shoreline.svg' },
    'lava-cave-shoreline-vertical': { color: '#3E2723', svgPath: '/src/assets/realistic-lava-cave-shoreline-vertical.svg' }
  };

  // Load SVG images if not already loaded
  if (!renderCustomWorld.loadedImages) {
    renderCustomWorld.loadedImages = {};
    Object.entries(assetConfig).forEach(([assetId, config]) => {
      if (config.svgPath) {
        const img = new Image();
        img.onload = () => {
          renderCustomWorld.loadedImages[assetId] = img;
        };
        img.src = config.svgPath;
      }
    });
  }

  // Render background first
  ctx.fillStyle = '#FFFFFF'; // White background
  ctx.fillRect(0, 0, customWorld.width || 800, customWorld.height || 600);

  // Render all world objects
  customWorld.objects.forEach(obj => {
    const screenX = obj.x - gameState.camera.x;
    const screenY = obj.y - gameState.camera.y;
    
    // Only render if visible
    if (screenX >= -obj.width && screenX <= GAME_CONFIG.CANVAS_WIDTH &&
        screenY >= -obj.height && screenY <= GAME_CONFIG.CANVAS_HEIGHT) {
      
      const config = assetConfig[obj.assetId] || { color: '#CCCCCC' };
      const loadedImage = renderCustomWorld.loadedImages?.[obj.assetId];
      
      // Use SVG image if available, otherwise fall back to custom rendering
      if (config.svgPath && loadedImage) {
        ctx.drawImage(loadedImage, screenX, screenY, obj.width, obj.height);
        
        // Add special effects for certain assets
        if (obj.assetId === 'treasure' && !obj.collected) {
          const glowIntensity = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
          ctx.fillStyle = `rgba(255, 215, 0, ${glowIntensity * 0.3})`;
          ctx.fillRect(screenX - 4, screenY - 4, obj.width + 8, obj.height + 8);
          // Redraw the treasure image on top of the glow
          ctx.drawImage(loadedImage, screenX, screenY, obj.width, obj.height);
        }
      } else {
        // Fallback to original rendering for assets without SVG or while loading
        switch (obj.assetId) {
          case 'grass':
            // Grass background
            ctx.fillStyle = config.color;
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
            // Add grass texture
            ctx.fillStyle = '#66BB6A';
            for (let i = 0; i < 8; i++) {
              const grassX = screenX + (i * 4) % obj.width;
              const grassY = screenY + ((i * 3) % obj.height);
              ctx.fillRect(grassX, grassY, 1, 3);
            }
            break;
          case 'water':
            drawPixelWater(ctx, screenX, screenY, obj.width, frameCount);
            break;
          case 'tree':
            // Tree background
            ctx.fillStyle = config.color;
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
            // Tree trunk
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(screenX + obj.width * 0.4, screenY + obj.height * 0.6, obj.width * 0.2, obj.height * 0.4);
            // Tree foliage
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.arc(screenX + obj.width * 0.5, screenY + obj.height * 0.3, obj.width * 0.4, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'treasure':
            // Render treasure box with glow effect
            if (!obj.collected) {
              const glowIntensity = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
              ctx.fillStyle = `rgba(255, 215, 0, ${glowIntensity * 0.5})`;
              ctx.fillRect(screenX - 6, screenY - 6, obj.width + 12, obj.height + 12);
            }
            ctx.fillStyle = config.color;
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
            // Add treasure details
            ctx.fillStyle = '#B8860B';
            ctx.fillRect(screenX + 2, screenY + 2, obj.width - 4, obj.height - 4);
            break;
          case 'spawn':
            // Player spawn point with pulsing effect
            const pulseIntensity = Math.sin(Date.now() * 0.008) * 0.2 + 0.8;
            ctx.fillStyle = `rgba(255, 87, 34, ${pulseIntensity})`;
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
            // Add spawn marker
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('S', screenX + obj.width/2, screenY + obj.height/2 + 5);
            break;
          case 'bridge':
            drawPixelBridge(ctx, screenX, screenY, obj.width);
            break;
          case 'cave':
            drawSimpleCaveEntrance(ctx, screenX, screenY, obj.width);
            break;
          case 'cave-entrance':
            // Cave entrance with dark opening
            ctx.fillStyle = '#654321';
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(screenX + obj.width/2, screenY + obj.height/2, obj.width * 0.3, 0, Math.PI * 2);
            ctx.fill();
            // Add glow effect for level connection
            if (obj.properties?.hasLevelConnection) {
              const glowIntensity = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
              ctx.fillStyle = `rgba(255, 255, 0, ${glowIntensity * 0.3})`;
              ctx.fillRect(screenX - 4, screenY - 4, obj.width + 8, obj.height + 8);
            }
            break;
          case 'large-tree':
            // Large tree with trunk and canopy
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(screenX + obj.width * 0.3, screenY + obj.height * 0.5, obj.width * 0.4, obj.height * 0.5);
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.arc(screenX + obj.width * 0.5, screenY + obj.height * 0.3, obj.width * 0.4, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'large-rock':
            // Large rock formation
            ctx.fillStyle = config.color;
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
            ctx.fillStyle = 'rgba(105, 105, 105, 0.7)';
            for (let i = 0; i < 6; i++) {
              const rockX = screenX + (i * 16) % (obj.width - 8);
              const rockY = screenY + ((i * 12) % (obj.height - 8));
              ctx.beginPath();
              ctx.arc(rockX + 4, rockY + 4, 4, 0, Math.PI * 2);
              ctx.fill();
            }
            break;
          case 'monster-goblin':
          case 'monster-orc':
          case 'monster-dragon':
            // Monster with basic shape
            ctx.fillStyle = config.color;
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
            // Add eyes
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(screenX + obj.width * 0.3, screenY + obj.height * 0.3, 3, 0, Math.PI * 2);
            ctx.arc(screenX + obj.width * 0.7, screenY + obj.height * 0.3, 3, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'rock':
            // Rock with texture
            ctx.fillStyle = config.color;
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
            // Add rock texture
            ctx.fillStyle = 'rgba(105, 105, 105, 0.5)';
            for (let i = 0; i < 3; i++) {
              const rockX = screenX + (i * 12) % (obj.width - 6);
              const rockY = screenY + ((i * 8) % (obj.height - 6));
              ctx.beginPath();
              ctx.arc(rockX + 3, rockY + 3, 3, 0, Math.PI * 2);
              ctx.fill();
            }
            break;
          case 'lava':
            // Animated lava with bubbles
            const bubbleOffset = Math.sin(Date.now() * 0.003 + screenX * 0.01) * 3;
            ctx.fillStyle = '#FF5722';
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
            ctx.fillStyle = '#FF6347';
            ctx.beginPath();
            ctx.arc(screenX + obj.width * 0.3 + bubbleOffset, screenY + obj.height * 0.3, obj.width * 0.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(screenX + obj.width * 0.7 - bubbleOffset, screenY + obj.height * 0.7, obj.width * 0.08, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'cave-water':
            // Dark cave water with subtle animation
            ctx.fillStyle = '#1976D2';
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
            const waveOffset = Math.sin(Date.now() * 0.002 + screenX * 0.02) * 2;
            ctx.fillStyle = '#2196F3';
            for (let i = 0; i < obj.width; i += 8) {
              const waveY = screenY + obj.height * 0.3 + waveOffset;
              ctx.fillRect(screenX + i, waveY, 4, obj.height * 0.4);
            }
            break;
          case 'stalactite':
            // Hanging stalactite
            ctx.fillStyle = config.color;
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
            ctx.fillStyle = '#8D6E63';
            ctx.beginPath();
            ctx.moveTo(screenX + obj.width * 0.5, screenY);
            ctx.lineTo(screenX + obj.width * 0.3, screenY + obj.height * 0.7);
            ctx.lineTo(screenX + obj.width * 0.7, screenY + obj.height * 0.7);
            ctx.closePath();
            ctx.fill();
            break;
          case 'stalagmite':
            // Rising stalagmite
            ctx.fillStyle = config.color;
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
            ctx.fillStyle = '#8D6E63';
            ctx.beginPath();
            ctx.moveTo(screenX + obj.width * 0.5, screenY + obj.height * 0.3);
            ctx.lineTo(screenX + obj.width * 0.3, screenY + obj.height);
            ctx.lineTo(screenX + obj.width * 0.7, screenY + obj.height);
            ctx.closePath();
            ctx.fill();
            break;
          case 'cave-crystal':
            // Glowing crystal
            const glow = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
            ctx.fillStyle = config.color;
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
            ctx.fillStyle = `rgba(156, 39, 176, ${glow})`;
            ctx.beginPath();
            ctx.moveTo(screenX + obj.width * 0.5, screenY + obj.height * 0.1);
            ctx.lineTo(screenX + obj.width * 0.8, screenY + obj.height * 0.4);
            ctx.lineTo(screenX + obj.width * 0.5, screenY + obj.height * 0.9);
            ctx.lineTo(screenX + obj.width * 0.2, screenY + obj.height * 0.4);
            ctx.closePath();
            ctx.fill();
            // Crystal highlight
            ctx.fillStyle = `rgba(255, 255, 255, ${glow * 0.8})`;
            ctx.beginPath();
            ctx.moveTo(screenX + obj.width * 0.5, screenY + obj.height * 0.1);
            ctx.lineTo(screenX + obj.width * 0.6, screenY + obj.height * 0.3);
            ctx.lineTo(screenX + obj.width * 0.5, screenY + obj.height * 0.5);
            ctx.lineTo(screenX + obj.width * 0.4, screenY + obj.height * 0.3);
            ctx.closePath();
            ctx.fill();
            break;
          case 'cave-floor':
            // Textured cave floor
            ctx.fillStyle = config.color;
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
            ctx.fillStyle = '#4E342E';
            for (let i = 0; i < 6; i++) {
              const dotX = screenX + (i * 8) % obj.width;
              const dotY = screenY + ((i * 6) % obj.height);
              ctx.fillRect(dotX, dotY, 2, 2);
            }
            break;
          case 'cave-wall':
            // Rough cave wall
            ctx.fillStyle = config.color;
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
            ctx.fillStyle = '#616161';
            for (let i = 0; i < 8; i++) {
              const rockX = screenX + (i * 7) % (obj.width - 4);
              const rockY = screenY + ((i * 5) % (obj.height - 4));
              ctx.beginPath();
              ctx.arc(rockX + 2, rockY + 2, 2, 0, Math.PI * 2);
              ctx.fill();
            }
            break;
          case 'mushroom':
            // Glowing cave mushroom
            ctx.fillStyle = config.color;
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
            // Mushroom stem
            ctx.fillStyle = '#FFF3E0';
            ctx.fillRect(screenX + obj.width * 0.4, screenY + obj.height * 0.5, obj.width * 0.2, obj.height * 0.5);
            // Mushroom cap
            ctx.fillStyle = '#FF9800';
            ctx.beginPath();
            ctx.arc(screenX + obj.width * 0.5, screenY + obj.height * 0.4, obj.width * 0.3, 0, Math.PI * 2);
            ctx.fill();
            // Glow effect
            const mushroomGlow = Math.sin(Date.now() * 0.004) * 0.2 + 0.8;
            ctx.fillStyle = `rgba(255, 152, 0, ${mushroomGlow * 0.3})`;
            ctx.beginPath();
            ctx.arc(screenX + obj.width * 0.5, screenY + obj.height * 0.4, obj.width * 0.4, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'lava-rock':
            // Hot lava rock
            ctx.fillStyle = config.color;
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
            const heatGlow = Math.sin(Date.now() * 0.006) * 0.4 + 0.6;
            ctx.fillStyle = `rgba(255, 87, 34, ${heatGlow})`;
            for (let i = 0; i < 4; i++) {
              const hotX = screenX + (i * 12) % (obj.width - 6);
              const hotY = screenY + ((i * 8) % (obj.height - 6));
              ctx.beginPath();
              ctx.arc(hotX + 3, hotY + 3, 3, 0, Math.PI * 2);
              ctx.fill();
            }
            break;
          case 'cave-pit':
            // Dark cave pit
            ctx.fillStyle = config.color;
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
            // Inner darkness
            ctx.fillStyle = '#000000';
            ctx.fillRect(screenX + 4, screenY + 4, obj.width - 8, obj.height - 8);
            // Pit edges
            ctx.fillStyle = '#424242';
            ctx.strokeRect(screenX + 2, screenY + 2, obj.width - 4, obj.height - 4);
            break;
          default:
            // Default rendering for other assets
            ctx.fillStyle = config.color;
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
            break;
        }
      }
      
      // Add border for non-walkable objects (except seamless assets)
      const seamlessAssets = ['water', 'grass', 'bridge', 'tree', 'rock', 'lava', 'cave-water', 'cave-floor', 'mushroom'];
      if (!obj.walkable && !seamlessAssets.includes(obj.assetId)) {
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, obj.width, obj.height);
      }
      
      // Add asset name label (except for seamless assets)
      if (!seamlessAssets.includes(obj.assetId)) {
        ctx.fillStyle = '#000000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(
          obj.assetId.charAt(0).toUpperCase() + obj.assetId.slice(1),
          screenX + obj.width / 2,
          screenY + obj.height / 2 + 3
        );
      }
      
      // Render HP bar for monsters
      if (obj.assetId.startsWith('monster-') && obj.properties?.hp !== undefined) {
        const maxHp = obj.properties.maxHp || 100;
        const currentHp = obj.properties.hp;
        const hpPercentage = currentHp / maxHp;
        
        // HP bar background
        ctx.fillStyle = '#000000';
        ctx.fillRect(screenX, screenY - 8, obj.width, 4);
        
        // HP bar fill
        let hpColor = '#00FF00'; // Green
        if (hpPercentage < 0.3) hpColor = '#FF0000'; // Red
        else if (hpPercentage < 0.6) hpColor = '#FFFF00'; // Yellow
        
        ctx.fillStyle = hpColor;
        ctx.fillRect(screenX, screenY - 8, obj.width * hpPercentage, 4);
        
        // HP text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${currentHp}/${maxHp}`, screenX + obj.width / 2, screenY - 10);
      }
      
      // Check for and render shoreline transitions
      const shorelineTransition = detectShorelineTransition(customWorld, obj.x, obj.y, 32);
      if (shorelineTransition) {
        let shorelineAssetKey = shorelineTransition.type;
        
        // Use vertical shoreline asset for vertical orientation
        if (shorelineTransition.orientation === 'vertical') {
          shorelineAssetKey = shorelineTransition.type + '-vertical';
        }
        
        console.log('Rendering shoreline:', {
          transition: shorelineTransition,
          assetKey: shorelineAssetKey,
          position: { x: obj.x, y: obj.y },
          screenPos: { x: screenX, y: screenY }
        });
        
        const shorelineConfig = assetConfig[shorelineAssetKey];
        const shorelineImage = renderCustomWorld.loadedImages?.[shorelineAssetKey];
        
        console.log('Shoreline assets:', {
          config: shorelineConfig,
          imageLoaded: !!shorelineImage,
          allLoadedImages: Object.keys(renderCustomWorld.loadedImages || {})
        });
        
        if (shorelineConfig?.svgPath && shorelineImage) {
          // Render shoreline transition overlay
          ctx.globalAlpha = 0.9; // Slightly transparent for blending
          ctx.drawImage(shorelineImage, screenX, screenY, obj.width, obj.height);
          ctx.globalAlpha = 1.0; // Reset alpha
          console.log('Shoreline rendered successfully');
        } else {
          console.log('Shoreline NOT rendered - missing config or image');
        }
      }
    }
  });
};

// Optimized terrain rendering with batching
const renderSimpleTerrain = (ctx, gameState, visibleArea, frameCount, treeImage) => {
  const { startTileX, endTileX, startTileY, endTileY } = visibleArea;
  
  // Batch similar terrain types to reduce draw calls
  const terrainBatches = new Map();

  // First pass: collect terrain tiles by type
  for (let tileX = startTileX; tileX <= endTileX; tileX++) {
    for (let tileY = startTileY; tileY <= endTileY; tileY++) {
      const chunkX = Math.floor(tileX / GAME_CONFIG.CHUNK_SIZE);
      const chunkY = Math.floor(tileY / GAME_CONFIG.CHUNK_SIZE);
      const chunkKey = `${chunkX},${chunkY}`;
      
      const chunk = gameState.terrain?.get(chunkKey);
      if (!chunk) continue;
      
      const localX = tileX % GAME_CONFIG.CHUNK_SIZE;
      const localY = tileY % GAME_CONFIG.CHUNK_SIZE;
      const tile = chunk.find(t => 
        t.x % GAME_CONFIG.CHUNK_SIZE === localX && 
        t.y % GAME_CONFIG.CHUNK_SIZE === localY
      );
      
      if (!tile) continue;
      
      const x = tileX * GAME_CONFIG.TILE_SIZE;
      const y = tileY * GAME_CONFIG.TILE_SIZE;
      
      // Batch tiles by type for efficient rendering
      if (!terrainBatches.has(tile.type)) {
        terrainBatches.set(tile.type, []);
      }
      terrainBatches.get(tile.type).push({ x, y, tile });
    }
  }
  
  // Second pass: render batched terrain types
  const size = GAME_CONFIG.TILE_SIZE;
  
  for (const [terrainType, tiles] of terrainBatches) {
    // Set color once per terrain type
    ctx.fillStyle = TERRAIN_TYPES[terrainType].color;
    
    // Render all tiles of this type
    for (const { x, y, tile } of tiles) {
      ctx.fillRect(x, y, size, size);
      
      // Add patterns and details based on terrain type (optimized)
      switch (terrainType) {
        case 'FOREST':
          // Grass background for all forest tiles
          ctx.fillStyle = '#4CAF50';
          for (const { x, y } of tiles) {
            ctx.fillRect(x, y, size, size);
          }
          // Add grass texture (reduced detail for performance)
          ctx.fillStyle = '#66BB6A';
          for (const { x, y } of tiles) {
            if (GAME_CONFIG.PERFORMANCE_MODE && (x + y) % (GAME_CONFIG.PATTERN_RENDER_FREQUENCY * GAME_CONFIG.TILE_SIZE) !== 0) continue;
            for (let i = 0; i < 4; i++) { // Reduced from 8 to 4
              const grassX = x + (i * 8) % size;
              const grassY = y + ((i * 6) % size);
              ctx.fillRect(grassX, grassY, 1, 3);
            }
          }
          // Draw trees (reduced frequency for performance)
          for (const { x, y } of tiles) {
            if (!GAME_CONFIG.PERFORMANCE_MODE || (x + y) % (GAME_CONFIG.TILE_SIZE * 2) === 0) {
              drawSvgTree(ctx, x, y, size, treeImage);
            }
          }
          break;
        case 'WATER':
          for (const { x, y } of tiles) {
            drawPixelWater(ctx, x, y, size, frameCount);
          }
          break;
        case 'MOUNTAIN':
          for (const { x, y } of tiles) {
            drawSimpleMountain(ctx, x, y, size);
          }
          break;
        case 'CAVE_ENTRANCE':
          for (const { x, y } of tiles) {
            drawSimpleCaveEntrance(ctx, x, y, size);
          }
          break;
        case 'LAVA':
          for (const { x, y } of tiles) {
            drawSimpleLava(ctx, x, y, size, frameCount);
          }
          break;
        case 'CRYSTAL':
          for (const { x, y } of tiles) {
            drawSimpleCrystal(ctx, x, y, size, frameCount);
          }
          break;
        case 'STAIRS_DOWN':
          for (const { x, y } of tiles) {
            drawSimpleStairs(ctx, x, y, size, true);
          }
          break;
        case 'STAIRS_UP':
          for (const { x, y } of tiles) {
            drawSimpleStairs(ctx, x, y, size, false);
          }
          break;
        case 'BRIDGE':
          for (const { x, y } of tiles) {
            drawPixelBridge(ctx, x, y, size);
          }
          break;
        case 'HIGH_GRASS':
          // Add grass texture (optimized)
          ctx.fillStyle = 'rgba(34, 139, 34, 0.3)';
          for (const { x, y } of tiles) {
            if (GAME_CONFIG.PERFORMANCE_MODE && (x + y) % (GAME_CONFIG.PATTERN_RENDER_FREQUENCY * GAME_CONFIG.TILE_SIZE) !== 0) continue;
            for (let i = 0; i < 3; i++) { // Reduced from 5 to 3
              const grassX = x + (i * 12) % size;
              const grassY = y + ((i * 8) % size);
              ctx.fillRect(grassX, grassY, 2, 6); // Reduced height
            }
          }
          break;
        case 'ROCKY_GROUND':
          // Add rock texture (optimized)
          ctx.fillStyle = 'rgba(105, 105, 105, 0.5)';
          for (const { x, y } of tiles) {
            if (GAME_CONFIG.PERFORMANCE_MODE && (x + y) % (GAME_CONFIG.PATTERN_RENDER_FREQUENCY * GAME_CONFIG.TILE_SIZE) !== 0) continue;
            for (let i = 0; i < 2; i++) { // Reduced from 3 to 2
              const rockX = x + (i * 16) % (size - 6);
              const rockY = y + ((i * 12) % (size - 6));
              ctx.beginPath();
              ctx.arc(rockX + 3, rockY + 3, 2, 0, Math.PI * 2); // Smaller rocks
              ctx.fill();
            }
          }
          break;
      }
    }
  }
};

// Enhanced pixel-style treasure box rendering
const renderPixelTreasureBoxes = (ctx, gameState, visibleArea) => {
  
  gameState.treasureBoxes.forEach(box => {
    const screenX = box.x - gameState.camera.x;
    const screenY = box.y - gameState.camera.y;
    
    // Only render if visible
    if (screenX >= -GAME_CONFIG.TILE_SIZE && screenX <= GAME_CONFIG.CANVAS_WIDTH &&
        screenY >= -GAME_CONFIG.TILE_SIZE && screenY <= GAME_CONFIG.CANVAS_HEIGHT) {
      
      const boxSize = GAME_CONFIG.TREASURE_SIZE;
      const boxHeight = GAME_CONFIG.TREASURE_SIZE * 0.8;
      const left = screenX - boxSize / 2;
      const top = screenY - boxHeight / 2;
      
      // Debug: Draw a bright outline to make treasure boxes more visible
      ctx.strokeStyle = '#FF00FF'; // Magenta outline for debugging
      ctx.lineWidth = 2;
      ctx.strokeRect(left - 2, top - 2, boxSize + 4, boxHeight + 4);
      
      if (!box.collected && !box.opened) {
        // Animated glow effect for unopened boxes
        const glowIntensity = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 215, 0, ${glowIntensity * 0.5})`;
        ctx.fillRect(left - 6, top - 6, boxSize + 12, boxHeight + 12);
      }
      
      // Main treasure box body
      ctx.fillStyle = (box.collected || box.opened) ? '#8B4513' : '#B8860B'; // Dark gold
      ctx.fillRect(left, top + boxHeight * 0.3, boxSize, boxHeight * 0.7);
      
      // Box body details
      if (!box.collected) {
        // Gold highlights
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(left + 2, top + boxHeight * 0.3 + 2, boxSize - 4, boxHeight * 0.7 - 4);
        
        // Corner reinforcements
        ctx.fillStyle = '#DAA520';
        const cornerSize = 4;
        // Top corners
        ctx.fillRect(left, top + boxHeight * 0.3, cornerSize, cornerSize);
        ctx.fillRect(left + boxSize - cornerSize, top + boxHeight * 0.3, cornerSize, cornerSize);
        // Bottom corners
        ctx.fillRect(left, top + boxHeight - cornerSize, cornerSize, cornerSize);
        ctx.fillRect(left + boxSize - cornerSize, top + boxHeight - cornerSize, cornerSize, cornerSize);
      }
      
      if (box.opened) {
        // Opened treasure box - lid is rotated back
        ctx.save();
        ctx.translate(left + boxSize * 0.5, top + boxHeight * 0.2);
        ctx.rotate(-Math.PI * 0.3); // Rotate lid back
        ctx.fillStyle = '#FF8C00';
        ctx.fillRect(-boxSize * 0.5, -boxHeight * 0.2, boxSize, boxHeight * 0.4);
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(-boxSize * 0.5 + 2, -boxHeight * 0.2 + 2, boxSize - 4, boxHeight * 0.4 - 4);
        ctx.restore();
        
        // Treasure contents visible inside
        // Gold coins
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(left + boxSize * 0.3, top + boxHeight * 0.6, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(left + boxSize * 0.5, top + boxHeight * 0.7, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(left + boxSize * 0.7, top + boxHeight * 0.6, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Gems
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(left + boxSize * 0.4, top + boxHeight * 0.5, 3, 3);
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(left + boxSize * 0.6, top + boxHeight * 0.5, 3, 3);
        
        // Magical glow from opened treasure
        const glowIntensity = Math.sin(Date.now() * 0.008) * 0.4 + 0.6;
        ctx.fillStyle = `rgba(255, 255, 0, ${glowIntensity * 0.3})`;
        ctx.fillRect(left + 4, top + boxHeight * 0.4, boxSize - 8, boxHeight * 0.5);
        
      } else {
        // Closed treasure box lid
        ctx.fillStyle = box.collected ? '#654321' : '#FF8C00'; // Orange lid
        ctx.fillRect(left, top, boxSize, boxHeight * 0.4);
        
        if (!box.collected) {
          // Lid highlight
          ctx.fillStyle = '#FFA500';
          ctx.fillRect(left + 2, top + 2, boxSize - 4, boxHeight * 0.4 - 4);
          
          // Lid handle/lock
          ctx.fillStyle = '#8B4513';
          const handleX = left + boxSize * 0.4;
          const handleY = top + boxHeight * 0.1;
          ctx.fillRect(handleX, handleY, boxSize * 0.2, boxHeight * 0.2);
          
          // Lock keyhole
          ctx.fillStyle = '#000000';
          ctx.fillRect(handleX + boxSize * 0.08, handleY + boxHeight * 0.08, boxSize * 0.04, boxHeight * 0.04);
          
          // Magical sparkles for unopened boxes
          const sparkleCount = 3;
          ctx.fillStyle = '#FFFF00';
          for (let i = 0; i < sparkleCount; i++) {
            const angle = (Date.now() * 0.01 + i * Math.PI * 2 / sparkleCount) % (Math.PI * 2);
            const sparkleX = left + boxSize * 0.5 + Math.cos(angle) * (boxSize * 0.6);
            const sparkleY = top + boxHeight * 0.5 + Math.sin(angle) * (boxHeight * 0.6);
            if (Math.sin(Date.now() * 0.01 + i) > 0.3) {
              ctx.fillRect(sparkleX, sparkleY, 2, 2);
              ctx.fillRect(sparkleX - 1, sparkleY, 1, 2);
              ctx.fillRect(sparkleX + 1, sparkleY, 1, 2);
              ctx.fillRect(sparkleX, sparkleY - 1, 2, 1);
              ctx.fillRect(sparkleX, sparkleY + 1, 2, 1);
            }
          }
        }
      }
    }
  });
};

const renderSimpleMonsters = (ctx, gameState, visibleArea) => {
  gameState.monsters.forEach(monster => {
    const screenX = monster.x - gameState.camera.x;
    const screenY = monster.y - gameState.camera.y;
    
    // Only render if visible
    if (screenX >= -GAME_CONFIG.TILE_SIZE && screenX <= GAME_CONFIG.CANVAS_WIDTH &&
        screenY >= -GAME_CONFIG.TILE_SIZE && screenY <= GAME_CONFIG.CANVAS_HEIGHT) {
      
      // Monster body (red circle)
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(screenX + GAME_CONFIG.TILE_SIZE * 0.5, screenY + GAME_CONFIG.TILE_SIZE * 0.5, 
              GAME_CONFIG.TILE_SIZE * 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Monster eyes
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(screenX + GAME_CONFIG.TILE_SIZE * 0.4, screenY + GAME_CONFIG.TILE_SIZE * 0.4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(screenX + GAME_CONFIG.TILE_SIZE * 0.6, screenY + GAME_CONFIG.TILE_SIZE * 0.4, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Health bar
      const healthBarWidth = GAME_CONFIG.TILE_SIZE * 0.8;
      const healthBarHeight = 4;
      const healthPercentage = monster.health / monster.maxHealth;
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(screenX + GAME_CONFIG.TILE_SIZE * 0.1, screenY - 10, healthBarWidth, healthBarHeight);
      
      ctx.fillStyle = healthPercentage > 0.5 ? '#00FF00' : healthPercentage > 0.25 ? '#FFFF00' : '#FF0000';
      ctx.fillRect(screenX + GAME_CONFIG.TILE_SIZE * 0.1, screenY - 10, 
                   healthBarWidth * healthPercentage, healthBarHeight);
    }
  });
};

const renderSimplePlayer = (ctx, gameState) => {
  const player = gameState.player;
  const size = GAME_CONFIG.PLAYER_SIZE;
  const topLeftX = player.x - size / 2;
  const topLeftY = player.y - size / 2;

  // Draw player centered using PLAYER_SIZE
  drawSimplePlayer(ctx, topLeftX, topLeftY, size);
  
  // Player health bar (scaled to player size, positioned above)
  const healthBarWidth = size;
  const healthBarHeight = 6;
  const healthPercentage = player.health / player.maxHealth;
  
  ctx.fillStyle = '#000000';
  ctx.fillRect(topLeftX, topLeftY - 15, healthBarWidth, healthBarHeight);
  
  ctx.fillStyle = healthPercentage > 0.5 ? '#00FF00' : healthPercentage > 0.25 ? '#FFFF00' : '#FF0000';
  ctx.fillRect(topLeftX, topLeftY - 15, healthBarWidth * healthPercentage, healthBarHeight);
};

// World boundaries rendering (invisible - terrain system handles seamless filling)
const renderWorldBoundaries = (ctx, gameState) => {
  // Boundaries are now invisible - terrain system ensures seamless canvas filling
  // The terrain generation system automatically extends beyond visible area
  // to provide continuous coverage without visible borders
};

// UI rendering
const renderUI = (ctx, gameState) => {
  // Mini-map in top-right corner
  const miniMapSize = 150;
  const miniMapX = GAME_CONFIG.CANVAS_WIDTH - miniMapSize - 10;
  const miniMapY = 10;
  
  // Mini-map background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(miniMapX, miniMapY, miniMapSize, miniMapSize);
  
  // Mini-map border
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.strokeRect(miniMapX, miniMapY, miniMapSize, miniMapSize);
  
  // Player position on mini-map
  const worldSize = GAME_CONFIG.WORLD_SIZE * GAME_CONFIG.TILE_SIZE;
  const playerMiniX = miniMapX + (gameState.player.x / worldSize) * miniMapSize;
  const playerMiniY = miniMapY + (gameState.player.y / worldSize) * miniMapSize;
  
  ctx.fillStyle = '#00FF00';
  ctx.beginPath();
  ctx.arc(playerMiniX, playerMiniY, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Performance info
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '12px Arial';
  ctx.fillText(`Terrain Chunks: ${gameState.terrain.size}`, 10, GAME_CONFIG.CANVAS_HEIGHT - 40);
  ctx.fillText(`Optimized Rendering: ON`, 10, GAME_CONFIG.CANVAS_HEIGHT - 25);
  ctx.fillText(`Simple Assets: ON`, 10, GAME_CONFIG.CANVAS_HEIGHT - 10);
};

export default SimpleCanvasRenderer;