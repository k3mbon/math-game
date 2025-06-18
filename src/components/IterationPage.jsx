import React, { useRef, useEffect, useState, useContext } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import { useCharacter } from '../contexts/CharacterContext';
import { useGameProgress } from '../contexts/GameProgressContext';
import FloatingCharacter from './FloatingCharacter';
import './IterationPage.css';


const IterationPage = () => {
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState('');
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [workspaceInitialized, setWorkspaceInitialized] = useState(false);
  const { selectedCharacter } = useCharacter();
  const { progress, updateProgress } = useGameProgress();

  // Floating character state
  const [showProgress, setShowProgress] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const characterRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = characterRef.current.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    e.stopPropagation();
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleProgress = (e) => {
    e.stopPropagation();
    setShowProgress(!showProgress);
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

  // Challenge generators for different levels
  const challengeGenerators = [
    // Level 1-3: Basic iterations
    () => {
      const count = Math.floor(Math.random() * 5) + 3;
      const action = Math.random() > 0.5 ? 'print' : 'sum';
      
      if (action === 'print') {
        const word = ['Hello', 'Hi', 'Loop', 'Code', 'Block'][Math.floor(Math.random() * 5)];
        return {
          description: `Print "${word}" ${count} times`,
          verify: (output) => {
            const expected = `${word}\n`.repeat(count);
            return output === expected;
          }
        };
      } else {
        return {
          description: `Sum numbers from 1 to ${count}`,
          verify: (_, result) => result === (count * (count + 1)) / 2
        };
      }
    },
    // Level 4-6: More complex iterations
    () => {
      const type = Math.floor(Math.random() * 4);
      const base = Math.floor(Math.random() * 5) + 1;
      
      switch(type) {
        case 0: // Reverse count
          return {
            description: `Print numbers from ${base * 5} down to ${base}`,
            verify: (output) => {
              let expected = '';
              for (let i = base * 5; i >= base; i--) {
                expected += `${i}\n`;
              }
              return output === expected;
            }
          };
        case 1: // Multiples
          return {
            description: `Sum multiples of ${base} up to ${base * 10}`,
            verify: (_, result) => {
              let sum = 0;
              for (let i = base; i <= base * 10; i += base) {
                sum += i;
              }
              return result === sum;
            }
          };
        case 2: // Factorial
          return {
            description: `Calculate factorial of ${base + 3}`,
            verify: (_, result) => {
              let fact = 1;
              for (let i = 2; i <= base + 3; i++) {
                fact *= i;
              }
              return result === fact;
            }
          };
        case 3: // Pattern printing
          const patternChar = ['*', '#', '$', '@'][Math.floor(Math.random() * 4)];
          return {
            description: `Print a triangle with ${base + 2} rows using '${patternChar}'`,
            verify: (output) => {
              let expected = '';
              for (let i = 1; i <= base + 2; i++) {
                expected += `${patternChar.repeat(i)}\n`;
              }
              return output === expected;
            }
          };
        default:
          return {
            description: `Print numbers from 1 to ${base}`,
            verify: (output) => {
              let expected = '';
              for (let i = 1; i <= base; i++) {
                expected += `${i}\n`;
              }
              return output === expected;
            }
          };
      }
    },
    // Level 7+: Advanced challenges
    () => {
      const type = Math.floor(Math.random() * 3);
      const base = Math.floor(Math.random() * 5) + 2;
      
      switch(type) {
        case 0: // Fibonacci
          return {
            description: `Calculate the ${base + 5}th Fibonacci number`,
            verify: (_, result) => {
              let a = 0, b = 1;
              for (let i = 2; i <= base + 5; i++) {
                [a, b] = [b, a + b];
              }
              return result === b;
            }
          };
        case 1: // Prime check
          const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
          const num = primes[Math.floor(Math.random() * primes.length)];
          return {
            description: `Check if ${num} is prime (return 1 if true, 0 if false)`,
            verify: (_, result) => result === 1
          };
        case 2: // Complex pattern
          const chars = ['A', 'B', 'C', 'D'];
          return {
            description: `Print a pyramid with ${base + 1} levels alternating between ${chars[0]} and ${chars[1]}`,
            verify: (output) => {
              let expected = '';
              for (let i = 1; i <= base + 1; i++) {
                const char = i % 2 === 0 ? chars[1] : chars[0];
                const spaces = ' '.repeat(base + 1 - i);
                expected += `${spaces}${char.repeat(2 * i - 1)}\n`;
              }
              return output === expected;
            }
          };
        default:
          return {
            description: `Print numbers from 1 to ${base}`,
            verify: (output) => {
              let expected = '';
              for (let i = 1; i <= base; i++) {
                expected += `${i}\n`;
              }
              return output === expected;
            }
          };
      }
    }
  ];

  const generateChallenge = () => {
    let generatorIndex = Math.min(Math.floor(level / 3), challengeGenerators.length - 1);
    if (level >= 10) generatorIndex = challengeGenerators.length - 1;
    
    const challenge = challengeGenerators[generatorIndex]();
    setCurrentChallenge(challenge);
    return challenge;
  };

  const captureConsoleLog = (msg) => {
    setConsoleOutput((prev) => prev + msg + '\n');
  };

  const runCode = () => {
    if (!workspaceRef.current || !currentChallenge) {
      setMessage('⚠️ Workspace not ready. Please try again.');
      return;
    }

    const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
    setConsoleOutput('');
    setMessage('');

    try {
      const originalConsoleLog = console.log;
      console.log = captureConsoleLog;
      
      const func = new Function('console', 'let result;\n' + code + '\nreturn result;');
      const userResult = func({ log: captureConsoleLog });

      if (currentChallenge.verify(consoleOutput, userResult)) {
        const newMessage = `🎉 Great job! You solved Level ${level}.`;
        setMessage(newMessage);
        
        if (level >= progress.iteration.level) {
          const newLevel = level === progress.iteration.level ? progress.iteration.level + 1 : progress.iteration.level;
          updateProgress('iteration', newLevel, 100);
        }
      } else {
        setMessage('❌ Try again! Your solution is not correct.');
      }
      
      console.log = originalConsoleLog;
    } catch (error) {
      setMessage(`⚠️ Error running code: ${error.message}`);
      console.error('Code execution error:', error);
    }
  };

  const nextLevel = () => {
    if (level < challengeGenerators.length * 3) {
      const newLevel = level + 1;
      setLevel(newLevel);
      generateChallenge();
      clearBlocks();
      
      if (newLevel > progress.iteration.level) {
        updateProgress('iteration', newLevel, 0);
      }
    }
  };

  const prevLevel = () => {
    if (level > 1) {
      setLevel((prev) => prev - 1);
      generateChallenge();
      clearBlocks();
    }
  };

  const clearBlocks = () => {
    if (workspaceRef.current) {
      try {
        workspaceRef.current.clear();
        setConsoleOutput('');
        setMessage('');
      } catch (error) {
        console.error('Error clearing blocks:', error);
        setMessage('⚠️ Error clearing workspace. Please refresh the page.');
      }
    }
  };

  const initializeWorkspace = () => {
    if (workspaceRef.current) {
      try {
        workspaceRef.current.dispose();
      } catch (error) {
        console.warn('Error disposing old workspace:', error);
      }
    }

    try {
      workspaceRef.current = Blockly.inject(blocklyDiv.current, {
        toolbox: {
          kind: 'categoryToolbox',
          contents: [
            {
              kind: 'category',
              name: 'Logic',
              colour: '%{BKY_LOGIC_HUE}',
              contents: [
                { kind: 'block', type: 'controls_if' },
                { kind: 'block', type: 'logic_compare' },
                { kind: 'block', type: 'logic_operation' },
                { kind: 'block', type: 'logic_negate' },
              ]
            },
            {
              kind: 'category',
              name: 'Loops',
              colour: '%{BKY_LOOPS_HUE}',
              contents: [
                { kind: 'block', type: 'controls_repeat_ext' },
                { kind: 'block', type: 'controls_whileUntil' },
              ]
            },
            {
              kind: 'category',
              name: 'Math',
              colour: '%{BKY_MATH_HUE}',
              contents: [
                { kind: 'block', type: 'math_number' },
                { kind: 'block', type: 'math_arithmetic' },
                { kind: 'block', type: 'math_modulo' },
                { kind: 'block', type: 'math_single' },
                { kind: 'block', type: 'math_trig' },
                { kind: 'block', type: 'math_constant' },
                { kind: 'block', type: 'math_random_int' },
                { kind: 'block', type: 'math_round' },
              ]
            },
            {
              kind: 'category',
              name: 'Text',
              colour: '%{BKY_TEXTS_HUE}',
              contents: [
                { kind: 'block', type: 'text' },
                { kind: 'block', type: 'text_print' },
                { kind: 'block', type: 'text_join' },
              ]
            },
            {
              kind: 'category',
              name: 'Variables',
              colour: '%{BKY_VARIABLES_HUE}',
              custom: 'VARIABLE'
            },
            {
              kind: 'category',
              name: 'Lists',
              colour: '%{BKY_LISTS_HUE}',
              contents: [
                { kind: 'block', type: 'lists_create_with' },
                { kind: 'block', type: 'lists_repeat' },
                { kind: 'block', type: 'lists_length' },
                { kind: 'block', type: 'lists_isEmpty' },
                { kind: 'block', type: 'lists_indexOf' },
                { kind: 'block', type: 'lists_getIndex' },
                { kind: 'block', type: 'lists_setIndex' },
              ]
            }
          ]
        },
        grid: {
          spacing: 20,
          length: 3,
          colour: '#ccc',
          snap: true,
        },
        trashcan: true,
      });
      setWorkspaceInitialized(true);
    } catch (error) {
      console.error('Workspace initialization failed:', error);
      setMessage('⚠️ Failed to initialize workspace. Please refresh the page.');
    }
  };

  useEffect(() => {
    generateChallenge();
    initializeWorkspace();

    return () => {
      if (workspaceRef.current) {
        try {
          workspaceRef.current.dispose();
          workspaceRef.current = null;
        } catch (error) {
          console.warn('Error disposing workspace:', error);
        }
      }
    };
  }, [level]);

  const progressPercentage = Math.min(
    (progress.iteration.completed + (message.startsWith('🎉') ? 20 : 0)),
    100
  );

  return (
    <div className="iteration-page">
      {/* Horizontal Progress Bar */}
      <FloatingCharacter/>
      <div className="maze-area">
        <h2>Iteration Challenge - Level {level}</h2>
        <div className="maze-box">
          {currentChallenge && (
            <>
              <p>🎯 Goal: {currentChallenge.description}</p>
              <p className="message">{message}</p>
              <div className="level-controls">
                <button 
                  onClick={prevLevel} 
                  className="btn level-btn"
                  disabled={level === 1}
                >
                  ← Previous
                </button>
                {message.startsWith('🎉') && level < challengeGenerators.length * 3 && (
                  <button onClick={nextLevel} className="btn next-level-btn">
                    Next Level →
                  </button>
                )}
                {message.startsWith('🎉') && level >= challengeGenerators.length * 3 && (
                  <div className="completion-message">
                    🏆 Congratulations! You've completed all levels!
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="blockly-wrapper">
        <div className="blockly-controls">
          <button onClick={runCode} className="btn run-btn">Run</button>
          <button onClick={clearBlocks} className="btn clear-btn">Clear</button>
        </div>
        <div className="blockly-area" ref={blocklyDiv} />
        <pre className="console-output">
          {consoleOutput || 'Console output will appear here...'}
        </pre>
      </div>
    </div>
  );
};

export default IterationPage;