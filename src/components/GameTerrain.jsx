import React, { useState, useEffect, useCallback } from 'react';
import CrystalCollectionModal from './CrystalCollectionModal';
import numerationProblems from '../data/NumerationProblem.json';

/**
 * GameTerrain component handles:
 * 1. Rendering multi-level terrain (surface + underground)
 * 2. Cave entrance/exit mechanics
 * 3. Crystal collection with math puzzles
 * 4. Player movement between levels
 */
const GameTerrain = ({ 
  terrainData, 
  playerPosition, 
  onPlayerMove, 
  onCrystalCollected,
  currentLevel = 0,
  onLevelChange 
}) => {
  const [showCrystalModal, setShowCrystalModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentCrystal, setCurrentCrystal] = useState(null);
  const [collectedCrystals, setCollectedCrystals] = useState(new Set());

  // Get terrain for current level
  const getCurrentLevelTerrain = () => {
    if (!terrainData || !terrainData.levels) return null;
    return terrainData.levels[currentLevel];
  };

  // Check if player is near a cave entrance
  const checkCaveEntrance = useCallback((x, y) => {
    if (!terrainData || !terrainData.levelConnections) return null;
    
    const tileX = Math.floor(x / 32); // Assuming 32px tile size
    const tileY = Math.floor(y / 32);
    
    // Check if player is on a cave entrance tile
    const connection = terrainData.levelConnections.find(conn => 
      conn.from.row === tileY && conn.from.col === tileX && currentLevel === 0
    );
    
    return connection;
  }, [terrainData, currentLevel]);

  // Check if player is trying to collect a crystal
  const checkCrystalCollection = useCallback((x, y) => {
    const levelTerrain = getCurrentLevelTerrain();
    if (!levelTerrain) return null;
    
    const tileX = Math.floor(x / 32);
    const tileY = Math.floor(y / 32);
    
    const cell = levelTerrain[tileY]?.[tileX];
    const crystalId = `${currentLevel}-${tileY}-${tileX}`;
    
    // Check if cell has a crystal and it hasn't been collected
    if (cell?.obstacle && 
        cell.obstacle.includes('crystal') || cell.obstacle.includes('Crystal')) {
      if (!collectedCrystals.has(crystalId)) {
        return {
          crystal: cell,
          id: crystalId,
          position: { x: tileX, y: tileY }
        };
      }
    }
    
    return null;
  }, [getCurrentLevelTerrain, currentLevel, collectedCrystals]);

  // Handle player interaction (called when player presses action key)
  const handlePlayerInteraction = useCallback((x, y) => {
    // Check cave entrance first
    const caveConnection = checkCaveEntrance(x, y);
    if (caveConnection && currentLevel === 0) {
      // Transport player to underground level
      onLevelChange(1, {
        x: caveConnection.to.col * 32,
        y: caveConnection.to.row * 32
      });
      return;
    }
    
    // Check crystal collection
    const crystalData = checkCrystalCollection(x, y);
    if (crystalData) {
      // Select a random math question based on current level
      const availableQuestions = numerationProblems.filter(q => q.level <= (currentLevel + 1));
      const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
      
      setCurrentQuestion(randomQuestion);
      setCurrentCrystal(crystalData);
      setShowCrystalModal(true);
    }
  }, [checkCaveEntrance, checkCrystalCollection, currentLevel, onLevelChange]);

  // Handle crystal collection success
  const handleCrystalCollected = useCallback((crystal) => {
    setCollectedCrystals(prev => new Set([...prev, crystal.id]));
    onCrystalCollected && onCrystalCollected(crystal);
  }, [onCrystalCollected]);

  // Render terrain grid for current level
  const renderTerrain = () => {
    const levelTerrain = getCurrentLevelTerrain();
    if (!levelTerrain) return null;

    return levelTerrain.map((row, rowIdx) => (
      <div key={rowIdx} className="terrain-row" style={{ display: 'flex' }}>
        {row.map((cell, colIdx) => {
          const crystalId = `${currentLevel}-${rowIdx}-${colIdx}`;
          const isCollected = collectedCrystals.has(crystalId);
          
          return (
            <div
              key={colIdx}
              className={`terrain-cell ${cell.isCaveEntrance ? 'cave-entrance' : ''}`}
              style={{
                width: 32,
                height: 32,
                position: 'relative',
                background: cell.terrain ? `url(${cell.terrain})` : '#8B7355',
                backgroundSize: 'cover'
              }}
            >
              {cell.terrain && (
                <img
                  src={cell.terrain}
                  alt="terrain"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    position: 'absolute', 
                    top: 0, 
                    left: 0 
                  }}
                />
              )}
              {cell.obstacle && !isCollected && (
                <img
                  src={cell.obstacle}
                  alt="obstacle"
                  style={{
                    width: '80%',
                    height: '80%',
                    position: 'absolute',
                    top: '10%',
                    left: '10%',
                    filter: cell.obstacle.includes('crystal') ? 'drop-shadow(0 2px 4px rgba(102, 126, 234, 0.6))' : 'none'
                  }}
                />
              )}
              {cell.isCaveEntrance && (
                <div 
                  className="cave-entrance-indicator"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: '2px solid #ff6b35',
                    boxSizing: 'border-box',
                    borderRadius: '4px',
                    background: 'rgba(255, 107, 53, 0.2)'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    ));
  };

  // Expose interaction handler to parent component
  useEffect(() => {
    if (typeof onPlayerMove === 'function') {
      // Add interaction handler to global scope for easy access
      window.handlePlayerInteraction = handlePlayerInteraction;
    }
    
    return () => {
      if (window.handlePlayerInteraction) {
        delete window.handlePlayerInteraction;
      }
    };
  }, [handlePlayerInteraction, onPlayerMove]);

  return (
    <div className="game-terrain">
      <div className="level-indicator">
        <h3>
          {currentLevel === 0 ? '🌍 Surface Level' : '🕳️ Underground Level'}
        </h3>
        <p>Crystals collected: {collectedCrystals.size}</p>
      </div>
      
      <div className="terrain-grid">
        {renderTerrain()}
      </div>

      <div className="controls-hint">
        <p>💡 Walk near crystals and press SPACE to interact</p>
        <p>🚪 Walk into cave entrances to travel between levels</p>
      </div>

      <CrystalCollectionModal
        isOpen={showCrystalModal}
        question={currentQuestion}
        crystal={currentCrystal}
        onClose={() => {
          setShowCrystalModal(false);
          setCurrentQuestion(null);
          setCurrentCrystal(null);
        }}
        onSolve={handleCrystalCollected}
      />
    </div>
  );
};

export default GameTerrain;
