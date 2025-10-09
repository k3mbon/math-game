import React, { useState } from 'react';
import './ScratchJrBlocks.css';

const ScratchJrBlocks = ({ onAddToSequence, sequence, maxMoves, isExecuting }) => {
  const [draggedBlock, setDraggedBlock] = useState(null);

  // ScratchJr-style movement blocks
  const movementBlocks = [
    {
      id: 'start',
      name: 'Start',
      icon: '🚀',
      color: '#4CAF50',
      type: 'control',
      action: 'start'
    },
    {
      id: 'up',
      name: 'Up',
      icon: '⬆️',
      color: '#2196F3',
      type: 'movement',
      action: 'up'
    },
    {
      id: 'down',
      name: 'Down',
      icon: '⬇️',
      color: '#2196F3',
      type: 'movement',
      action: 'down'
    },
    {
      id: 'left',
      name: 'Left',
      icon: '⬅️',
      color: '#2196F3',
      type: 'movement',
      action: 'left'
    },
    {
      id: 'right',
      name: 'Right',
      icon: '➡️',
      color: '#2196F3',
      type: 'movement',
      action: 'right'
    },
    {
      id: 'repeat',
      name: 'Repeat',
      icon: '🔄',
      color: '#FF9800',
      type: 'control',
      action: 'repeat'
    }
  ];

  const handleBlockClick = (block) => {
    if (sequence.length < maxMoves && !isExecuting) {
      const blockWithId = {
        ...block,
        uniqueId: `${block.id}_${Date.now()}_${Math.random()}`
      };
      onAddToSequence(blockWithId);
    }
  };

  const handleDragStart = (e, block) => {
    setDraggedBlock(block);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
  };

  return (
    <div className="scratchjr-blocks-container">
      <div className="blocks-header">
        <span className="blocks-icon">🧩</span>
        <h3>ScratchJr Blocks</h3>
      </div>
      
      <div className="horizontal-blocks-row">
        {movementBlocks.map((block) => (
          <div
            key={block.id}
            className={`scratchjr-block ${block.type} ${draggedBlock?.id === block.id ? 'dragging' : ''}`}
            style={{ 
              backgroundColor: block.color,
              cursor: sequence.length >= maxMoves || isExecuting ? 'not-allowed' : 'pointer',
              opacity: sequence.length >= maxMoves || isExecuting ? 0.5 : 1
            }}
            onClick={() => handleBlockClick(block)}
            draggable={!isExecuting && sequence.length < maxMoves}
            onDragStart={(e) => handleDragStart(e, block)}
            onDragEnd={handleDragEnd}
            title={block.name}
          >
            <div className="block-content">
              <span className="block-icon">{block.icon}</span>
            </div>
            <div className="block-connector-right"></div>
          </div>
        ))}
      </div>

      <div className="blocks-info">
        <div className="info-item">
          <span className="info-icon">📊</span>
          <span className="info-text">Blocks: {sequence.length}/{maxMoves}</span>
        </div>
        <div className="info-item">
          <span className="info-icon">💡</span>
          <span className="info-text">Click or drag blocks to program</span>
        </div>
      </div>
    </div>
  );
};

export default ScratchJrBlocks;