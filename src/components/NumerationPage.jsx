// components/NumerationPage.jsx
import React, { useRef, useEffect, useState } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import './NumerationPage.css';
import FloatingCharacter from './FloatingCharacter';
import { useCharacter } from '../contexts/CharacterContext';
import { useGameProgress } from '../contexts/GameProgressContext';

const NumerationPage = () => {
  const { selectedCharacter } = useCharacter();
  const { progress, updateProgress } = useGameProgress();
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState('');
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [workspaceInitialized, setWorkspaceInitialized] = useState(false);

  // Challenge generators for different levels
  const challengeGenerators = [
    // Level 1-3: Basic number concepts
    () => {
      const type = Math.floor(Math.random() * 3);
      const base = Math.floor(Math.random() * 5) + 1;
      
      switch(type) {
        case 0: // Number sequence
          return {
            description: `Print numbers from ${base} to ${base + 5}`,
            verify: (output) => {
              let expected = '';
              for (let i = base; i <= base + 5; i++) {
                expected += `${i}\n`;
              }
              return output === expected;
            }
          };
        case 1: // Even/odd identification
          const num = base * 2 + (Math.random() > 0.5 ? 0 : 1);
          const type = num % 2 === 0 ? 'even' : 'odd';
          return {
            description: `Check if ${num} is ${type} (return 1 if true, 0 if false)`,
            verify: (_, result) => result === (num % 2 === 0 ? 1 : 0)
          };
        case 2: // Number properties
          return {
            description: `Count how many digits are in ${base * 100 + base * 10 + base}`,
            verify: (_, result) => result === 3
          };
        default:
          return {
            description: `Print the number ${base}`,
            verify: (output) => output === `${base}\n`
          };
      }
    },
    // Level 4-6: Intermediate number operations
    () => {
      const type = Math.floor(Math.random() * 4);
      const base = Math.floor(Math.random() * 5) + 3;
      
      switch(type) {
        case 0: // Prime numbers
          const primes = [2, 3, 5, 7, 11, 13];
          const num = primes[Math.floor(Math.random() * primes.length)];
          return {
            description: `Check if ${num} is prime (return 1 if true, 0 if false)`,
            verify: (_, result) => result === 1
          };
        case 1: // Digit operations
          const number = base * 10 + (base + 1);
          return {
            description: `Sum the digits of ${number}`,
            verify: (_, result) => result === (base + (base + 1))
          };
        case 2: // Number patterns
          return {
            description: `Print multiples of ${base} up to ${base * 5}`,
            verify: (output) => {
              let expected = '';
              for (let i = base; i <= base * 5; i += base) {
                expected += `${i}\n`;
              }
              return output === expected;
            }
          };
        case 3: // Number reversal
          const twoDigit = base * 10 + (base + 1);
          return {
            description: `Reverse the digits of ${twoDigit}`,
            verify: (_, result) => result === ((base + 1) * 10 + base)
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
    // Level 7+: Advanced number theory
    () => {
      const type = Math.floor(Math.random() * 3);
      const base = Math.floor(Math.random() * 5) + 5;
      
      switch(type) {
        case 0: // Fibonacci sequence
          return {
            description: `Calculate the ${base}th Fibonacci number`,
            verify: (_, result) => {
              let a = 0, b = 1;
              for (let i = 2; i <= base; i++) {
                [a, b] = [b, a + b];
              }
              return result === b;
            }
          };
        case 1: // Perfect numbers
          const perfectNumbers = [6, 28, 496];
          const num = perfectNumbers[Math.floor(Math.random() * perfectNumbers.length)];
          return {
            description: `Check if ${num} is a perfect number (return 1 if true, 0 if false)`,
            verify: (_, result) => result === 1
          };
        case 2: // Number factorization
          const composite = base * 2;
          return {
            description: `Count the number of factors of ${composite}`,
            verify: (_, result) => {
              let count = 0;
              for (let i = 1; i <= composite; i++) {
                if (composite % i === 0) count++;
              }
              return result === count;
            }
          };
        default:
          return {
            description: `Print the prime numbers up to ${base * 2}`,
            verify: (output) => {
              const primes = [];
              for (let i = 2; i <= base * 2; i++) {
                let isPrime = true;
                for (let j = 2; j < i; j++) {
                  if (i % j === 0) {
                    isPrime = false;
                    break;
                  }
                }
                if (isPrime) primes.push(i);
              }
              const expected = primes.join('\n') + '\n';
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
      
      if (level >= progress.numeration?.level || 0) {
        const newLevel = level === (progress.numeration?.level || 0) ? (progress.numeration?.level || 0) + 1 : progress.numeration?.level || 0;
        updateProgress('numeration', newLevel, 100);
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
      setLevel((prev) => prev + 1);
      generateChallenge();
      clearBlocks();
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
    // Clean up existing workspace if it exists
    if (workspaceRef.current) {
      try {
        workspaceRef.current.dispose();
      } catch (error) {
        console.warn('Error disposing old workspace:', error);
      }
    }

    // Create new workspace with numeration-specific blocks
    try {
      workspaceRef.current = Blockly.inject(blocklyDiv.current, {
        toolbox: {
          kind: 'categoryToolbox',
          contents: [
            {
              kind: 'category',
              name: 'Numbers',
              colour: '#5b80a5',
              contents: [
                { kind: 'block', type: 'math_number' },
                { kind: 'block', type: 'math_arithmetic' },
                { kind: 'block', type: 'math_modulo' },
                { kind: 'block', type: 'math_single' },
                { kind: 'block', type: 'math_round' },
                { kind: 'block', type: 'math_constrain' },
              ]
            },
            {
              kind: 'category',
              name: 'Logic',
              colour: '#8a5ba5',
              contents: [
                { kind: 'block', type: 'controls_if' },
                { kind: 'block', type: 'logic_compare' },
                { kind: 'block', type: 'logic_operation' },
              ]
            },
            {
              kind: 'category',
              name: 'Loops',
              colour: '#a55b80',
              contents: [
                { kind: 'block', type: 'controls_repeat_ext' },
                { kind: 'block', type: 'controls_whileUntil' },
              ]
            },
            {
              kind: 'category',
              name: 'Text',
              colour: '#5ba58a',
              contents: [
                { kind: 'block', type: 'text_print' },
                { kind: 'block', type: 'text' },
              ]
            },
            {
              kind: 'category',
              name: 'Variables',
              colour: '#a58a5b',
              custom: 'VARIABLE'
            }
          ]
        },
        grid: {
          spacing: 20,
          length: 3,
          colour: '#eee',
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

  return (
    <div className="numeration-page">
      <FloatingCharacter/>
      <div className="challenge-area">
        <h2>Numeration Challenge - Level {level}</h2>
        <div className="challenge-box">
          {currentChallenge && (
            <>
              <p className="challenge-description">🎯 Goal: {currentChallenge.description}</p>
              <p className={`message ${message.startsWith('🎉') ? 'success' : message.startsWith('❌') ? 'error' : ''}`}>
                {message}
              </p>
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

export default NumerationPage;