import React, { useState, useRef, useEffect } from 'react';
import { useCharacter } from '../contexts/CharacterContext';
import { useGameProgress } from '../contexts/GameProgressContext';
import './FloatingCharacter.css';

const FloatingCharacter = () => {
  const { selectedCharacter } = useCharacter();
  const { progress } = useGameProgress();
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Calculate progress
  const progressPercentage = progress?.iteration?.completed || 0;
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    e.stopPropagation();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;
    
    // Keep character within viewport bounds
    const maxX = window.innerWidth - containerRef.current.offsetWidth;
    const maxY = window.innerHeight - containerRef.current.offsetHeight;
    
    setPosition({
      x: Math.max(0, Math.min(maxX, newX)),
      y: Math.max(0, Math.min(maxY, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!selectedCharacter) return null;

  return (
    <div
      ref={containerRef}
      className={`floating-character ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        pointerEvents: 'auto' // Ensure it can receive mouse events
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="character-progress-container">
        <span className="character-emoji">{selectedCharacter.emoji}</span>
        <span className="progress-percentage">{progressPercentage}%</span>
        
        <svg className="progress-ring" width="60" height="60">
          <circle
            className="progress-ring-circle"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeWidth="4"
            r={radius}
            cx="30"
            cy="30"
          />
        </svg>
      </div>
    </div>
  );
};

export default FloatingCharacter;