import React, { useState, useRef, useCallback, useEffect } from 'react';
import './TerrainDesigner.css';

// Terrain tools configuration for different levels
const TERRAIN_TOOLS = {
  0: { // Surface level
    grass: { name: '🌱 Grass', color: '#4CAF50', walkable: true, tileClass: 'grass' },
    water: { name: '💧 Water', color: '#2196F3', walkable: false, tileClass: 'water' },
    stone: { name: '🪨 Stone', color: '#9E9E9E', walkable: true, tileClass: 'stone' },
    tree: { name: '🌳 Tree', color: '#388E3C', walkable: false, tileClass: 'tree' },
    spawn: { name: '🎯 Spawn', color: '#FF9800', walkable: true, tileClass: 'spawn' }
  },
  1: { // Cave level
    caveFloor: { name: '🟫 Cave Floor', color: '#8D6E63', walkable: true, tileClass: 'cave-floor' },
    caveWall: { name: '⬛ Cave Wall', color: '#424242', walkable: false, tileClass: 'cave-wall' },
    lava: { name: '🌋 Lava', color: '#FF5722', walkable: false, tileClass: 'lava' },
    crystal: { name: '💎 Crystal', color: '#E91E63', walkable: true, tileClass: 'crystal' },
    spawn: { name: '🎯 Spawn', color: '#FF9800', walkable: true, tileClass: 'spawn' }
  }
};

const TerrainDesigner = () => {
  const canvasRef = useRef(null);
  const [terrainData, setTerrainData] = useState({ 0: {}, 1: {} });
  const [selectedTool, setSelectedTool] = useState('grass');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paintMode, setPaintMode] = useState(false);
  const [brushSize, setBrushSize] = useState(1);
  const [mapDimensions, setMapDimensions] = useState({ width: 50, height: 30 });
  const [gridSize, setGridSize] = useState(32);
  const [showGrid, setShowGrid] = useState(true);
  const [gridOpacity, setGridOpacity] = useState(0.3);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [previewMode, setPreviewMode] = useState(false);
  const [smoothPanning, setSmoothPanning] = useState(true);
  const [canvasAnimation, setCanvasAnimation] = useState({ active: false, type: null });
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedTileForProperties, setSelectedTileForProperties] = useState(null);
  const [showSpawnManager, setShowSpawnManager] = useState(false);
  const [showPropertyEditor, setShowPropertyEditor] = useState(false);
  const [selectedTileForEdit, setSelectedTileForEdit] = useState(null);
  const [lastPaintedPosition, setLastPaintedPosition] = useState({ x: -1, y: -1 });
  const [isDragPainting, setIsDragPainting] = useState(false);

  const canvasSize = {
    width: mapDimensions.width * gridSize,
    height: mapDimensions.height * gridSize
  };

  const getCurrentLevelTools = () => TERRAIN_TOOLS[currentLevel] || {};

  const getGridPosition = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;
    
    const adjustedX = (canvasX - mapOffset.x) / zoomLevel;
    const adjustedY = (canvasY - mapOffset.y) / zoomLevel;
    
    return {
      x: Math.floor(adjustedX / gridSize),
      y: Math.floor(adjustedY / gridSize)
    };
  }, [gridSize, mapOffset, zoomLevel]);

  const handleCanvasInteraction = useCallback((gridX, gridY, isRightClick = false) => {
    if (gridX < 0 || gridX >= mapDimensions.width || gridY < 0 || gridY >= mapDimensions.height) {
      return;
    }
    
    const key = `${gridX},${gridY}`;
    const currentTerrain = terrainData[currentLevel] || {};
    
    if (isRightClick) {
      if (currentTerrain[key]) {
        setTerrainData(prev => {
          const newData = { ...prev };
          const levelData = { ...newData[currentLevel] };
          delete levelData[key];
          newData[currentLevel] = levelData;
          return newData;
        });
      }
    } else {
      const toolData = getCurrentLevelTools()[selectedTool];
      if (!toolData) return;
      
      if (paintMode && brushSize > 1) {
        const halfBrush = Math.floor(brushSize / 2);
        const updatedCells = {};
        
        for (let dx = -halfBrush; dx <= halfBrush; dx++) {
          for (let dy = -halfBrush; dy <= halfBrush; dy++) {
            const newX = gridX + dx;
            const newY = gridY + dy;
            if (newX >= 0 && newX < mapDimensions.width && newY >= 0 && newY < mapDimensions.height) {
              const brushKey = `${newX},${newY}`;
              updatedCells[brushKey] = {
                tool: selectedTool,
                ...toolData,
                x: newX,
                y: newY
              };
            }
          }
        }
        
        setTerrainData(prev => ({
          ...prev,
          [currentLevel]: {
            ...prev[currentLevel],
            ...updatedCells
          }
        }));
      } else {
        setTerrainData(prev => ({
          ...prev,
          [currentLevel]: {
            ...prev[currentLevel],
            [key]: {
              tool: selectedTool,
              ...toolData,
              x: gridX,
              y: gridY
            }
          }
        }));
      }
    }
    
    // Update last painted position
    setLastPaintedPosition({ x: gridX, y: gridY });
  }, [selectedTool, currentLevel, terrainData, mapDimensions, paintMode, brushSize, getCurrentLevelTools, isDragPainting, lastPaintedPosition]);

  const handleCanvasMouseDown = useCallback((e) => {
    e.preventDefault(); // Prevent text selection and other default behaviors
    const { x: gridX, y: gridY } = getGridPosition(e.clientX, e.clientY);
    setCursorPosition({ x: gridX, y: gridY });
    
    if (e.button === 1 || e.altKey) {
      // Middle mouse button or Alt key for panning
      setIsDragging(true);
      setDragStart({ x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y });
    } else if (e.button === 2) {
      // Right mouse button
      if (e.shiftKey) {
        const key = `${gridX},${gridY}`;
        const currentTerrain = terrainData[currentLevel] || {};
        if (currentTerrain[key]) {
          setSelectedTileForEdit(currentTerrain[key]);
          setShowPropertyEditor(true);
        }
      } else {
        handleCanvasInteraction(gridX, gridY, true);
      }
    } else if (e.button === 0) {
      // Left mouse button for painting
      setIsDrawing(true);
      setIsDragPainting(true);
      setLastPaintedPosition({ x: -1, y: -1 }); // Reset last painted position
      handleCanvasInteraction(gridX, gridY);
    }
  }, [getGridPosition, mapOffset, handleCanvasInteraction, terrainData, currentLevel]);

  const handleCanvasMouseMove = useCallback((e) => {
    const { x: gridX, y: gridY } = getGridPosition(e.clientX, e.clientY);
    setCursorPosition({ x: gridX, y: gridY });
    
    if (isDragging) {
      e.preventDefault(); // Prevent text selection while panning
      // Handle map panning
      const newOffset = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      
      if (smoothPanning) {
        setMapOffset(newOffset);
      } else {
        const snappedOffset = {
          x: Math.round(newOffset.x / gridSize) * gridSize,
          y: Math.round(newOffset.y / gridSize) * gridSize
        };
        setMapOffset(snappedOffset);
      }
    } else if (isDrawing && (e.buttons & 1) === 1) {
      e.preventDefault(); // Prevent text selection while painting
      // Handle drag painting - only when left mouse button is held down
      // Check if we're on a different grid position than last painted
      if (lastPaintedPosition.x !== gridX || lastPaintedPosition.y !== gridY) {
        handleCanvasInteraction(gridX, gridY);
      }
    }
  }, [isDragging, isDrawing, dragStart, mapOffset, gridSize, handleCanvasInteraction, getGridPosition, smoothPanning, lastPaintedPosition]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDrawing(false);
    setIsDragging(false);
    setIsDragPainting(false);
    setLastPaintedPosition({ x: -1, y: -1 });
  }, []);

  const handleCanvasRightClick = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleCanvasWheel = useCallback((e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.max(0.1, Math.min(3, prev * zoomFactor)));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      
      switch (e.key.toLowerCase()) {
        case 'p':
          setPaintMode(prev => !prev);
          break;
        case 's':
          if (e.ctrlKey) {
            e.preventDefault();
            saveTerrainConfiguration();
          } else {
            setSelectedTool('spawn');
          }
          break;
        case 'g':
          setSelectedTool('grass');
          break;
        case 'w':
          setSelectedTool('water');
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          setBrushSize(parseInt(e.key));
          break;
        case 'l':
          if (e.ctrlKey) {
            e.preventDefault();
            loadTerrainConfiguration();
          }
          break;
        case 'c':
          if (e.ctrlKey) {
            e.preventDefault();
            clearCurrentLevel();
          }
          break;
        case 'tab':
          e.preventDefault();
          togglePreviewMode();
          break;
        case 'escape':
          setShowPropertyModal(false);
          setShowSpawnManager(false);
          setShowPropertyEditor(false);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('contextmenu', handleCanvasRightClick);
      return () => canvas.removeEventListener('contextmenu', handleCanvasRightClick);
    }
  }, [handleCanvasRightClick]);

  const buildTreeStructure = () => {
    const tools = getCurrentLevelTools();
    const categories = {
      'Environment': ['grass', 'water', 'stone'],
      'Objects': ['tree', 'crystal'],
      'Special': ['spawn']
    };
    
    if (currentLevel === 1) {
      categories['Environment'] = ['caveFloor', 'caveWall', 'lava'];
      categories['Objects'] = ['crystal'];
    }
    
    const tree = {};
    Object.entries(categories).forEach(([category, toolKeys]) => {
      tree[category] = {
        name: category,
        children: toolKeys.filter(key => tools[key]).map(key => ({
          key,
          ...tools[key]
        }))
      };
    });
    
    return tree;
  };

  const renderTreeNode = (node, isRoot = false) => {
    if (isRoot) {
      return (
        <div key={node.name} className="tree-category">
          <div className="category-header">{node.name}</div>
          <div className="category-items">
            {node.children.map(child => (
              <button
                key={child.key}
                className={`tool-btn ${selectedTool === child.key ? 'active' : ''}`}
                onClick={() => setSelectedTool(child.key)}
                style={{ backgroundColor: selectedTool === child.key ? child.color : 'transparent' }}
              >
                {child.name}
              </button>
            ))}
          </div>
        </div>
      );
    }
  };

  const getEffectiveProperties = (toolKey, toolData) => {
    const baseProps = {
      obstacle: !toolData?.walkable,
      water: toolKey === 'water' || toolKey === 'lava',
      special: toolKey === 'spawn' || toolKey === 'crystal'
    };
    return baseProps;
  };

  const getTileClass = (toolData) => {
    return toolData?.tileClass || 'default';
  };

  const TilePropertyEditor = ({ tile, onSave, onClose }) => {
    const [properties, setProperties] = useState({
      walkable: tile.walkable || false,
      obstacle: !tile.walkable || false,
      water: tile.tool === 'water' || tile.tool === 'lava' || false,
      special: tile.tool === 'spawn' || tile.tool === 'crystal' || false
    });

    const handleSave = () => {
      const updatedTile = {
        ...tile,
        walkable: properties.walkable,
        obstacle: properties.obstacle,
        water: properties.water,
        special: properties.special
      };
      onSave(updatedTile);
    };

    return (
      <div className="property-editor-modal">
        <div className="property-editor-panel">
          <h3>Edit Tile Properties</h3>
          <div className="property-form">
            <div className="property-group">
              <label>Tile Type:</label>
              <select value={tile.tool} disabled>
                <option value={tile.tool}>{tile.name}</option>
              </select>
            </div>
            
            <div className="property-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={properties.walkable}
                  onChange={(e) => setProperties(prev => ({ ...prev, walkable: e.target.checked, obstacle: !e.target.checked }))}
                />
                Walkable
              </label>
            </div>
            
            <div className="property-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={properties.obstacle}
                  onChange={(e) => setProperties(prev => ({ ...prev, obstacle: e.target.checked, walkable: !e.target.checked }))}
                />
                Obstacle
              </label>
            </div>
            
            <div className="property-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={properties.water}
                  onChange={(e) => setProperties(prev => ({ ...prev, water: e.target.checked }))}
                />
                Water/Liquid
              </label>
            </div>
            
            <div className="property-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={properties.special}
                  onChange={(e) => setProperties(prev => ({ ...prev, special: e.target.checked }))}
                />
                Special
              </label>
            </div>
          </div>
          
          <div className="property-editor-buttons">
            <button onClick={handleSave} className="save-btn">Save</button>
            <button onClick={onClose} className="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  const [imageCache, setImageCache] = useState({});

  const loadImage = useCallback((src) => {
    if (imageCache[src]) {
      return Promise.resolve(imageCache[src]);
    }
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        setImageCache(prev => ({ ...prev, [src]: img }));
        resolve(img);
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }, [imageCache]);

  const renderTerrain = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(mapOffset.x, mapOffset.y);
    ctx.scale(zoomLevel, zoomLevel);
    
    if (showGrid) {
      ctx.strokeStyle = `rgba(0, 0, 0, ${gridOpacity})`;
      ctx.lineWidth = 1 / zoomLevel;
      
      for (let x = 0; x <= mapDimensions.width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * gridSize, 0);
        ctx.lineTo(x * gridSize, mapDimensions.height * gridSize);
        ctx.stroke();
      }
      
      for (let y = 0; y <= mapDimensions.height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * gridSize);
        ctx.lineTo(mapDimensions.width * gridSize, y * gridSize);
        ctx.stroke();
      }
    }
    
    // Draw export area boundary (highlighted border)
    ctx.strokeStyle = '#FF5722';
    ctx.lineWidth = 3 / zoomLevel;
    ctx.setLineDash([10 / zoomLevel, 5 / zoomLevel]);
    ctx.strokeRect(0, 0, mapDimensions.width * gridSize, mapDimensions.height * gridSize);
    ctx.setLineDash([]);
    
    // Add export area label
    ctx.fillStyle = '#FF5722';
    ctx.font = `${16 / zoomLevel}px Arial`;
    ctx.fillText(`Export Area: ${mapDimensions.width}×${mapDimensions.height}`, 5 / zoomLevel, -10 / zoomLevel);
    
    const currentTerrain = terrainData[currentLevel] || {};
    Object.values(currentTerrain).forEach(tile => {
      if (tile && tile.x !== undefined && tile.y !== undefined) {
        const x = tile.x * gridSize;
        const y = tile.y * gridSize;
        
        if (previewMode && tile.image) {
          const img = imageCache[tile.image];
          if (img) {
            ctx.drawImage(img, x, y, gridSize, gridSize);
          } else {
            loadImage(tile.image);
            ctx.fillStyle = tile.color || '#888';
            ctx.fillRect(x, y, gridSize, gridSize);
          }
        } else {
          ctx.fillStyle = tile.color || '#888';
          ctx.fillRect(x, y, gridSize, gridSize);
          
          if (tile.name && gridSize >= 24) {
            ctx.fillStyle = '#000';
            ctx.font = `${Math.min(gridSize / 2, 16) / zoomLevel}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const emoji = tile.name.split(' ')[0];
            ctx.fillText(emoji, x + gridSize / 2, y + gridSize / 2);
          }
        }
        
        if (tile.tool === 'spawn') {
          ctx.strokeStyle = '#FF0000';
          ctx.lineWidth = 2 / zoomLevel;
          ctx.strokeRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
        }
      }
    });
    
    if (cursorPosition.x >= 0 && cursorPosition.x < mapDimensions.width && 
        cursorPosition.y >= 0 && cursorPosition.y < mapDimensions.height) {
      const x = cursorPosition.x * gridSize;
      const y = cursorPosition.y * gridSize;
      
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2 / zoomLevel;
      
      if (paintMode && brushSize > 1) {
        const halfBrush = Math.floor(brushSize / 2);
        for (let dx = -halfBrush; dx <= halfBrush; dx++) {
          for (let dy = -halfBrush; dy <= halfBrush; dy++) {
            const brushX = (cursorPosition.x + dx) * gridSize;
            const brushY = (cursorPosition.y + dy) * gridSize;
            if (cursorPosition.x + dx >= 0 && cursorPosition.x + dx < mapDimensions.width &&
                cursorPosition.y + dy >= 0 && cursorPosition.y + dy < mapDimensions.height) {
              ctx.strokeRect(brushX, brushY, gridSize, gridSize);
            }
          }
        }
      } else {
        ctx.strokeRect(x, y, gridSize, gridSize);
      }
    }
    
    ctx.restore();
  }, [terrainData, currentLevel, gridSize, imageCache, loadImage, mapOffset, cursorPosition, zoomLevel, showGrid, gridOpacity, mapDimensions, previewMode, paintMode, brushSize]);

  useEffect(() => {
    renderTerrain();
  }, [renderTerrain]);

  const saveTerrainConfiguration = () => {
    const config = {
      terrainData,
      mapDimensions,
      gridSize,
      currentLevel,
      metadata: {
        created: new Date().toISOString(),
        version: '1.0'
      }
    };
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'terrain-config.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export terrain in the format expected by the open world game
  const exportSeamlessTerrain = () => {
    const timestamp = Date.now();
    const exportData = {
      levels: {},
      levelConnections: [],
      dimensions: {
        rows: mapDimensions.height,
        cols: mapDimensions.width
      },
      exportDimensions: {
        width: mapDimensions.width * gridSize,
        height: mapDimensions.height * gridSize
      },
      cellSize: gridSize,
      seamlessData: {},
      timestamp: new Date().toISOString(),
      metadata: {
        surfaceLevel: 0,
        undergroundLevel: 1,
        caveEntrances: 0,
        totalCells: mapDimensions.width * mapDimensions.height,
        exportResolution: `${mapDimensions.width * gridSize}x${mapDimensions.height * gridSize}`
      }
    };

    // Convert terrain data to the expected format
    [0, 1].forEach(levelIndex => {
      const levelData = [];
      
      for (let y = 0; y < mapDimensions.height; y++) {
        const row = [];
        for (let x = 0; x < mapDimensions.width; x++) {
          const tileKey = `${x},${y}`;
          const tile = terrainData[levelIndex]?.[tileKey];
          
          let terrainPath = null;
          let obstaclePath = null;

          if (tile) {
            // Debug logging for export
            if (x === 0 && y === 0) {
              console.log('🎨 EXPORT DEBUG - First tile:', tile);
              console.log('🎨 Tool:', tile.tool);
              console.log('🎨 Level:', levelIndex);
            }
            
            // Map terrain types to asset paths
            switch (tile.tool) {
              case 'grass':
                terrainPath = '/assets/terrain/1 Tiles/Map_tile_04.png';
                console.log('🌱 Exporting grass tile at', x, y);
                break;
              case 'water':
                terrainPath = '/assets/terrain/1 Tiles/Map_tile_110.png';
                console.log('💧 Exporting water tile at', x, y);
                break;
              case 'stone':
                terrainPath = '/assets/terrain/1 Tiles/Map_tile_121.png';
                console.log('🪨 Exporting stone tile at', x, y);
                break;
              case 'tree':
                terrainPath = '/assets/terrain/1 Tiles/Map_tile_04.png'; // Grass base
                obstaclePath = '/assets/characters/terrain-object/Trees/3.png';
                console.log('🌳 Exporting tree tile at', x, y);
                break;
              case 'caveFloor':
                terrainPath = '/assets/terrain/1 Tiles/Map_tile_03.png';
                console.log('🕳️ Exporting cave floor tile at', x, y);
                break;
              case 'caveWall':
                terrainPath = '/assets/terrain/1 Tiles/Map_tile_03.png';
                obstaclePath = '/assets/characters/terrain-object/Rocks/2.png';
                console.log('🧱 Exporting cave wall tile at', x, y);
                break;
              case 'lava':
                terrainPath = '/assets/terrain/1 Tiles/Map_tile_135.png';
                console.log('🌋 Exporting lava tile at', x, y);
                break;
              case 'crystal':
                terrainPath = '/assets/terrain/1 Tiles/Map_tile_03.png';
                obstaclePath = '/assets/characters/terrain-object/Other/Cave_enter.png';
                console.log('💎 Exporting crystal tile at', x, y);
                break;
              default:
                terrainPath = levelIndex === 0 ? '/assets/terrain/1 Tiles/Map_tile_04.png' : '/assets/terrain/1 Tiles/Map_tile_03.png';
                console.log('❓ Using default terrain for tile:', tile.tool, 'at', x, y, 'level', levelIndex);
            }
          } else {
            // Default terrain for empty cells
            terrainPath = levelIndex === 0 ? '/assets/terrain/1 Tiles/Map_tile_04.png' : '/assets/terrain/1 Tiles/Map_tile_03.png';
            if (x === 0 && y === 0) {
              console.log('🎨 EXPORT DEBUG - Empty cell default:', terrainPath, 'level', levelIndex);
            }
          }

          row.push({
            terrain: terrainPath,
            obstacle: obstaclePath
          });
        }
        levelData.push(row);
      }
      
      exportData.levels[levelIndex] = levelData;
      exportData.seamlessData[levelIndex] = {
        tiles: {},
        obstacles: {},
        seamlessMap: {},
        tileMapping: {},
        blendingData: {}
      };
    });

    // Add level connections if there are cave entrances
    let caveEntrances = 0;
    [0, 1].forEach(levelIndex => {
      Object.values(terrainData[levelIndex] || {}).forEach(tile => {
        if (tile.tool === 'crystal') { // Using crystal as cave entrance for now
          caveEntrances++;
          exportData.levelConnections.push({
            from: { level: 0 },
            to: { level: 1 },
            id: timestamp + caveEntrances
          });
        }
      });
    });
    
    exportData.metadata.caveEntrances = caveEntrances;

    // Create download
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `terrain-seamless-${mapDimensions.width}x${mapDimensions.height}-${timestamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert(`Terrain exported as terrain-seamless-${mapDimensions.width}x${mapDimensions.height}-${timestamp}.json\nCopy this file to /public/terrain-data/ folder to use in the game!`);
  };

  // Import terrain from JSON file
  const importTerrainFromFile = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target.result);
            loadTerrainFromImport(jsonData);
          } catch (error) {
            alert('Error parsing JSON file: ' + error.message);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Load terrain data from imported JSON
  const loadTerrainFromImport = (importData) => {
    try {
      // Check if it's a seamless terrain export format (new format)
      if (importData.levels && importData.dimensions) {
        // Update map dimensions
        setMapDimensions({
          width: importData.dimensions.cols,
          height: importData.dimensions.rows
        });

        // Convert export format back to designer format
        const newTerrainData = {};
        
        Object.keys(importData.levels).forEach(levelKey => {
          const levelData = importData.levels[levelKey];
          newTerrainData[levelKey] = {};
          
          // Process the 2D array format
          for (let y = 0; y < levelData.length; y++) {
            for (let x = 0; x < levelData[y].length; x++) {
              const cell = levelData[y][x];
              if (cell && (cell.terrain || cell.obstacle)) {
                const position = `${x},${y}`;
                
                // Map terrain and obstacle paths back to designer tools
                let tool = 'grass'; // default
                
                if (cell.obstacle) {
                  // Map obstacle assets to tools
                  if (cell.obstacle.includes('Trees/1.png') || cell.obstacle.includes('Trees/2.png') || cell.obstacle.includes('Trees/3.png')) {
                    tool = 'tree';
                  } else if (cell.obstacle.includes('Crystals/1.png') || cell.obstacle.includes('Cave_enter')) {
                    tool = 'crystal';
                  } else if (cell.obstacle.includes('Rocks/2.png') || cell.obstacle.includes('Rocks/3.png')) {
                    tool = 'caveWall';
                  }
                } else if (cell.terrain) {
                  // Map terrain types
                  if (cell.terrain.includes('Map_tile_04') || cell.terrain.includes('Map_tile_11')) {
                    tool = 'grass';
                  } else if (cell.terrain.includes('Map_tile_110')) {
                    tool = 'water';
                  } else if (cell.terrain.includes('Map_tile_121')) {
                    tool = 'stone';
                  } else if (cell.terrain.includes('Map_tile_03')) {
                    tool = 'caveFloor';
                  } else if (cell.terrain.includes('Map_tile_135')) {
                    tool = 'lava';
                  }
                }
                
                const toolData = getCurrentLevelTools()[tool];
                if (toolData) {
                  newTerrainData[levelKey][position] = {
                    tool: tool,
                    ...toolData,
                    x: x,
                    y: y
                  };
                }
              }
            }
          }
        });
        
        setTerrainData(newTerrainData);
        alert('Seamless terrain imported successfully!');
        
      } else {
        // Try to handle other formats or show error
        alert('Unsupported terrain file format. Please use a terrain file exported from this terrain designer.');
      }
    } catch (error) {
      alert('Error loading terrain: ' + error.message);
      console.error('Import error:', error);
    }
  };

  const applyToOpenWorldGame = (config) => {
    const gameConfig = {
      levels: config.terrainData,
      mapSize: config.mapDimensions,
      tileSize: config.gridSize,
      playerSpawn: findPlayerSpawn(config.terrainData)
    };
    
    localStorage.setItem('WildRealmConfig', JSON.stringify(gameConfig));
    
    setCanvasAnimation({ active: true, type: 'export' });
    setTimeout(() => {
      setCanvasAnimation({ active: false, type: null });
      alert('Configuration exported to Open World Game!');
    }, 1000);
  };

  const findPlayerSpawn = (levels) => {
    for (const [levelKey, levelData] of Object.entries(levels)) {
      for (const tile of Object.values(levelData)) {
        if (tile.tool === 'spawn') {
          return { level: parseInt(levelKey), x: tile.x, y: tile.y };
        }
      }
    }
    return { level: 0, x: 0, y: 0 };
  };

  const loadTerrainConfiguration = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const config = JSON.parse(e.target.result);
            setTerrainData(config.terrainData || { 0: {}, 1: {} });
            setMapDimensions(config.mapDimensions || { width: 50, height: 30 });
            setGridSize(config.gridSize || 32);
            setCurrentLevel(config.currentLevel || 0);
          } catch (error) {
            alert('Invalid configuration file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const clearCurrentLevel = () => {
    if (confirm(`Clear all terrain data for Level ${currentLevel}?`)) {
      setTerrainData(prev => ({
        ...prev,
        [currentLevel]: {}
      }));
    }
  };

  const togglePreviewMode = () => {
    setPreviewMode(prev => !prev);
  };

  const updateMapDimensions = (width, height) => {
    const newDimensions = { width: parseInt(width), height: parseInt(height) };
    setMapDimensions(newDimensions);
    
    // Force canvas re-render with new dimensions
    setTimeout(() => {
      renderTerrain();
    }, 100);
    
    console.log(`📐 Map dimensions updated: ${newDimensions.width}×${newDimensions.height} tiles = ${newDimensions.width * gridSize}×${newDimensions.height * gridSize}px`);
  };

  const generateTerrain = (type = 'random') => {
    const newTerrain = {};
    const tools = getCurrentLevelTools();
    const toolKeys = Object.keys(tools).filter(key => key !== 'spawn');
    
    for (let x = 0; x < mapDimensions.width; x++) {
      for (let y = 0; y < mapDimensions.height; y++) {
        const key = `${x},${y}`;
        let selectedToolKey;
        
        switch (type) {
          case 'grassland':
            selectedToolKey = Math.random() < 0.8 ? 'grass' : (Math.random() < 0.5 ? 'tree' : 'stone');
            break;
          case 'water':
            selectedToolKey = Math.random() < 0.6 ? 'water' : 'grass';
            break;
          case 'mixed':
            selectedToolKey = toolKeys[Math.floor(Math.random() * toolKeys.length)];
            break;
          default: // random
            selectedToolKey = toolKeys[Math.floor(Math.random() * toolKeys.length)];
        }
        
        if (tools[selectedToolKey]) {
          newTerrain[key] = {
            tool: selectedToolKey,
            ...tools[selectedToolKey],
            x,
            y
          };
        }
      }
    }
    
    setTerrainData(prev => ({
      ...prev,
      [currentLevel]: newTerrain
    }));
  };

  return (
    <div className="terrain-designer">
      <div className="terrain-designer-header">
        <h1>🏗️ Advanced Map Editor</h1>
        
        <div className="header-controls">
          <div className="level-controls">
            <label>Current Level:</label>
            <select 
              value={currentLevel} 
              onChange={(e) => setCurrentLevel(parseInt(e.target.value))}
              className="level-selector"
            >
              <option value={0}>Level 0 - Surface</option>
              <option value={1}>Level 1 - Cave</option>
            </select>
          </div>
          
          <div className="dimension-controls">
            <label>Map Size:</label>
            <input 
              type="number" 
              value={mapDimensions.width} 
              onChange={(e) => updateMapDimensions(e.target.value, mapDimensions.height)}
              min="10" 
              max="200" 
              className="dimension-input"
              title="Width in tiles"
            />
            <span>×</span>
            <input 
              type="number" 
              value={mapDimensions.height} 
              onChange={(e) => updateMapDimensions(mapDimensions.width, e.target.value)}
              min="10" 
              max="150" 
              className="dimension-input"
              title="Height in tiles"
            />
            <span className="dimension-info">
              ({canvasSize.width}×{canvasSize.height}px) 
              = {mapDimensions.width}×{mapDimensions.height} tiles
            </span>
          </div>

          <div className="export-controls" style={{background: '#4CAF50', padding: '8px', borderRadius: '8px', margin: '5px 0'}}>
            <label style={{color: 'white', fontWeight: 'bold'}}>🚀 EXPORT/IMPORT:</label>
            <button onClick={exportSeamlessTerrain} className="export-btn" style={{background: '#FF5722', color: 'white', fontWeight: 'bold'}}>
              🚀 Export for Game
            </button>
            <button onClick={importTerrainFromFile} className="import-btn" style={{background: '#2196F3', color: 'white', fontWeight: 'bold'}}>
              📤 Import JSON
            </button>
            <button onClick={() => {
              console.log('🔄 Re-exporting terrain...');
              exportSeamlessTerrain();
            }} className="export-btn" style={{background: '#9C27B0', color: 'white', fontWeight: 'bold', marginLeft: '5px'}}>
              🔄 Re-export Fixed
            </button>
          </div>

          <div className="grid-controls">
            <label>Grid Size:</label>
            <select 
              value={gridSize} 
              onChange={(e) => {
                const newSize = parseInt(e.target.value);
                setGridSize(newSize);
                setMapOffset({ x: 0, y: 0 });
                setZoomLevel(1);
              }}
              className="grid-selector"
            >
              <option value={16}>16px</option>
              <option value={24}>24px</option>
              <option value={32}>32px</option>
              <option value={48}>48px</option>
              <option value={64}>64px</option>
            </select>
          </div>
        </div>

        <div className="action-buttons">
          <div className="generation-controls">
            <label>Generate:</label>
            <button onClick={() => generateTerrain('grassland')} className="generate-btn">
              🌱 Grassland
            </button>
            <button onClick={() => generateTerrain('water')} className="generate-btn">
              🌊 Water
            </button>
            <button onClick={() => generateTerrain('mixed')} className="generate-btn">
              🏔️ Mixed
            </button>
            <button onClick={() => generateTerrain('random')} className="generate-btn">
              🎲 Random
            </button>
          </div>

          <div className="paint-controls">
            <label className="paint-mode-toggle">
              <input 
                type="checkbox" 
                checked={paintMode} 
                onChange={(e) => setPaintMode(e.target.checked)}
              />
              🎨 Paint Mode (P)
            </label>
            <div className="brush-size-control">
              <label>Brush:</label>
              <input 
                type="range" 
                min="1" 
                max="5" 
                value={brushSize} 
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="brush-slider"
              />
              <span className="brush-size">{brushSize}×{brushSize}</span>
            </div>
          </div>
          
          <div className="utility-controls">
            <label>Actions:</label>
            <button onClick={saveTerrainConfiguration} className="save-btn">
              � Save (Ctrl+S)
            </button>
            <button onClick={loadTerrainConfiguration} className="load-btn">
              📁 Load (Ctrl+L)
            </button>
            <button onClick={clearCurrentLevel} className="clear-btn">
              🗑️ Clear (Ctrl+C)
            </button>
            <button onClick={() => setShowSpawnManager(true)} className="spawn-btn">
              🎯 Spawns
            </button>
            <button onClick={togglePreviewMode} className={`preview-btn ${previewMode ? 'active' : ''}`}>
              👁️ Preview (Tab)
            </button>
          </div>
        </div>
      </div>

      <div className="terrain-designer-content">
        <div className="tool-palette">
          <h3>🎨 {currentLevel === 0 ? 'Surface' : 'Cave'} Asset Tree</h3>
          
          <div className="asset-tree">
            {Object.entries(buildTreeStructure()).map(([rootKey, rootNode]) => 
              renderTreeNode(rootNode, true)
            )}
          </div>
        </div>

        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className={`terrain-canvas ${previewMode ? 'preview-mode' : ''} ${canvasAnimation.active ? 'canvas-animating' : ''} ${paintMode ? 'paint-mode' : ''} ${isDragPainting ? 'drag-painting' : ''} ${selectedTool === 'eraser' ? 'eraser-mode' : ''}`}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onContextMenu={handleCanvasRightClick}
            onWheel={handleCanvasWheel}
          />
          <div className="canvas-info">
            <span>Level {currentLevel} | Tool: {getCurrentLevelTools()[selectedTool]?.name} | Grid: {gridSize}px | Zoom: {Math.round(zoomLevel * 100)}%</span>
            <div className="canvas-controls">
              <label className="grid-toggle">
                <input 
                  type="checkbox" 
                  checked={showGrid} 
                  onChange={(e) => setShowGrid(e.target.checked)}
                />
                Grid
              </label>
              <label className="grid-opacity">
                Opacity:
                <input 
                  type="range" 
                  min="0.1" 
                  max="1" 
                  step="0.1" 
                  value={gridOpacity} 
                  onChange={(e) => setGridOpacity(parseFloat(e.target.value))}
                  className="opacity-slider"
                />
              </label>
              <label className="smooth-panning">
                <input 
                  type="checkbox" 
                  checked={smoothPanning} 
                  onChange={(e) => setSmoothPanning(e.target.checked)}
                />
                Smooth Pan
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="terrain-designer-footer">
        <div className="level-summary">
          <h4>📊 Level Summary</h4>
          <div className="level-stats">
            {Object.keys(terrainData).map(level => {
              const levelData = terrainData[level] || {};
              const tileCount = Object.keys(levelData).length;
              return (
                <div key={level} className="level-stat">
                  <span>Level {level}: {tileCount} tiles</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="instructions">
            <h4>📝 Instructions & Keyboard Shortcuts</h4>
            <ul>
              <li>Select a tool from the organized category palette</li>
              <li><strong>Left-click and drag</strong> on the canvas to place terrain tiles</li>
              <li><strong>Right-click</strong> on placed tiles to delete them</li>
              <li><strong>Shift+Right-click</strong> on placed tiles to edit their properties</li>
              <li><strong>Middle Mouse/Alt + Drag:</strong> Pan the map around</li>
              <li><strong>Mouse Wheel:</strong> Zoom in/out on the canvas</li>
              <li><strong>P:</strong> Toggle paint mode for brush painting</li>
              <li><strong>S:</strong> Switch to spawn tool | <strong>Ctrl+S:</strong> Save configuration</li>
              <li><strong>G:</strong> Switch to grass tool | <strong>W:</strong> Switch to water tool</li>
              <li><strong>1-5:</strong> Set brush size (1x1 to 5x5)</li>
              <li><strong>Ctrl+L:</strong> Load configuration | <strong>Ctrl+C:</strong> Clear current level</li>
              <li><strong>Tab:</strong> Toggle preview mode | <strong>Escape:</strong> Close dialogs</li>
              <li>Switch between levels to design multi-level worlds</li>
              <li>Special tiles (⭐) have unique properties like cave entrances</li>
              <li>Use Preview mode to see the final result with actual images</li>
            </ul>
        </div>
      </div>

      {showPropertyModal && selectedTileForProperties && (
        <div className="property-modal">
          <div className="property-modal-panel">
            <h3>Configure Tile Properties</h3>
            <p>Tile: {getCurrentLevelTools()[selectedTileForProperties]?.name}</p>
            <div className="property-options">
              <label>
                <input 
                  type="checkbox" 
                  defaultChecked={getEffectiveProperties(selectedTileForProperties, getCurrentLevelTools()[selectedTileForProperties]).obstacle}
                  onChange={(e) => {
                    // Handle property change
                  }}
                />
                🚧 Obstacle (blocks movement)
              </label>
              <label>
                <input 
                  type="checkbox" 
                  defaultChecked={getEffectiveProperties(selectedTileForProperties, getCurrentLevelTools()[selectedTileForProperties]).water}
                  onChange={(e) => {
                    // Handle property change
                  }}
                />
                💧 Water (special water tile)
              </label>
              <label>
                <input 
                  type="checkbox" 
                  defaultChecked={getEffectiveProperties(selectedTileForProperties, getCurrentLevelTools()[selectedTileForProperties]).special}
                  onChange={(e) => {
                    // Handle property change
                  }}
                />
                ✨ Special (unique properties)
              </label>
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowPropertyModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showSpawnManager && (
         <div className="spawn-manager">
           <div className="spawn-manager-overlay" onClick={() => setShowSpawnManager(false)}></div>
           <div className="spawn-manager-panel">
             <h3>🎯 Spawn Point Manager</h3>
             <div className="spawn-list">
               <p>Click on the canvas with the spawn tool selected to place spawn points.</p>
             </div>
             <div className="spawn-actions">
               <button onClick={() => setShowSpawnManager(false)} className="close-btn">
                 Close
               </button>
             </div>
           </div>
         </div>
       )}

       {showPropertyEditor && selectedTileForEdit && (
         <TilePropertyEditor 
           tile={selectedTileForEdit}
           onSave={(updatedTile) => {
             const key = `${updatedTile.x},${updatedTile.y}`;
             setTerrainData(prev => ({
               ...prev,
               [currentLevel]: {
                 ...prev[currentLevel],
                 [key]: updatedTile
               }
             }));
             setShowPropertyEditor(false);
             setSelectedTileForEdit(null);
           }}
           onClose={() => {
             setShowPropertyEditor(false);
             setSelectedTileForEdit(null);
           }}
         />
       )}
     </div>
   );
 };

 export default TerrainDesigner;