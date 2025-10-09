import React, { useEffect, useRef, useState } from 'react';
import './OfficialScratchBlocks.css';

// Initialize global objects for Blockly/ScratchBlocks compatibility
if (typeof window !== 'undefined') {
  // Module system compatibility
  if (typeof window.module === 'undefined') {
    window.module = { exports: {} };
  }
  if (typeof window.exports === 'undefined') {
    window.exports = window.module.exports;
  }

  // Google Closure compatibility
  if (!window.goog) {
    window.goog = {
      require: function(name) {
        return window[name] || {};
      },
      provide: function(name) {
        // No-op for provide
      },
      exportSymbol: function(name, obj) {
        window[name] = obj;
      },
      global: window,
      LOCALE: 'en',
      DEBUG: false
    };
  }

  // Initialize Blockly namespace
  if (!window.Blockly) {
    window.Blockly = {};
  }

  // Initialize ScratchBlocks namespace
  window.ScratchBlocks = window.ScratchBlocks || {};
}

const OfficialScratchBlocks = ({ onAddToSequence, sequence, maxMoves, isExecuting, onExecuteProgram }) => {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);
  const [ScratchBlocks, setScratchBlocks] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Retry function to reset state and attempt reinitialization
  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setScratchBlocks(null);
    if (workspace.current) {
      try {
        workspace.current.dispose();
      } catch (e) {
        console.warn('Error disposing workspace:', e);
      }
      workspace.current = null;
    }
    // Trigger re-initialization
    loadScratchBlocks();
  };

  // Load Scratch Blocks using dynamic import approach
  const loadScratchBlocks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Wait a bit for scripts to fully load
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check for Scratch Blocks globals that should be loaded via index.html
      let api = null;
      
      if (window.ScratchBlocks && typeof window.ScratchBlocks.inject === 'function') {
        api = window.ScratchBlocks;
        console.log('Using ScratchBlocks global');
      } else if (window.Blockly && typeof window.Blockly.inject === 'function') {
        api = window.Blockly;
        console.log('Using Blockly global');
      }

      if (!api) {
        // Try to load scratch-blocks dynamically as fallback
        try {
          const scratchBlocksModule = await import('scratch-blocks');
          api = scratchBlocksModule.default || scratchBlocksModule;
          console.log('Loaded scratch-blocks module dynamically');
        } catch (importError) {
          console.error('Failed to import scratch-blocks module:', importError);
          throw new Error('Scratch Blocks not available. Please ensure the scratch-blocks dependency is installed.');
        }
      }

      if (!api || typeof api.inject !== 'function') {
        throw new Error('Scratch Blocks API is not properly initialized.');
      }

      setScratchBlocks(api);
      setIsLoading(false);
      console.log('Scratch Blocks loaded successfully');
    } catch (error) {
      console.error('Failed to load Scratch Blocks:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Initialize loadScratchBlocks on mount
  useEffect(() => {
    loadScratchBlocks();
  }, []);

  // Initialize workspace when ScratchBlocks is loaded
  useEffect(() => {
    if (!ScratchBlocks || !blocklyDiv.current || isLoading || error) return;
    
    // Cleanup any existing workspace
    if (workspace.current) {
      try {
        workspace.current.dispose();
        workspace.current = null;
      } catch (e) {
        console.log('Workspace disposal not needed:', e.message);
      }
    }

    try {

      // Create workspace with original Scratch vertical layout
      // Ensure media/path hints are set prior to inject to prevent null.match
      // Ensure paths are set on the correct object
      try {
        // Strong defaults to avoid null.match inside ScratchBlocks CSS injection
        const defaultBlocklyPath = '/node_modules/scratch-blocks';
        const defaultMediaPath = '/node_modules/scratch-blocks/media/';
        
        // Set paths on window.Blockly
        if (!window.Blockly) window.Blockly = {};
        window.Blockly.pathToBlockly = window.Blockly.pathToBlockly || defaultBlocklyPath;
        window.Blockly.pathToMedia = window.Blockly.pathToMedia || defaultMediaPath;
        window.Blockly.Msg = window.Blockly.Msg || {};
        
        // Also set on ScratchBlocks if it's different from Blockly
        if (ScratchBlocks && ScratchBlocks !== window.Blockly) {
          ScratchBlocks.pathToBlockly = ScratchBlocks.pathToBlockly || defaultBlocklyPath;
          ScratchBlocks.pathToMedia = ScratchBlocks.pathToMedia || defaultMediaPath;
          ScratchBlocks.Msg = ScratchBlocks.Msg || {};
        }

        // Defensive wrapper for CSS injection to prevent null.match errors
        const wrapCssInject = (obj, objName) => {
          if (obj && obj.Css && typeof obj.Css.inject === 'function') {
            const origInject = obj.Css.inject;
            obj.Css.inject = function() {
              try {
                // Ensure paths are always valid strings before injection
                obj.pathToBlockly = obj.pathToBlockly || defaultBlocklyPath;
                obj.pathToMedia = obj.pathToMedia || defaultMediaPath;
                return origInject.apply(this, arguments);
              } catch (e) {
                console.warn(`${objName}.Css.inject failed, continuing without CSS:`, e);
                // Continue without CSS injection - workspace will still render
              }
            };
          }
        };

        wrapCssInject(ScratchBlocks, 'ScratchBlocks');
        wrapCssInject(window.Blockly, 'Blockly');
      } catch (pathError) {
        console.warn('Path setup failed:', pathError);
      }

      // Prefer Scratch theme if available to avoid manual colour parsing
      const scratchTheme = (ScratchBlocks && ScratchBlocks.Themes && (ScratchBlocks.Themes.Scratch || ScratchBlocks.Themes.Classic || ScratchBlocks.Themes.ScratchClassic)) || null;

      // Safe colour fallbacks to prevent null.match when parsing colours
      const eventsColour = '#FFD500';
      const motionColour = '#4C97FF';
      const controlColour = '#FFAB19';

      const toolboxXml = `
        <xml>
          <category name="Events" ${scratchTheme ? 'categoryStyle="events"' : `colour="${eventsColour}"`}>
            <block type="event_whenflagclicked"></block>
          </category>
          <category name="Motion" ${scratchTheme ? 'categoryStyle="motion"' : `colour="${motionColour}"`}>
            <block type="motion_changexby">
              <value name="DX">
                <shadow type="math_number"><field name="NUM">1</field></shadow>
              </value>
            </block>
            <block type="motion_changeyby">
              <value name="DY">
                <shadow type="math_number"><field name="NUM">1</field></shadow>
              </value>
            </block>
          </category>
          <category name="Control" ${scratchTheme ? 'categoryStyle="control"' : `colour="${controlColour}"`}>
            <block type="control_repeat">
              <value name="TIMES">
                <shadow type="math_number"><field name="NUM">2</field></shadow>
              </value>
            </block>
          </category>
        </xml>
      `;

      workspace.current = ScratchBlocks.inject(blocklyDiv.current, {
        toolbox: toolboxXml,
        theme: scratchTheme || undefined,
        rtl: false,
        scrollbars: true,
        sounds: false,
        oneBasedIndex: false,
        media: '/node_modules/scratch-blocks/media/',
        move: {
          scrollbars: true,
          drag: true,
          wheel: true,
        },
        grid: {
          spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: true
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 2,
          minScale: 0.5,
          scaleSpeed: 1.2
        },
        trashcan: true
      });

      // Listen for workspace changes
      workspace.current.addChangeListener((event) => {
        if (!event || !onAddToSequence) return;

        // Handle block creation and movement events
        if (event.type === ScratchBlocks.Events.BLOCK_CREATE || 
            event.type === ScratchBlocks.Events.BLOCK_MOVE) {
          
          // For block move events, only process when block is moved to workspace (not connecting to other blocks)
          if (event.type === ScratchBlocks.Events.BLOCK_MOVE) {
            // Skip if block is being connected to another block
            if (event.newParentId) return;
            
            // Skip if block is being moved within workspace (not from toolbox)
            if (event.oldParentId !== undefined && event.oldParentId !== null) return;
          }

          try {
            const block = workspace.current.getBlockById(event.blockId);
            if (!block) return;

            // Only add blocks that are in the workspace (not in toolbox)
            if (block.isInFlyout || block.isInMutator) return;

            const blockType = block.type;

            // Helper to read numeric inputs or fields safely
            const getNumber = (b, inputName) => {
              try {
                const t = b.getInputTargetBlock && b.getInputTargetBlock(inputName);
                if (t && typeof t.getFieldValue === 'function') {
                  const v = Number(t.getFieldValue('NUM'));
                  if (!Number.isNaN(v)) return v;
                }
                const raw = Number(b.getFieldValue && b.getFieldValue(inputName));
                if (!Number.isNaN(raw)) return raw;
              } catch (_) {}
              return 0;
            };

            // Map built-in Scratch blocks to game actions
            if (!isExecuting) {
              if (blockType === 'motion_changexby') {
                const dx = getNumber(block, 'DX');
                const steps = Math.max(1, Math.abs(dx || 1));
                const dir = (dx ?? 1) >= 0 ? 'right' : 'left';
                for (let i = 0; i < steps && sequence.length < maxMoves; i++) {
                  onAddToSequence({ id: dir, name: dir === 'right' ? 'Move Right' : 'Move Left', icon: dir === 'right' ? '➡️' : '⬅️', color: '#4C97FF', action: dir, type: 'movement', steps: 1, uniqueId: `${event.blockId}-${i}` });
                }
              } else if (blockType === 'motion_changeyby') {
                const dy = getNumber(block, 'DY');
                const steps = Math.max(1, Math.abs(dy || 1));
                const dir = (dy ?? 1) >= 0 ? 'up' : 'down';
                for (let i = 0; i < steps && sequence.length < maxMoves; i++) {
                  onAddToSequence({ id: dir, name: dir === 'up' ? 'Move Up' : 'Move Down', icon: dir === 'up' ? '⬆️' : '⬇️', color: '#4C97FF', action: dir, type: 'movement', steps: 1, uniqueId: `${event.blockId}-${i}` });
                }
              } else if (blockType === 'control_repeat') {
                const times = getNumber(block, 'TIMES') || 2;
                onAddToSequence({ id: 'repeat', name: 'Repeat', icon: '🔁', color: '#FFAB19', action: 'repeat', type: 'control', times, uniqueId: event.blockId });
              } else if (blockType === 'event_whenflagclicked') {
                onAddToSequence({ id: 'start', name: 'Start', icon: '🏁', color: '#FFD500', action: 'start', type: 'control', uniqueId: event.blockId });
              }
            }
          } catch (error) {
            console.error('Error handling block event:', error);
          }
        }

        // Handle block deletion to remove from sequence
        if (event.type === ScratchBlocks.Events.BLOCK_DELETE) {
          console.log('Block deleted:', event.blockId);
          // TODO: Remove from sequence if needed
        }
      });

      console.log('Official Scratch Blocks workspace initialized successfully');
    } catch (error) {
      console.error('Failed to initialize workspace:', error);
      setError(error.message);
    }
  }, [ScratchBlocks, isLoading, error, onAddToSequence, sequence.length, maxMoves, isExecuting]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (workspace.current) {
        try {
          workspace.current.dispose();
        } catch (e) {
          console.log('Workspace cleanup not needed:', e.message);
        }
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="official-scratch-blocks-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading Official Scratch Blocks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="official-scratch-blocks-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>Failed to load Scratch Blocks: {error}</p>
          <button onClick={handleRetry}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="official-scratch-blocks-container">
      <div 
        ref={blocklyDiv} 
        className="blockly-workspace"
        style={{ 
          height: '300px', 
          width: '100%',
          opacity: isExecuting ? 0.6 : 1,
          pointerEvents: isExecuting ? 'none' : 'auto'
        }}
      />


      <div className="blocks-info">
        <div className="info-item">
          <span className="info-icon">📊</span>
          <span className="info-text">Blocks: {sequence.length}/{maxMoves}</span>
        </div>
        <div className="info-item">
          <span className="info-icon">💡</span>
          <span className="info-text">Drag blocks to create your program</span>
        </div>
        <div className="blocks-controls">
          <button 
            onClick={onExecuteProgram}
            disabled={isExecuting || sequence.length === 0 || sequence.length > maxMoves}
            className="run-button"
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              background: '#4CAF50',
              color: 'white',
              cursor: isExecuting || sequence.length === 0 || sequence.length > maxMoves ? 'not-allowed' : 'pointer',
              opacity: isExecuting || sequence.length === 0 || sequence.length > maxMoves ? 0.5 : 1,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>▶</span>
            Run Program
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfficialScratchBlocks;