import React from 'react';

const modalBackdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000
};

const modalCardStyle = {
  background: '#101820',
  border: '2px solid #00ccff',
  borderRadius: '10px',
  padding: '16px',
  width: '340px',
  color: '#e6f9ff',
  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.4)'
};

const buttonRowStyle = {
  display: 'flex',
  gap: '10px',
  marginTop: '14px',
  justifyContent: 'flex-end'
};

const actionButtonStyle = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #00ccff',
  background: '#002b36',
  color: '#a8ecff',
  cursor: 'pointer'
};

const TreasureLootModal = ({ isOpen, loot, onCollect, onClose }) => {
  if (!isOpen) return null;
  const coins = loot?.coins || 0;
  const crystals = loot?.crystals || 0;
  const items = Array.isArray(loot?.items) ? loot.items : [];

  return (
    <div style={modalBackdropStyle}>
      <div style={modalCardStyle} role="dialog" aria-modal="true" aria-label="Treasure Loot">
        <h3 style={{ margin: '0 0 8px 0', color: '#00ccff' }}>Treasure Loot</h3>
        <div>
          <div style={{ marginBottom: '6px' }}>
            <strong>Coins:</strong> {coins}
          </div>
          <div style={{ marginBottom: '6px' }}>
            <strong>Crystals:</strong> {crystals}
          </div>
          <div>
            <strong>Items:</strong> {items.length ? items.join(', ') : 'None'}
          </div>
        </div>
        <div style={buttonRowStyle}>
          <button style={actionButtonStyle} onClick={onClose}>Close</button>
          <button style={{ ...actionButtonStyle, background: '#003b46', borderColor: '#2aff95', color: '#d6ffe6' }} onClick={onCollect}>Collect</button>
        </div>
      </div>
    </div>
  );
};

export default TreasureLootModal;