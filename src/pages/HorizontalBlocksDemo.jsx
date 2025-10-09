import React, { useState, useRef, useEffect } from 'react';
import HorizontalMovementBlocks from '../components/HorizontalMovementBlocks';
import './HorizontalBlocksDemo.css';

export default function HorizontalBlocksDemo() {
  const canvasRef = useRef(null);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0, direction: 0 });
  const [mazeSize] = useState(8);
  const [isAnimating, setIsAnimating] = useState(false);
  const [maze, setMaze] = useState([]);
  
  const tileSize = 50;
  const canvasWidth = mazeSize * tileSize;
  const canvasHeight = mazeSize * tileSize;

  // Initialize maze
  useEffect(() => {
    const newMaze = Array.from({ length: mazeSize }, () => Array(mazeSize).fill(0));
    
    // Add some obstacles for demonstration
    newMaze[2][3] = 1;
    newMaze[3][3] = 1;
    newMaze[4][3] = 1;
    newMaze[5][2] = 1;
    newMaze[5][3] = 1;
    newMaze[5][4] = 1;
    newMaze[1][6] = 1;
    newMaze[2][6] = 1;
    newMaze[6][1] = 1;
    newMaze[6][2] = 1;
    
    // Set start and goal
    newMaze[0][0] = 'S';
    newMaze[mazeSize - 1][mazeSize - 1] = 'G';
    
    setMaze(newMaze);
  }, [mazeSize]);

  // Draw the maze and player
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || maze.length === 0) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw maze
    for (let y = 0; y < mazeSize; y++) {
      for (let x = 0; x < mazeSize; x++) {
        const cell = maze[y][x];
        const pixelX = x * tileSize;
        const pixelY = y * tileSize;

        // Draw cell background
        if (cell === 1) {
          // Obstacle
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          ctx.strokeStyle = '#654321';
          ctx.strokeRect(pixelX, pixelY, tileSize, tileSize);
        } else if (cell === 'S') {
          // Start position
          ctx.fillStyle = '#4CAF50';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          ctx.fillStyle = 'white';
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('S', pixelX + tileSize/2, pixelY + tileSize/2 + 7);
        } else if (cell === 'G') {
          // Goal position
          ctx.fillStyle = '#FF9800';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
          ctx.fillStyle = 'white';
          ctx.font = '20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('G', pixelX + tileSize/2, pixelY + tileSize/2 + 7);
        } else {
          // Empty space
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(pixelX, pixelY, tileSize, tileSize);
        }

        // Draw grid lines
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.strokeRect(pixelX, pixelY, tileSize, tileSize);
      }
    }

    // Draw player
    const playerPixelX = playerPosition.x * tileSize + tileSize/2;
    const playerPixelY = playerPosition.y * tileSize + tileSize/2;
    
    // Player body
    ctx.fillStyle = '#2196F3';
    ctx.beginPath();
    ctx.arc(playerPixelX, playerPixelY, tileSize/3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Player direction indicator
    ctx.fillStyle = 'white';
    ctx.beginPath();
    const directionOffsets = [
      { x: tileSize/4, y: 0 },     // right
      { x: 0, y: tileSize/4 },     // down
      { x: -tileSize/4, y: 0 },    // left
      { x: 0, y: -tileSize/4 }     // up
    ];
    const offset = directionOffsets[playerPosition.direction];
    ctx.arc(playerPixelX + offset.x, playerPixelY + offset.y, 4, 0, 2 * Math.PI);
    ctx.fill();

  }, [maze, playerPosition, mazeSize, tileSize, canvasWidth, canvasHeight]);

  const handleMovementExecuted = async (movements) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    let currentPos = { ...playerPosition };

    for (const movement of movements) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Animation delay

      if (movement.type === 'move') {
        let newX = currentPos.x;
        let newY = currentPos.y;

        switch (movement.direction) {
          case 'right':
            newX = Math.min(currentPos.x + 1, mazeSize - 1);
            break;
          case 'left':
            newX = Math.max(currentPos.x - 1, 0);
            break;
          case 'up':
            newY = Math.max(currentPos.y - 1, 0);
            break;
          case 'down':
            newY = Math.min(currentPos.y + 1, mazeSize - 1);
            break;
        }

        // Check for obstacles
        if (maze[newY] && maze[newY][newX] !== 1) {
          currentPos = { ...currentPos, x: newX, y: newY };
          setPlayerPosition(currentPos);
        }
      } else if (movement.type === 'turn') {
        currentPos = { ...currentPos, direction: movement.newDirection };
        setPlayerPosition(currentPos);
      }
    }

    setIsAnimating(false);

    // Check if goal reached
    if (currentPos.x === mazeSize - 1 && currentPos.y === mazeSize - 1) {
      setTimeout(() => {
        alert('🎉 Congratulations! You reached the goal!');
      }, 200);
    }
  };

  const resetPlayer = () => {
    setPlayerPosition({ x: 0, y: 0, direction: 0 });
  };

  return (
    <div className="horizontal-blocks-demo">
      <div className="demo-header">
        <h1>🎮 Horizontal Movement Blocks Demo</h1>
        <p>
          Experience Scratch-inspired horizontal block programming! <mcreference link="https://github.com/scratchfoundation/scratch-blocks" index="0">0</mcreference>
          <br />
          Create movement sequences using the horizontal grammar blocks below.
        </p>
      </div>

      <div className="demo-content">
        <div className="game-section">
          <div className="maze-container">
            <h3>🗺️ Game World</h3>
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="game-canvas"
            />
            <div className="game-controls">
              <button onClick={resetPlayer} className="reset-button">
                🔄 Reset Player
              </button>
              <div className="game-status">
                <span className={`status-indicator ${isAnimating ? 'animating' : 'ready'}`}>
                  {isAnimating ? '🔄 Animating...' : '✅ Ready'}
                </span>
              </div>
            </div>
          </div>

          <div className="instructions-panel">
            <h4>📋 Instructions</h4>
            <ul>
              <li>🟦 <strong>Blue circle:</strong> Your character</li>
              <li>🟢 <strong>S:</strong> Start position</li>
              <li>🟠 <strong>G:</strong> Goal position</li>
              <li>🟤 <strong>Brown squares:</strong> Obstacles</li>
              <li>⚪ <strong>White dot:</strong> Direction indicator</li>
            </ul>
            
            <div className="legend">
              <h5>🎯 Objective</h5>
              <p>Use the horizontal movement blocks to navigate from Start (S) to Goal (G) while avoiding obstacles!</p>
            </div>
          </div>
        </div>

        <div className="blocks-section">
          <HorizontalMovementBlocks
            onMovementExecuted={handleMovementExecuted}
            playerPosition={playerPosition}
            mazeSize={mazeSize}
          />
        </div>
      </div>

      <div className="demo-features">
        <h3>✨ Features Demonstrated</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4>🧩 Horizontal Grammar</h4>
            <p>Blocks snap together horizontally, inspired by Scratch Blocks design patterns</p>
          </div>
          <div className="feature-card">
            <h4>🎨 Visual Styling</h4>
            <p>Scratch-like appearance with gradients, shadows, and smooth animations</p>
          </div>
          <div className="feature-card">
            <h4>🎮 Interactive Navigation</h4>
            <p>Real-time character movement with collision detection and goal checking</p>
          </div>
          <div className="feature-card">
            <h4>📱 Responsive Design</h4>
            <p>Adapts to different screen sizes while maintaining usability</p>
          </div>
        </div>
      </div>

      <div className="technical-info">
        <h3>🔧 Technical Implementation</h3>
        <div className="tech-details">
          <div className="tech-item">
            <strong>Block System:</strong> Custom Blockly blocks with horizontal-oriented design
          </div>
          <div className="tech-item">
            <strong>Movement Engine:</strong> Step-by-step animation with collision detection
          </div>
          <div className="tech-item">
            <strong>Styling:</strong> CSS gradients and animations matching Scratch aesthetics
          </div>
          <div className="tech-item">
            <strong>Integration:</strong> Seamless integration with existing React components
          </div>
        </div>
      </div>
    </div>
  );
}