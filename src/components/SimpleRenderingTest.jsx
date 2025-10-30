import React, { useRef, useEffect, useState } from 'react';

const SimpleRenderingTest = () => {
  const canvasRef = useRef(null);
  const [renderingStats, setRenderingStats] = useState({
    frameCount: 0,
    fps: 0,
    lastFrameTime: 0,
    renderTime: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    let animationId;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsUpdateTime = lastTime;

    const render = (currentTime) => {
      const renderStart = performance.now();
      
      // Clear canvas
      ctx.fillStyle = '#87CEEB'; // Sky blue background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw simple ground
      ctx.fillStyle = '#90EE90'; // Light green
      ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

      // Draw simple player (circle)
      const playerX = 400;
      const playerY = 300;
      ctx.fillStyle = '#FF6B6B'; // Red player
      ctx.beginPath();
      ctx.arc(playerX, playerY, 20, 0, Math.PI * 2);
      ctx.fill();

      // Draw player direction indicator
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(playerX + 10, playerY - 5, 3, 0, Math.PI * 2);
      ctx.fill();

      // Draw some simple objects
      // Tree
      ctx.fillStyle = '#8B4513'; // Brown trunk
      ctx.fillRect(100, 250, 20, 50);
      ctx.fillStyle = '#228B22'; // Green leaves
      ctx.beginPath();
      ctx.arc(110, 240, 30, 0, Math.PI * 2);
      ctx.fill();

      // Rock
      ctx.fillStyle = '#696969'; // Gray rock
      ctx.beginPath();
      ctx.arc(600, 280, 25, 0, Math.PI * 2);
      ctx.fill();

      // Draw debug info
      ctx.fillStyle = '#000000';
      ctx.font = '16px Arial';
      ctx.fillText(`FPS: ${renderingStats.fps}`, 10, 30);
      ctx.fillText(`Frame: ${frameCount}`, 10, 50);
      ctx.fillText(`Render Time: ${Math.round(renderingStats.renderTime)}ms`, 10, 70);

      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;

      // Update FPS every second
      frameCount++;
      if (currentTime - fpsUpdateTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - fpsUpdateTime));
        setRenderingStats(prev => ({
          ...prev,
          fps,
          frameCount,
          renderTime
        }));
        frameCount = 0;
        fpsUpdateTime = currentTime;
      }

      lastTime = currentTime;
      animationId = requestAnimationFrame(render);
    };

    // Start rendering
    animationId = requestAnimationFrame(render);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Simple Rendering Test</h2>
      <p>This is a basic rendering test to verify canvas functionality.</p>
      
      <div style={{ 
        display: 'flex', 
        gap: '20px',
        alignItems: 'flex-start'
      }}>
        <canvas 
          ref={canvasRef}
          style={{ 
            border: '2px solid #333',
            borderRadius: '8px'
          }}
        />
        
        <div style={{
          background: '#f0f0f0',
          padding: '15px',
          borderRadius: '8px',
          minWidth: '200px'
        }}>
          <h3>Rendering Stats</h3>
          <p><strong>FPS:</strong> {renderingStats.fps}</p>
          <p><strong>Frame Count:</strong> {renderingStats.frameCount}</p>
          <p><strong>Render Time:</strong> {Math.round(renderingStats.renderTime)}ms</p>
          
          <div style={{ marginTop: '15px' }}>
            <h4>Test Elements:</h4>
            <ul style={{ fontSize: '14px' }}>
              <li>✓ Canvas initialization</li>
              <li>✓ Background rendering</li>
              <li>✓ Simple shapes (player, tree, rock)</li>
              <li>✓ Text rendering</li>
              <li>✓ Animation loop</li>
              <li>✓ Performance monitoring</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleRenderingTest;