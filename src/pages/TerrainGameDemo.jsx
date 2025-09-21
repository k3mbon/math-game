import React, { useState } from 'react';
import GameTerrain from '../components/GameTerrain';

const TerrainGameDemo = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: 64, y: 64 });
  const [currentLevel, setCurrentLevel] = useState(0);
  const [terrainData, setTerrainData] = useState(null);
  const [collectedCrystals, setCollectedCrystals] = useState([]);

  // Load terrain data from JSON file
  const loadTerrainFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setTerrainData(data);
          console.log('Terrain loaded:', data);
        } catch (error) {
          alert('Error loading terrain file: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  // Handle player movement
  const handlePlayerMove = (newPosition) => {
    setPlayerPosition(newPosition);
  };

  // Handle level change (cave entrance/exit)
  const handleLevelChange = (newLevel, newPosition) => {
    setCurrentLevel(newLevel);
    setPlayerPosition(newPosition);
    console.log(`Player moved to level ${newLevel} at position:`, newPosition);
  };

  // Handle crystal collection
  const handleCrystalCollected = (crystal) => {
    setCollectedCrystals(prev => [...prev, crystal]);
    console.log('Crystal collected:', crystal);
  };

  // Create sample terrain data for demo
  const createSampleTerrain = () => {
    const sampleData = {
      levels: {
        0: Array(10).fill(null).map((_, row) => 
          Array(15).fill(null).map((_, col) => {
            if (row === 5 && col === 7) {
              // Cave entrance
              return {
                terrain: '/assets/terrain/1 Tiles/Map_tile_01.png',
                obstacle: '/assets/characters/terrain-object/Other/Cave_enter.png',
                isCaveEntrance: true,
                connectedTo: { row: 5, col: 7 }
              };
            } else if (Math.random() > 0.8) {
              // Random crystals
              return {
                terrain: '/assets/terrain/1 Tiles/Map_tile_01.png',
                obstacle: '/assets/characters/terrain-object/Crystals/1.png'
              };
            } else {
              return {
                terrain: '/assets/terrain/1 Tiles/Map_tile_01.png',
                obstacle: null
              };
            }
          })
        ),
        1: Array(10).fill(null).map((_, row) => 
          Array(15).fill(null).map((_, col) => {
            if (Math.random() > 0.7) {
              // More crystals underground
              return {
                terrain: '/assets/terrain/1 Tiles/Map_tile_05.png',
                obstacle: '/assets/characters/terrain-object/Crystals/2.png'
              };
            } else {
              return {
                terrain: '/assets/terrain/1 Tiles/Map_tile_05.png',
                obstacle: null
              };
            }
          })
        )
      },
      levelConnections: [
        {
          from: { row: 5, col: 7, level: 0 },
          to: { row: 5, col: 7, level: 1 },
          id: Date.now()
        }
      ],
      dimensions: { rows: 10, cols: 15 },
      timestamp: new Date().toISOString(),
      metadata: {
        surfaceLevel: 0,
        undergroundLevel: 1,
        caveEntrances: 1
      }
    };
    
    setTerrainData(sampleData);
  };

  return (
    <div className="terrain-game-demo">
      <div className="demo-header">
        <h1>🎮 Terrain Game Demo</h1>
        <p>Test the cave entrance system and crystal collection with math puzzles</p>
      </div>

      <div className="demo-controls">
        <div className="file-loader">
          <h3>Load Terrain File</h3>
          <input
            type="file"
            accept=".json"
            onChange={loadTerrainFile}
            style={{
              padding: '0.5rem',
              border: '2px solid var(--primary-300)',
              borderRadius: '6px',
              background: 'var(--bg-light)'
            }}
          />
          <button onClick={createSampleTerrain} style={{
            marginLeft: '1rem',
            padding: '0.5rem 1rem',
            background: 'var(--primary-500)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Create Sample Terrain
          </button>
        </div>

        <div className="game-info">
          <div className="info-item">
            <strong>Player Position:</strong> ({Math.floor(playerPosition.x / 32)}, {Math.floor(playerPosition.y / 32)})
          </div>
          <div className="info-item">
            <strong>Current Level:</strong> {currentLevel === 0 ? 'Surface' : 'Underground'}
          </div>
          <div className="info-item">
            <strong>Crystals Collected:</strong> {collectedCrystals.length}
          </div>
        </div>
      </div>

      <div className="demo-instructions">
        <h3>📋 Instructions</h3>
        <ol>
          <li>🗂️ Load a terrain file created with the Terrain Designer, or create sample terrain</li>
          <li>💎 Click on crystals to solve math puzzles and collect them</li>
          <li>🚪 Cave entrances (orange highlighted tiles) transport you between levels</li>
          <li>🧮 Solve the math problems using Blockly programming to unlock crystals</li>
          <li>❌ Wrong answers leave the crystal protected - try again!</li>
        </ol>
      </div>

      {terrainData ? (
        <GameTerrain
          terrainData={terrainData}
          playerPosition={playerPosition}
          onPlayerMove={handlePlayerMove}
          onCrystalCollected={handleCrystalCollected}
          currentLevel={currentLevel}
          onLevelChange={handleLevelChange}
        />
      ) : (
        <div className="no-terrain">
          <p>No terrain loaded. Please load a terrain file or create sample terrain.</p>
        </div>
      )}

      {collectedCrystals.length > 0 && (
        <div className="collected-crystals">
          <h3>🏆 Collected Crystals</h3>
          <div className="crystal-list">
            {collectedCrystals.map((crystal, idx) => (
              <div key={idx} className="crystal-item">
                Crystal {idx + 1} from Level {crystal.id.split('-')[0]} 
                at position ({crystal.position.x}, {crystal.position.y})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TerrainGameDemo;
