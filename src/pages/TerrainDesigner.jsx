import React, { useState, useEffect, useCallback } from 'react';

// Terrain and obstacle asset directories
const terrainDir = '/assets/terrain/1 Tiles';
const obstacleCategories = {
  Trees: '/assets/characters/terrain-object/Trees',
  Rocks: '/assets/characters/terrain-object/Rocks',
  Bushes: '/assets/characters/terrain-object/Bushes',
  Houses: '/assets/characters/terrain-object/Houses',
  Crystals: '/assets/characters/terrain-object/Crystals',
  Grass: '/assets/characters/terrain-object/Grass',
  Ruins: '/assets/characters/terrain-object/Ruins',
  Other: '/assets/characters/terrain-object/Other'
};

// Special cave entrance asset
const CAVE_ENTRANCE_ASSET = '/assets/characters/terrain-object/Other/Cave_enter.png';

const GRID_ROWS = 20;
const GRID_COLS = 30;
const CELL_SIZE = 32; // pixels per cell

function TerrainDesigner() {
  const [terrainTiles, setTerrainTiles] = useState([]);
  const [obstacleTiles, setObstacleTiles] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [selectedObstacle, setSelectedObstacle] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Trees');
  const [mode, setMode] = useState('terrain'); // 'terrain' or 'obstacle'
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentLevel, setCurrentLevel] = useState(0); // 0 = surface, 1 = underground
  
  // Grid size controls
  const [gridWidth, setGridWidth] = useState(GRID_COLS);
  const [gridHeight, setGridHeight] = useState(GRID_ROWS);
  const [exportSize, setExportSize] = useState({ width: 1400, height: 1400 });
  
  const [levels, setLevels] = useState({
    0: Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill({ terrain: null, obstacle: null })),
    1: Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill({ terrain: null, obstacle: null }))
  });
  const [levelConnections, setLevelConnections] = useState([]); // Store cave entrance connections
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  
  // Drag-to-paint functionality
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState(null); // 'paint' or 'erase'
  const [lastPaintedCell, setLastPaintedCell] = useState(null);

  // Resize grid when dimensions change
  const resizeGrid = (newWidth, newHeight) => {
    setLevels(prev => {
      const newLevels = { ...prev };
      Object.keys(newLevels).forEach(levelKey => {
        const currentGrid = newLevels[levelKey];
        const newGrid = [];
        
        for (let y = 0; y < newHeight; y++) {
          newGrid[y] = [];
          for (let x = 0; x < newWidth; x++) {
            if (y < currentGrid.length && x < currentGrid[y].length) {
              // Keep existing cell data
              newGrid[y][x] = currentGrid[y][x];
            } else {
              // Add new empty cell
              newGrid[y][x] = { terrain: null, obstacle: null };
            }
          }
        }
        newLevels[levelKey] = newGrid;
      });
      return newLevels;
    });
    
    setGridWidth(newWidth);
    setGridHeight(newHeight);
  };

  // Get current level grid
  const getCurrentGrid = () => {
    return levels[currentLevel] || Array(gridHeight).fill(null).map(() => Array(gridWidth).fill({ terrain: null, obstacle: null }));
  };

  // Update grid reference to current level
  const updateCurrentGrid = (newGrid) => {
    setLevels(prev => ({
      ...prev,
      [currentLevel]: typeof newGrid === 'function' ? newGrid(prev[currentLevel] || []) : newGrid
    }));
  };

  // Load terrain tiles
  useEffect(() => {
    const terrainImages = [];
    // Load actual terrain tiles based on the file listing
    for (let i = 1; i <= 143; i++) {
      if (i < 10) {
        terrainImages.push(`${terrainDir}/Map_tile_0${i}.png`);
      } else {
        terrainImages.push(`${terrainDir}/Map_tile_${i}.png`);
      }
    }
    setTerrainTiles(terrainImages);
    setIsLoading(false);
  }, []);

  // Load obstacle tiles based on selected category
  useEffect(() => {
    const loadObstacles = async () => {
      const obstacleImages = [];
      const categoryPath = obstacleCategories[selectedCategory];
      
      // Load obstacles based on category
      if (selectedCategory === 'Trees') {
        for (let i = 1; i <= 9; i++) {
          obstacleImages.push(`${categoryPath}/${i}.png`);
        }
      } else if (selectedCategory === 'Rocks') {
        for (let i = 1; i <= 6; i++) {
          obstacleImages.push(`${categoryPath}/${i}.png`);
        }
      } else if (selectedCategory === 'Crystals') {
        for (let i = 1; i <= 10; i++) {
          obstacleImages.push(`${categoryPath}/${i}.png`);
        }
      } else if (selectedCategory === 'Bushes') {
        for (let i = 1; i <= 8; i++) {
          obstacleImages.push(`${categoryPath}/${i}.png`);
        }
      } else if (selectedCategory === 'Grass') {
        for (let i = 1; i <= 12; i++) {
          obstacleImages.push(`${categoryPath}/${i}.png`);
        }
      } else if (selectedCategory === 'Houses') {
        for (let i = 1; i <= 15; i++) {
          obstacleImages.push(`${categoryPath}/${i}.png`);
        }
      } else if (selectedCategory === 'Ruins') {
        for (let i = 1; i <= 20; i++) {
          obstacleImages.push(`${categoryPath}/${i}.png`);
        }
      } else if (selectedCategory === 'Other') {
        // Add specific files for Other category
        obstacleImages.push(`${categoryPath}/Cave_enter.png`);
        // Add more as needed
        for (let i = 1; i <= 5; i++) {
          obstacleImages.push(`${categoryPath}/${i}.png`);
        }
      }
      
      setObstacleTiles(obstacleImages);
    };
    
    loadObstacles();
  }, [selectedCategory]);

  // Add global mouse event listeners for drag functionality
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        console.log('Global mouse up - ending drag mode');
        setIsDragging(false);
        setDragMode(null);
        setLastPaintedCell(null);
      }
    };

    const handleGlobalMouseMove = (e) => {
      // Prevent text selection during drag
      if (isDragging) {
        e.preventDefault();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isDragging]);

  // Save grid state for undo/redo
  const saveToHistory = useCallback((newGrid) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newGrid)));
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  // Handle tile/obstacle placement
  // Paint a cell (used for both click and drag)
  const paintCell = (row, col, isErasing = false) => {
    // Skip if we just painted this cell to avoid redundant operations
    if (lastPaintedCell && lastPaintedCell.row === row && lastPaintedCell.col === col) {
      return;
    }
    
    setLastPaintedCell({ row, col });
    
    updateCurrentGrid((prev) => {
      const currentGrid = prev || Array(GRID_ROWS).fill(null).map(() => Array(GRID_COLS).fill({ terrain: null, obstacle: null }));
      const newGrid = currentGrid.map((r) => r.map((c) => ({ ...c })));
      
      if (isErasing) {
        if (mode === 'terrain') {
          newGrid[row][col].terrain = null;
        } else {
          newGrid[row][col].obstacle = null;
        }
        console.log(`🧹 Erased ${mode} at (${row}, ${col})`);
      } else {
        if (mode === 'terrain' && selectedTile) {
          newGrid[row][col].terrain = selectedTile;
          console.log(`🎨 Painted terrain at (${row}, ${col}):`, selectedTile);
        } else if (mode === 'obstacle' && selectedObstacle) {
          newGrid[row][col].obstacle = selectedObstacle;
          console.log(`🪨 Painted obstacle at (${row}, ${col}):`, selectedObstacle);
        }
      }
      
      // Only save to history if not dragging (to avoid too many history entries)
      if (!isDragging) {
        saveToHistory(newGrid);
      }
      
      return newGrid;
    });
  };

  const handleCellClick = (row, col) => {
    // Handle cave entrance connection mode
    if (isConnecting) {
      if (!connectionStart) {
        // Set start point (must be on level 0)
        if (currentLevel === 0) {
          setConnectionStart({ row, col, level: 0 });
        } else {
          alert('Cave entrance must start on surface level (Level 0)');
        }
      } else {
        // Set end point (must be on level 1)
        if (currentLevel === 1) {
          const connection = {
            from: connectionStart,
            to: { row, col, level: 1 },
            id: Date.now()
          };
          setLevelConnections(prev => [...prev, connection]);
          
          // Place cave entrance on level 0
          setLevels(prev => {
            const newLevels = { ...prev };
            newLevels[0] = newLevels[0].map((r, rIdx) => 
              r.map((c, cIdx) => 
                rIdx === connectionStart.row && cIdx === connectionStart.col 
                  ? { ...c, obstacle: CAVE_ENTRANCE_ASSET, isCaveEntrance: true, connectedTo: { row, col } }
                  : c
              )
            );
            return newLevels;
          });
          
          setConnectionStart(null);
          setIsConnecting(false);
          alert(`Cave entrance created! Connection from (${connectionStart.row}, ${connectionStart.col}) to (${row}, ${col})`);
        } else {
          alert('Cave exit must be placed on underground level (Level 1)');
        }
      }
      return;
    }

    // Normal tile/obstacle placement
    paintCell(row, col, false);
  };

  // Handle mouse down on cell - start dragging
  const handleCellMouseDown = (row, col, event) => {
    event.preventDefault();
    
    if (isConnecting) {
      handleCellClick(row, col);
      return;
    }
    
    setIsDragging(true);
    setLastPaintedCell(null);
    
    // Determine if we're painting or erasing based on right-click
    const isErasing = event.button === 2; // Right mouse button
    setDragMode(isErasing ? 'erase' : 'paint');
    
    // Paint the initial cell
    paintCell(row, col, isErasing);
    
    console.log(`🖱️ Started ${isErasing ? 'erasing' : 'painting'} at (${row}, ${col})`);
  };

  // Handle mouse enter on cell during drag
  const handleCellMouseEnter = (row, col) => {
    if (isDragging && !isConnecting) {
      const isErasing = dragMode === 'erase';
      paintCell(row, col, isErasing);
    }
  };

  // Handle mouse up - stop dragging
  const handleMouseUp = () => {
    if (isDragging) {
      console.log(`🖱️ Finished ${dragMode}ing`);
      setIsDragging(false);
      setDragMode(null);
      setLastPaintedCell(null);
      
      // Save to history after drag operation completes
      updateCurrentGrid((currentGrid) => {
        saveToHistory(currentGrid);
        return currentGrid;
      });
    }
  };

  // Handle context menu (right-click) to prevent browser menu
  const handleContextMenu = (event) => {
    event.preventDefault();
  };

  // Handle erasing (legacy function for compatibility)
  const handleErase = (row, col) => {
    paintCell(row, col, true);
  };

  // Clear grid
  const handleClear = () => {
    const newGrid = Array(gridHeight)
      .fill(null)
      .map(() => Array(gridWidth).fill({ terrain: null, obstacle: null }));
    updateCurrentGrid(newGrid);
    saveToHistory(newGrid);
  };

  // Clear all levels
  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all levels and connections?')) {
      setLevels({
        0: Array(gridHeight).fill(null).map(() => Array(gridWidth).fill({ terrain: null, obstacle: null })),
        1: Array(gridHeight).fill(null).map(() => Array(gridWidth).fill({ terrain: null, obstacle: null }))
      });
      setLevelConnections([]);
      setHistory([]);
      setHistoryIndex(-1);
    }
  };

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setLevels(prev => ({
        ...prev,
        [currentLevel]: JSON.parse(JSON.stringify(history[newIndex]))
      }));
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setLevels(prev => ({
        ...prev,
        [currentLevel]: JSON.parse(JSON.stringify(history[newIndex]))
      }));
    }
  };

  // Save grid as JSON with seamless terrain generation
  const handleSave = () => {
    const saveData = {
      levels: levels,
      levelConnections: levelConnections,
      dimensions: { rows: gridHeight, cols: gridWidth },
      exportDimensions: exportSize,
      cellSize: CELL_SIZE,
      seamlessData: generateSeamlessTerrain(),
      timestamp: new Date().toISOString(),
      metadata: {
        surfaceLevel: 0,
        undergroundLevel: 1,
        caveEntrances: levelConnections.length,
        totalCells: gridHeight * gridWidth,
        exportResolution: `${exportSize.width}x${exportSize.height}`
      }
    };
    const dataStr = JSON.stringify(saveData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `terrain-seamless-${gridWidth}x${gridHeight}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export for game - creates properly formatted terrain file for open world game
  const handleExportForGame = () => {
    console.log('🚀 Starting terrain export for game...');
    const timestamp = Date.now();
    const exportData = {
      levels: {},
      levelConnections: levelConnections,
      dimensions: {
        rows: gridHeight,
        cols: gridWidth
      },
      exportDimensions: exportSize,
      cellSize: CELL_SIZE,
      seamlessData: {},
      timestamp: new Date().toISOString(),
      metadata: {
        surfaceLevel: 0,
        undergroundLevel: 1,
        caveEntrances: levelConnections.length,
        totalCells: gridHeight * gridWidth,
        exportResolution: `${exportSize.width}x${exportSize.height}`
      }
    };

    // Convert levels to proper format for game
    [0, 1].forEach(levelIndex => {
      const levelData = [];
      const currentLevel = levels[levelIndex];
      
      for (let y = 0; y < gridHeight; y++) {
        const row = [];
        for (let x = 0; x < gridWidth; x++) {
          const cell = currentLevel[y] && currentLevel[y][x] ? currentLevel[y][x] : { terrain: null, obstacle: null };
          
          let terrainPath = null;
          let obstaclePath = null;

          // Debug logging for first few tiles
          if (x < 3 && y < 3) {
            console.log(`🎨 EXPORT DEBUG - Cell at ${x},${y}:`, cell);
          }

          if (cell.terrain) {
            terrainPath = cell.terrain;
            console.log(`🌱 Exporting terrain tile at ${x},${y}:`, terrainPath);
          } else {
            // Default terrain
            terrainPath = levelIndex === 0 ? '/assets/terrain/1 Tiles/Map_tile_04.png' : '/assets/terrain/1 Tiles/Map_tile_03.png';
          }

          if (cell.obstacle) {
            obstaclePath = cell.obstacle;
            console.log(`🪨 Exporting obstacle at ${x},${y}:`, obstaclePath);
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

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `terrain-seamless-${gridWidth}x${gridHeight}-${timestamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    console.log(`✅ Terrain exported successfully: terrain-seamless-${gridWidth}x${gridHeight}-${timestamp}.json`);
    alert(`Terrain exported for game!\nFile: terrain-seamless-${gridWidth}x${gridHeight}-${timestamp}.json\n\nCopy this file to /public/terrain-data/ folder to use in the game!`);
  };

  // Quick export with standard filename for immediate game use
  const handleQuickExportForGame = () => {
    console.log('⚡ Quick export with standard filename...');
    const exportData = {
      levels: {},
      levelConnections: levelConnections,
      dimensions: {
        rows: gridHeight,
        cols: gridWidth
      },
      exportDimensions: exportSize,
      cellSize: CELL_SIZE,
      seamlessData: {},
      timestamp: new Date().toISOString(),
      metadata: {
        surfaceLevel: 0,
        undergroundLevel: 1,
        caveEntrances: levelConnections.length,
        totalCells: gridHeight * gridWidth,
        exportResolution: `${exportSize.width}x${exportSize.height}`
      }
    };

    // Convert levels to proper format for game
    [0, 1].forEach(levelIndex => {
      const levelData = [];
      const currentLevel = levels[levelIndex];
      
      for (let y = 0; y < gridHeight; y++) {
        const row = [];
        for (let x = 0; x < gridWidth; x++) {
          const cell = currentLevel[y] && currentLevel[y][x] ? currentLevel[y][x] : { terrain: null, obstacle: null };
          
          row.push({
            terrain: cell.terrain,
            obstacle: cell.obstacle
          });
        }
        levelData.push(row);
      }
      
      exportData.levels[levelIndex] = levelData;
    });

    // Generate seamless data
    exportData.seamlessData = generateSeamlessData();

    // Create download with standard filename
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'custom-terrain.json'; // Standard filename that game looks for
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('✅ Quick export completed: custom-terrain.json');
    alert('Quick export completed!\nFile: custom-terrain.json\n\nThis file uses a standard name that the game will automatically find.');
  };

  // Import terrain from JSON file
  const handleImportTerrain = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importData = JSON.parse(e.target.result);
            console.log('📤 Importing terrain data:', importData);
            
            // Load levels data
            if (importData.levels) {
              const newLevels = { ...levels };
              
              // Convert imported data back to grid format
              Object.keys(importData.levels).forEach(levelKey => {
                const levelData = importData.levels[levelKey];
                const levelIndex = parseInt(levelKey);
                
                if (Array.isArray(levelData)) {
                  // New format - array of rows
                  newLevels[levelIndex] = levelData.map(row => row.map(cell => ({
                    terrain: cell.terrain,
                    obstacle: cell.obstacle
                  })));
                } else {
                  // Old format - keep as is
                  newLevels[levelIndex] = levelData;
                }
              });
              
              setLevels(newLevels);
            }
            
            // Load dimensions
            if (importData.dimensions) {
              resizeGrid(importData.dimensions.cols, importData.dimensions.rows);
            }
            
            // Load level connections
            if (importData.levelConnections) {
              setLevelConnections(importData.levelConnections);
            }
            
            // Load export size
            if (importData.exportDimensions) {
              setExportSize(importData.exportDimensions);
            }
            
            alert('Terrain imported successfully!');
          } catch (error) {
            console.error('Import error:', error);
            alert('Error importing terrain file. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Generate seamless terrain data for export
  const generateSeamlessTerrain = () => {
    const seamlessData = {};
    
    Object.keys(levels).forEach(levelKey => {
      const grid = levels[levelKey];
      const levelData = {
        tiles: {},
        obstacles: {},
        seamlessMap: [],
        tileMapping: {},
        blendingData: {}
      };
      
      // Create seamless tile mapping
      const cellWidth = exportSize.width / gridWidth;
      const cellHeight = exportSize.height / gridHeight;
      
      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          const cell = grid[y] && grid[y][x] ? grid[y][x] : { terrain: null, obstacle: null };
          const tileKey = `${x},${y}`;
          
          // Calculate world position for seamless export
          const worldX = Math.floor(x * cellWidth);
          const worldY = Math.floor(y * cellHeight);
          
          const seamlessEdges = calculateSeamlessEdges(x, y, grid);
          const blendingInfo = calculateBlendingInfo(x, y, grid, seamlessEdges);
          
          levelData.tiles[tileKey] = {
            terrain: cell.terrain,
            obstacle: cell.obstacle,
            worldPosition: { x: worldX, y: worldY },
            gridPosition: { x, y },
            size: { width: cellWidth, height: cellHeight },
            seamlessEdges: seamlessEdges,
            blending: blendingInfo,
            // Add tile transition data for seamless rendering
            transitions: generateTileTransitions(x, y, grid, seamlessEdges)
          };

          // Store blending data for post-processing
          if (blendingInfo.needsBlending) {
            levelData.blendingData[tileKey] = blendingInfo;
          }
        }
      }
      
      // Generate seamless map data for game engines
      levelData.seamlessMap = generateSeamlessMapData(grid, cellWidth, cellHeight);
      
      seamlessData[levelKey] = levelData;
    });
    
    return seamlessData;
  };

  // Calculate blending information for seamless terrain
  const calculateBlendingInfo = (x, y, grid, edges) => {
    const currentCell = grid[y] && grid[y][x] ? grid[y][x] : { terrain: null };
    const currentTerrain = currentCell.terrain;
    
    if (!currentTerrain) return { needsBlending: false };
    
    const blendingInfo = {
      needsBlending: false,
      blendEdges: [],
      transitionType: 'none',
      neighborTerrain: {}
    };
    
    // Check each edge for different terrain types
    Object.keys(edges).forEach(direction => {
      const neighborTerrain = edges[direction];
      if (neighborTerrain && neighborTerrain !== currentTerrain) {
        blendingInfo.needsBlending = true;
        blendingInfo.blendEdges.push(direction);
        blendingInfo.neighborTerrain[direction] = neighborTerrain;
      }
    });
    
    // Determine transition type
    if (blendingInfo.blendEdges.length > 0) {
      if (blendingInfo.blendEdges.length === 1) {
        blendingInfo.transitionType = 'edge';
      } else if (blendingInfo.blendEdges.length === 2) {
        blendingInfo.transitionType = 'corner';
      } else {
        blendingInfo.transitionType = 'complex';
      }
    }
    
    return blendingInfo;
  };

  // Generate tile transitions for seamless rendering
  const generateTileTransitions = (x, y, grid, edges) => {
    const transitions = {
      topEdge: null,
      rightEdge: null,
      bottomEdge: null,
      leftEdge: null,
      corners: {}
    };
    
    const currentCell = grid[y] && grid[y][x] ? grid[y][x] : { terrain: null };
    const currentTerrain = currentCell.terrain;
    
    if (!currentTerrain) return transitions;
    
    // Generate edge transitions
    Object.keys(edges).forEach(direction => {
      const neighborTerrain = edges[direction];
      if (neighborTerrain && neighborTerrain !== currentTerrain) {
        transitions[`${direction}Edge`] = {
          from: currentTerrain,
          to: neighborTerrain,
          blendPercent: 30 // 30% blend zone
        };
      }
    });
    
    // Generate corner transitions for complex blending
    const cornerPositions = [
      { x: x-1, y: y-1, name: 'topLeft' },
      { x: x+1, y: y-1, name: 'topRight' },
      { x: x-1, y: y+1, name: 'bottomLeft' },
      { x: x+1, y: y+1, name: 'bottomRight' }
    ];
    
    cornerPositions.forEach(corner => {
      if (corner.x >= 0 && corner.x < gridWidth && corner.y >= 0 && corner.y < gridHeight) {
        const cornerCell = grid[corner.y] && grid[corner.y][corner.x] ? grid[corner.y][corner.x] : { terrain: null };
        if (cornerCell.terrain && cornerCell.terrain !== currentTerrain) {
          transitions.corners[corner.name] = {
            from: currentTerrain,
            to: cornerCell.terrain,
            blendPercent: 20
          };
        }
      }
    });
    
    return transitions;
  };

  // Generate seamless map data for game engines
  const generateSeamlessMapData = (grid, cellWidth, cellHeight) => {
    const mapData = {
      width: exportSize.width,
      height: exportSize.height,
      cellSize: { width: cellWidth, height: cellHeight },
      layers: {
        terrain: [],
        obstacles: [],
        blending: []
      }
    };
    
    // Generate terrain layer
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const cell = grid[y] && grid[y][x] ? grid[y][x] : { terrain: null, obstacle: null };
        
        if (cell.terrain) {
          mapData.layers.terrain.push({
            x: x * cellWidth,
            y: y * cellHeight,
            width: cellWidth,
            height: cellHeight,
            texture: cell.terrain,
            gridPos: { x, y }
          });
        }
        
        if (cell.obstacle) {
          mapData.layers.obstacles.push({
            x: x * cellWidth,
            y: y * cellHeight,
            width: cellWidth,
            height: cellHeight,
            texture: cell.obstacle,
            gridPos: { x, y }
          });
        }
      }
    }
    
    return mapData;
  };

  // Calculate seamless edges for tile blending
  const calculateSeamlessEdges = (x, y, grid) => {
    const edges = {
      top: null,
      right: null,
      bottom: null,
      left: null
    };
    
    // Check adjacent tiles for seamless blending
    if (y > 0 && grid[y-1] && grid[y-1][x]) {
      edges.top = grid[y-1][x].terrain;
    }
    if (x < gridWidth - 1 && grid[y] && grid[y][x+1]) {
      edges.right = grid[y][x+1].terrain;
    }
    if (y < gridHeight - 1 && grid[y+1] && grid[y+1][x]) {
      edges.bottom = grid[y+1][x].terrain;
    }
    if (x > 0 && grid[y] && grid[y][x-1]) {
      edges.left = grid[y][x-1].terrain;
    }
    
    return edges;
  };

  if (isLoading) {
    return <div className="loading-tiles">Loading terrain designer...</div>;
  }

  console.log('TerrainDesigner render:', {
    terrainTiles: terrainTiles.length,
    obstacleTiles: obstacleTiles.length,
    selectedCategory,
    mode,
    currentLevel
  });

  return (
    <div className="terrain-designer">
      <h2>Terrain Designer</h2>
      
      <div className="terrain-designer-content">
        <div className="terrain-designer-sidebar">
          {/* Grid Size Controls */}
          <div className="grid-size-controls">
            <h3>Grid Dimensions</h3>
            <div className="size-inputs">
              <div className="input-group">
                <label>Width (cells):</label>
                <input 
                  type="number" 
                  min="5" 
                  max="100" 
                  value={gridWidth} 
                  onChange={(e) => {
                    const newWidth = Math.max(5, Math.min(100, parseInt(e.target.value) || gridWidth));
                    console.log(`📐 Grid width changed to: ${newWidth} cells`);
                    resizeGrid(newWidth, gridHeight);
                  }}
                />
                <small style={{color: '#666'}}>Current: {gridWidth} cells</small>
              </div>
              <div className="input-group">
                <label>Height (cells):</label>
                <input 
                  type="number" 
                  min="5" 
                  max="100" 
                  value={gridHeight} 
                  onChange={(e) => {
                    const newHeight = Math.max(5, Math.min(100, parseInt(e.target.value) || gridHeight));
                    console.log(`📐 Grid height changed to: ${newHeight} cells`);
                    resizeGrid(gridWidth, newHeight);
                  }}
                />
                <small style={{color: '#666'}}>Current: {gridHeight} cells</small>
              </div>
              <div style={{padding: '5px', background: '#f0f0f0', borderRadius: '4px', marginTop: '5px'}}>
                <strong>Export Area: {gridWidth} × {gridHeight} = {gridWidth * gridHeight} cells</strong>
              </div>
            </div>
            <div className="export-size">
              <h4>Export Size (pixels)</h4>
              <div className="size-inputs">
                <div className="input-group">
                  <label>Width:</label>
                  <input 
                    type="number" 
                    min="400" 
                    max="4000" 
                    step="100"
                    value={exportSize.width} 
                    onChange={(e) => {
                      const width = parseInt(e.target.value) || exportSize.width;
                      setExportSize(prev => ({ ...prev, width }));
                    }}
                  />
                </div>
                <div className="input-group">
                  <label>Height:</label>
                  <input 
                    type="number" 
                    min="400" 
                    max="4000" 
                    step="100"
                    value={exportSize.height} 
                    onChange={(e) => {
                      const height = parseInt(e.target.value) || exportSize.height;
                      setExportSize(prev => ({ ...prev, height }));
                    }}
                  />
                </div>
              </div>
              <div className="export-info">
                <small>Cell size: {Math.floor(exportSize.width / gridWidth)}×{Math.floor(exportSize.height / gridHeight)}px</small>
              </div>
              <div className="preset-sizes">
                <button onClick={() => setExportSize({ width: 1024, height: 1024 })}>1024²</button>
                <button onClick={() => setExportSize({ width: 1400, height: 1400 })}>1400²</button>
                <button onClick={() => setExportSize({ width: 2048, height: 2048 })}>2048²</button>
                <button onClick={() => setExportSize({ width: 1920, height: 1080 })}>HD</button>
              </div>
            </div>
          </div>

          {/* Level Controls */}
          <div className="level-controls">
            <h3>Level: {currentLevel === 0 ? 'Surface' : 'Underground'}</h3>
            <div className="level-buttons">
              <button 
                className={currentLevel === 0 ? 'active' : ''} 
                onClick={() => setCurrentLevel(0)}
              >
                🌍 Surface (Level 0)
              </button>
              <button 
                className={currentLevel === 1 ? 'active' : ''} 
                onClick={() => setCurrentLevel(1)}
              >
                🕳️ Underground (Level 1)
              </button>
            </div>
          </div>

          {/* Cave Connection Controls */}
          <div className="cave-controls">
            <h3>Cave Connections</h3>
            <button 
              className={isConnecting ? 'active' : ''} 
              onClick={() => {
                setIsConnecting(!isConnecting);
                setConnectionStart(null);
              }}
            >
              {isConnecting ? '❌ Cancel Connection' : '🔗 Create Cave Connection'}
            </button>
            {isConnecting && (
              <div className="connection-help">
                <p>1. Switch to Surface level and click where you want the cave entrance</p>
                <p>2. Switch to Underground level and click where the player should spawn</p>
              </div>
            )}
            {levelConnections.length > 0 && (
              <div className="connection-list">
                <h4>Existing Connections:</h4>
                {levelConnections.map((conn, idx) => (
                  <div key={conn.id} className="connection-item">
                    Cave {idx + 1}: ({conn.from.row}, {conn.from.col}) → ({conn.to.row}, {conn.to.col})
                    <button onClick={() => {
                      setLevelConnections(prev => prev.filter(c => c.id !== conn.id));
                      // Remove cave entrance from surface
                      setLevels(prev => {
                        const newLevels = { ...prev };
                        newLevels[0] = newLevels[0].map((r, rIdx) => 
                          r.map((c, cIdx) => 
                            rIdx === conn.from.row && cIdx === conn.from.col && c.isCaveEntrance
                              ? { ...c, obstacle: null, isCaveEntrance: false, connectedTo: null }
                              : c
                          )
                        );
                        return newLevels;
                      });
                    }}>🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="toolbar">
            <button 
              className={mode === 'terrain' ? 'active' : ''} 
              onClick={() => setMode('terrain')}
            >
              Terrain Mode
            </button>
            <button 
              className={mode === 'obstacle' ? 'active' : ''} 
              onClick={() => setMode('obstacle')}
            >
              Obstacle Mode
            </button>
            
            <div className="action-buttons">
              <button onClick={handleUndo} disabled={historyIndex <= 0}>
                Undo
              </button>
              <button onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
                Redo
              </button>
              <button onClick={handleClear}>
                Clear Level
              </button>
              <button onClick={handleClearAll} style={{ background: '#e74c3c' }}>
                Clear All
              </button>
              <button onClick={handleSave}>
                Save
              </button>
            </div>
            
            <div className="export-import-buttons" style={{ marginTop: '10px', padding: '10px', background: '#4CAF50', borderRadius: '8px' }}>
              <h4 style={{ color: 'white', margin: '0 0 10px 0' }}>🚀 Export/Import</h4>
              <button onClick={handleExportForGame} style={{ background: '#FF5722', color: 'white', fontWeight: 'bold', margin: '2px' }}>
                🚀 Export for Game
              </button>
              <button onClick={handleQuickExportForGame} style={{ background: '#4CAF50', color: 'white', fontWeight: 'bold', margin: '2px' }}>
                ⚡ Quick Export
              </button>
              <button onClick={handleImportTerrain} style={{ background: '#2196F3', color: 'white', fontWeight: 'bold', margin: '2px' }}>
                📤 Import JSON
              </button>
              <button onClick={() => {
                console.log('🔄 Re-exporting terrain...');
                handleExportForGame();
              }} style={{ background: '#9C27B0', color: 'white', fontWeight: 'bold', margin: '2px' }}>
                🔄 Re-export Fixed
              </button>
            </div>
          </div>

          {/* Tiles Palette */}
          {mode === 'terrain' ? (
            <div className="palette">
              <h3>Select Terrain Tile</h3>
              <div className="tiles-container">
                <div className="tiles-count">Available tiles: {terrainTiles.length}</div>
                {terrainTiles.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                    Loading terrain tiles...
                  </div>
                ) : (
                  <div className="tiles" style={{ minHeight: '200px', background: 'white', display: 'grid' }}>
                    {terrainTiles.map((src, idx) => (
                      <img
                        key={`terrain-${idx}-${src}`}
                        src={src}
                        alt={`Terrain ${idx + 1}`}
                        className={selectedTile === src ? 'selected' : ''}
                        onClick={() => setSelectedTile(src)}
                        onError={(e) => {
                          console.log('Failed to load terrain tile:', src);
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('Loaded terrain tile:', src);
                        }}
                        style={{
                          width: '48px',
                          height: '48px',
                          border: selectedTile === src ? '3px solid #16a34a' : '2px solid transparent',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          margin: '2px',
                          background: 'white',
                          objectFit: 'cover',
                          display: 'block',
                          opacity: 1,
                          visibility: 'visible'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="palette">
              <h3>Select Obstacle <span className="mode-indicator">{selectedCategory}</span></h3>
              
              <div className="category-selector" style={{ marginBottom: '1rem' }}>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '2px solid var(--primary-300)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {Object.keys(obstacleCategories).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="tiles-container">
                <div className="tiles-count">Available obstacles: {obstacleTiles.length}</div>
                <div className="tiles" style={{ minHeight: '200px', background: 'white', display: 'grid' }}>
                  {obstacleTiles.map((src, idx) => (
                    <img
                      key={`obstacle-${selectedCategory}-${idx}-${src}`}
                      src={src}
                      alt={`${selectedCategory} ${idx + 1}`}
                      className={selectedObstacle === src ? 'selected' : ''}
                      onClick={() => setSelectedObstacle(src)}
                      onError={(e) => {
                        console.log('Failed to load obstacle tile:', src);
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('Loaded obstacle tile:', src);
                      }}
                      style={{
                        width: '48px',
                        height: '48px',
                        border: selectedObstacle === src ? '3px solid #16a34a' : '2px solid transparent',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        margin: '2px',
                        background: 'white',
                        objectFit: 'cover',
                        display: 'block',
                        opacity: 1,
                        visibility: 'visible'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="terrain-designer-main">
          <div className="grid-container">
            <div className="grid">
              {getCurrentGrid().map((rowArr, rowIdx) => (
                <div key={rowIdx} className="grid-row">
                  {rowArr.map((cell, colIdx) => (
                    <div
                      key={colIdx}
                      className={`grid-cell ${cell.isCaveEntrance ? 'cave-entrance' : ''} ${isConnecting ? 'connecting' : ''} ${isDragging ? 'dragging' : ''}`}
                      onClick={() => handleCellClick(rowIdx, colIdx)}
                      onMouseDown={(e) => handleCellMouseDown(rowIdx, colIdx, e)}
                      onMouseEnter={() => handleCellMouseEnter(rowIdx, colIdx)}
                      onContextMenu={handleContextMenu}
                      style={{
                        cursor: isDragging 
                          ? (dragMode === 'erase' ? 'not-allowed' : 'crosshair')
                          : 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      {cell.terrain && (
                        <img
                          src={cell.terrain}
                          alt="terrain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      {cell.obstacle && (
                        <img
                          src={cell.obstacle}
                          alt="obstacle"
                          className="obstacle-img"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid-controls">
            <p>
              Current Mode: <span className="mode-indicator">{mode}</span> | 
              Level: <span className="level-indicator">{currentLevel === 0 ? 'Surface' : 'Underground'}</span>
              {isConnecting && <span className="connecting-indicator"> | 🔗 Connecting Mode</span>}
            </p>
            <p>Left click to place • Right click to erase • Grid: {gridHeight}×{gridWidth} ({gridHeight * gridWidth} cells)</p>
            <p>Export Size: {exportSize.width}×{exportSize.height}px • Cell Size: {Math.floor(exportSize.width / gridWidth)}×{Math.floor(exportSize.height / gridHeight)}px</p>
            <p>Selected: {mode === 'terrain' ? (selectedTile ? 'Terrain tile' : 'None') : (selectedObstacle ? `${selectedCategory} obstacle` : 'None')}</p>
            <p>Cave Connections: {levelConnections.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TerrainDesigner;
/**
 * TODO: For full parity with the video, consider these enhancements:
 * 1. Add a "Save" button to export the grid as JSON or image.
 * 2. Add a "Clear" button to reset the grid.
 * 3. Add hover preview for tile placement.
 * 4. Add undo/redo functionality.
 * 5. Add grid snapping and visual feedback.
 * 6. Add drag-to-paint for faster editing.
 * 7. Add zoom in/out for large maps.
 * 8. Add a sidebar for quick switching between terrain/obstacle palettes.
 * 9. Add keyboard shortcuts for mode switching and erasing.
 * 10. Add a mini-map or overview of the grid.
 * 
 * These features can be implemented as needed to further match the workflow in the video.
 */