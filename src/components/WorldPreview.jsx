import React, { useRef, useEffect, useState } from 'react';
import './WorldPreview.css';

const WorldPreview = ({ worldLevels, levelNames, currentLevel, onClose }) => {
  const canvasRef = useRef(null);
  const [loadedImages, setLoadedImages] = useState({});
  // currentLevel is now passed as prop
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [keys, setKeys] = useState({});
  
  const gridSize = 32;
  const canvasSize = { width: 800, height: 600 };

  // Available assets configuration
  const availableAssets = [
    { id: 'grass', name: 'Grass', color: '#7CB342', category: 'terrain', svgPath: null },
    { id: 'water', name: 'Water', color: '#2196F3', category: 'terrain', svgPath: '/src/assets/realistic-water.svg' },
    { id: 'tree', name: 'Tree', color: '#4CAF50', category: 'obstacle', svgPath: '/src/assets/realistic-tree.svg' },
    { id: 'rock', name: 'Rock', color: '#9E9E9E', category: 'obstacle', svgPath: '/src/assets/realistic-rock.svg' },
    { id: 'bridge', name: 'Bridge', color: '#8D6E63', category: 'terrain', svgPath: '/src/assets/realistic-bridge.svg' },
    { id: 'treasure', name: 'Treasure', color: '#FFD700', category: 'interactive', svgPath: '/src/assets/realistic-treasure.svg' },
    { id: 'spawn', name: 'Spawn Point', color: '#FF5722', category: 'special', svgPath: '/src/assets/realistic-spawn.svg' },
    { id: 'cave-entrance', name: 'Cave Entrance', color: '#5D4037', category: 'special', svgPath: '/src/assets/cave-entrance.svg' },
    { id: 'lava', name: 'Lava', color: '#FF5722', category: 'terrain', svgPath: '/src/assets/realistic-lava.svg' },
    { id: 'cave-floor', name: 'Cave Floor', color: '#6D4C41', category: 'terrain', svgPath: '/src/assets/realistic-cave-floor.svg' },
    { id: 'cave-wall', name: 'Cave Wall', color: '#4E342E', category: 'obstacle', svgPath: '/src/assets/realistic-cave-wall.svg' },
    { id: 'cave-water', name: 'Cave Water', color: '#1976D2', category: 'terrain', svgPath: '/src/assets/realistic-cave-water.svg' },
    { id: 'mushroom', name: 'Mushroom', color: '#E91E63', category: 'obstacle', svgPath: '/src/assets/realistic-cave-mushroom.svg' },
    { id: 'crystal', name: 'Crystal', color: '#9C27B0', category: 'interactive', svgPath: '/src/assets/realistic-cave-crystal.svg' },
    { id: 'stalactite', name: 'Stalactite', color: '#795548', category: 'obstacle', svgPath: '/src/assets/realistic-stalactite.svg' },
    { id: 'stalagmite', name: 'Stalagmite', color: '#8D6E63', category: 'obstacle', svgPath: '/src/assets/realistic-stalagmite.svg' },
    { id: 'goblin', name: 'Goblin', color: '#4CAF50', category: 'monster', svgPath: '/public/assets/monster-goblin.svg', hp: 30, detectionRange: 3, movementSpeed: 1.5 },
    { id: 'orc', name: 'Orc', color: '#FF5722', category: 'monster', svgPath: '/public/assets/monster-orc.svg', hp: 50, detectionRange: 4, movementSpeed: 1.0 },
    { id: 'dragon', name: 'Dragon', color: '#F44336', category: 'monster', svgPath: '/public/assets/monster-dragon.svg', hp: 100, detectionRange: 6, movementSpeed: 0.8 }
  ];

  // Get current level objects
  const currentLevelObjects = worldLevels?.[currentLevel] || [];
  
  // Check if grass terrain exists
  const hasGrassTerrain = currentLevelObjects.some(obj => obj.assetId === 'grass');

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: true }));
    };

    const handleKeyUp = (e) => {
      setKeys(prev => ({ ...prev, [e.key.toLowerCase()]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Camera movement
  useEffect(() => {
    const interval = setInterval(() => {
      setCameraOffset(prev => {
        let newX = prev.x;
        let newY = prev.y;
        const speed = 5;

        if (keys['w'] || keys['arrowup']) newY += speed;
        if (keys['s'] || keys['arrowdown']) newY -= speed;
        if (keys['a'] || keys['arrowleft']) newX += speed;
        if (keys['d'] || keys['arrowright']) newX -= speed;

        return { x: newX, y: newY };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [keys]);

  // Load SVG images
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = availableAssets
        .filter(asset => asset.svgPath)
        .map(asset => {
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              setLoadedImages(prev => ({
                ...prev,
                [asset.id]: img
              }));
              resolve();
            };
            img.onerror = () => resolve();
            img.src = asset.svgPath;
          });
        });
      
      await Promise.all(imagePromises);
    };
    
    loadImages();
  }, []);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background color - white if no grass, light green if grass exists
    ctx.fillStyle = hasGrassTerrain ? '#f0f8e8' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save context and apply camera offset
    ctx.save();
    ctx.translate(cameraOffset.x, cameraOffset.y);

    // Draw grid
    ctx.strokeStyle = hasGrassTerrain ? '#e0e8d0' : '#f0f0f0';
    ctx.lineWidth = 1;
    
    const startX = Math.floor(-cameraOffset.x / gridSize) * gridSize;
    const endX = startX + canvas.width + gridSize;
    const startY = Math.floor(-cameraOffset.y / gridSize) * gridSize;
    const endY = startY + canvas.height + gridSize;
    
    for (let x = startX; x <= endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }

    // Group objects by position for stacking
    const objectsByPosition = {};
    currentLevelObjects.forEach((obj, index) => {
      const key = `${obj.x},${obj.y}`;
      if (!objectsByPosition[key]) {
        objectsByPosition[key] = [];
      }
      objectsByPosition[key].push({ ...obj, originalIndex: index });
    });

    // Draw stacked objects
    Object.values(objectsByPosition).forEach(stackedObjects => {
      // Sort by layer priority
      const layerOrder = { terrain: 0, obstacle: 1, interactive: 2, special: 3, monster: 4 };
      stackedObjects.sort((a, b) => {
        const assetA = availableAssets.find(asset => asset.id === a.assetId);
        const assetB = availableAssets.find(asset => asset.id === b.assetId);
        return (layerOrder[assetA?.category] || 0) - (layerOrder[assetB?.category] || 0);
      });

      stackedObjects.forEach((obj) => {
        const asset = availableAssets.find(a => a.id === obj.assetId);
        if (!asset) return;

        const objWidth = obj.width || gridSize;
        const objHeight = obj.height || gridSize;

        // Draw SVG image if available, otherwise use colored rectangle
        if (asset.svgPath && loadedImages[asset.id]) {
          ctx.drawImage(loadedImages[asset.id], obj.x, obj.y, objWidth, objHeight);
        } else {
          ctx.fillStyle = asset.color;
          ctx.fillRect(obj.x, obj.y, objWidth, objHeight);
        }

        // Draw monster HP bar
        if (asset.category === 'monster') {
          const currentHp = obj.properties?.hp || asset.hp;
          const maxHp = asset.hp;
          const hpBarWidth = objWidth - 4;
          const hpBarHeight = 4;
          const hpBarX = obj.x + 2;
          const hpBarY = obj.y - 8;
          
          ctx.fillStyle = '#333';
          ctx.fillRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight);
          
          const hpPercentage = currentHp / maxHp;
          ctx.fillStyle = hpPercentage > 0.6 ? '#4CAF50' : hpPercentage > 0.3 ? '#FF9800' : '#F44336';
          ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercentage, hpBarHeight);
        }
      });
    });

    ctx.restore();
  }, [currentLevelObjects, loadedImages, cameraOffset, hasGrassTerrain]);

  const getLevelName = (levelIndex) => {
    if (levelIndex === 0) return 'Surface';
    return `Cave Level ${levelIndex}`;
  };

  return (
    <div className="world-preview-overlay">
      <div className="world-preview-container">
        <div className="preview-header">
          <h2>Game Preview - {getLevelName(currentLevel)}</h2>
          <div className="preview-controls">
            {worldData?.levels && Object.keys(worldData.levels).length > 1 && (
              <div className="level-selector">
                <label>Level: </label>
                <select 
                  value={currentLevel} 
                  onChange={(e) => setCurrentLevel(Number(e.target.value))}
                >
                  {Object.keys(worldData.levels).sort((a, b) => Number(a) - Number(b)).map(levelIndex => (
                    <option key={levelIndex} value={levelIndex}>
                      {getLevelName(Number(levelIndex))}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button onClick={onClose} className="close-btn">✕</button>
          </div>
        </div>
        
        <div className="preview-content">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="preview-canvas"
          />
        </div>
        
        <div className="preview-footer">
          <div className="preview-stats">
            <span>Objects: {currentLevelObjects.length}</span>
            <span>Background: {hasGrassTerrain ? 'Grass Terrain' : 'White (No Grass)'}</span>
            <span>Camera: ({Math.round(-cameraOffset.x)}, {Math.round(-cameraOffset.y)})</span>
          </div>
          <div className="preview-controls-info">
            🎮 Use WASD or Arrow keys to move camera around the world
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldPreview;