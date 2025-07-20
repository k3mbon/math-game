import React, { useEffect, useRef, useState } from 'react';

const CharacterAnimation = () => {
  const canvasRef = useRef(null);
  const [spriteSheet, setSpriteSheet] = useState(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const animationRef = useRef(null);
  
  // Animation configuration
  const FRAME_WIDTH = 78;
  const FRAME_HEIGHT = 58;
  const TOTAL_FRAMES = 11;
  const ANIMATION_SPEED = 200; // milliseconds per frame (slower for better visibility)
  const SCALE = 15; // Scale up the character for maximum visibility
  
  useEffect(() => {
    // Load the sprite sheet
    const img = new Image();
    img.onload = () => {
      setSpriteSheet(img);
    };
    img.src = '/src/assets/downloaded-assets/characters/kings-and-pigs/01-King Human/Idle (78x58).png';
  }, []);
  
  useEffect(() => {
    if (!spriteSheet) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = FRAME_WIDTH * SCALE;
    canvas.height = FRAME_HEIGHT * SCALE;
    
    // Animation loop
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate source position in sprite sheet
      const sourceX = currentFrame * FRAME_WIDTH;
      const sourceY = 0; // All frames are in a single row
      
      // Draw current frame scaled up
      ctx.imageSmoothingEnabled = false; // Keep pixel art crisp
      ctx.drawImage(
        spriteSheet,
        sourceX, sourceY, FRAME_WIDTH, FRAME_HEIGHT,
        0, 0, FRAME_WIDTH * SCALE, FRAME_HEIGHT * SCALE
      );
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [spriteSheet, currentFrame]);
  
  useEffect(() => {
    // Frame timing
    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % TOTAL_FRAMES);
    }, ANIMATION_SPEED);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#2c3e50',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>
        🤴 King Human Idle Animation (SCALE: {SCALE}x)
      </h1>
      
      <div style={{
        padding: '30px',
        backgroundColor: '#34495e',
        borderRadius: '15px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
        margin: '20px 0'
      }}>
        <canvas 
          ref={canvasRef}
          style={{
            border: '3px solid #3498db',
            borderRadius: '8px',
            backgroundColor: '#ecf0f1',
            imageRendering: 'pixelated'
          }}
        />
      </div>
      
      <div style={{
        marginTop: '20px',
        color: 'white',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>Frame: {currentFrame + 1} / {TOTAL_FRAMES}</p>
        <p>Animation Speed: {ANIMATION_SPEED}ms per frame</p>
        <p style={{ color: '#e74c3c', fontWeight: 'bold' }}>Scale: {SCALE}x (Character size: {FRAME_WIDTH * SCALE}x{FRAME_HEIGHT * SCALE}px)</p>
        <p style={{ color: '#3498db' }}>Watch for subtle movements in the character's stance and breathing!</p>
      </div>
      
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#1a252f',
        borderRadius: '5px',
        color: '#bdc3c7',
        fontSize: '14px',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <p><strong>Instructions:</strong></p>
        <p>This component displays the King Human idle animation using the sprite sheet.</p>
        <p>The animation cycles through all 11 frames automatically.</p>
        <p>You can adjust the ANIMATION_SPEED and SCALE constants in the code.</p>
      </div>
    </div>
  );
};

export default CharacterAnimation;