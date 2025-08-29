import React, { useState, useEffect } from 'react';
import './Game1.css';

// Enhanced game configuration for worm movement
const DIFFICULTY_LEVELS = {
  1: { canvasWidth: 8, canvasHeight: 6, maxMoves: 8, mathOps: false },
  2: { canvasWidth: 10, canvasHeight: 8, maxMoves: 10, mathOps: true },
  3: { canvasWidth: 12, canvasHeight: 10, maxMoves: 12, mathOps: true },
  4: { canvasWidth: 14, canvasHeight: 12, maxMoves: 15, mathOps: true },
  5: { canvasWidth: 16, canvasHeight: 14, maxMoves: 18, mathOps: true }
};

const START_POS = { x: 1, y: 1 };
const CELL_SIZE = 60; // Increased base cell size





// Realistic Car Character with directional assets
const CarCharacter = ({ size = 48, x = 0, y = 0, direction = 'right', isAnimating = false }) => {
  const getCarAsset = () => {
    switch (direction) {
      case 'up': return '/assets/car-back.svg';
      case 'down': return '/assets/car-front.svg';
      case 'left': return '/assets/car-left.svg';
      case 'right': return '/assets/car-right.svg';
      default: return '/assets/car-right.svg';
    }
  };
  
  return (
    <div 
      className="car-character" 
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        transition: isAnimating ? 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'all 0.3s ease'
      }}
    >
      <img 
        src={getCarAsset()} 
        alt={`Car facing ${direction}`}
        width={size} 
        height={size}
        style={{
          display: 'block',
          imageRendering: 'crisp-edges'
        }}
      />
    </div>
  );
};

// Digital KUBO Tile Component
const KuboTile = ({ id, name, icon, category, onClick, isDragging, onDragStart, onDragEnd, ...props }) => {
  const handleClick = (e) => {
    e.currentTarget.classList.add('clicked');
    setTimeout(() => {
      e.currentTarget.classList.remove('clicked');
    }, 300);
    if (onClick) onClick();
  };

  return (
    <div 
      className={`kubo-tile ${isDragging ? 'dragging' : ''}`}
      data-category={category}
      onClick={handleClick}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      title={name}
      {...props}
    >
      <div className="kubo-tile-icon">{icon}</div>
      <div className="kubo-tile-label">{name}</div>
    </div>
  );
};



// Enhanced movement tiles for worm character
const KUBO_TILES = {
  movement: [
    { id: 'right1', name: 'Kanan 1', icon: '➡️', color: '#4CAF50', action: 'move', param: { x: 1, y: 0 }, size: 'large' },
    { id: 'left1', name: 'Kiri 1', icon: '⬅️', color: '#4CAF50', action: 'move', param: { x: -1, y: 0 }, size: 'large' },
    { id: 'up1', name: 'Atas 1', icon: '⬆️', color: '#4CAF50', action: 'move', param: { x: 0, y: -1 }, size: 'large' },
    { id: 'down1', name: 'Bawah 1', icon: '⬇️', color: '#4CAF50', action: 'move', param: { x: 0, y: 1 }, size: 'large' },
    { id: 'right2', name: 'Kanan 2', icon: '⏩', color: '#66BB6A', action: 'move', param: { x: 2, y: 0 }, size: 'large', minLevel: 2 },
    { id: 'left2', name: 'Kiri 2', icon: '⏪', color: '#66BB6A', action: 'move', param: { x: -2, y: 0 }, size: 'large', minLevel: 2 }
  ],
  numbers: [
    { id: 'num1', value: '1', icon: '1️⃣', color: '#FF9800', action: 'number', param: 1, size: 'large' },
    { id: 'num2', value: '2', icon: '2️⃣', color: '#FFB74D', action: 'number', param: 2, size: 'large' },
    { id: 'num3', value: '3', icon: '3️⃣', color: '#FFCC02', action: 'number', param: 3, size: 'large' },
    { id: 'num4', value: '4', icon: '4️⃣', color: '#FFC107', action: 'number', param: 4, size: 'large', minLevel: 2 },
    { id: 'num5', value: '5', icon: '5️⃣', color: '#FFD54F', action: 'number', param: 5, size: 'large', minLevel: 2 },
    { id: 'num6', value: '6', icon: '6️⃣', color: '#FFEB3B', action: 'number', param: 6, size: 'large', minLevel: 3 },
    { id: 'num7', value: '7', icon: '7️⃣', color: '#F9A825', action: 'number', param: 7, size: 'large', minLevel: 3 },
    { id: 'num8', value: '8', icon: '8️⃣', color: '#F57F17', action: 'number', param: 8, size: 'large', minLevel: 4 },
    { id: 'num9', value: '9', icon: '9️⃣', color: '#FF8F00', action: 'number', param: 9, size: 'large', minLevel: 4 },
    { id: 'num10', value: '10', icon: '🔟', color: '#E65100', action: 'number', param: 10, size: 'large', minLevel: 5 }
  ],
  actions: [
    { id: 'go', value: 'MULAI', icon: '🚀', color: '#9C27B0', action: 'start', param: null, size: 'large' },
    { id: 'stop', value: 'BERHENTI', icon: '🛑', color: '#AD47B5', action: 'stop', param: null, size: 'large' },
    { id: 'beep', value: 'BUNYI', icon: '🔊', color: '#BA68C8', action: 'beep', param: null, size: 'large' },
    { id: 'dance', value: 'MENARI', icon: '💃', color: '#CE93D8', action: 'dance', param: null, size: 'large', minLevel: 3 },
    { id: 'celebrate', value: 'PESTA', icon: '🎉', color: '#E1BEE7', action: 'celebrate', param: null, size: 'large', minLevel: 4 }
  ],
  math: [
    { id: 'add', value: '+', icon: '➕', color: '#2196F3', action: 'math', param: 'add', size: 'large', minLevel: 2 },
    { id: 'subtract', value: '-', icon: '➖', color: '#42A5F5', action: 'math', param: 'subtract', size: 'large', minLevel: 2 },
    { id: 'multiply', value: '×', icon: '✖️', color: '#64B5F6', action: 'math', param: 'multiply', size: 'large', minLevel: 4 },
    { id: 'equals', value: '=', icon: '🟰', color: '#90CAF9', action: 'math', param: 'equals', size: 'large', minLevel: 3 }
  ],
  loops: [
    { id: 'repeat2', value: 'Ulangi 2x', icon: '🔄', color: '#FF5722', action: 'repeat', param: 2, size: 'large', minLevel: 3 },
    { id: 'repeat3', value: 'Ulangi 3x', icon: '🔁', color: '#FF7043', action: 'repeat', param: 3, size: 'large', minLevel: 4 },
    { id: 'repeat5', value: 'Ulangi 5x', icon: '🌀', color: '#FF8A65', action: 'repeat', param: 5, size: 'large', minLevel: 5 }
  ]
};

const Game1 = () => {
  // Enhanced game state with difficulty progression
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [carPos, setCarPos] = useState(START_POS);
  const [target, setTarget] = useState({ x: 6, y: 4 });
  const [message, setMessage] = useState("");

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
  
  // Get current difficulty settings
  const currentDifficulty = DIFFICULTY_LEVELS[difficultyLevel];
  
  // Handle window resize for responsive canvas sizing
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Initialize target based on difficulty level
  useEffect(() => {
    const { canvasWidth, canvasHeight } = currentDifficulty;
    // Generate random target position, avoiding start position
    let newTarget;
    do {
      newTarget = {
        x: Math.floor(Math.random() * (canvasWidth - 2)) + 1,
        y: Math.floor(Math.random() * (canvasHeight - 2)) + 1
      };
    } while (newTarget.x === START_POS.x && newTarget.y === START_POS.y);
    
    setTarget(newTarget);
    updateAvailableTiles();
  }, [difficultyLevel]);
  
  // Update available tiles based on difficulty level
  const updateAvailableTiles = () => {
    const tiles = {};
    Object.keys(KUBO_TILES).forEach(category => {
      tiles[category] = KUBO_TILES[category].filter(tile => 
        !tile.minLevel || tile.minLevel <= difficultyLevel
      );
    });
    setAvailableTiles(tiles);
  };

  const resetGame = () => {
    setCarPos(START_POS);
    setCarDirection('right');
    
    const { canvasWidth, canvasHeight } = currentDifficulty;
    // Generate random target position, avoiding start position
    let newTarget;
    do {
      newTarget = {
        x: Math.floor(Math.random() * (canvasWidth - 2)) + 1,
        y: Math.floor(Math.random() * (canvasHeight - 2)) + 1
      };
    } while (newTarget.x === START_POS.x && newTarget.y === START_POS.y);
    
    setTarget(newTarget);
    setMessage("");
    setProgramSequence([]);
    setMovesUsed(0);

    setShowCelebration(false);
    setShowSuccessPopup(false);
    setGameOver(false);
    setIsAnimating(false);
    updateAvailableTiles();
  };
  
  const nextLevel = () => {
    if (difficultyLevel < 5) {
      setDifficultyLevel(prev => prev + 1);
      setScore(prev => prev + 100); // Bonus for advancing
      setMessage(`🎉 Naik Level! Selamat datang di Level ${difficultyLevel + 1}!`);
    } else {
      setMessage("🏆 Selamat! Anda telah menguasai semua level!");
    }
    setShowSuccessPopup(false);
    resetGame();
  };

  const handleSuccessClose = () => {
    setShowSuccessPopup(false);
    resetGame();
  };
  
  const checkWinCondition = (finalPos = carPos) => {
    if (finalPos.x === target.x && finalPos.y === target.y) {
      const bonusPoints = Math.max(0, currentDifficulty.maxMoves - movesUsed) * 10;
      setScore(prev => prev + 50 + bonusPoints);
      setGamesWon(prev => prev + 1);
      setShowSuccessPopup(true);
      setMessage(`🎯 Berhasil! Bonus: ${bonusPoints} poin!`);
      return true;
    }
    return false;
  };
  
  const checkGameOver = (pos) => {
    const { canvasWidth, canvasHeight } = currentDifficulty;
    return pos.x < 0 || pos.x >= canvasWidth || pos.y < 0 || pos.y >= canvasHeight;
  };

  const addTileToSequence = (tile) => {
    setProgramSequence(prev => [...prev, { ...tile, id: Date.now() + Math.random() }]);
  };

  const removeTileFromSequence = (index) => {
    setProgramSequence(prev => prev.filter((_, i) => i !== index));
  };

  const clearSequence = () => {
    setProgramSequence([]);
  };

  const handleDragStart = (tile) => {
    setDraggedTile(tile);
  };

  const handleDragEnd = () => {
    setDraggedTile(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedTile) {
      addTileToSequence(draggedTile);
      setDraggedTile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const runProgram = async () => {
    if (programSequence.length === 0) {
      setMessage("📝 Please add some movement tiles to create your program!");
      return;
    }

    if (programSequence.length > currentDifficulty.maxMoves) {
      setMessage(`Too many moves! Maximum allowed: ${currentDifficulty.maxMoves}`);
      return;
    }

    setIsRunning(true);
    setIsAnimating(true);
    setMessage("");

    setGameOver(false);
    let pos = { ...carPos };
    let moveCount = 0;
    let direction = carDirection;

    for (let i = 0; i < programSequence.length; i++) {
      const tile = programSequence[i];
      
      switch (tile.action) {
        case 'move':
          moveCount++;
          const newPos = {
            x: pos.x + tile.param.x,
            y: pos.y + tile.param.y
          };
          
          // Update direction based on movement
          if (tile.param.x > 0) direction = 'right';
          else if (tile.param.x < 0) direction = 'left';
          else if (tile.param.y > 0) direction = 'down';
          else if (tile.param.y < 0) direction = 'up';
          
          // Check if car goes outside canvas
          if (checkGameOver(newPos)) {
            setGameOver(true);
            setMessage("💀 Game Over! The car went outside the game area. Try again!");
            setIsRunning(false);
            return;
          }
          
          pos = newPos;
          setCarDirection(direction);
          break;
          
        case 'start':
        case 'stop':
        case 'beep':
        case 'dance':
        case 'celebrate':
        case 'number':
        case 'math':
          // Actions processed but no console output needed
          break;
      }
      
      setCarPos({ ...pos });
      
      // Add delay for smooth animation
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    setMovesUsed(moveCount);
    
    // Check win condition with final position
    setTimeout(() => {
      if (!checkWinCondition(pos)) {
        setMessage(`🐛 Try again! Moves used: ${moveCount}/${currentDifficulty.maxMoves}`);
      }
      setIsRunning(false);
      setIsAnimating(false);
    }, 500);
  };

  // Render game canvas with grid
  const renderGameCanvas = () => {
    const { canvasWidth, canvasHeight } = currentDifficulty;
    const cells = [];
    
    // Calculate available space for canvas (accounting for control overlays)
    const viewportWidth = windowSize.width;
    const viewportHeight = windowSize.height;
    
    // Account for unified-controls-overlay positioning with dynamic adjustments for larger grids
    let availableWidth, availableHeight;
    
    if (viewportWidth <= 576) {
      // Mobile: stack controls vertically, reduce available space
      availableWidth = viewportWidth - 40; // 20px margin on each side
      availableHeight = viewportHeight - 300; // Account for header, controls, and programming area
    } else if (viewportWidth <= 992) {
      // Tablet: side controls but smaller
      availableWidth = viewportWidth - 300; // 250px controls + margins
      availableHeight = viewportHeight - 180; // Account for programming section (120px + margins)
    } else {
      // Desktop: account for movement controls (280px + 40px margins) and programming section (120px + 40px margins)
      availableWidth = viewportWidth - 320; // 280px controls + 40px margins
      availableHeight = viewportHeight - 160; // 120px programming section + 40px margins
    }
    
    // For larger grids, ensure we have enough space by reducing overlay space if needed
    const minRequiredWidth = canvasWidth * 15; // minimum cell size * grid width
    const minRequiredHeight = canvasHeight * 15; // minimum cell size * grid height
    
    if (minRequiredWidth > availableWidth) {
      // Reduce control overlay space for larger grids
      if (viewportWidth > 992) {
        availableWidth = viewportWidth - Math.min(280, viewportWidth * 0.2); // Use max 20% of viewport for controls
      } else if (viewportWidth > 576) {
        availableWidth = viewportWidth - Math.min(250, viewportWidth * 0.25); // Use max 25% of viewport for controls
      }
    }
    
    if (minRequiredHeight > availableHeight) {
      // Reduce programming section space for larger grids
      if (viewportWidth > 576) {
        availableHeight = viewportHeight - Math.min(140, viewportHeight * 0.15); // Use max 15% of viewport for programming
      }
    }
    
    // Ensure minimum available space
    availableWidth = Math.max(availableWidth, minRequiredWidth, 200);
    availableHeight = Math.max(availableHeight, minRequiredHeight, 150);
    
    // Calculate optimal cell size to fill available space
    const maxCellSizeByWidth = Math.floor(availableWidth / canvasWidth);
    const maxCellSizeByHeight = Math.floor(availableHeight / canvasHeight);
    
    // Use the smaller dimension to ensure canvas fits in both directions
    let optimalCellSize = Math.min(maxCellSizeByWidth, maxCellSizeByHeight);
    
    // Apply minimum and maximum cell size constraints
    const minCellSize = 15;
    const maxCellSize = viewportWidth <= 576 ? 35 : 50;
    
    optimalCellSize = Math.max(minCellSize, Math.min(optimalCellSize, maxCellSize));
    
    // Calculate final canvas dimensions
    const finalCanvasWidth = canvasWidth * optimalCellSize;
    const finalCanvasHeight = canvasHeight * optimalCellSize;
    
    for (let y = 0; y < canvasHeight; y++) {
        for (let x = 0; x < canvasWidth; x++) {
          const isCarPos = carPos.x === x && carPos.y === y;
          const isTarget = target.x === x && target.y === y;
          const isStartPos = START_POS.x === x && START_POS.y === y;
          
          cells.push(
            <div
              key={`${x}-${y}`}
              className={`game-cell ${
                isCarPos ? 'car-cell' : ''
              } ${
                isTarget ? 'target-cell' : ''
              } ${
                isStartPos ? 'start-cell' : ''
              }`}
              style={{
                left: `${x * optimalCellSize}px`,
                top: `${y * optimalCellSize}px`,
                width: `${optimalCellSize}px`,
                height: `${optimalCellSize}px`
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
                    objectFit: 'contain'
                  }}
                />
              )}
              {isStartPos && !isCarPos && <div className="start-marker">🏠</div>}
            </div>
          );
        }
      }
      
      return (
        <div 
          className="game-canvas"
          style={{
            width: `${Math.min(finalCanvasWidth, availableWidth)}px`,
            height: `${Math.min(finalCanvasHeight, availableHeight)}px`,
            position: 'relative',
            maxWidth: `${availableWidth}px`,
            maxHeight: `${availableHeight}px`,
            overflow: 'hidden',
            margin: '0 auto'
          }}
        >
          {cells}
          <CarCharacter 
            x={carPos.x * optimalCellSize + 2}
            y={carPos.y * optimalCellSize + 2}
            direction={carDirection}
            size={optimalCellSize - 4}
            isAnimating={isAnimating}
          />
        </div>
      );
  };



  return (
    <div className="bnl-container kubo-theme">

      <div className="kubo-game-info">
        <div className="kubo-mission">
          <span className="mission-label">Misi:</span>
          <span className="mission-text">Gerakkan Mobil ke</span>
          <span className="bnl-target-number">({target.x}, {target.y})</span>
        </div>
        <div className="kubo-difficulty">
          <span className="level-label">Level {difficultyLevel}</span>
          <span className="moves-label">Langkah: {movesUsed}/{currentDifficulty.maxMoves}</span>
        </div>
        <div className="kubo-score">
          <span className="score-label">Skor:</span>
          <span className="score-value">{score}</span>
        </div>
        {gameOver && (
          <div className="game-over-notice">
            <span className="game-over-label">💀 PERMAINAN BERAKHIR!</span>
          </div>
        )}
      </div>

      {/* Single unified game workspace */}
      <div className="kubo-unified-workspace">
        <div className="kubo-playground full-width">
          <div 
            className="game-canvas-container"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {renderGameCanvas()}
            
            {/* Unified controls overlay inside canvas */}
            <div className="unified-controls-overlay">
              {/* Movement Controls Section */}
              <div className="controls-section movement-controls">
                <div className="section-header">🧩 Kontrol Gerakan (Level {difficultyLevel})</div>
                <div className="controls-grid">
                  {Object.entries(availableTiles).map(([category, tiles]) => (
                    <div key={category} className="tile-category">
                      <h4 className="category-title">{category === 'movement' ? 'Gerakan' : category === 'numbers' ? 'Angka' : category === 'actions' ? 'Aksi' : category === 'math' ? 'Matematika' : category === 'loops' ? 'Pengulangan' : category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                      <div className="tiles-row">
                        {tiles.map(tile => (
                          <KuboTile
                            key={tile.id}
                            {...tile}
                            data-category={category}
                            onClick={() => addTileToSequence(tile)}
                            onDragStart={() => handleDragStart(tile)}
                            onDragEnd={handleDragEnd}
                            isDragging={draggedTile?.id === tile.id}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Programming Sequence Section */}
              <div className="controls-section programming-section">
                <div className="sequence-header">
                  <h3>🧩 Program Mobil Anda</h3>
                  {programSequence.length > 0 && (
                    <button className="clear-button" onClick={clearSequence}>
                      🗑️ Hapus Semua
                    </button>
                  )}
                </div>
                <div className="sequence-tiles">
                  {programSequence.length === 0 ? (
                    <div className="empty-sequence">
                      Seret ubin ke sini untuk membuat program Anda!
                    </div>
                  ) : (
                    programSequence.map((tile, index) => (
                      <div key={tile.id || index} className="sequence-tile-wrapper">
                        <KuboTile
                          {...tile}
                          data-category={tile.category}
                          onClick={() => removeTileFromSequence(index)}
                          title="Click to remove"
                        />
                        <div className="tile-index">{index + 1}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>



      <div className="bnl-controls kubo-controls">
        <button 
          className="bnl-button kubo-button primary" 
          onClick={runProgram}
          disabled={isRunning || gameOver}
        >
          {isRunning ? '⏳ Berjalan...' : '🚀 Jalankan Mobil'}
        </button>
        <button className="bnl-button kubo-button secondary" onClick={resetGame}>
          🔄 Reset Permainan
        </button>
        {difficultyLevel > 1 && (
          <button
            className="kubo-button kubo-level-button"
            onClick={() => setDifficultyLevel(prev => Math.max(1, prev - 1))}
          >
            ⬇️ Level Mudah
          </button>
        )}
        {difficultyLevel < 5 && gamesWon >= 3 && (
          <button
            className="kubo-button kubo-level-button"
            onClick={nextLevel}
          >
            ⬆️ Level Berikutnya
          </button>
        )}
        <div className="score-display">
          🏆 Skor: {score}
        </div>
      </div>

      {showSuccessPopup && (
        <div className="success-overlay">
          <div className="success-content">
            <h2>🎉 Berhasil! 🎉</h2>
            <p>Mobil mencapai target!</p>
            <div className="success-buttons">
              {difficultyLevel < 5 ? (
                <button className="next-level-button" onClick={nextLevel}>
                  ⬆️ Level Berikutnya
                </button>
              ) : (
                <button className="play-again-button" onClick={handleSuccessClose}>
                  🔄 Main Lagi
                </button>
              )}
              <button className="continue-button" onClick={handleSuccessClose}>
                🔄 Coba Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h2>💀 Permainan Berakhir! 💀</h2>
            <p>Mobil keluar dari area permainan!</p>
            <button className="retry-button" onClick={resetGame}>
              🔄 Coba Lagi
            </button>
          </div>
        </div>
      )}


    </div>
  );
};

export default Game1;