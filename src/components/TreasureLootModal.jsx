import React from 'react';
import { useTranslation } from 'react-i18next';
import './TreasureQuestionModal.css';

const TreasureLootModal = ({ isOpen, loot, onCollect, onClose }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;
  const coins = loot?.coins || 0;
  const crystals = loot?.crystals || 0;
  const items = Array.isArray(loot?.items) ? loot.items : [];

  return (
    <div className="treasure-modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    }}>
      <div className="treasure-modal treasure-modal--loot" role="dialog" aria-modal="true" aria-labelledby="treasure-loot-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="treasure-loot-title">🏆 {t('wildrealm.loot.title')}</h2>
          <button className="close-btn" onClick={onClose} aria-label={t('wildrealm.buttons.close')}>×</button>
        </div>
        <div className="modal-content">
          <div className="question-section">
            <div className="parchment-card loot-list" role="list">
              <div className="loot-item" role="listitem"><strong>{t('wildrealm.loot.coins')}:</strong> {coins}</div>
              <div className="loot-item" role="listitem"><strong>{t('wildrealm.loot.crystals')}:</strong> {crystals}</div>
              <div className="loot-item" role="listitem"><strong>{t('wildrealm.loot.items')}:</strong> {items.length ? items.join(', ') : t('wildrealm.loot.none')}</div>
            </div>
            <div className="action-buttons" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="reset-btn" onClick={onClose}>✖ {t('wildrealm.buttons.close')}</button>
              <button className="run-btn" onClick={onCollect}>🎒 {t('wildrealm.buttons.collect')}</button>
            </div>
          </div>
          <div className="blockly-section" aria-hidden="true">
            <div className="blockly-container" style={{ minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="generated-code" style={{ textAlign: 'center' }}>{t('wildrealm.labels.inventoryHint')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreasureLootModal;
