import React from 'react';
import './GameStartMenu.css';

const GameStartMenu = ({ onPlay, onBack }) => {
  return (
    <div className="game-start-menu">
      <div className="menu-container">
        <div className="menu-header">
          <h1 className="game-title">🏰 Math Adventure</h1>
          <p className="game-subtitle">Explore, Fight Monsters & Solve Puzzles!</p>
        </div>
        
        <div className="menu-content">
          <div className="game-features">
            <div className="feature-item">
              <span className="feature-icon">⚔️</span>
              <span className="feature-text">Battle Monsters</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <span className="feature-text">Solve Math Puzzles</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🗺️</span>
              <span className="feature-text">Explore Open World</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💎</span>
              <span className="feature-text">Collect Treasures</span>
            </div>
          </div>
          
          <div className="menu-buttons">
            <button 
              className="menu-button play-button"
              onClick={onPlay}
            >
              <span className="button-icon">🎮</span>
              Play Game
            </button>
            
            <button 
              className="menu-button back-button"
              onClick={onBack}
            >
              <span className="button-icon">🏠</span>
              Back to Home
            </button>
          </div>
        </div>
        
        <div className="menu-footer">
          <div className="controls-info">
            <h3>🎮 Controls</h3>
            <div className="control-item">
              <span className="control-key">WASD / Arrow Keys</span>
              <span className="control-desc">Move Player</span>
            </div>
            <div className="control-item">
              <span className="control-key">Mouse Click</span>
              <span className="control-desc">Attack Monsters</span>
            </div>
            <div className="control-item">
              <span className="control-key">Walk into Treasures</span>
              <span className="control-desc">Open Treasure Boxes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStartMenu;