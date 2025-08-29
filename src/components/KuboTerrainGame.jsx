import React, { useState, useEffect } from 'react';
import './KuboTerrainGame.css';

// Game configuration constants
const DIFFICULTY_LEVELS = {
  1: { 
    canvasWidth: 8, 
    canvasHeight: 6, 
    maxMoves: 8, 
    mathOps: false,
    name: 'Mudah',
    requiredMath: false,
    minSteps: 4,
    description: 'Gerakan dasar'
  },
  2: { 
    canvasWidth: 10, 
    canvasHeight: 8, 
    maxMoves: 10, 
    mathOps: true,
    name: 'Sedang',
    requiredMath: true,
    minSteps: 6,
    mathOperations: ['add', 'subtract'],
    description: 'Gunakan penjumlahan dan pengurangan'
  },
  3: { 
    canvasWidth: 12, 
    canvasHeight: 10, 
    maxMoves: 12, 
    mathOps: true,
    name: 'Sulit',
    requiredMath: true,
    minSteps: 8,
    mathOperations: ['add', 'subtract', 'multiply'],
    requiredLoops: 1,
    description: 'Gunakan perkalian dan loop'
  },
  4: { 
    canvasWidth: 14, 
    canvasHeight: 12, 
    maxMoves: 15, 
    mathOps: true,
    name: 'Sangat Sulit',
    requiredMath: true,
    minSteps: 10,
    mathOperations: ['add', 'subtract', 'multiply', 'divide'],
    requiredLoops: 2,
    conditionalLogic: true,
    description: 'Gunakan semua operasi, loop, dan logika kondisional'
  },
  5: { 
    canvasWidth: 16, 
    canvasHeight: 14, 
    maxMoves: 18, 
    mathOps: true,
    name: 'Ahli',
    requiredMath: true,
    minSteps: 12,
    mathOperations: ['add', 'subtract', 'multiply', 'divide'],
    requiredLoops: 3,
    conditionalLogic: true,
    nestedLoops: true,
    description: 'Master semua konsep matematika dan pemrograman'
  }
};

const START_POS = { x: 1, y: 1 };
const CELL_SIZE = 60;

const TERRAIN_TYPES = {
  grass: {
    walkable: true,
    asset: '/src/assets/realistic-grass.svg',
    color: '#4CAF50',
    weight: 0.6
  },
  tree: {
    walkable: false,
    asset: '/src/assets/realistic-tree.svg', 
    color: '#2E7D32',
    weight: 0.15
  },
  rock: {
    walkable: false,
    asset: '/src/assets/realistic-rock.svg',
    color: '#757575', 
    weight: 0.1
  },
  water: {
    walkable: false,
    asset: '/src/assets/realistic-water.svg',
    color: '#2196F3',
    weight: 0.1
  },
  dirt: {
    walkable: true,
    asset: '/src/assets/rocky-ground.svg',
    color: '#8D6E63',
    weight: 0.05
  }
};

// Add pathfinding function to check if path exists
const hasValidPath = (terrain, startPos, targetPos, width, height) => {
  // BFS to find if there's a path from start to target
  const queue = [{ x: startPos.x, y: startPos.y }];
  const visited = new Set();
  const directions = [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 }];
  
  visited.add(`${startPos.x},${startPos.y}`);
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    // Check if we reached the target
    if (current.x === targetPos.x && current.y === targetPos.y) {
      return true;
    }
    
    // Check all adjacent cells
    for (const dir of directions) {
      const newX = current.x + dir.x;
      const newY = current.y + dir.y;
      const key = `${newX},${newY}`;
      
      // Check bounds
      if (newX >= 0 && newX < width && newY >= 0 && newY < height && !visited.has(key)) {
        // Check if cell is walkable
        const terrainType = terrain[newY][newX];
        if (TERRAIN_TYPES[terrainType] && TERRAIN_TYPES[terrainType].walkable) {
          visited.add(key);
          queue.push({ x: newX, y: newY });
        }
      }
    }
  }
  
  return false;
};

const generateTerrain = (width, height, startPos, targetPos) => {
  let terrain;
  let attempts = 0;
  const maxAttempts = 20; // Reduced attempts for faster generation
  
  do {
    terrain = [];
    attempts++;
    
    // First, create a guaranteed path corridor
    const pathCells = new Set();
    let currentX = startPos.x;
    let currentY = startPos.y;
    
    // Create L-shaped path from start to target
    while (currentX !== targetPos.x) {
      pathCells.add(`${currentX},${currentY}`);
      if (currentX < targetPos.x) currentX++;
      else currentX--;
    }
    while (currentY !== targetPos.y) {
      pathCells.add(`${currentX},${currentY}`);
      if (currentY < targetPos.y) currentY++;
      else currentY--;
    }
    pathCells.add(`${targetPos.x},${targetPos.y}`);
    
    // Add some buffer cells around the path for easier navigation
    const bufferCells = new Set();
    pathCells.forEach(cell => {
      const [x, y] = cell.split(',').map(Number);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const newX = x + dx;
          const newY = y + dy;
          if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
            bufferCells.add(`${newX},${newY}`);
          }
        }
      }
    });
    
    for (let y = 0; y < height; y++) {
      terrain[y] = [];
      for (let x = 0; x < width; x++) {
        const cellKey = `${x},${y}`;
        
        // Always make start and target walkable
        if ((x === startPos.x && y === startPos.y) || (x === targetPos.x && y === targetPos.y)) {
          terrain[y][x] = 'grass';
          continue;
        }
        
        // Ensure path corridor is walkable
        if (pathCells.has(cellKey)) {
          terrain[y][x] = 'grass';
          continue;
        }
        
        // Reduce obstacle density near the path
        const isNearPath = bufferCells.has(cellKey);
        const rand = Math.random();
        
        if (isNearPath) {
          // Higher chance of walkable terrain near path
          if (rand < 0.85) {
            terrain[y][x] = 'grass';
          } else if (rand < 0.95) {
            terrain[y][x] = 'dirt';
          } else {
            terrain[y][x] = 'tree';
          }
        } else {
          // Normal terrain generation for other areas
          if (rand < 0.6) {
            terrain[y][x] = 'grass';
          } else if (rand < 0.75) {
            terrain[y][x] = 'tree';
          } else if (rand < 0.85) {
            terrain[y][x] = 'rock';
          } else if (rand < 0.95) {
            terrain[y][x] = 'water';
          } else {
            terrain[y][x] = 'dirt';
          }
        }
      }
    }
    
    // Since we pre-created a path, we should always have a valid path
    // But let's verify just in case
    if (hasValidPath(terrain, startPos, targetPos, width, height)) {
      break;
    }
    
  } while (attempts < maxAttempts);
  
  // Final fallback - create simple L-shaped path if all else fails
  if (attempts >= maxAttempts) {
    for (let y = 0; y < height; y++) {
      terrain[y] = [];
      for (let x = 0; x < width; x++) {
        terrain[y][x] = 'grass'; // Start with all grass
      }
    }
    
    // Add some obstacles but ensure path remains clear
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if ((x === startPos.x && y === startPos.y) || (x === targetPos.x && y === targetPos.y)) {
          continue; // Keep start and target clear
        }
        
        // Don't place obstacles on the guaranteed L-path
        const onHorizontalPath = (y === startPos.y && 
          ((x >= Math.min(startPos.x, targetPos.x) && x <= Math.max(startPos.x, targetPos.x))));
        const onVerticalPath = (x === targetPos.x && 
          ((y >= Math.min(startPos.y, targetPos.y) && y <= Math.max(startPos.y, targetPos.y))));
        
        if (!onHorizontalPath && !onVerticalPath && Math.random() < 0.3) {
          const rand = Math.random();
          if (rand < 0.5) terrain[y][x] = 'tree';
          else if (rand < 0.8) terrain[y][x] = 'rock';
          else terrain[y][x] = 'water';
        }
      }
    }
  }
  
  return terrain;
};

const CarCharacter = ({ size = 48, x = 0, y = 0, direction = 'right', isAnimating = false }) => {
  const getCarAsset = () => {
    switch (direction) {
      case 'up': return '/src/assets/car-back.svg';
      case 'down': return '/src/assets/car-front.svg';
      case 'left': return '/src/assets/car-left.svg';
      case 'right': return '/src/assets/car-right.svg';
      default: return '/src/assets/car-right.svg';
    }
  };

  return (
    <div
      className="car-character"
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage: `url(${getCarAsset()})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        zIndex: 10,
        transition: isAnimating ? 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'all 0.3s ease',
      }}
    />
  );
};

const KuboTile = ({ id, name, icon, category, onClick, onContextMenu, isDragging, onDragStart, onDragEnd, description, ...props }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = (e) => {
    e.currentTarget.classList.add('clicked');
    setTimeout(() => {
      e.currentTarget.classList.remove('clicked');
    }, 300);
    if (onClick) onClick();
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (onContextMenu) onContextMenu(e);
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      id,
      name,
      icon,
      category,
      description,
      ...props
    }));
    if (onDragStart) onDragStart(e);
  };

  return (
    <div
      className={`kubo-tile ${isDragging ? 'dragging' : ''}`}
      data-category={category}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      draggable
      title={name}
      onMouseEnter={() => {
        if (description) {
          setShowTooltip(true);
        }
      }}
      onMouseLeave={() => {
        setShowTooltip(false);
      }}
      {...props}
    >
      <div className="kubo-tile-icon">{icon}</div>
      <div className="kubo-tile-label">{name}</div>
      
      {showTooltip && description && (
        <div className="tile-tooltip">
          {description}
        </div>
      )}
    </div>
  );
};

const KUBO_TILES = {
  movement: [
    { id: 'right1', name: 'Move Right', icon: '🚗➡️', color: 'linear-gradient(135deg, #4CAF50, #66BB6A)', action: 'move', param: { x: 1, y: 0 }, size: 'large', glow: '#4CAF50', description: 'Command: Move car 1 step right. Use in sequences and loops.' },
    { id: 'left1', name: 'Move Left', icon: '⬅️🚗', color: 'linear-gradient(135deg, #2196F3, #42A5F5)', action: 'move', param: { x: -1, y: 0 }, size: 'large', glow: '#2196F3', description: 'Command: Move car 1 step left. Use in sequences and loops.' },
    { id: 'up1', name: 'Move Up', icon: '🚗⬆️', color: 'linear-gradient(135deg, #FF9800, #FFB74D)', action: 'move', param: { x: 0, y: -1 }, size: 'large', glow: '#FF9800', description: 'Command: Move car 1 step up. Use in sequences and loops.' },
    { id: 'down1', name: 'Move Down', icon: '⬇️🚗', color: 'linear-gradient(135deg, #9C27B0, #BA68C8)', action: 'move', param: { x: 0, y: 1 }, size: 'large', glow: '#9C27B0', description: 'Command: Move car 1 step down. Use in sequences and loops.' },
    { id: 'right2', name: 'Sprint Right', icon: '🚗💨➡️', color: 'linear-gradient(135deg, #4CAF50, #8BC34A)', action: 'move', param: { x: 2, y: 0 }, size: 'large', minLevel: 2, glow: '#4CAF50', description: 'Command: Move car 2 steps right. Efficient for longer distances.' },
    { id: 'left2', name: 'Sprint Left', icon: '⬅️💨🚗', color: 'linear-gradient(135deg, #2196F3, #03A9F4)', action: 'move', param: { x: -2, y: 0 }, size: 'large', minLevel: 2, glow: '#2196F3', description: 'Command: Move car 2 steps left. Efficient for longer distances.' }
  ],
  numbers: [
    { id: 'num1', value: '1', icon: '1️⃣', color: '#FF9800', action: 'number', param: 1, size: 'large', description: 'Number: Value 1. Use with math operators or loop counts.' },
    { id: 'num2', value: '2', icon: '2️⃣', color: '#FFB74D', action: 'number', param: 2, size: 'large', description: 'Number: Value 2. Use with math operators or loop counts.' },
    { id: 'num3', value: '3', icon: '3️⃣', color: '#FFCC02', action: 'number', param: 3, size: 'large', description: 'Number: Value 3. Use with math operators or loop counts.' },
    { id: 'num4', value: '4', icon: '4️⃣', color: '#FFC107', action: 'number', param: 4, size: 'large', minLevel: 2, description: 'Number: Value 4. Use with math operators or loop counts.' },
    { id: 'num5', value: '5', icon: '5️⃣', color: '#FFD54F', action: 'number', param: 5, size: 'large', minLevel: 2, description: 'Number: Value 5. Use with math operators or loop counts.' },
    { id: 'num6', value: '6', icon: '6️⃣', color: '#FFEB3B', action: 'number', param: 6, size: 'large', minLevel: 3, description: 'Number: Value 6. Use with math operators or loop counts.' },
    { id: 'num7', value: '7', icon: '7️⃣', color: '#F9A825', action: 'number', param: 7, size: 'large', minLevel: 3, description: 'Number: Value 7. Use with math operators or loop counts.' },
    { id: 'num8', value: '8', icon: '8️⃣', color: '#F57F17', action: 'number', param: 8, size: 'large', minLevel: 4, description: 'Number: Value 8. Use with math operators or loop counts.' },
    { id: 'num9', value: '9', icon: '9️⃣', color: '#FF8F00', action: 'number', param: 9, size: 'large', minLevel: 4, description: 'Number: Value 9. Use with math operators or loop counts.' },
    { id: 'num10', value: '10', icon: '🔟', color: '#E65100', action: 'number', param: 10, size: 'large', minLevel: 5, description: 'Number: Value 10. Use with math operators or loop counts.' }
  ],
  actions: [
    { id: 'go', value: 'MULAI', icon: '🚀', color: '#9C27B0', action: 'start', param: null, size: 'large', description: 'Action: Start program execution. Use to begin your sequence.' },
    { id: 'stop', value: 'BERHENTI', icon: '🛑', color: '#AD47B5', action: 'stop', param: null, size: 'large', description: 'Action: Stop program execution. Use to end your sequence.' },
    { id: 'beep', value: 'BUNYI', icon: '🔊', color: '#BA68C8', action: 'beep', param: null, size: 'large', description: 'Action: Play beep sound. Use for feedback or debugging.' },
    { id: 'dance', value: 'MENARI', icon: '💃', color: '#CE93D8', action: 'dance', param: null, size: 'large', minLevel: 3, description: 'Action: Car celebration dance. Use for success events.' },
    { id: 'celebrate', value: 'PESTA', icon: '🎉', color: '#E1BEE7', action: 'celebrate', param: null, size: 'large', minLevel: 4, description: 'Action: Victory celebration. Use when reaching goals.' }
  ],
  math: [
    { id: 'add', value: '+', icon: '➕', color: '#2196F3', action: 'math', param: 'add', size: 'large', minLevel: 2, description: 'Math: Addition operator. Use with numbers for calculations.' },
    { id: 'subtract', value: '-', icon: '➖', color: '#42A5F5', action: 'math', param: 'subtract', size: 'large', minLevel: 2, description: 'Math: Subtraction operator. Use with numbers for calculations.' },
    { id: 'multiply', value: '×', icon: '✖️', color: '#64B5F6', action: 'math', param: 'multiply', size: 'large', minLevel: 4, description: 'Math: Multiplication operator. Use with numbers for calculations.' },
    { id: 'equals', value: '=', icon: '🟰', color: '#90CAF9', action: 'math', param: 'equals', size: 'large', minLevel: 3, description: 'Math: Equals operator. Use to complete calculations.' }
  ],
  loops: [
    { id: 'loop_start_2', value: 'Repeat 2x', icon: '🔄2️⃣', color: '#FF5722', action: 'loop_start', param: 2, size: 'large', minLevel: 3, description: 'Start a loop that repeats the next actions 2 times' },
    { id: 'loop_start_3', value: 'Repeat 3x', icon: '🔁3️⃣', color: '#FF7043', action: 'loop_start', param: 3, size: 'large', minLevel: 4, description: 'Start a loop that repeats the next actions 3 times' },
    { id: 'loop_start_5', value: 'Repeat 5x', icon: '🌀5️⃣', color: '#FF8A65', action: 'loop_start', param: 5, size: 'large', minLevel: 5, description: 'Start a loop that repeats the next actions 5 times' },
    { id: 'loop_start_custom', value: 'Repeat ?x', icon: '🔄❓', color: '#FF6F00', action: 'loop_start', param: 1, size: 'large', minLevel: 3, description: 'Start a loop with custom repetition count - click to set number', customizable: true },
    { id: 'loop_end', value: 'End Loop', icon: '🔚', color: '#D32F2F', action: 'loop_end', param: null, size: 'large', minLevel: 3, description: 'End the current loop - all actions between loop start and end will be repeated' }
  ]
};

const KuboTerrainGame = () => {
  // Game state
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [carPos, setCarPos] = useState(START_POS);
  const [initialSpawnPos, setInitialSpawnPos] = useState(START_POS);
  const [target, setTarget] = useState({ x: 6, y: 4 });
  const [message, setMessage] = useState("");
  const [terrain, setTerrain] = useState([]);
  const [score, setScore] = useState(0);
  const [programSequence, setProgramSequence] = useState([]);
  const [draggedTile, setDraggedTile] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [movesUsed, setMovesUsed] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [availableTiles, setAvailableTiles] = useState({});
  const [gameOver, setGameOver] = useState(false);
  const [carDirection, setCarDirection] = useState('right');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  // New state for collapsible categories
  const [collapsedCategories, setCollapsedCategories] = useState({
    movement: false,
    math: false,
    actions: false,
    loops: false
  });
  
  // State for custom loop counts
  const [customLoopCounts, setCustomLoopCounts] = useState({});

  // Get current difficulty settings
  const currentDifficulty = DIFFICULTY_LEVELS[difficultyLevel];
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Initialize target and terrain based on difficulty level
  useEffect(() => {
    if (currentDifficulty) {
      const { canvasWidth, canvasHeight } = currentDifficulty;
      
      // Generate random start position
      const newStartPos = {
        x: Math.floor(Math.random() * (canvasWidth - 2)) + 1,
        y: Math.floor(Math.random() * (canvasHeight - 2)) + 1
      };
      
      // Generate random target position, avoiding start position
      let newTarget;
      do {
        newTarget = {
          x: Math.floor(Math.random() * (canvasWidth - 2)) + 1,
          y: Math.floor(Math.random() * (canvasHeight - 2)) + 1
        };
      } while (newTarget.x === newStartPos.x && newTarget.y === newStartPos.y);
      
      setCarPos(newStartPos);
      setInitialSpawnPos(newStartPos);
      setTarget(newTarget);
      
      // Generate terrain with walkable path
      const newTerrain = generateTerrain(
        canvasWidth,
        canvasHeight,
        newStartPos,
        newTarget
      );
      setTerrain(newTerrain);
      updateAvailableTiles();
      
      // Clear program sequence when level changes
      setProgramSequence([]);
    }
  }, [difficultyLevel]);
  
  // Update available tiles based on difficulty level
  const updateAvailableTiles = () => {
    const currentLevel = DIFFICULTY_LEVELS[difficultyLevel];
    const tiles = {};
    
    Object.keys(KUBO_TILES).forEach(category => {
      tiles[category] = KUBO_TILES[category].filter(tile => 
        !tile.minLevel || tile.minLevel <= difficultyLevel
      );
    });
    
    // Progressive difficulty: filter tiles based on level requirements
    if (!currentLevel.requiredMath) {
      // Level 1: Only basic movement
      delete tiles.math;
      delete tiles.loops;
    } else {
      // Filter math operations based on level
      if (currentLevel.mathOperations && tiles.math) {
        const allowedOps = currentLevel.mathOperations;
        tiles.math = tiles.math.filter(tile => 
          allowedOps.includes(tile.param)
        );
      }
      
      // Remove loops for levels that don't require them
      if (!currentLevel.requiredLoops) {
        delete tiles.loops;
      }
    }
    
    setAvailableTiles(tiles);
  };

  const resetGame = () => {
    const { canvasWidth, canvasHeight } = currentDifficulty;
    
    // Generate random start position
    const newStartPos = {
      x: Math.floor(Math.random() * (canvasWidth - 2)) + 1,
      y: Math.floor(Math.random() * (canvasHeight - 2)) + 1
    };
    
    // Generate random target position, avoiding start position
    let newTarget;
    do {
      newTarget = {
        x: Math.floor(Math.random() * (canvasWidth - 2)) + 1,
        y: Math.floor(Math.random() * (canvasHeight - 2)) + 1
      };
    } while (newTarget.x === newStartPos.x && newTarget.y === newStartPos.y);
    
    setCarPos(newStartPos);
    setInitialSpawnPos(newStartPos);
    setCarDirection('right');
    setTarget(newTarget);
    
    // Regenerate terrain with walkable path
    const newTerrain = generateTerrain(
      canvasWidth,
      canvasHeight,
      newStartPos,
      newTarget
    );
    setTerrain(newTerrain);
    setMessage("");
    setMovesUsed(0);
    setGameOver(false);
    setShowCelebration(false);
    setShowSuccessPopup(false);
    setIsAnimating(false);
  };

  // Render game canvas with terrain grid
  const renderGameCanvas = () => {
    const { canvasWidth, canvasHeight } = currentDifficulty;
    const cells = [];
    
    // Calculate cell size based on available space and level progression
    const maxCanvasWidth = Math.min(600, windowSize.width * 0.4); // Responsive max width
    const maxCanvasHeight = Math.min(500, windowSize.height * 0.6); // Max height constraint
    
    // Calculate cell size to fit within both width and height constraints
    const cellSizeByWidth = maxCanvasWidth / canvasWidth;
    const cellSizeByHeight = maxCanvasHeight / canvasHeight;
    const cellSize = Math.min(CELL_SIZE, cellSizeByWidth, cellSizeByHeight, 40); // Max 40px per cell
    
    const finalCanvasWidth = canvasWidth * cellSize;
    const finalCanvasHeight = canvasHeight * cellSize;
    
    // Generate cells with terrain
    for (let y = 0; y < canvasHeight; y++) {
      for (let x = 0; x < canvasWidth; x++) {
        const isCarPos = carPos.x === x && carPos.y === y;
        const isTarget = target.x === x && target.y === y;
        const isStartPos = START_POS.x === x && START_POS.y === y;
        
        // Get terrain for this cell
        const terrainType = terrain[y] && terrain[y][x] ? terrain[y][x] : 'grass';
        const terrainConfig = TERRAIN_TYPES[terrainType] || TERRAIN_TYPES.grass;
        
        // Check if this is the initial spawn position (where car started)
        const isInitialSpawn = x === initialSpawnPos.x && y === initialSpawnPos.y;
        
        cells.push(
          <div
            key={`${x}-${y}`}
            className={`game-cell terrain-${terrainType} ${
              isCarPos ? 'car-cell' : ''
            } ${
              isTarget ? 'target-cell' : ''
            } ${
              isInitialSpawn ? 'spawn-cell' : ''
            }`}
            style={{
              left: `${x * cellSize}px`,
              top: `${y * cellSize}px`,
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              backgroundImage: `url(${terrainConfig.asset})`,
              backgroundColor: terrainConfig.color,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {isTarget && (
              <img 
                src="/assets/kubo-target-tile.svg" 
                alt="Target" 
                className="target-asset"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  position: 'relative',
                  zIndex: 2
                }}
              />
            )}
            {isInitialSpawn && !isCarPos && (
              <div className="house-marker" style={{ 
                position: 'absolute', 
                zIndex: 2, 
                fontSize: `${cellSize * 0.6}px`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}>🏠</div>
            )}
          </div>
        );
      }
    }
      
    return (
      <div 
        className="game-canvas"
        style={{
          width: `${finalCanvasWidth}px`,
          height: `${finalCanvasHeight}px`,
          position: 'relative',
          overflow: 'visible'
        }}
      >
        {cells}
        <CarCharacter 
          size={Math.floor(cellSize * 0.8)}
          x={carPos.x * cellSize + cellSize * 0.1}
          y={carPos.y * cellSize + cellSize * 0.1}
          direction={carDirection}
          isAnimating={isAnimating}
        />
      </div>
    );
  };

  const addTileToSequence = (tile) => {
    if (!isRunning) {
      let finalTile = { ...tile, id: Date.now() + Math.random() };
      
      // Handle custom loop tiles
      if (tile.customizable && tile.action === 'loop_start') {
        const count = prompt('Enter number of repetitions (1-20):', '3');
        const repeatCount = parseInt(count);
        
        if (isNaN(repeatCount) || repeatCount < 1 || repeatCount > 20) {
          alert('Please enter a valid number between 1 and 20');
          return;
        }
        
        finalTile = {
          ...finalTile,
          param: repeatCount,
          value: `Repeat ${repeatCount}x`,
          icon: `🔄${repeatCount}️⃣`
        };
      }
      
      setProgramSequence(prev => [...prev, finalTile]);
    }
  };

  const removeTileFromSequence = (index) => {
    if (!isRunning) {
      setProgramSequence(prev => prev.filter((_, i) => i !== index));
    }
  };

  const clearProgram = () => {
    if (!isRunning) {
      setProgramSequence([]);
    }
  };

  const regenerateLevel = () => {
    if (!isRunning) {
      resetGame();
      setMessage("🔄 Level regenerated with a guaranteed path!");
    }
  };

  // Render program sequence with visual loop containers
  const renderProgramSequenceWithLoops = () => {
    const elements = [];
    let globalIndex = 0;
    
    const renderSequenceSection = (sequence, startIndex = 0, isInLoop = false, loopCount = null) => {
      const sectionElements = [];
      let i = 0;
      
      while (i < sequence.length) {
        const tile = sequence[i];
        const currentGlobalIndex = startIndex + i;
        
        if (tile.action === 'loop_start') {
          // Find matching loop_end
          let loopDepth = 1;
          let loopEndIndex = -1;
          
          for (let j = i + 1; j < sequence.length; j++) {
            if (sequence[j].action === 'loop_start') {
              loopDepth++;
            } else if (sequence[j].action === 'loop_end') {
              loopDepth--;
              if (loopDepth === 0) {
                loopEndIndex = j;
                break;
              }
            }
          }
          
          if (loopEndIndex === -1) {
            // No matching end, render as regular tile with warning
            sectionElements.push(
              <div key={`${tile.id}-${currentGlobalIndex}`} className="sequence-tile-wrapper error">
                <KuboTile
                  {...tile}
                  data-category={tile.category}
                  onClick={() => removeTileFromSequence(currentGlobalIndex)}
                  onContextMenu={() => removeTileFromSequence(currentGlobalIndex)}
                />
                <div className="tile-index">{currentGlobalIndex + 1}</div>
                <div className="tile-warning">⚠️ Missing End</div>
              </div>
            );
            i++;
          } else {
            // Render loop container
            const loopBody = sequence.slice(i + 1, loopEndIndex);
            const loopStartTile = tile;
            const loopEndTile = sequence[loopEndIndex];
            
            sectionElements.push(
              <div key={`loop-${currentGlobalIndex}`} className="loop-container">
                <div className="loop-header">
                  <div className="sequence-tile-wrapper loop-start">
                    <KuboTile
                      {...loopStartTile}
                      data-category={loopStartTile.category}
                      onClick={() => removeTileFromSequence(currentGlobalIndex)}
                      onContextMenu={() => removeTileFromSequence(currentGlobalIndex)}
                    />
                    <div className="tile-index">{currentGlobalIndex + 1}</div>
                  </div>
                  <div className="loop-indicator">
                    <span className="loop-count">Repeat {loopStartTile.param}x</span>
                    <div className="loop-arrow">↓</div>
                  </div>
                </div>
                
                <div className="loop-body">
                  {renderSequenceSection(loopBody, currentGlobalIndex + 1, true, loopStartTile.param)}
                </div>
                
                <div className="loop-footer">
                  <div className="sequence-tile-wrapper loop-end">
                    <KuboTile
                      {...loopEndTile}
                      data-category={loopEndTile.category}
                      onClick={() => removeTileFromSequence(currentGlobalIndex + loopBody.length + 1)}
                      onContextMenu={() => removeTileFromSequence(currentGlobalIndex + loopBody.length + 1)}
                    />
                    <div className="tile-index">{currentGlobalIndex + loopBody.length + 2}</div>
                  </div>
                  <div className="loop-indicator">
                    <div className="loop-arrow">↑</div>
                    <span className="loop-end-text">End Loop</span>
                  </div>
                </div>
              </div>
            );
            
            i = loopEndIndex + 1;
          }
        } else {
          // Regular tile
          const tileClass = isInLoop ? 'sequence-tile-wrapper in-loop' : 'sequence-tile-wrapper';
          sectionElements.push(
            <div key={`${tile.id}-${currentGlobalIndex}`} className={tileClass}>
              <KuboTile
                {...tile}
                data-category={tile.category}
                onClick={() => removeTileFromSequence(currentGlobalIndex)}
                onContextMenu={() => removeTileFromSequence(currentGlobalIndex)}
              />
              <div className="tile-index">{currentGlobalIndex + 1}</div>
              {isInLoop && loopCount && (
                <div className="loop-execution-indicator">
                  <small>×{loopCount}</small>
                </div>
              )}
            </div>
          );
          i++;
        }
      }
      
      return sectionElements;
    };
    
    return renderSequenceSection(programSequence);
  };

  // Toggle category collapse state
  const toggleCategory = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const tileData = e.dataTransfer.getData('application/json');
    if (tileData) {
      try {
        const tile = JSON.parse(tileData);
        // Ensure category is preserved during drag and drop
        addTileToSequence(tile);
      } catch (error) {
        console.error('Error parsing dropped tile data:', error);
      }
    }
  };

  const runProgram = async () => {
    if (programSequence.length === 0 || isRunning) return;
    
    setIsRunning(true);
    setIsAnimating(true);
    let currentPos = { ...carPos };
    let moveCount = 0;
    let direction = carDirection;
    
    // Parse program sequence to handle loops
    const executeSequence = async (sequence) => {
      let i = 0;
      while (i < sequence.length) {
        const tile = sequence[i];
        
        if (tile.action === 'loop_start') {
          // Find matching loop_end
          let loopDepth = 1;
          let loopEndIndex = -1;
          
          for (let j = i + 1; j < sequence.length; j++) {
            if (sequence[j].action === 'loop_start') {
              loopDepth++;
            } else if (sequence[j].action === 'loop_end') {
              loopDepth--;
              if (loopDepth === 0) {
                loopEndIndex = j;
                break;
              }
            }
          }
          
          if (loopEndIndex === -1) {
            // No matching loop_end found, skip this loop
            setMessage('⚠️ Loop missing end marker! Add "End Loop" tile.');
            i++;
            continue;
          }
          
          // Extract loop body (tiles between loop_start and loop_end)
          const loopBody = sequence.slice(i + 1, loopEndIndex);
          const repeatCount = tile.param;
          
          // Execute loop body multiple times
          for (let rep = 0; rep < repeatCount; rep++) {
            await executeSequence(loopBody);
          }
          
          // Skip to after the loop_end
          i = loopEndIndex + 1;
        } else if (tile.action === 'loop_end') {
          // Standalone loop_end (shouldn't happen with proper parsing)
          setMessage('⚠️ Found "End Loop" without matching "Repeat" tile!');
          i++;
        } else if (tile.action === 'move') {
          const newPos = {
            x: currentPos.x + tile.param.x,
            y: currentPos.y + tile.param.y
          };
          
          // Check bounds
          if (newPos.x >= 0 && newPos.x < currentDifficulty.canvasWidth && 
              newPos.y >= 0 && newPos.y < currentDifficulty.canvasHeight) {
            
            // Check terrain walkability
            const terrainType = terrain[newPos.y] && terrain[newPos.y][newPos.x] ? terrain[newPos.y][newPos.x] : 'grass';
            const terrainConfig = TERRAIN_TYPES[terrainType] || TERRAIN_TYPES.grass;
            
            if (terrainConfig.walkable) {
              currentPos = newPos;
              moveCount++;
              
              // Update direction based on movement
              if (tile.param.x > 0) direction = 'right';
              else if (tile.param.x < 0) direction = 'left';
              else if (tile.param.y > 0) direction = 'down';
              else if (tile.param.y < 0) direction = 'up';
              
              setCarPos(currentPos);
              setCarDirection(direction);
              
              await new Promise(resolve => setTimeout(resolve, 800));
            } else {
              setMessage('🚫 Cannot move to that terrain!');
            }
          } else {
            setMessage('🚫 Cannot move outside the game area!');
          }
          i++;
        } else {
          // Handle other actions (beep, dance, etc.)
          if (tile.action === 'beep') {
            setMessage('🔊 Beep!');
            await new Promise(resolve => setTimeout(resolve, 500));
          } else if (tile.action === 'dance') {
            setMessage('💃 Dancing!');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          i++;
        }
      }
    };
    
    await executeSequence(programSequence);
    
    setMovesUsed(moveCount);
    
    // Check win condition
    setTimeout(() => {
      if (currentPos.x === target.x && currentPos.y === target.y) {
        setMessage(`🎉 Level ${difficultyLevel} Complete! Moves: ${moveCount}/${currentDifficulty.maxMoves}`);
        setScore(prev => prev + (currentDifficulty.maxMoves - moveCount + 1) * 10);
        setGamesWon(prev => prev + 1);
        setShowSuccessPopup(true);
        setShowCelebration(true);
      } else {
        setMessage(`🐛 Try again! Moves used: ${moveCount}/${currentDifficulty.maxMoves}`);
      }
      setIsRunning(false);
      setIsAnimating(false);
    }, 500);
  };

  return (
    <div className="kubo-theme">
      <div className="scratch-workspace">
        {/* Game Info */}
        <div className="kubo-game-info">
          <div className="level-info">
            <h3>Level {difficultyLevel} - {DIFFICULTY_LEVELS[difficultyLevel].name}</h3>
            <p className="level-description">{DIFFICULTY_LEVELS[difficultyLevel].description}</p>
            <p>Gerakan: {programSequence.length}/{DIFFICULTY_LEVELS[difficultyLevel].maxMoves}</p>
            {DIFFICULTY_LEVELS[difficultyLevel].requiredMath && (
              <div className="math-requirements">
                <small>Operasi yang tersedia: {DIFFICULTY_LEVELS[difficultyLevel].mathOperations?.join(', ')}</small>
                {DIFFICULTY_LEVELS[difficultyLevel].requiredLoops && (
                  <small>Loop diperlukan: {DIFFICULTY_LEVELS[difficultyLevel].requiredLoops}</small>
                )}
              </div>
            )}
          </div>
          <div className="game-stats">
            <span>Level: {difficultyLevel}</span>
            <span>Score: {score}</span>
            <span>Moves: {movesUsed}/{currentDifficulty?.maxMoves || 0}</span>
            <span>Won: {gamesWon}</span>
          </div>
          <div className="level-controls">
            <button 
              onClick={() => {
                setDifficultyLevel(Math.max(1, difficultyLevel - 1));
                setProgramSequence([]); // Clear program sequence
              }}
              disabled={difficultyLevel <= 1}
            >
              ← Level Sebelumnya
            </button>
            <button 
              onClick={() => {
                setDifficultyLevel(Math.min(5, difficultyLevel + 1));
                setProgramSequence([]); // Clear program sequence
              }}
              disabled={difficultyLevel >= 5}
            >
              Level Selanjutnya →
            </button>
          </div>
        </div>

        {/* Blocks Palette */}
        <div className="scratch-blocks-palette">
          <div className="palette-category">
            <h3 
              className="category-header clickable" 
              onClick={() => toggleCategory('movement')}
            >
              Movement {collapsedCategories.movement ? '▶' : '▼'}
            </h3>
            {!collapsedCategories.movement && (
              <div className="tiles-grid">
                {availableTiles.movement?.map(tile => (
                  <KuboTile
                    key={tile.id}
                    {...tile}
                    category="movement"
                    data-category="movement"
                    onClick={() => addTileToSequence({...tile, category: "movement"})}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="palette-category">
            <h3 
              className="category-header clickable" 
              onClick={() => toggleCategory('math')}
            >
              Math {collapsedCategories.math ? '▶' : '▼'}
            </h3>
            {!collapsedCategories.math && (
              <div className="tiles-grid">
                {availableTiles.numbers?.map(tile => (
                  <KuboTile
                    key={tile.id}
                    {...tile}
                    category="numbers"
                    data-category="numbers"
                    onClick={() => addTileToSequence({...tile, category: "numbers"})}
                  />
                ))}
                {availableTiles.math?.map(tile => (
                  <KuboTile
                    key={tile.id}
                    {...tile}
                    category="math"
                    data-category="math"
                    onClick={() => addTileToSequence({...tile, category: "math"})}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="palette-category">
            <h3 
              className="category-header clickable" 
              onClick={() => toggleCategory('actions')}
            >
              Actions {collapsedCategories.actions ? '▶' : '▼'}
            </h3>
            {!collapsedCategories.actions && (
              <div className="tiles-grid">
                {availableTiles.actions?.map(tile => (
                  <KuboTile
                    key={tile.id}
                    {...tile}
                    category="actions"
                    data-category="actions"
                    onClick={() => addTileToSequence({...tile, category: "actions"})}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="palette-category">
            <h3 
              className="category-header clickable" 
              onClick={() => toggleCategory('loops')}
            >
              Loops {collapsedCategories.loops ? '▶' : '▼'}
            </h3>
            {!collapsedCategories.loops && (
              <div className="tiles-grid">
                {availableTiles.loops?.map(tile => (
                  <KuboTile
                    key={tile.id}
                    {...tile}
                    category="loops"
                    data-category="loops"
                    onClick={() => addTileToSequence({...tile, category: "loops"})}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stage Area */}
        <div className="scratch-stage-area">
          <div className="game-canvas-container">
            {renderGameCanvas()}
          </div>
        </div>

        {/* Scripts Area with Drop Zone */}
        <div 
          className="scratch-scripts-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="scripts-header">
            <h3>Program Sequence</h3>
            <div className="program-controls">
              <button onClick={runProgram} disabled={isRunning || programSequence.length === 0}>
                {isRunning ? 'Running...' : 'Run'}
              </button>
              <button onClick={resetGame} disabled={isRunning}>
                Reset
              </button>
              <button onClick={clearProgram} disabled={isRunning}>
                Clear
              </button>
              <button onClick={regenerateLevel} disabled={isRunning} title="Generate a new level with guaranteed path">
                🔄 New Level
              </button>
            </div>
          </div>
          
          <div className="programming-workspace">
            <div className="program-sequence">
              {programSequence.length === 0 ? (
                <div className="empty-program">
                  <p>Drag tiles here or click tiles above to build your program!</p>
                  <p>🎯 Goal: Move the car to the target!</p>
                  <p>💡 Use "Repeat" and "End Loop" tiles to create loops!</p>
                </div>
              ) : (
                <div className="sequence-tiles">
                  {renderProgramSequenceWithLoops()}
                </div>
              )}
            </div>
          </div>
          
          {message && (
            <div className={`game-message ${gameOver ? 'error' : 'info'}`}>
              {message}
            </div>
          )}
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="success-popup">
          <div className="popup-content">
            <h2>🎉 Congratulations!</h2>
            <p>You reached the target!</p>
            <p>Moves used: {movesUsed}/{currentDifficulty?.maxMoves}</p>
            <button onClick={() => {
              setShowSuccessPopup(false);
              resetGame();
            }}>
              Play Again
            </button>
            <button onClick={() => {
              setShowSuccessPopup(false);
              setDifficultyLevel(Math.min(5, difficultyLevel + 1));
            }}>
              Next Level
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KuboTerrainGame;