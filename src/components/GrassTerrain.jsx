import React, { useEffect, useRef } from 'react';
import './GrassTerrain.css';
import { generateTerrainMap, preloadTileImages, preloadCharacterSprite, SWORDSMAN_SPRITE } from '../utils/grassTileMapping';

const GrassTerrain = ({ width = 7, height = 7 }) => {
  const canvasRef = useRef(null);
  const characterRef = useRef({
    x: Math.floor(width / 2),
    y: Math.floor(height / 2),
    sprite: null
  });

  // Render the terrain and character
  useEffect(() => {
    const terrainMap = generateTerrainMap(width, height);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const tileSize = 64; // Assuming each tile is 64x64 pixels
    
    // Set canvas dimensions
    canvas.width = width * tileSize;
    canvas.height = height * tileSize;
    
    // Load all images and render
    Promise.all([
      preloadTileImages(),
      preloadCharacterSprite()
    ]).then(([tileImages, characterSprite]) => {
      // Draw terrain tiles
      for (let y = 0; y < terrainMap.length; y++) {
        for (let x = 0; x < terrainMap[y].length; x++) {
          const tileType = terrainMap[y][x];
          ctx.drawImage(tileImages[tileType], x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
      
      // Store and draw character
      characterRef.current.sprite = characterSprite;
      ctx.drawImage(
        characterSprite,
        0, 0, 64, 64, // Source coordinates and dimensions (assuming sprite sheet)
        characterRef.current.x * tileSize, characterRef.current.y * tileSize, tileSize, tileSize // Destination coordinates and dimensions
      );
    });
  }, [width, height]);

  return (
    <div className="grass-terrain-container">
      <canvas ref={canvasRef} className="terrain-canvas"></canvas>
    </div>
  );
};

export default GrassTerrain;