import React from 'react';
import GrassTerrain from '../components/GrassTerrain';

const TerrainDemo = () => {
  return (
    <div className="terrain-demo-container">
      <h1>Grass Terrain Demo</h1>
      <p>A demonstration of seamless grass terrain with proper tile placement</p>
      
      <GrassTerrain width={7} height={7} />
      
      <div className="terrain-info">
        <h2>Tile Mapping</h2>
        <ul>
          <li>Corners: TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT</li>
          <li>Edges: TOP, RIGHT, BOTTOM, LEFT</li>
          <li>Center: CENTER filler tiles</li>
        </ul>
      </div>
    </div>
  );
};

export default TerrainDemo;