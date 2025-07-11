import React, { useState, useEffect, useRef } from "react";
import "./TowerDefenseGame.css";
import towerIcon from '../assets/tower-icon.png';
import towerCircle from '../assets/tower-circle.png';
import enemySprite from '../assets/enemy-sprite.png';

// Constants
const MAP_WIDTH = 15;
const MAP_HEIGHT = 10;
const TILE_SIZE = 40;

// Tower types with their properties
const TOWER_TYPES = {
  BASIC: {
    name: "Basic Tower",
    cost: 20,
    damage: 10,
    range: 3,
    fireRate: 1, // shots per second
    description: "Basic tower with balanced stats",
    icon: towerIcon,
    circle: towerCircle
  },
  SNIPER: {
    name: "Sniper Tower",
    cost: 40,
    damage: 30,
    range: 5,
    fireRate: 0.5, // slower fire rate
    description: "Long range, high damage, slow fire rate",
    icon: towerIcon,
    circle: towerCircle
  },
  RAPID: {
    name: "Rapid Tower",
    cost: 35,
    damage: 5,
    range: 2,
    fireRate: 2, // faster fire rate
    description: "Short range, low damage, fast fire rate",
    icon: towerIcon,
    circle: towerCircle
  }
};

// Enemy types with their properties
const ENEMY_TYPES = {
  NORMAL: {
    name: "Normal",
    hp: 100,
    speed: 1,
    reward: 10,
    damage: 1, // lives lost when reaching end
    sprite: enemySprite
  },
  FAST: {
    name: "Fast",
    hp: 60,
    speed: 2,
    reward: 15,
    damage: 1,
    sprite: enemySprite
  },
  TANK: {
    name: "Tank",
    hp: 300,
    speed: 0.5,
    reward: 25,
    damage: 2,
    sprite: enemySprite
  },
  BOSS: {
    name: "Boss",
    hp: 1000,
    speed: 0.7,
    reward: 100,
    damage: 5,
    sprite: enemySprite
  }
};

// Tile types: 0 = grass (buildable), 1 = path, 2 = water (not buildable), 3 = rocks (not buildable)
const generateMap = () => {
  // Start with empty map
  const map = Array(MAP_HEIGHT).fill(null).map(() => Array(MAP_WIDTH).fill(0));
  
  // Generate a more interesting path
  const generatePath = () => {
    const path = [];
    
    // Start from left side
    let x = 0;
    let y = Math.floor(MAP_HEIGHT / 2);
    path.push({ x, y });
    
    // Generate a winding path to the right side
    while (x < MAP_WIDTH - 1) {
      // Decide direction: 0 = right, 1 = up, 2 = down
      const direction = Math.random() < 0.7 ? 0 : (y > 1 && y < MAP_HEIGHT - 2) ? 
                        (Math.random() < 0.5 ? 1 : 2) : 
                        (y <= 1 ? 2 : 1);
      
      switch (direction) {
        case 0: // right
          x += 1;
          break;
        case 1: // up
          y -= 1;
          break;
        case 2: // down
          y += 1;
          break;
      }
      
      // Ensure we stay within bounds
      y = Math.max(0, Math.min(y, MAP_HEIGHT - 1));
      
      // Add to path if not already included
      if (!path.some(p => p.x === x && p.y === y)) {
        path.push({ x, y });
      }
    }
    
    return path;
  };
  
  const path = generatePath();
  
  // Mark path on map
  path.forEach(({ x, y }) => {
    map[y][x] = 1;
  });
  
  // Add some water and rocks for visual interest (not buildable)
  for (let i = 0; i < 5; i++) {
    const x = Math.floor(Math.random() * MAP_WIDTH);
    const y = Math.floor(Math.random() * MAP_HEIGHT);
    
    // Don't place on path
    if (map[y][x] === 0) {
      map[y][x] = Math.random() < 0.5 ? 2 : 3; // 2 = water, 3 = rocks
    }
  }
  
  return { map, path };
};

const { map: initialMap, path } = generateMap();

function TowerDefenseGame() {
  const [map, setMap] = useState(initialMap);
  const [towers, setTowers] = useState([]); // {x, y, type, lastFired}
  const [enemies, setEnemies] = useState([]); // {id, type, posIndex, hp, progress}
  const [money, setMoney] = useState(150);
  const [lives, setLives] = useState(20);
  const [wave, setWave] = useState(0);
  const [waveInProgress, setWaveInProgress] = useState(false);
  const [selectedTower, setSelectedTower] = useState('BASIC');
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);
  const gameLoopRef = useRef(null);
  const enemyIdCounter = useRef(0);
  
  // Wave configuration
  const waves = [
    { enemies: [{ type: 'NORMAL', count: 5 }] },
    { enemies: [{ type: 'NORMAL', count: 8 }, { type: 'FAST', count: 3 }] },
    { enemies: [{ type: 'NORMAL', count: 10 }, { type: 'FAST', count: 5 }] },
    { enemies: [{ type: 'NORMAL', count: 8 }, { type: 'FAST', count: 8 }, { type: 'TANK', count: 2 }] },
    { enemies: [{ type: 'NORMAL', count: 12 }, { type: 'FAST', count: 10 }, { type: 'TANK', count: 5 }] },
    { enemies: [{ type: 'BOSS', count: 1 }, { type: 'NORMAL', count: 15 }, { type: 'FAST', count: 10 }] },
  ];

  // Start a new wave
  const startWave = () => {
    if (waveInProgress || gameOver || gameWon) return;
    
    const nextWave = wave + 1;
    if (nextWave > waves.length) {
      setGameWon(true);
      return;
    }
    
    setWave(nextWave);
    setWaveInProgress(true);
    
    // Prepare enemies for this wave
    const waveEnemies = [];
    let delay = 0;
    
    waves[nextWave - 1].enemies.forEach(enemyGroup => {
      const { type, count } = enemyGroup;
      
      for (let i = 0; i < count; i++) {
        waveEnemies.push({
          id: enemyIdCounter.current++,
          type,
          delay: delay,
          spawned: false
        });
        delay += 800 / ENEMY_TYPES[type].speed; // Faster enemies spawn more quickly
      }
    });
    
    // Spawn enemies with their individual delays
    waveEnemies.forEach(enemy => {
      setTimeout(() => {
        setEnemies(prev => [
          ...prev,
          {
            id: enemy.id,
            type: enemy.type,
            posIndex: 0,
            hp: ENEMY_TYPES[enemy.type].hp,
            progress: 0 // Progress between path points (0-1)
          }
        ]);
      }, enemy.delay);
    });
    
    // End wave after all enemies are spawned and either killed or reached the end
    setTimeout(() => {
      const checkWaveEnd = setInterval(() => {
        if (enemies.length === 0) {
          setWaveInProgress(false);
          clearInterval(checkWaveEnd);
          
          // Bonus money for completing a wave
          setMoney(m => m + nextWave * 25);
        }
      }, 1000);
    }, delay + 1000);
  };

  // Game loop: move enemies, towers attack
  useEffect(() => {
    if (gameOver || gameWon) return;
    
    gameLoopRef.current = setInterval(() => {
      // Update enemy positions
      setEnemies(prevEnemies => {
        let updatedEnemies = [];
        let lostLives = 0;
        let earnedMoney = 0;
        let earnedScore = 0;

        prevEnemies.forEach(enemy => {
          // Skip dead enemies
          if (enemy.hp <= 0) {
            earnedMoney += ENEMY_TYPES[enemy.type].reward;
            earnedScore += ENEMY_TYPES[enemy.type].reward * 2;
            return;
          }
          
          // Update progress along path
          const speed = ENEMY_TYPES[enemy.type].speed * 0.05; // Adjust speed factor
          let newProgress = enemy.progress + speed;
          let newPosIndex = enemy.posIndex;
          
          // Move to next path segment if progress >= 1
          if (newProgress >= 1) {
            newProgress = 0;
            newPosIndex++;
          }
          
          // Check if enemy reached the end
          if (newPosIndex >= path.length) {
            lostLives += ENEMY_TYPES[enemy.type].damage;
            return;
          }
          
          updatedEnemies.push({
            ...enemy,
            posIndex: newPosIndex,
            progress: newProgress
          });
        });

        // Update game state based on enemy actions
        if (lostLives > 0) {
          setLives(l => {
            const newLives = Math.max(l - lostLives, 0);
            if (newLives === 0) {
              setGameOver(true);
            }
            return newLives;
          });
        }
        
        if (earnedMoney > 0) {
          setMoney(m => m + earnedMoney);
          setScore(s => s + earnedScore);
        }

        return updatedEnemies;
      });
      
      // Tower attacks
      setEnemies(prevEnemies => {
        if (prevEnemies.length === 0) return prevEnemies;
        
        const now = Date.now();
        let updatedEnemies = [...prevEnemies];
        
        // Each tower attacks if enemies in range
        towers.forEach(tower => {
          const towerType = TOWER_TYPES[tower.type];
          const fireInterval = 1000 / towerType.fireRate;
          
          // Check if tower can fire
          if (now - tower.lastFired < fireInterval) return;
          
          // Find enemies in range
          const enemiesInRange = updatedEnemies.filter(enemy => {
            const enemyPos = path[enemy.posIndex];
            const dist = Math.sqrt(
              (tower.x - enemyPos.x) ** 2 + (tower.y - enemyPos.y) ** 2
            );
            return dist <= towerType.range;
          });
          
          if (enemiesInRange.length > 0) {
            // Target first enemy (closest to end)
            const target = enemiesInRange.reduce((prev, current) => 
              prev.posIndex > current.posIndex ? prev : current
            );
            
            // Apply damage
            updatedEnemies = updatedEnemies.map(enemy => 
              enemy.id === target.id 
                ? { ...enemy, hp: enemy.hp - towerType.damage }
                : enemy
            );
            
            // Update tower's last fired time
            setTowers(prevTowers => 
              prevTowers.map(t => 
                t.x === tower.x && t.y === tower.y 
                  ? { ...t, lastFired: now }
                  : t
              )
            );
          }
        });
        
        return updatedEnemies.filter(e => e.hp > 0);
      });
    }, 50); // Faster game loop for smoother animations

    return () => clearInterval(gameLoopRef.current);
  }, [towers, gameOver, gameWon]);

  // Handle map click to place tower
  function handleMapClick(x, y) {
    // Cannot build if game is over
    if (gameOver || gameWon) return;
    
    // Cannot place on path or non-buildable tiles
    if (map[y][x] !== 0) return;
    
    // Cannot place if there's already a tower
    if (towers.find(t => t.x === x && t.y === y)) return;
    
    const towerCost = TOWER_TYPES[selectedTower].cost;
    
    // Check if enough money
    if (money < towerCost) return;
    
    // Place the tower
    setTowers(prev => [
      ...prev, 
      { 
        x, 
        y, 
        type: selectedTower,
        lastFired: 0
      }
    ]);
    
    // Deduct cost
    setMoney(m => m - towerCost);
  }
  
  // Handle tower type selection
  function selectTowerType(type) {
    setSelectedTower(type);
  }

  // Calculate enemy position with interpolation for smoother movement
  const getEnemyPosition = (enemy) => {
    if (enemy.posIndex >= path.length - 1) return path[path.length - 1];
    
    const currentPos = path[enemy.posIndex];
    const nextPos = path[enemy.posIndex + 1];
    
    return {
      x: currentPos.x + (nextPos.x - currentPos.x) * enemy.progress,
      y: currentPos.y + (nextPos.y - currentPos.y) * enemy.progress
    };
  };
  
  // Render tower range indicator
  const renderTowerRange = (tower) => {
    if (!tower) return null;
    
    const range = TOWER_TYPES[tower.type].range;
    return (
      <div 
        className="tower-range" 
        style={{
          width: `${range * 2}em`,
          height: `${range * 2}em`,
          left: `${50 - range * 100}%`,
          top: `${50 - range * 100}%`
        }}
      />
    );
  };
  
  // Render game over or victory screen
  const renderGameStatus = () => {
    if (gameOver) {
      return (
        <div className="game-status game-over">
          <h2>Game Over</h2>
          <p>Your score: {score}</p>
          <p>Waves completed: {wave}</p>
          <button onClick={() => window.location.reload()}>Play Again</button>
        </div>
      );
    }
    
    if (gameWon) {
      return (
        <div className="game-status game-won">
          <h2>Victory!</h2>
          <p>You completed all waves!</p>
          <p>Your score: {score}</p>
          <button onClick={() => window.location.reload()}>Play Again</button>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="tower-defense-container">
      <div className="info-bar">
        <div className="resources">
          <div>Money: ${money}</div>
          <div>Lives: {lives}</div>
          <div>Score: {score}</div>
        </div>
        <div className="wave-info">
          {wave > 0 ? `Wave ${wave}/${waves.length}` : 'Ready to start'}
        </div>
        <div className="wave-control">
          {!waveInProgress && wave < waves.length && !gameOver && !gameWon && (
            <button onClick={startWave} className="start-wave-btn">
              {wave === 0 ? 'Start Game' : `Start Wave ${wave + 1}`}
            </button>
          )}
          {waveInProgress && (
            <div className="wave-progress">Wave in progress...</div>
          )}
        </div>
      </div>
      
      <div className="tower-selection">
        {Object.entries(TOWER_TYPES).map(([type, data]) => (
          <div 
            key={type} 
            className={`tower-option ${selectedTower === type ? 'selected' : ''}`}
            onClick={() => selectTowerType(type)}
          >
            <div className={`tower-icon ${type.toLowerCase()}`} style={{ backgroundImage: `url(${towerIcon})` }}></div>
            <div className="tower-info">
              <div className="tower-name">{type}</div>
              <div className="tower-cost">${data.cost}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="map" style={{ width: `${MAP_WIDTH * TILE_SIZE}px`, height: `${MAP_HEIGHT * TILE_SIZE}px` }}>
        {map.map((row, y) => (
          <div key={y} className="map-row">
            {row.map((cell, x) => {
              const tileType = cell === 0 ? 'grass' : 
                             cell === 1 ? 'path' : 
                             cell === 2 ? 'water' : 'rocks';
              const hasTower = towers.find(t => t.x === x && t.y === y);
              
              return (
                <div
                  key={x}
                  className={`map-cell ${tileType}`}
                  onClick={() => handleMapClick(x, y)}
                >
                  {hasTower && (
                    <div 
                      className="tower" 
                      style={{
                        backgroundImage: `url(${TOWER_TYPES[hasTower.type].circle})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center'
                      }}
                    >
                      {renderTowerRange(hasTower)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Render enemies as absolute positioned elements for smooth movement */}
        {enemies.map(enemy => {
          const pos = getEnemyPosition(enemy);
          const enemyType = enemy.type.toLowerCase();
          const healthPercent = (enemy.hp / ENEMY_TYPES[enemy.type].hp) * 100;
          
          return (
            <div 
              key={enemy.id} 
              className="enemy"
              style={{
                left: `${pos.x * TILE_SIZE}px`,
                top: `${pos.y * TILE_SIZE}px`,
                width: `${TILE_SIZE}px`,
                height: `${TILE_SIZE}px`,
                backgroundImage: `url(${ENEMY_TYPES[enemy.type].sprite})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center'
              }}
            >
              <div className="enemy-health-bar">
                <div 
                  className="enemy-health-fill" 
                  style={{ width: `${healthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {renderGameStatus()}
    </div>
  );
}

export default TowerDefenseGame;

