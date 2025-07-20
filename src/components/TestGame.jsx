import React from 'react';

const TestGame = () => {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#4a9',
      color: 'white',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div>
        <h1>Test Game Component</h1>
        <p>If you can see this, the routing and component loading is working!</p>
        <p>Current time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default TestGame;