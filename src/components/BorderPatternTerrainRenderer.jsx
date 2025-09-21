import React, { useState, useEffect } from 'react';
import { EnhancedTerrainEditor, createDefaultGrassLevel } from '../utils/EnhancedTerrainEditor.js';

export const BorderPatternTerrainRenderer = ({ 
  gridWidth = 20, 
  gridHeight = 20, 
  obstacles = [],
  onTileClick = null,
  showGrid = true,
  tileSize = 32 
}) => {
  const [terrainData, setTerrainData] = useState(null);
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    // Initialize terrain editor with grass border pattern
    const newEditor = new EnhancedTerrainEditor(gridWidth, gridHeight);
    newEditor.createGrassBorder();
    newEditor.addObstacles(obstacles);
    
    setEditor(newEditor);
    setTerrainData(newEditor.generateTerrainData());
  }, [gridWidth, gridHeight, obstacles]);

  const handleTileClick = (x, y) => {
    if (onTileClick) {
      onTileClick(x, y, editor);
    }
  };

  const renderTile = (tileData, index) => {
    const { x, y, asset, walkable } = tileData;
    
    return (
      <div
        key={index}
        className="terrain-tile"
        style={{
          position: 'absolute',
          left: x * tileSize,
          top: y * tileSize,
          width: tileSize,
          height: tileSize,
          backgroundImage: `url(${asset})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          border: showGrid ? '1px solid rgba(0,0,0,0.1)' : 'none',
          cursor: onTileClick ? 'pointer' : 'default',
          opacity: walkable ? 1 : 0.8
        }}
        onClick={() => handleTileClick(x, y)}
        title={`Tile (${x}, ${y}) - ${walkable ? 'Walkable' : 'Blocked'}`}
      />
    );
  };

  if (!terrainData) {
    return <div>Loading terrain...</div>;
  }

  return (
    <div 
      className="border-pattern-terrain-renderer"
      style={{
        position: 'relative',
        width: gridWidth * tileSize,
        height: gridHeight * tileSize,
        border: '2px solid #333',
        backgroundColor: '#f0f0f0'
      }}
    >
      {terrainData.tiles.map((tile, index) => renderTile(tile, index))}
    </div>
  );
};

// Example usage component that demonstrates the grass border pattern
export const GrassBorderDemo = () => {
  const [selectedTerrain, setSelectedTerrain] = useState('GRASS');
  const [editor, setEditor] = useState(null);
  const [terrainData, setTerrainData] = useState(null);

  const terrainOptions = [
    { value: 'GRASS', label: 'Grass (Border Pattern)', color: '#4CAF50' },
    { value: 'WATER', label: 'Water', color: '#2196F3' },
    { value: 'ROCK', label: 'Rock', color: '#757575' },
    { value: 'SAND', label: 'Sand', color: '#FFEB3B' }
  ];

  const handleTileClick = (x, y, terrainEditor) => {
    if (terrainEditor) {
      terrainEditor.setTile(x, y, selectedTerrain);
      const newData = terrainEditor.generateTerrainData();
      setTerrainData(newData);
    }
  };

  const resetTerrain = () => {
    if (editor) {
      editor.createGrassBorder();
      const newData = editor.generateTerrainData();
      setTerrainData(newData);
    }
  };

  const exportTerrain = () => {
    if (editor) {
      const jsonData = editor.exportToJSON();
      console.log('Exported terrain data:', jsonData);
      
      // Create download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'grass-border-terrain.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Grass Border Pattern Terrain Editor</h3>
      <p>The grass tiles automatically use different sprites for corners, edges, and center areas!</p>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Select terrain type to paint: </label>
        <select 
          value={selectedTerrain} 
          onChange={(e) => setSelectedTerrain(e.target.value)}
          style={{ marginLeft: '10px', padding: '5px' }}
        >
          {terrainOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <button 
          onClick={resetTerrain}
          style={{ marginLeft: '10px', padding: '5px 10px' }}
        >
          Reset to Grass Border
        </button>
        
        <button 
          onClick={exportTerrain}
          style={{ marginLeft: '10px', padding: '5px 10px' }}
        >
          Export JSON
        </button>
      </div>

      <BorderPatternTerrainRenderer
        gridWidth={15}
        gridHeight={15}
        obstacles={[]}
        onTileClick={handleTileClick}
        showGrid={true}
        tileSize={32}
      />
      
      <div style={{ marginTop: '20px' }}>
        <h4>Border Pattern Legend:</h4>
        <ul>
          <li><strong>Corners:</strong> grass1.png (top-left), grass3.png (top-right), grass7.png (bottom-left), grass9.png (bottom-right)</li>
          <li><strong>Edges:</strong> grass2.png (top), grass4.png (left), grass6.png (right), grass8.png (bottom)</li>
          <li><strong>Center:</strong> grass5.png (all interior tiles)</li>
        </ul>
      </div>
    </div>
  );
};