import React from 'react';
import './TreasureQuestionModal.css';
import { soundEffects } from '../utils/soundEffects';

const DeathModal = ({ isOpen, crystalsPenalty = 0, currentCrystals = 0, onRespawn, onQuit }) => {
  if (!isOpen) return null;

  const canRespawn = true;
  const remainingCrystals = Math.max(0, currentCrystals - crystalsPenalty);

  const handleRespawn = () => {
    soundEffects.playResume();
    if (onRespawn) onRespawn();
  };

  const handleQuit = () => {
    soundEffects.playMenuClick();
    if (onQuit) onQuit();
  };

  return (
    <div className="treasure-modal-overlay">
      <div className="treasure-modal">
        <div className="modal-header">
          <h2>You Died</h2>
        </div>
        <div className="modal-content" style={{ gap: '16px' }}>
          <div style={{ fontSize: '16px' }}>
            You lose {crystalsPenalty} crystals.
          </div>
          <div style={{ fontSize: '14px', color: '#8898aa' }}>
            Current: {currentCrystals} → After respawn: {remainingCrystals}
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
            <button className="run-btn" onClick={handleRespawn} disabled={!canRespawn}>
              Respawn
            </button>
            <button className="skip-btn" onClick={handleQuit}>
              Quit to Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeathModal;