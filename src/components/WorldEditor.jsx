import React, { useState, useRef, useEffect } from 'react';
import './WorldEditor.css';
import WorldPreview from './WorldPreview';

// Import realistic SVG assets
import realisticWaterSvg from '../assets/realistic-water.svg';
import realisticTreeSvg from '../assets/realistic-tree.svg';
import realisticRockSvg from '../assets/realistic-rock.svg';
import realisticTreasureSvg from '../assets/realistic-treasure.svg';
import realisticSpawnSvg from '../assets/realistic-spawn.svg';
import realisticCaveSvg from '../assets/realistic-cave.svg';
import highGrassSvg from '../assets/high-grass.svg';

const WorldEditor = ({ onSaveWorld, initialWorld = null }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // Core state
  const [selectedTool, setSelectedTool] = useState('place');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [gridSize] = useState(32);
  const [showGrid, setShowGrid] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });
  const [keys, setKeys] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});

  // Asset to SVG mapping
  const assetSvgMap = {
    'grass': highGrassSvg,
    'rock': realisticRockSvg,
    'water': realisticWaterSvg,
    'tree': realisticTreeSvg,
    'treasure': realisticTreasureSvg,
    'spawn': realisticSpawnSvg,
    'cave-entrance': realisticCaveSvg
  };
  
  // Load SVG images
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = Object.entries(assetSvgMap).map(async ([assetId, svgPath]) => {
        const img = new Image();
        img.src = svgPath;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
        return [assetId, img];
      });
      
      const loadedImagePairs = await Promise.all(imagePromises);
      const imageMap = Object.fromEntries(loadedImagePairs);
      setLoadedImages(imageMap);
    };
    
    loadImages();
  }, []);

  // World state - simplified to single level for now
  const [worldObjects, setWorldObjects] = useState(() => {
    if (initialWorld?.levels?.[0]) {
      return initialWorld.levels[0];
    }
    return [];
  });
  
  // Keep level structure for compatibility
  const currentLevel = 0;
  const worldLevels = { 0: worldObjects };
  const levelNames = { 0: 'Main Level' };

  // Tools definition
  const tools = [
    { id: 'place', name: 'Place', icon: '📍' },
    { id: 'select', name: 'Select', icon: '🔍' },
    { id: 'erase', name: 'Erase', icon: '🗑️' }
  ];

  // Available assets
  const availableAssets = [
    {
      id: 'grass',
      name: 'Grass',
      color: '#4CAF50',
      walkable: true,
      category: 'terrain',
      icon: <img src={highGrassSvg} alt="Grass" style={{width: '24px', height: '24px'}} />
    },
    {
      id: 'rock',
      name: 'Rock',
      color: '#757575',
      walkable: false,
      category: 'obstacle',
      icon: <img src={realisticRockSvg} alt="Rock" style={{width: '24px', height: '24px'}} />
    },
    {
      id: 'water',
      name: 'Water',
      color: '#2196F3',
      walkable: false,
      category: 'terrain',
      icon: <img src={realisticWaterSvg} alt="Water" style={{width: '24px', height: '24px'}} />
    },
    {
      id: 'tree',
      name: 'Tree',
      color: '#388E3C',
      walkable: false,
      category: 'obstacle',
      icon: <img src={realisticTreeSvg} alt="Tree" style={{width: '24px', height: '24px'}} />
    },
    {
      id: 'treasure',
      name: 'Treasure Box',
      color: '#FFD700',
      walkable: true,
      category: 'interactive',
      hasQuestion: true,
      icon: <img src={realisticTreasureSvg} alt="Treasure" style={{width: '24px', height: '24px'}} />
    },
    {
      id: 'spawn',
      name: 'Player Spawn',
      color: '#FF5722',
      walkable: true,
      category: 'special',
      icon: <img src={realisticSpawnSvg} alt="Spawn" style={{width: '24px', height: '24px'}} />
    },
    {
      id: 'cave-entrance',
      name: 'Cave Entrance',
      color: '#4A4A4A',
      walkable: true,
      category: 'special',
      hasLevelConnection: true,
      icon: <img src={realisticCaveSvg} alt="Cave" style={{width: '24px', height: '24px'}} />
    },
    {
      id: 'monster-goblin',
      name: 'Goblin',
      color: '#8B4513',
      walkable: false,
      category: 'monster',
      hp: 30,
      detectionRange: 3,
      movementSpeed: 1.5,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="10" r="6" fill="#8B4513"/>
          <circle cx="10" cy="8" r="1" fill="#FF0000"/>
          <circle cx="14" cy="8" r="1" fill="#FF0000"/>
          <path d="M8 6L6 4L8 5Z" fill="#8B4513"/>
          <path d="M16 6L18 4L16 5Z" fill="#8B4513"/>
          <path d="M10 12L12 14L14 12" stroke="#000" strokeWidth="1" fill="none"/>
          <rect x="10" y="16" width="4" height="6" fill="#8B4513"/>
        </svg>
      )
    }
  ];

  // Canvas drawing
  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(cameraOffset.x, cameraOffset.y);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e0e0e0';
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
    }

    // Draw objects
    worldObjects.forEach((obj, index) => {
      const asset = availableAssets.find(a => a.id === obj.assetId);
      if (!asset) return;

      const objWidth = obj.width || gridSize;
      const objHeight = obj.height || gridSize;

      // Draw object using SVG image if available
      const svgImage = loadedImages[obj.assetId];
      if (svgImage && svgImage.complete && svgImage.naturalWidth > 0) {
        ctx.drawImage(svgImage, obj.x, obj.y, objWidth, objHeight);
      } else {
        // Fallback to colored rectangle if image not loaded
        ctx.fillStyle = asset.color;
        ctx.fillRect(obj.x, obj.y, objWidth, objHeight);
        
        // Draw object name as fallback
        ctx.fillStyle = '#000000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(asset.name, obj.x + objWidth/2, obj.y + objHeight/2 + 3);
      }

      // Draw selection highlight
      if (selectedObject === index) {
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 3;
        ctx.strokeRect(obj.x - 2, obj.y - 2, objWidth + 4, objHeight + 4);
      }
    });

    ctx.restore();
  };

  // Mouse handling
  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - cameraOffset.x) / gridSize) * gridSize;
    const y = Math.floor((e.clientY - rect.top - cameraOffset.y) / gridSize) * gridSize;
    return { x, y };
  };

  const handleCanvasMouseDown = (e) => {
    e.preventDefault();
    const { x, y } = getCanvasCoordinates(e);
    setIsDragging(true);

    if (e.button === 0) { // Left click
      switch (selectedTool) {
        case 'place':
          if (selectedAsset) {
            placeAsset(x, y);
          }
          break;
        case 'select':
          selectObject(x, y);
          break;
        case 'erase':
          eraseObject(x, y);
          break;
      }
    } else if (e.button === 2) { // Right click - always erase
      eraseObject(x, y);
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging) return;
    const { x, y } = getCanvasCoordinates(e);

    if (e.buttons === 2) { // Right mouse button
      eraseObject(x, y);
      return;
    }

    if (e.buttons === 1) { // Left mouse button
      switch (selectedTool) {
        case 'place':
          if (selectedAsset) {
            placeAsset(x, y);
          }
          break;
        case 'erase':
          eraseObject(x, y);
          break;
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  // Object manipulation
  const placeAsset = (x, y) => {
    if (!selectedAsset) return;

    const objWidth = gridSize;
    const objHeight = gridSize;

    // Check if same asset already exists at this position
    const existingIndex = worldObjects.findIndex(
      obj => obj.x === x && obj.y === y && obj.assetId === selectedAsset.id
    );

    if (existingIndex >= 0) {
      return; // Don't place duplicate
    }

    const newObject = {
      id: Date.now(),
      assetId: selectedAsset.id,
      x,
      y,
      width: objWidth,
      height: objHeight,
      walkable: selectedAsset.walkable,
      properties: {
        ...selectedAsset,
        hasQuestion: selectedAsset.hasQuestion || false,
        hp: selectedAsset.hp || null,
        detectionRange: selectedAsset.detectionRange || null,
        movementSpeed: selectedAsset.movementSpeed || null
      }
    };

    setWorldObjects([...worldObjects, newObject]);
  };

  const selectObject = (x, y) => {
    const objectIndex = worldObjects.findIndex(
      obj => x >= obj.x && x < obj.x + obj.width && 
             y >= obj.y && y < obj.y + obj.height
    );
    
    setSelectedObject(objectIndex >= 0 ? objectIndex : null);
  };

  const eraseObject = (x, y) => {
    const objectIndex = worldObjects.findIndex(
      obj => x >= obj.x && x < obj.x + obj.width && 
             y >= obj.y && y < obj.y + obj.height
    );
    
    if (objectIndex >= 0) {
      setWorldObjects(worldObjects.filter((_, index) => index !== objectIndex));
      if (selectedObject === objectIndex) {
        setSelectedObject(null);
      }
    }
  };

  // World management
  const saveWorld = () => {
    const worldData = {
      size: canvasSize,
      gridSize,
      levels: { 0: worldObjects },
      levelNames: { 0: 'Main Level' },
      currentLevel: 0
    };
    
    localStorage.setItem('savedWorld', JSON.stringify(worldData));
    alert('World saved successfully!');
  };

  const loadWorld = () => {
    const savedData = localStorage.getItem('savedWorld');
    if (savedData) {
      try {
        const worldData = JSON.parse(savedData);
        setWorldObjects(worldData.levels?.[0] || []);
        setSelectedObject(null);
        alert('World loaded successfully!');
      } catch (error) {
        alert('Error loading world: Invalid save data');
      }
    } else {
      alert('No saved world found!');
    }
  };

  const clearWorld = () => {
    setWorldObjects([]);
    setSelectedObject(null);
  };

  const exportWorld = () => {
    const worldData = {
      size: canvasSize,
      gridSize,
      levels: { 0: worldObjects },
      levelNames: { 0: 'Main Level' },
      currentLevel: 0
    };
    
    if (onSaveWorld) {
      onSaveWorld(worldData);
    } else {
      const dataStr = JSON.stringify(worldData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'world.json';
      link.click();
    }
  };

  // Simplified - no complex level management needed

  // Effects
  useEffect(() => {
    drawCanvas();
  }, [worldObjects, showGrid, selectedObject, cameraOffset, loadedImages]);

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
    const moveSpeed = 5;
    
    const interval = setInterval(() => {
      setCameraOffset(prev => {
        let newX = prev.x;
        let newY = prev.y;

        if (keys['w'] || keys['arrowup']) newY += moveSpeed;
        if (keys['s'] || keys['arrowdown']) newY -= moveSpeed;
        if (keys['a'] || keys['arrowleft']) newX += moveSpeed;
        if (keys['d'] || keys['arrowright']) newX -= moveSpeed;

        return { x: newX, y: newY };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [keys]);

  // Canvas sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        const padding = 32;
        const newWidth = Math.max(400, rect.width - padding);
        const newHeight = Math.max(300, rect.height - padding);
        
        setCanvasSize({ width: newWidth, height: newHeight });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  const selectedObjectData = selectedObject !== null ? worldObjects[selectedObject] : null;
  const selectedAssetData = selectedObjectData ? 
    availableAssets.find(a => a.id === selectedObjectData.assetId) : null;

  return (
    <div className="world-editor">
      <div className="editor-header">
        <h2>World Editor</h2>
        <div className="level-info">
          <span>Objects: {worldObjects.length}</span>
        </div>
        
        <div className="editor-actions">
          <button onClick={saveWorld} className="btn btn-success">
            💾 Save World
          </button>
          <button onClick={loadWorld} className="btn btn-info">
            📁 Load World
          </button>
          <button onClick={() => setShowPreview(true)} className="btn btn-secondary">
            🎮 Game Preview
          </button>
          <button onClick={clearWorld} className="btn btn-warning">
            Clear World
          </button>
          <button onClick={exportWorld} className="btn btn-primary">
            Export World
          </button>
          <label className="grid-toggle">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            Show Grid
          </label>
        </div>
      </div>

      <div className="editor-content">
        <div className="toolbar">
          <div className="tool-section">
            <h3>Tools</h3>
            <div className="tool-buttons">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  className={`tool-btn ${selectedTool === tool.id ? 'active' : ''}`}
                  onClick={() => setSelectedTool(tool.id)}
                  title={tool.name}
                >
                  <span className="tool-icon">{tool.icon}</span>
                  <span className="tool-name">{tool.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="asset-section">
            <h3>Assets</h3>
            <div className="asset-categories">
              {['terrain', 'obstacle', 'interactive', 'special', 'monster'].map(category => (
                <div key={category} className="asset-category">
                  <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                  <div className="asset-grid">
                    {availableAssets
                      .filter(asset => asset.category === category)
                      .map(asset => (
                        <button
                          key={asset.id}
                          className={`asset-btn ${selectedAsset?.id === asset.id ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedAsset(asset);
                            setSelectedTool('place');
                          }}
                          title={asset.name}
                          style={{ 
                            backgroundColor: selectedAsset?.id === asset.id ? asset.color : 'transparent',
                            border: `2px solid ${asset.color}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px'
                          }}
                        >
                          {asset.icon}
                        </button>
                      ))
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="canvas-container" ref={containerRef}>
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onContextMenu={(e) => e.preventDefault()}
            className="world-canvas"
          />
          <div className="canvas-info">
            <p>Use WASD to move camera | Left click to place/select | Right click to erase</p>
            <p>Current Tool: {selectedTool} | Selected Asset: {selectedAsset?.name || 'None'}</p>
          </div>
        </div>

        {selectedObjectData && (
          <div className="properties-panel">
            <h3>Properties</h3>
            <div className="property-form">
              <h4>{selectedAssetData?.name}</h4>
              
              <div className="property-group">
                <label>Position: ({selectedObjectData.x}, {selectedObjectData.y})</label>
              </div>

              <div className="property-group">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedObjectData.walkable}
                    onChange={(e) => {
                      const newObjects = [...worldObjects];
                      newObjects[selectedObject] = {
                        ...newObjects[selectedObject],
                        walkable: e.target.checked
                      };
                      setWorldObjects(newObjects);
                    }}
                  />
                  Walkable
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="editor-footer">
        <div className="world-stats">
          <span>Objects: {worldObjects.length}</span>
          <span>Camera: ({Math.round(cameraOffset.x)}, {Math.round(cameraOffset.y)})</span>
        </div>
      </div>

      {showPreview && (
        <WorldPreview
          worldLevels={{ 0: worldObjects }}
          levelNames={{ 0: 'Main Level' }}
          currentLevel={0}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default WorldEditor;