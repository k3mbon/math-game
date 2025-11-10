import React, { useState, useEffect, useRef, useCallback } from 'react';
import Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import '../blocks/mathPuzzle';
import './TreasureQuestionModal.css';
import { soundEffects } from '../utils/soundEffects';

const TreasureQuestionModal = ({ isOpen, question, onClose, onSolve, onSkip, isLoading, error }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [blocklyCode, setBlocklyCode] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const blocklyDivRef = useRef(null);
  const workspaceRef = useRef(null);
  const [workspaceInitError, setWorkspaceInitError] = useState(null);
  const changeDebounceRef = useRef(null);
  const closeBtnRef = useRef(null);

  const pointsForDifficulty = (diff) => {
    const map = { 'Mudah': 10, 'Sedang': 20, 'Sulit': 30, 'Sangat Sulit': 40 };
    return map[diff] ?? 10;
  };

  const getToolboxForQuestion = (q) => {
    const v = q?.verify || q?.type || 'generic';
    const base = {
      kind: 'categoryToolbox',
      contents: [
        { kind: 'category', name: 'Logic', colour: '#5C81A6', contents: [
          { kind: 'block', type: 'controls_if' },
          { kind: 'block', type: 'logic_compare' },
          { kind: 'block', type: 'logic_operation' },
          { kind: 'block', type: 'logic_boolean' }
        ]},
        { kind: 'category', name: 'Loops', colour: '#5CA65C', contents: [
          { kind: 'block', type: 'controls_repeat_ext' },
          { kind: 'block', type: 'controls_whileUntil' },
          { kind: 'block', type: 'controls_for' }
        ]},
        { kind: 'category', name: 'Math', colour: '#5C68A6', contents: [
          { kind: 'block', type: 'math_number' },
          { kind: 'block', type: 'math_arithmetic' },
          { kind: 'block', type: 'math_single' },
          { kind: 'block', type: 'math_modulo' }
        ]},
        { kind: 'category', name: 'Text', colour: '#5CA68D', contents: [
          { kind: 'block', type: 'text' },
          { kind: 'block', type: 'text_print' }
        ]},
        { kind: 'category', name: 'Variables', colour: '#A65C81', custom: 'VARIABLE' },
        { kind: 'category', name: 'Functions', colour: '#9A5CA6', custom: 'PROCEDURE' }
      ]
    };
    const numericTypes = new Set(['evenOdd','isPrime','digitCount','sumDigits','reverse','reverseDigits','palindrome','armstrong','powerOfTwo','binaryConversion']);
    if (numericTypes.has(v)) {
      base.contents = base.contents.filter(cat => cat.name !== 'Loops');
    }
    return base;
  };

  const initialXmlForQuestion = (q) => {
    const v = q?.verify || q?.type || 'generic';
    if (v === 'sequence' || v === 'multiples' || v === 'printPrimes') {
      return `
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="controls_for" x="20" y="20">
    <field name="VAR">i</field>
    <value name="FROM"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
    <value name="TO"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
    <value name="BY"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
    <statement name="DO">
      <block type="text_print">
        <value name="TEXT">
          <shadow type="text"><field name="TEXT">i</field></shadow>
        </value>
      </block>
    </statement>
  </block>
</xml>`;
    }
    return `
<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="text_print" x="20" y="20">
    <value name="TEXT"><shadow type="text"><field name="TEXT">Hello</field></shadow></value>
  </block>
</xml>`;
  };

  const handleClose = useCallback(() => {
    console.log('TreasureQuestionModal: handleClose called');
    setUserAnswer('');
    setBlocklyCode('');
    setIsCorrect(null);
    setShowResult(false);
    setAttempts(0);
    if (workspaceRef.current) {
      workspaceRef.current.clear();
    }
    onClose();
  }, [onClose]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen && blocklyDivRef.current && !workspaceRef.current) {
      // Initialize Blockly workspace
      let workspace;
      try {
        workspace = Blockly.inject(blocklyDivRef.current, {
          toolbox: getToolboxForQuestion(question),
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
            maxScale: 3,
            minScale: 0.3,
            scaleSpeed: 1.2
          },
          trashcan: true
        });
        setWorkspaceInitError(null);
      } catch (err) {
        console.error('Blockly initialization failed:', err);
        setWorkspaceInitError(err);
        workspace = null;
      }

      workspaceRef.current = workspace;

      // Add workspace change listener (debounced) and preload blocks
      if (workspace) {
        workspace.addChangeListener(() => {
          if (changeDebounceRef.current) {
            clearTimeout(changeDebounceRef.current);
          }
          changeDebounceRef.current = setTimeout(() => {
            const code = javascriptGenerator.workspaceToCode(workspace);
            setBlocklyCode(code);
          }, 120);
        });
        try {
          const xmlText = initialXmlForQuestion(question);
          const xml = Blockly.Xml.textToDom(xmlText);
          Blockly.Xml.domToWorkspace(xml, workspace);
        } catch (e) {
          console.warn('Failed to preload default blocks', e);
        }
      }
    }

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, [isOpen, question]);

  // Accessibility: focus the close button when modal opens
  useEffect(() => {
    if (isOpen && closeBtnRef.current) {
      try { closeBtnRef.current.focus(); } catch {}
    }
  }, [isOpen]);

  const verifySolution = (q, result, output) => {
    const verifyType = q?.verify || q?.type || 'generic';
    const normalize = (s) => String(s ?? '').replace(/\r/g, '').trim();
    const out = normalize(output);
    const expected = q?.answer;
    if (['sequence','printPrimes','multiples'].includes(verifyType) || typeof expected === 'string') {
      return normalize(expected) === out;
    }
    const numExpected = Number(expected);
    const numOut = Number(out);
    const numRes = Number(result);
    return numRes === numExpected || numOut === numExpected;
  };

  const executeCode = useCallback((opts = { previewOnly: false }) => {
    try {
      // Create a safe execution environment
      let output = '';
      const originalConsoleLog = console.log;
      
      // Override console.log to capture output
      console.log = (...args) => {
        output += args.join(' ') + '\n';
      };

      // Execute the generated code
      const func = new Function(blocklyCode);
      const result = func();
      
      // Restore console.log
      console.log = originalConsoleLog;
      
      const cleanOutput = output.trim();
      const correct = verifySolution(question, result, cleanOutput);
      setIsCorrect(correct);
      setUserAnswer(cleanOutput || result?.toString() || 'No output');
      setShowResult(true);
      if (!opts.previewOnly) {
        setAttempts((prev) => prev + 1);
      }
      if (correct && !opts.previewOnly) {
        // Success sound is played in OpenWorldGame's handleQuestionSolve
        setTimeout(() => {
          onSolve();
          handleClose();
        }, 1500);
      } else if (!correct) {
        // Play error sound for incorrect answer
        soundEffects.playError();
      }
    } catch (error) {
      setIsCorrect(false);
      setUserAnswer(`Error: ${error.message}`);
      setShowResult(true);
      // Play error sound for execution error
      soundEffects.playError();
    }
  }, [blocklyCode, question, onSolve, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="treasure-modal-overlay" onClick={(e) => {
      // Close modal if clicking on overlay (not on modal content)
      if (e.target === e.currentTarget) {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      }
    }}>
      <div className="treasure-modal" role="dialog" aria-modal="true" aria-labelledby="treasure-modal-title" onClick={(e) => {
        // Prevent clicks inside modal from bubbling to overlay
        e.stopPropagation();
      }}>
        <div className="modal-header">
          <h2 id="treasure-modal-title">🏆 {question?.title || (isLoading ? 'Loading question…' : error ? 'Question error' : 'No question available')}</h2>
          <button ref={closeBtnRef} className="close-btn" onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClose();
          }}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="question-section">
            {isLoading && (
              <div className="loading-banner">Loading question data…</div>
            )}
            {error && (
              <div className="error-banner">Failed to load questions. You can try the workspace or skip.</div>
            )}
            {question && (
              <div className="story-section">
                <h3>📖 Story</h3>
                <p>{question.story || question.statement || question.description}</p>
                {question.image && (
                  <div style={{ marginTop: '10px' }}>
                    <img src={question.image} alt={question.title || 'Question image'} style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #DAA520' }} />
                  </div>
                )}
              </div>
            )}
            
            <div className="problem-details">
              {question ? (
                <>
                  <div className="difficulty">Difficulty: <span className={`difficulty-${(question.difficulty || 'Mudah').toLowerCase()}`}>{question.difficulty || 'Mudah'}</span></div>
                  <div>Category: <strong>{question.verify || question.type || 'General'}</strong></div>
                  <div>Points: <strong>{pointsForDifficulty(question.difficulty || 'Mudah')}</strong></div>
                  <div className="hint">💡 Hint: {question.hint}</div>
                  {question.num && <div className="number">Number: {question.num}</div>}
                  {question.start && <div className="range">Range: {question.start} to {question.start + question.endOffset}</div>}
                  {question.base && <div className="base">Base: {question.base}, Limit: {question.limit}</div>}
                </>
              ) : (
                <div className="hint">No question available. Try building a solution or skip.</div>
              )}
            </div>
            
            {question && (
              <div className="expected-output">
                <h4>Expected Output:</h4>
                <pre>{question.answer}</pre>
              </div>
            )}
            
            {showResult && (
              <div className={`result ${isCorrect ? 'correct' : 'incorrect'}`} aria-live="polite">
                <h4>{isCorrect ? '✅ Correct!' : '❌ Incorrect'}</h4>
                <p>Your output: <code>{userAnswer}</code></p>
                {isCorrect && <p>🎉 Treasure unlocked! Well done!</p>}
              </div>
            )}
            <div style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>Attempts: <strong>{attempts}</strong></div>
          </div>
          
          <div className="blockly-section">
            <h3>🧩 Blockly Workspace</h3>
            <div className="blockly-container">
              {workspaceInitError ? (
                <div className="workspace-error">Blockly failed to initialize. Please reload or skip.</div>
              ) : (
                <div ref={blocklyDivRef} className="blockly-workspace"></div>
              )}
            </div>
            
            <div className="code-section">
              <h4>Generated Code:</h4>
              <pre className="generated-code">{blocklyCode || 'No code generated yet...'}</pre>
            </div>
            
            <div className="action-buttons">
              <button 
                className="run-btn" 
                onClick={() => executeCode({ previewOnly: true })}
                disabled={!blocklyCode.trim() || !!workspaceInitError}
              >
                🔍 Run Code
              </button>
              <button className="reset-btn" onClick={() => workspaceRef.current?.clear()}>
                🔄 Reset
              </button>
              <button className="skip-btn" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                executeCode({ previewOnly: false });
              }} disabled={!blocklyCode.trim() || !!workspaceInitError}>
                ✅ Submit Answer
              </button>
            </div>
            <div className="action-buttons" style={{ marginTop: '8px' }}>
              <button className="reset-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleClose(); }}>
                ✖ Close
              </button>
              {onSkip && (
                <button className="skip-btn" onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onSkip();
                  handleClose();
                }}>
                  ⏭️ Skip
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreasureQuestionModal;