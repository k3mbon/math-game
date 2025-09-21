import React, { useState } from 'react';
import GrassTerrain from '../components/GrassTerrain';
import '../components/GrassTerrain.css';

const GrassTerrainDemo = () => {
  const [terrainSize, setTerrainSize] = useState({ width: 7, height: 7 });

  const handleSizeChange = (dimension, value) => {
    setTerrainSize(prev => ({
      ...prev,
      [dimension]: parseInt(value, 10)
    }));
  };

  return (
    <div className="grass-terrain-demo">
      <header>
        <h1>Grass Terrain Mapping Demo</h1>
        <p>A demonstration of seamless terrain with proper tile placement</p>
      </header>

      <div className="controls">
        <div className="control-group">
          <label>Width: </label>
          <input 
            type="range" 
            min="3" 
            max="12" 
            value={terrainSize.width} 
            onChange={(e) => handleSizeChange('width', e.target.value)} 
          />
          <span>{terrainSize.width}</span>
        </div>
        
        <div className="control-group">
          <label>Height: </label>
          <input 
            type="range" 
            min="3" 
            max="12" 
            value={terrainSize.height} 
            onChange={(e) => handleSizeChange('height', e.target.value)} 
          />
          <span>{terrainSize.height}</span>
        </div>
      </div>

      <div className="terrain-container">
        <GrassTerrain width={terrainSize.width} height={terrainSize.height} />
      </div>

      <div className="tile-legend">
        <h2>Tile Mapping Legend</h2>
        <div className="tile-types">
          <div className="tile-type">
            <div className="tile-icon corner-tile"></div>
            <span>Corner Tiles: TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT</span>
          </div>
          <div className="tile-type">
            <div className="tile-icon edge-tile"></div>
            <span>Edge Tiles: TOP, RIGHT, BOTTOM, LEFT</span>
          </div>
          <div className="tile-type">
            <div className="tile-icon center-tile"></div>
            <span>Center Tile: CENTER</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrassTerrainDemo;