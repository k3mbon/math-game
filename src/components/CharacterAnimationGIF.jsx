import React from 'react';
import kingHumanIdleGif from '../assets/downloaded-assets/characters/kings-and-pigs/01-King Human/Idle.gif';

const CharacterAnimationGIF = () => {
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
      <h1 style={{ 
        color: 'white', 
        marginBottom: '20px',
        textAlign: 'center',
        fontSize: '2.5rem',
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
      }}>
        🤴 King Human Idle Animation (GIF Version)
      </h1>
      
      <div style={{
        padding: '40px',
        backgroundColor: '#34495e',
        borderRadius: '20px',
        boxShadow: '0 12px 24px rgba(0,0,0,0.4)',
        margin: '20px 0',
        border: '3px solid #3498db'
      }}>
        {/* Actual GIF Animation */}
        <img 
          src={kingHumanIdleGif} 
          alt="King Human Idle Animation"
          style={{
            border: '3px solid #3498db',
            borderRadius: '8px',
            backgroundColor: '#ecf0f1',
            imageRendering: 'pixelated',
            width: '390px', // 78px * 5 scale
            height: '290px', // 58px * 5 scale
            objectFit: 'contain'
          }}
        />
      </div>
      
      <div style={{
        marginTop: '30px',
        color: 'white',
        textAlign: 'center',
        maxWidth: '600px'
      }}>
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold',
          color: '#3498db',
          marginBottom: '15px'
        }}>
          🎬 GIF-Based Animation Benefits
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          <div style={{
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
            padding: '20px',
            borderRadius: '10px',
            border: '2px solid #3498db'
          }}>
            <h3 style={{ color: '#3498db', marginBottom: '10px' }}>✨ Simplicity</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              No complex canvas rendering or frame management needed!
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(46, 204, 113, 0.2)',
            padding: '20px',
            borderRadius: '10px',
            border: '2px solid #2ecc71'
          }}>
            <h3 style={{ color: '#2ecc71', marginBottom: '10px' }}>🚀 Performance</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Browser-optimized GIF playback with hardware acceleration!
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(155, 89, 182, 0.2)',
            padding: '20px',
            borderRadius: '10px',
            border: '2px solid #9b59b6'
          }}>
            <h3 style={{ color: '#9b59b6', marginBottom: '10px' }}>🎯 Reliability</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Consistent animation timing across all devices and browsers!
            </p>
          </div>
        </div>
        
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: 'rgba(241, 196, 15, 0.2)',
          borderRadius: '10px',
          border: '2px solid #f1c40f'
        }}>
          <h3 style={{ color: '#f1c40f', marginBottom: '15px' }}>📋 Implementation Steps</h3>
          <ol style={{ 
            textAlign: 'left', 
            fontSize: '14px',
            lineHeight: '1.6',
            paddingLeft: '20px'
          }}>
            <li>Use the GIF Creator tool above to convert your sprite sheet</li>
            <li>Download the generated animated GIF</li>
            <li>Place it in your <code style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>/public/assets/</code> folder</li>
            <li>Replace the placeholder div with an <code style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>&lt;img&gt;</code> tag</li>
            <li>Enjoy smooth, effortless animation! 🎉</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default CharacterAnimationGIF;