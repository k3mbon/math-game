import React, { useState, useEffect } from 'react';
import HumanCharacter from './HumanCharacter';
import { getGrassTileByPosition, preloadGrassTiles } from '../utils/grassTileLoader';
import { generateBalancedLayout } from '../utils/smartRandomizer';
import './ZenoGameNew.css';

const ZenoGameNew = () => {
  const [level] = useState(1);
  const [sequence, setSequence] = useState([]);
  const gridWidth = 6;
  const gridHeight = 5;

  const getGrassTileByPositionWrapper = (x, y, width, height) => {
    return getGrassTileByPosition(x, y, width, height);
  };

  // Generate random layout on component initialization and refresh
  const generateNewLayout = () => {
    const crystalCount = 2 + level; // 3 for level 1, 4 for level 2, etc.
    return generateBalancedLayout({
      gridWidth,
      gridHeight,
      crystalCount,
      maxMoves: 12,
      startPosition: { x: 0, y: 3 },
      difficultyTarget: 0.75 // Target 75% of max moves for good challenge
    });
  };

  const [gameLayout] = useState(() => {
    const layout = generateNewLayout();
    console.log(`Generated layout with ${Object.keys(layout.crystals).length} crystals requiring ${layout.optimalMoves} moves`);
    return layout;
  });

  const [crystals, setCrystals] = useState(gameLayout.crystals);
  const [targetPosition, setTargetPosition] = useState(gameLayout.target);
  const [collectedCrystals, setCollectedCrystals] = useState(0);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 3 }); // Changed from y: 4 to y: 3 to avoid last row
  const [playerDirection, setPlayerDirection] = useState('right');
  const [executionQueue, setExecutionQueue] = useState([]);
  const [maxMoves] = useState(12);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  useEffect(() => {
    preloadGrassTiles();
  }, []);

  useEffect(() => {
    const processNextMove = () => {
      if (executionQueue.length === 0) {
        setIsExecuting(false);
        return;
      }

      const nextMove = executionQueue.shift();
      setIsExecuting(true);

      setTimeout(() => {
        setPlayerPosition(prev => {
          let newX = prev.x;
          let newY = prev.y;
          
          switch (nextMove) {
            case 'up':
              newY = Math.max(0, prev.y - 1);
              setPlayerDirection('up');
              break;
            case 'down':
              newY = Math.min(gridHeight - 1, prev.y + 1);
              setPlayerDirection('down');
              break;
            case 'left':
              newX = Math.max(0, prev.x - 1);
              setPlayerDirection('left');
              break;
            case 'right':
              newX = Math.min(gridWidth - 1, prev.x + 1);
              setPlayerDirection('right');
              break;
          }
          
          const crystalKey = `${newX}-${newY}`;
          if (crystals[crystalKey] && !crystals[crystalKey].collected) {
            setCrystals(prevCrystals => ({
              ...prevCrystals,
              [crystalKey]: { ...prevCrystals[crystalKey], collected: true }
            }));
            setCollectedCrystals(prev => prev + 1);
          }
          
          // Check for win condition: player reaches target after collecting all crystals
          const allCrystalsCollected = Object.values(crystals).every(crystal => crystal.collected) || 
                                     (crystals[crystalKey] && Object.values(crystals).filter(c => !c.collected || c === crystals[crystalKey]).length === 1);
          const reachedTarget = newX === targetPosition.x && newY === targetPosition.y;
          
          if (allCrystalsCollected && reachedTarget && !gameWon) {
            setTimeout(() => {
              setGameWon(true);
              setShowVictoryModal(true);
              setScore(prev => prev + (12 - sequence.length) * 10); // Bonus points for efficiency
            }, 500); // Small delay for smooth animation
          }
          
          return { x: newX, y: newY };
        });

        setExecutionQueue(prev => prev.slice(1));
        setTimeout(processNextMove, 300);
      }, 800);
    };

    if (executionQueue.length > 0 && !isExecuting) {
      processNextMove();
    }
  }, [executionQueue.length, isExecuting, crystals, gridHeight, gridWidth]);

  const executeProgram = () => {
    if (sequence.length === 0 || sequence.length > maxMoves) return;
    
    const moves = sequence.map(tile => tile.id);
    setExecutionQueue([...moves]);
  };

  const resetGame = () => {
    setPlayerPosition({ x: 0, y: 3 }); // Changed from y: 4 to y: 3 to avoid last row
    setPlayerDirection('right');
    setSequence([]);
    setExecutionQueue([]);
    setIsExecuting(false);
    setCollectedCrystals(0);
    setCurrentStep(0);
    setGameWon(false);
    setShowVictoryModal(false);
    
    // Generate a new random layout
    const newLayout = generateNewLayout();
    
    console.log(`New layout generated with ${Object.keys(newLayout.crystals).length} crystals requiring ${newLayout.optimalMoves} moves`);
    
    setCrystals(newLayout.crystals);
    setTargetPosition(newLayout.target);
  };

  const addToSequence = (tile) => {
    if (sequence.length < maxMoves && !gameWon) {
      setSequence(prev => [...prev, { ...tile, uniqueId: Date.now() }]);
    }
  };

  const nextLevel = () => {
    // For now, just restart with a new layout (can be expanded for actual level progression)
    setShowVictoryModal(false);
    setGameWon(false);
    resetGame();
  };

  const repeatLevel = () => {
    setShowVictoryModal(false);
    setGameWon(false);
    resetGame();
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #E8F4FD 0%, #B8E6B8 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      overflow: 'hidden',
      margin: 0,
      padding: 0,
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
      boxSizing: 'border-box'
    }}>
      <div style={{
        padding: '15px 20px',
        background: 'transparent',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          width: '100%'
        }}>
          <div style={{
            background: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '2px solid #4CAF50',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            minHeight: '40px',
            minWidth: '120px'
          }}>
            <span style={{
              fontSize: '14px',
              color: '#333',
              padding: '2px 4px',
              margin: 0
            }}>Misi: Gerakkan Ksatria ke</span>
            <span style={{
              background: '#FF9800',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontWeight: 'bold',
              margin: 0
            }}>({targetPosition.x}, {targetPosition.y})</span>
          </div>
          <div style={{
            background: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '2px solid #4CAF50',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            minHeight: '40px',
            minWidth: '120px'
          }}>
            <span style={{
              background: '#4CAF50',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontWeight: 'bold',
              margin: 0
            }}>Level 1</span>
            <span style={{
              background: '#FF9800',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontWeight: 'bold',
              margin: 0
            }}>Langkah: {sequence.length}/12</span>
          </div>
          
          <div style={{
            background: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '2px solid #9C27B0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            minHeight: '40px',
            minWidth: '120px'
          }}>
            <span style={{
              background: '#9C27B0',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontWeight: 'bold',
              margin: 0
            }}>💎 Kristal: {collectedCrystals}/{Object.keys(crystals).length}</span>
          </div>
          
          <div style={{
            background: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '2px solid #4CAF50',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            minHeight: '40px',
            minWidth: '120px'
          }}>
            <span style={{
              fontSize: '14px',
              color: '#333',
              padding: '2px 4px',
              margin: 0
            }}>Skor:</span>
            <span style={{
              background: '#FF9800',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontWeight: 'bold',
              margin: 0
            }}>0</span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flex: 1,
        gap: '15px',
        padding: '0 15px',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'visible', // Changed from 'hidden' to 'visible' to prevent clipping
        maxHeight: 'calc(100vh - 140px)' // Reserve space for header and footer
      }}>
        <div style={{
          width: '260px',
          background: 'white',
          borderRadius: '15px',
          padding: '15px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '2px solid #4CAF50',
          flexShrink: 0,
          boxSizing: 'border-box',
          overflowY: 'auto',
          maxHeight: '100%'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '15px',
            background: '#F5F5F5',
            padding: '8px',
            borderRadius: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>🎮</span>
            <h3 style={{
              margin: 0,
              fontSize: '14px',
              color: '#333',
              padding: '2px 0'
            }}>Kontrol Gerakan (Level 1)</h3>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{
              background: '#4CAF50',
              color: 'white',
              padding: '6px 10px',
              margin: '0 0 12px 0',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>GERAKAN</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px'
            }}>
              <div 
                style={{
                  width: '65px',
                  height: '65px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: '#4A90E2',
                  boxShadow: '0 3px 6px rgba(74, 144, 226, 0.3)',
                  border: '2px solid transparent'
                }}
                onClick={() => addToSequence({id: 'up', name: 'Up', icon: '⬆️', color: '#4A90E2'})}
              >
                <span style={{ fontSize: '20px', color: 'white' }}>⬆️</span>
              </div>
              <div 
                style={{
                  width: '65px',
                  height: '65px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: '#4A90E2',
                  boxShadow: '0 3px 6px rgba(74, 144, 226, 0.3)',
                  border: '2px solid transparent'
                }}
                onClick={() => addToSequence({id: 'left', name: 'Left', icon: '⬅️', color: '#4A90E2'})}
              >
                <span style={{ fontSize: '20px', color: 'white' }}>⬅️</span>
              </div>
              <div 
                style={{
                  width: '65px',
                  height: '65px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: '#4A90E2',
                  boxShadow: '0 3px 6px rgba(74, 144, 226, 0.3)',
                  border: '2px solid transparent'
                }}
                onClick={() => addToSequence({id: 'right', name: 'Right', icon: '➡️', color: '#4A90E2'})}
              >
                <span style={{ fontSize: '20px', color: 'white' }}>➡️</span>
              </div>
              <div 
                style={{
                  width: '65px',
                  height: '65px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: '#4A90E2',
                  boxShadow: '0 3px 6px rgba(74, 144, 226, 0.3)',
                  border: '2px solid transparent'
                }}
                onClick={() => addToSequence({id: 'down', name: 'Down', icon: '⬇️', color: '#4A90E2'})}
              >
                <span style={{ fontSize: '20px', color: 'white' }}>⬇️</span>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{
              background: '#4CAF50',
              color: 'white',
              padding: '6px 10px',
              margin: '0 0 12px 0',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>AKSI</h4>
            <div style={{
              width: '100px',
              height: '65px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: '#FF9800',
              boxShadow: '0 3px 6px rgba(255, 152, 0, 0.3)'
            }}>
              <span style={{ fontSize: '20px', color: 'white' }}>↻</span>
            </div>
          </div>
        </div>

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          minWidth: 0,
          overflow: 'visible', // Changed from 'hidden' to 'visible' to prevent clipping
          maxHeight: '100%'
        }}>
          <div style={{
            background: '#4CAF50',
            color: 'white',
            padding: '12px 15px',
            borderRadius: '8px',
            position: 'relative',
            flexShrink: 0
          }}>
            <p style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              padding: '0'
            }}>Program Sequence - Langkah yang akan dijalankan oleh karakter</p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '8px 0'
            }}>
              <div style={{
                flex: 1,
                height: '6px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: 'white',
                  width: `${sequence.length > 0 ? (sequence.length / maxMoves) * 100 : 0}%`,
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{sequence.length}/{maxMoves}</span>
            </div>
            <p style={{
              fontSize: '11px',
              margin: '0',
              opacity: 0.9
            }}>🎯 {sequence.length === 0 ? 'Tambahkan gerakan untuk memulai' : `${sequence.length} gerakan telah dipilih`}</p>
            <p style={{
              fontSize: '10px',
              margin: '4px 0 0 0',
              opacity: 0.7,
              fontStyle: 'italic'
            }}>💡 Tip: Cari kristal terdekat dulu untuk jalur yang efisien!</p>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flex: '0 0 auto',
            marginBottom: '10px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 50px)',
              gridTemplateRows: 'repeat(5, 50px)',
              gap: '0px', // Removed gap to make terrain seamless
              background: 'transparent', // Removed white background
              padding: '0px', // Removed padding
              borderRadius: '0px', // Removed border radius
              border: 'none', // Removed border
              boxShadow: 'none' // Removed shadow
            }}>
              {Array.from({ length: gridWidth * gridHeight }, (_, i) => {
                const x = i % gridWidth;
                const y = Math.floor(i / gridWidth);
                const isTarget = x === targetPosition.x && y === targetPosition.y;
                const isPlayerHere = playerPosition.x === x && playerPosition.y === y;
                const crystalKey = `${x}-${y}`;
                const hasCrystal = crystals[crystalKey] && !crystals[crystalKey].collected;
                const grassAsset = getGrassTileByPositionWrapper(x, y, gridWidth, gridHeight);
                
                return (
                  <div 
                    key={i} 
                    style={{
                      width: '50px',
                      height: '50px',
                      border: 'none', // Removed border for seamless terrain
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      borderRadius: '0px', // Removed border radius for seamless look
                      backgroundImage: `url('${grassAsset}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {isPlayerHere && (
                      <HumanCharacter 
                        size={60} // Increased from 40 to 60 for better visibility
                        x={0}
                        y={0}
                        direction={playerDirection}
                        isAnimating={isExecuting}
                        animationState={isExecuting ? 'walking' : 'breathing'} // Changed from 'idle' to 'breathing'
                      />
                    )}
                    {isTarget && (
                      <div style={{
                        fontSize: '20px',
                        background: '#FF9800',
                        width: '40px',
                        height: '40px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(255, 152, 0, 0.5)'
                      }}>🎯</div>
                    )}
                    {hasCrystal && (
                      <div style={{
                        fontSize: '18px',
                        background: 'linear-gradient(45deg, #9C27B0, #673AB7)',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(156, 39, 176, 0.6)',
                        border: '2px solid white',
                        animation: 'sparkle 2s ease-in-out infinite',
                        zIndex: 5
                      }}>💎</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{
            background: 'white',
            border: '2px solid #FF9800',
            borderRadius: '12px',
            padding: '12px',
            flex: '1 1 auto',
            minHeight: '140px', // Minimum height for better visibility
            maxHeight: sequence.length > 12 ? '320px' : sequence.length > 6 ? '280px' : '240px', // Dynamic height based on sequence length
            overflow: 'visible', // Changed to visible to prevent clipping
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '10px',
              flexShrink: 0 // Prevent header from shrinking
            }}>
              <span style={{ fontSize: '16px' }}>🧩</span>
              <h3 style={{
                margin: 0,
                color: '#FF9800',
                fontSize: '14px',
                padding: '0'
              }}>Program Ksatriamu</h3>
            </div>
            
            <div 
                      className="program-sequence-container"
                      style={{
                        flex: 1,
                        minHeight: '100px',
                        border: '2px solid #FFE0B2',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: sequence.length === 0 ? 'center' : 'flex-start',
                        justifyContent: sequence.length === 0 ? 'center' : 'flex-start',
                        maxHeight: sequence.length > 12 ? '280px' : sequence.length > 6 ? '240px' : '200px',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        flexWrap: 'wrap',
                        gap: '12px',
                        background: 'linear-gradient(135deg, #FFF8E1 0%, #FFFDE7 100%)',
                        alignContent: 'flex-start',
                        position: 'relative'
                      }}>
              {sequence.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#666',
                  width: '100%', // Take full width when centered
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '50px'
                }}>
                  <p style={{
                    margin: 0,
                    fontStyle: 'italic',
                    fontSize: '12px'
                  }}>Seret ubin ke sini untuk membuat program Anda!</p>
                </div>
              ) : (
                // Sequence tiles with improved layout for scrolling
                sequence.map((tile, index) => (
                  <div
                    key={tile.uniqueId}
                    className="sequence-tile"
                    style={{
                      width: '50px', // Consistent tile size
                      height: '50px', // Consistent tile size
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '18px', // Font size for visibility
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      backgroundColor: tile.color,
                      flexShrink: 0, // Prevent tiles from shrinking
                      cursor: 'pointer', // Interactive cursor
                      transition: 'transform 0.2s ease', // Hover effect
                      position: 'relative',
                      margin: '0' // No margin to prevent layout issues
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                    title={`${tile.name} (${index + 1})`} // Tooltip
                  >
                    {tile.icon}
                    {/* Step number indicator with improved positioning */}
                    <div style={{
                      position: 'absolute',
                      top: '-4px', // Positioning to prevent clipping
                      right: '-4px', // Positioning to prevent clipping
                      width: '20px', // Size for visibility
                      height: '20px', // Size for visibility
                      borderRadius: '50%',
                      background: '#2196F3',
                      color: 'white',
                      fontSize: '12px', // Font size for readability
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      border: '2px solid white',
                      zIndex: 10, // Above other elements
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)' // Shadow for visibility
                    }}>
                      {index + 1}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '15px',
        padding: '12px 20px',
        background: 'rgba(255,255,255,0.1)',
        width: '100%',
        boxSizing: 'border-box',
        flexShrink: 0,
        minHeight: '50px'
      }}>
        <button 
          onClick={executeProgram}
          disabled={isExecuting || sequence.length === 0 || sequence.length > maxMoves || gameWon}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: sequence.length === 0 || sequence.length > maxMoves || isExecuting || gameWon ? 'not-allowed' : 'pointer',
            background: '#4CAF50',
            color: 'white',
            boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
            opacity: sequence.length === 0 || sequence.length > maxMoves || isExecuting || gameWon ? 0.5 : 1
          }}
        >
          <span>✓</span>
          JALANKAN KSATRIA
        </button>
        
        <button 
          onClick={resetGame}
          disabled={isExecuting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: isExecuting ? 'not-allowed' : 'pointer',
            background: '#FF9800',
            color: 'white',
            boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
            opacity: isExecuting ? 0.5 : 1
          }}
        >
          <span>🔄</span>
          RESET PERMAINAN
        </button>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#FFF9C4',
          padding: '8px 12px',
          borderRadius: '15px',
          border: '2px solid #FFD54F'
        }}>
          <span style={{ fontSize: '16px' }}>⚠️</span>
          <span style={{ fontWeight: 'bold', color: '#F57F17', fontSize: '14px' }}>Skor: {score}</span>
        </div>
      </div>

      {/* Victory Modal */}
      {showVictoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          animation: 'fadeIn 0.5s ease-in-out'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            borderRadius: '20px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            border: '3px solid #FFD700',
            minWidth: '400px',
            transform: 'scale(1)',
            animation: 'celebrationBounce 0.6s ease-out'
          }}>
            <div style={{
              fontSize: '60px',
              marginBottom: '20px',
              animation: 'sparkle 1s ease-in-out infinite'
            }}>🎉</div>
            
            <h1 style={{
              color: 'white',
              fontSize: '32px',
              margin: '0 0 10px 0',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>Selamat!</h1>
            
            <p style={{
              color: 'white',
              fontSize: '18px',
              margin: '0 0 20px 0',
              opacity: 0.95
            }}>Anda berhasil mengumpulkan semua kristal!</p>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              padding: '15px',
              margin: '20px 0',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <div style={{ color: 'white', fontSize: '16px', marginBottom: '8px' }}>
                🏆 <strong>Statistik Permainan:</strong>
              </div>
              <div style={{ color: 'white', fontSize: '14px', marginBottom: '5px' }}>
                💎 Kristal dikumpulkan: {collectedCrystals}/{Object.keys(crystals).length}
              </div>
              <div style={{ color: 'white', fontSize: '14px', marginBottom: '5px' }}>
                🎯 Langkah digunakan: {sequence.length}/12
              </div>
              <div style={{ color: 'white', fontSize: '14px' }}>
                ⭐ Skor: {score} poin
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              marginTop: '25px'
            }}>
              <button 
                onClick={nextLevel}
                style={{
                  background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(255, 152, 0, 0.4)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(255, 152, 0, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(255, 152, 0, 0.4)';
                }}
              >
                <span>🚀</span>
                Level Berikutnya
              </button>
              
              <button 
                onClick={repeatLevel}
                style={{
                  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(33, 150, 243, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(33, 150, 243, 0.4)';
                }}
              >
                <span>🔄</span>
                Ulangi Level
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZenoGameNew;