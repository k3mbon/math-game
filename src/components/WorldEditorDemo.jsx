import React, { useState } from 'react';
import WorldEditor from './WorldEditor';
import SimpleOpenWorldGame from './SimpleOpenWorldGame';
import './WorldEditorDemo.css';

const WorldEditorDemo = () => {
  const [currentView, setCurrentView] = useState('editor');
  const [savedWorld, setSavedWorld] = useState(null);
  const [savedWorlds, setSavedWorlds] = useState([]);
  const [selectedWorldIndex, setSelectedWorldIndex] = useState(null);
  
  // Default world for testing when no world is saved
  const getDefaultWorld = () => {
    return {
      size: { width: 800, height: 600 },
      gridSize: 32,
      levels: {
        0: [
          { id: 1, assetId: 'spawn', x: 64, y: 64, width: 32, height: 32, walkable: true, properties: { name: 'Player Spawn', category: 'special' } },
          { id: 2, assetId: 'grass', x: 96, y: 64, width: 32, height: 32, walkable: true, properties: { name: 'Grass', category: 'terrain' } },
          { id: 3, assetId: 'grass', x: 128, y: 64, width: 32, height: 32, walkable: true, properties: { name: 'Grass', category: 'terrain' } },
          { id: 4, assetId: 'tree', x: 160, y: 64, width: 32, height: 32, walkable: false, properties: { name: 'Tree', category: 'obstacle' } },
          { id: 5, assetId: 'treasure', x: 192, y: 96, width: 32, height: 32, walkable: true, properties: { name: 'Treasure Box', category: 'interactive', hasQuestion: true } }
        ]
      },
      currentLevel: 0
    };
  };
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSaveWorld = (worldData) => {
    console.log('handleSaveWorld called with:', worldData);
    const worldWithMetadata = {
      ...worldData,
      name: `World ${savedWorlds.length + 1}`,
      createdAt: new Date().toLocaleString()
    };
    setSavedWorld(worldWithMetadata);
    setSavedWorlds(prev => [...prev, worldWithMetadata]);
    setSelectedWorldIndex(savedWorlds.length);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    console.log('World saved to state:', worldWithMetadata);
  };

  const handleLoadWorld = (index) => {
    const world = savedWorlds[index];
    if (world) {
      setSavedWorld(world);
      setSelectedWorldIndex(index);
    }
  };

  const handleDeleteWorld = (index) => {
    const newWorlds = savedWorlds.filter((_, i) => i !== index);
    setSavedWorlds(newWorlds);
    if (selectedWorldIndex === index) {
      setSavedWorld(null);
      setSelectedWorldIndex(null);
    } else if (selectedWorldIndex > index) {
      setSelectedWorldIndex(selectedWorldIndex - 1);
    }
  };

  const handleLoadSampleWorld = () => {
    const sampleWorld = {
      size: { width: 800, height: 600 },
      gridSize: 32,
      name: 'Sample Multi-Level World',
      createdAt: new Date().toLocaleString(),
      currentLevel: 0,
      levelNames: {
        0: 'Surface',
        1: 'Underground Cave',
        2: 'Deep Cavern'
      },
      levels: {
        0: [
          // Surface level
          { id: 1, assetId: 'spawn', x: 64, y: 64, width: 32, height: 32, walkable: true, properties: { name: 'Player Spawn', category: 'special' } },
          { id: 2, assetId: 'grass', x: 96, y: 64, width: 32, height: 32, walkable: true, properties: { name: 'Grass', category: 'terrain' } },
          { id: 3, assetId: 'grass', x: 128, y: 64, width: 32, height: 32, walkable: true, properties: { name: 'Grass', category: 'terrain' } },
          { id: 4, assetId: 'tree', x: 160, y: 64, width: 32, height: 32, walkable: false, properties: { name: 'Tree', category: 'obstacle' } },
          { id: 5, assetId: 'rock', x: 96, y: 96, width: 32, height: 32, walkable: false, properties: { name: 'Rock', category: 'obstacle' } },
          { id: 6, assetId: 'water', x: 64, y: 128, width: 32, height: 32, walkable: false, properties: { name: 'Water', category: 'terrain' } },
          { id: 7, assetId: 'bridge', x: 96, y: 128, width: 32, height: 32, walkable: true, properties: { name: 'Bridge', category: 'terrain' } },
          { id: 8, assetId: 'water', x: 128, y: 128, width: 32, height: 32, walkable: false, properties: { name: 'Water', category: 'terrain' } },
          { id: 9, assetId: 'treasure', x: 192, y: 96, width: 32, height: 32, walkable: true, properties: { name: 'Treasure Box', category: 'interactive', hasQuestion: true } },
          { id: 10, assetId: 'cave-entrance', x: 224, y: 128, width: 32, height: 32, walkable: true, properties: { name: 'Cave Entrance', category: 'special', targetLevel: 1 } }
        ],
        1: [
          // Underground cave level
          { id: 11, assetId: 'spawn', x: 64, y: 64, width: 32, height: 32, walkable: true, properties: { name: 'Cave Spawn', category: 'special' } },
          { id: 12, assetId: 'stalactite', x: 96, y: 64, width: 32, height: 32, walkable: false, properties: { name: 'Stalactite', category: 'obstacle' } },
          { id: 13, assetId: 'cave-water', x: 128, y: 96, width: 32, height: 32, walkable: false, properties: { name: 'Cave Water', category: 'terrain' } },
          { id: 14, assetId: 'treasure', x: 160, y: 128, width: 32, height: 32, walkable: true, properties: { name: 'Hidden Treasure', category: 'interactive', hasQuestion: true } },
          { id: 15, assetId: 'cave-entrance', x: 192, y: 160, width: 32, height: 32, walkable: true, properties: { name: 'Deeper Cave', category: 'special', targetLevel: 2 } }
        ],
        2: [
          // Deep cavern level
          { id: 16, assetId: 'spawn', x: 64, y: 64, width: 32, height: 32, walkable: true, properties: { name: 'Deep Spawn', category: 'special' } },
          { id: 17, assetId: 'lava', x: 96, y: 96, width: 32, height: 32, walkable: false, properties: { name: 'Lava', category: 'terrain' } },
          { id: 18, assetId: 'lava', x: 128, y: 96, width: 32, height: 32, walkable: false, properties: { name: 'Lava', category: 'terrain' } },
          { id: 19, assetId: 'monster-dragon', x: 160, y: 128, width: 64, height: 64, walkable: false, properties: { name: 'Dragon Boss', category: 'monster', hp: 100 } },
          { id: 20, assetId: 'treasure', x: 224, y: 160, width: 32, height: 32, walkable: true, properties: { name: 'Dragon Treasure', category: 'interactive', hasQuestion: true } }
        ]
      },
      // Legacy objects field for backward compatibility
      objects: []
    };
    setSavedWorld(sampleWorld);
    setSavedWorlds(prev => [...prev, sampleWorld]);
    setSelectedWorldIndex(savedWorlds.length);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const convertWorldToGameFormat = (worldData) => {
    console.log('convertWorldToGameFormat called with:', worldData);
    if (!worldData) {
      console.log('No worldData provided, returning null');
      return null;
    }

    // Handle new multi-level format - extract current level objects
    if (worldData.levels) {
      console.log('Converting multi-level format:', worldData.levels);
      const currentLevel = worldData.currentLevel || 0;
      const currentLevelObjects = worldData.levels[currentLevel] || [];
      console.log(`Extracting objects from level ${currentLevel}:`, currentLevelObjects);
      
      const converted = {
        ...worldData,
        // Ensure we have the proper structure for SimpleOpenWorldGame
        size: worldData.size,
        gridSize: worldData.gridSize,
        levels: worldData.levels,
        currentLevel: currentLevel,
        objects: currentLevelObjects // Extract current level objects
      };
      console.log('Converted world data:', converted);
      return converted;
    }

    // Handle legacy single-level format
    const gameWorld = {
      width: worldData.size.width,
      height: worldData.size.height,
      terrain: [],
      objects: [],
      treasures: [],
      playerSpawn: { x: 100, y: 100 } // default spawn
    };

    const objectsToProcess = worldData.objects || [];
    objectsToProcess.forEach(obj => {
      const gameObj = {
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height,
        type: obj.assetId,
        walkable: obj.walkable
      };

      switch (obj.assetId) {
        case 'spawn':
          gameWorld.playerSpawn = { x: obj.x, y: obj.y };
          break;
        case 'treasure':
          gameWorld.treasures.push({
            ...gameObj,
            collected: false,
            hasQuestion: obj.properties?.hasQuestion || false
          });
          break;
        case 'grass':
        case 'water':
          gameWorld.terrain.push(gameObj);
          break;
        default:
          gameWorld.objects.push(gameObj);
          break;
      }
    });

    return gameWorld;
  };

  return (
    <div className="world-editor-demo">
      {showSuccessMessage && (
        <div className="success-message">
          ✅ World saved successfully!
        </div>
      )}
      
      <div className="demo-header">
        <h1>World Editor & Game Preview</h1>
        <div className="view-controls">
          <button 
            className={`view-btn ${currentView === 'editor' ? 'active' : ''}`}
            onClick={() => setCurrentView('editor')}
          >
            🎨 World Editor
          </button>
          <button 
            className={`view-btn ${currentView === 'preview' ? 'active' : ''}`}
            onClick={() => setCurrentView('preview')}
          >
            🎮 Game Preview
          </button>
        </div>
      </div>

      <div className="demo-content">
        {currentView === 'editor' ? (
          <div className="editor-container">
            <div className="editor-instructions">
              <h3>How to use the World Editor:</h3>
              <ul>
                <li><strong>Select Tool:</strong> Click on objects to select and edit their properties</li>
                <li><strong>Place Tool:</strong> Choose an asset and click on the canvas to place it</li>
                <li><strong>Erase Tool:</strong> Click on objects to remove them</li>
                <li><strong>Move Tool:</strong> Drag objects to reposition them</li>
              </ul>
              <p><strong>Tip:</strong> Use the properties panel on the right to configure walkability and other settings for selected objects.</p>
            </div>
            <WorldEditor 
              onSaveWorld={handleSaveWorld}
              initialWorld={savedWorld}
            />
          </div>
        ) : (
          <div className="preview-container">
            <div className="preview-header">
              <div className="preview-controls">
                <button 
                  className="back-btn"
                  onClick={() => setCurrentView('editor')}
                >
                  ← Back to Editor
                </button>
                <div className="world-selector">
                  <h4>Select World:</h4>
                  <select 
                    value={selectedWorldIndex || ''} 
                    onChange={(e) => {
                      const index = parseInt(e.target.value);
                      if (!isNaN(index)) {
                        handleLoadWorld(index);
                      }
                    }}
                  >
                    <option value="">Choose a world...</option>
                    {savedWorlds.map((world, index) => (
                      <option key={index} value={index}>
                        {world.name} ({world.createdAt})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="world-list">
                <h4>Created Worlds ({savedWorlds.length}):</h4>
                {savedWorlds.length === 0 ? (
                  <p className="no-worlds">No worlds created yet. Go back to the editor to create your first world!</p>
                ) : (
                  <div className="worlds-grid">
                    {savedWorlds.map((world, index) => (
                      <div 
                        key={index} 
                        className={`world-card ${selectedWorldIndex === index ? 'selected' : ''}`}
                      >
                        <div className="world-info">
                          <h5>{world.name}</h5>
                          <p>Created: {world.createdAt}</p>
                          {world.levels ? (
                            <>
                              <p>Levels: {Object.keys(world.levels).length}</p>
                              <p>Total Objects: {Object.values(world.levels).reduce((total, levelObjects) => total + levelObjects.length, 0)}</p>
                            </>
                          ) : (
                            <p>Objects: {world.objects?.length || 0}</p>
                          )}
                          <p>Size: {world.size?.width}x{world.size?.height}</p>
                        </div>
                        <div className="world-actions">
                          <button 
                            className="load-btn"
                            onClick={() => handleLoadWorld(index)}
                          >
                            Load
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteWorld(index)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="preview-instructions">
              <h3>Game Preview</h3>
              <p>This is how your designed world looks in the actual game. Use WASD or arrow keys to move around!</p>
              {savedWorld && (
                <div className="world-stats">
                  <span>Current: {savedWorld.name}</span>
                  {savedWorld.levels ? (
                    <>
                      <span>Levels: {Object.keys(savedWorld.levels).length}</span>
                      <span>Total Objects: {Object.values(savedWorld.levels).reduce((total, levelObjects) => total + levelObjects.length, 0)}</span>
                    </>
                  ) : (
                    <span>Objects: {savedWorld.objects?.length || 0}</span>
                  )}
                  <span>Size: {savedWorld.size?.width}x{savedWorld.size?.height}</span>
                </div>
              )}
            </div>
            <SimpleOpenWorldGame 
              customWorld={convertWorldToGameFormat(savedWorld || getDefaultWorld())}
            />
          </div>
        )}
      </div>

      <div className="demo-footer">
        <div className="feature-highlights">
          <div className="feature">
            <h4>🎨 Visual Design</h4>
            <p>Drag and drop assets to create your world visually</p>
          </div>
          <div className="feature">
            <h4>⚙️ Property Control</h4>
            <p>Configure walkability, interactions, and more for each object</p>
          </div>
          <div className="feature">
            <h4>🎮 Live Preview</h4>
            <p>Test your world immediately in the game engine</p>
          </div>
          <div className="feature">
            <h4>💾 Export/Import</h4>
            <p>Save your worlds as JSON files for reuse</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldEditorDemo;