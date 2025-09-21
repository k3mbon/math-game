import React, { useState, useEffect } from 'react';

const GRID_ROWS = 20;
const GRID_COLS = 30;

function TerrainDesignerSimple() {
  const [isLoading, setIsLoading] = useState(true);
  const [grid, setGrid] = useState(
    Array(GRID_ROWS)
      .fill(null)
      .map(() => Array(GRID_COLS).fill({ terrain: null, obstacle: null }))
  );

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading terrain designer...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Terrain Designer (Simple Version)</h2>
      <p>This is a simplified version to test if the basic component loads.</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${GRID_COLS}, 20px)`,
        gap: '1px',
        border: '2px solid #ccc',
        padding: '10px',
        background: '#f0f0f0',
        margin: '1rem 0'
      }}>
        {grid.map((row, rowIdx) => 
          row.map((cell, colIdx) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              style={{
                width: '20px',
                height: '20px',
                border: '1px solid #999',
                background: '#fff',
                cursor: 'pointer'
              }}
              onClick={() => {
                console.log(`Clicked cell ${rowIdx}, ${colIdx}`);
              }}
            />
          ))
        )}
      </div>
      
      <p>Grid dimensions: {GRID_ROWS} × {GRID_COLS}</p>
    </div>
  );
}

export default TerrainDesignerSimple;
