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

// Updated challenge generators for grades 4-6
const challengeGenerators = [
  // Level 1-3: Very basic iterations
  () => {
    const count = Math.floor(Math.random() * 3) + 2; // 2-4 repetitions
    const action = Math.random() > 0.5 ? 'print' : 'count';
    
    if (action === 'print') {
      const word = ['Hello', 'Star', 'Cat', 'Dog', 'Fun'][Math.floor(Math.random() * 5)];
      return {
        description: `Print "${word}" ${count} times`,
        verify: (output) => {
          const expected = Array(count).fill(word).join('\n');
          return output.trim() === expected;
        },
        solution: `for (let i = 0; i < ${count}; i++) {\n  console.log("${word}");\n}`
      };
    } else {
      return {
        description: `Count from 1 to ${count}`,
        verify: (output) => {
          let expected = '';
          for (let i = 1; i <= count; i++) {
            expected += `${i}\n`;
          }
          return output.trim() === expected.trim();
        },
        solution: `for (let i = 1; i <= ${count}; i++) {\n  console.log(i);\n}`
      };
    }
  },
  // Level 4-6: Slightly more complex
  () => {
    const type = Math.floor(Math.random() * 3);
    const base = Math.floor(Math.random() * 3) + 2; // 2-4
    
    switch(type) {
      case 0: // Simple count
        return {
          description: `Print numbers from ${base} to ${base * 3}`,
          verify: (output) => {
            let expected = '';
            for (let i = base; i <= base * 3; i++) {
              expected += `${i}\n`;
            }
            return output.trim() === expected.trim();
          },
          solution: `for (let i = ${base}; i <= ${base * 3}; i++) {\n  console.log(i);\n}`
        };
      case 1: // Simple sum
        return {
          description: `Add numbers from 1 to ${base + 2}`,
          verify: (output) => {
            let sum = 0;
            for (let i = 1; i <= base + 2; i++) {
              sum += i;
            }
            return Number(output.trim()) === sum;
          },
          solution: `let sum = 0;\nfor (let i = 1; i <= ${base + 2}; i++) {\n  sum += i;\n}\nconsole.log(sum);`
        };
      case 2: // Simple pattern
        const patternChar = ['*', '#', 'X', 'O'][Math.floor(Math.random() * 4)];
        return {
          description: `Print ${base} lines of '${patternChar}' (first line 1, second line 2, etc)`,
          verify: (output) => {
            let expected = '';
            for (let i = 1; i <= base; i++) {
              expected += `${patternChar.repeat(i)}\n`;
            }
            return output.trim() === expected.trim();
          },
          solution: `for (let i = 1; i <= ${base}; i++) {\n  console.log("${patternChar}".repeat(i));\n}`
        };
    }
  },
  // Level 7-9: More challenging but still simple
  () => {
    const type = Math.floor(Math.random() * 3);
    const base = Math.floor(Math.random() * 3) + 3; // 3-5
    
    switch(type) {
      case 0: // Count by 2s
        return {
          description: `Count from 2 to ${base * 2} by 2s`,
          verify: (output) => {
            let expected = '';
            for (let i = 2; i <= base * 2; i += 2) {
              expected += `${i}\n`;
            }
            return output.trim() === expected.trim();
          },
          solution: `for (let i = 2; i <= ${base * 2}; i += 2) {\n  console.log(i);\n}`
        };
      case 1: // Simple multiplication
        return {
          description: `Print the ${base} times table up to ${base * 5}`,
          verify: (output) => {
            let expected = '';
            for (let i = 1; i <= 5; i++) {
              expected += `${base * i}\n`;
            }
            return output.trim() === expected.trim();
          },
          solution: `for (let i = 1; i <= 5; i++) {\n  console.log(${base} * i);\n}`
        };
      case 2: // Simple pyramid
        const patternChar = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
        return {
          description: `Print a small pyramid with ${base} levels using '${patternChar}'`,
          verify: (output) => {
            let expected = '';
            for (let i = 1; i <= base; i++) {
              expected += `${patternChar.repeat(i)}\n`;
            }
            return output.trim() === expected.trim();
          },
          solution: `for (let i = 1; i <= ${base}; i++) {\n  console.log("${patternChar}".repeat(i));\n}`
        };
    }
  }
];

// Keep all other parts of the component exactly the same

  const generateChallenge = () => {
    let generatorIndex = Math.min(Math.floor(level / 3), challengeGenerators.length - 1);
    if (level >= 10) generatorIndex = challengeGenerators.length - 1;
    
    const challenge = challengeGenerators[generatorIndex]();
    setCurrentChallenge(challenge);
    return challenge;
  };

  const runCode = () => {
  if (!workspaceRef.current || !currentChallenge) {
    setConsoleOutput('⚠️ Workspace not ready. Please try again.\n');
    return;
  }

  // Clear console before each run
  setConsoleOutput('Running your code...\n\n');
  setMessage('');

  const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
  let capturedOutput = '';

  try {
    // Override console.log to capture output
    const originalConsoleLog = console.log;
    const originalAlert = window.alert;
    
    console.log = (...args) => {
      const message = args.join(' ');
      capturedOutput += message + '\n';
      setConsoleOutput(prev => prev + message + '\n');
      originalConsoleLog(...args);
    };

    // Override alert to capture in console output instead
    window.alert = (msg) => {
      capturedOutput += 'ALERT: ' + msg + '\n';
      setConsoleOutput(prev => prev + 'ALERT: ' + msg + '\n');
    };

    // Execute the code
    const func = new Function(`
      let result;
      try {
        ${code}
      } catch (e) {
        console.error(e.message);
      }
      return result;
    `);
    const capturedResult = func();

    // Restore original functions
    console.log = originalConsoleLog;
    window.alert = originalAlert;

    // Verify the solution
    const isCorrect = currentChallenge.verify(capturedOutput, capturedResult);
    
    if (isCorrect) {
      const newMessage = `🎉 Great job! You solved Level ${level}!`;
      setMessage(newMessage);
      setConsoleOutput(prev => prev + '\n✅ Correct solution!\n\n' + newMessage + '\n');
      
      if (level >= progress.iteration.level) {
        updateProgress('iteration', level + 1, 100);
      }
    } else {
      setMessage('❌ Try again! Check your solution.');
      setConsoleOutput(prev => prev + 
        '\n❌ Incorrect solution. Try again!\n' +
        `Challenge: ${currentChallenge.description}\n` +
        `Your output:\n${capturedOutput}\n` +
        (currentChallenge.solution ? `Need help? Try this:\n${currentChallenge.solution}\n` : ''));
    }

  } catch (error) {
    setMessage(`⚠️ Error: ${error.message}`);
    setConsoleOutput(prev => prev + `\n⚠️ Runtime Error: ${error.message}\n`);
    console.error('Execution error:', error);
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
        // Ensure result variable exists
        if (!workspaceRef.current.getVariable('result')) {
          workspaceRef.current.createVariable('result');
        }
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
    try {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
      }

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
              custom: 'VARIABLE',
              contents: [
                {
                  kind: 'block',
                  type: 'variables_set',
                  fields: {
                    'VAR': { name: 'result', type: 'result' }
                  }
                }
              ]
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

      // Create the result variable if it doesn't exist
      if (!workspaceRef.current.getVariable('result')) {
        workspaceRef.current.createVariable('result');
      }

      setWorkspaceInitialized(true);
    } catch (error) {
      console.error('Workspace initialization failed:', error);
      setMessage('⚠️ Failed to initialize workspace. Please refresh the page.');
      setConsoleOutput('Error initializing Blockly. Please try again.');
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
          <button onClick={() => {
            const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
            setConsoleOutput('Generated JavaScript:\n\n' + code);
          }} className="btn code-btn">
            Show Code
          </button>
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