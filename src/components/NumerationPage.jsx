import React, { useRef, useEffect, useState } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator } from 'blockly/javascript';
import './NumerationPage.css';
import FloatingCharacter from './FloatingCharacter';
import { useCharacter } from '../contexts/CharacterContext';
import { useGameProgress } from '../contexts/GameProgressContext';
import problemBank from '../data/NumerationProblem.json';

const NumerationPage = () => {
  const { selectedCharacter } = useCharacter();
  const { progress, updateProgress } = useGameProgress();
  const blocklyDiv = useRef(null);
  const workspaceRef = useRef(null);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [level, setLevel] = useState(1);
  const [message, setMessage] = useState('');
  const [currentChallenge, setCurrentChallenge] = useState(null);

  const runCode = () => {
    if (!workspaceRef.current || !currentChallenge) {
      setMessage('⚠️ Workspace not ready. Please try again.');
      return;
    }

    let code = javascriptGenerator.workspaceToCode(workspaceRef.current);
    setConsoleOutput('');
    setMessage('');

    try {
      // Create a custom console that captures output
      const capturedOutput = [];
      const customConsole = {
        log: (...args) => {
          const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ');
          capturedOutput.push(message);
          setConsoleOutput(prev => prev + message + '\n');
        }
      };

      // Special handling for even/odd challenges
      if (currentChallenge.verifyType === 'evenOdd') {
        // Add explicit return of the last modified variable
        const lines = code.split('\n');
        const lastAssignment = lines.reverse().find(line => line.includes('='));
        
        if (lastAssignment) {
          const varName = lastAssignment.split('=')[0].trim();
          code += `\nreturn ${varName};`;
        } else {
          // Fallback to checking common variable names
          code = `
            let result, answer, number;
            ${code}
            return number !== undefined ? number : 
                  answer !== undefined ? answer : 
                  result;
          `;
        }
      }

      // Execute the code
      const func = new Function('console', code);
      const result = func(customConsole);

      // Verify the solution
      const verificationResult = currentChallenge.verify(
        capturedOutput.join('\n'),
        result
      );

      if (verificationResult) {
        setMessage(`🎉 Great job! You solved Level ${level}.`);
        if (progress.numeration < level) {
          updateProgress('numeration', level);
        }
      } else {
        setMessage('❌ Try again! Your solution is not correct.');
        setConsoleOutput(prev => prev + `\nExpected answer: ${currentChallenge.expectedAnswer}`);
      }

    } catch (e) {
      setMessage(`⚠️ Error: ${e.message}`);
      setConsoleOutput(prev => prev + `Error: ${e.message}\n`);
    }
  };

  const generateChallenge = () => {
    const availableProblems = problemBank.filter(p => p.level === level);
    const random = availableProblems[Math.floor(Math.random() * availableProblems.length)];

  let description = random.story;
    if (random.start !== undefined && random.endOffset !== undefined) {
      description = description
        .replace('{start}', random.start)
        .replace('{end}', random.start + random.endOffset);
    }
    if (random.num !== undefined) {
      const isEven = random.num % 2 === 0;
      description = description
        .replace('{num}', random.num)
        .replace('{type}', isEven ? 'even' : 'odd');
    }
    if (random.base !== undefined && random.limit !== undefined) {
      description = description
        .replace('{base}', random.base)
        .replace('{limit}', random.limit);
    }
    if (random.n !== undefined) {
      description = description.replace('{n}', random.n);
    }

    const verify = (output, result) => {
      switch (random.verify) {
        case 'sequence':
        case 'multiples':
        case 'printPrimes':
          return output === random.answer;
        case 'evenOdd':{
          const numResult = Number(result);
          return !isNaN(numResult) && numResult === (random.num % 2 === 0 ? 1 : 0);
        }
        case 'digitCount':
        case 'sumDigits':
        case 'reverse':
        case 'fibonacci':
        case 'isPrime':
        case 'factorCount':
        case 'perfectNumber':{
          // Convert to number if necessary before comparison
          const numResult = Number(result);
          return !isNaN(numResult) && numResult == random.answer;
        }
          
        default:
          return false;
      }
    };

        setCurrentChallenge({
          description,
          verify,
          verifyType: random.verify,
          expectedAnswer: `Return value: ${random.num % 2 === 0 ? 1 : 0}`
        });
      };

  const nextLevel = () => {
    setLevel((prev) => prev + 1);
    generateChallenge();
    clearBlocks();
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
      workspaceRef.current.clear();
    }
    setConsoleOutput('');
    setMessage('');
  };

  const initializeWorkspace = () => {
    if (workspaceRef.current) {
      workspaceRef.current.dispose();
    }

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
              { kind: 'block', type: 'math_constrain' }
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
              { kind: 'block', type: 'logic_negate' },
              { kind: 'block', type: 'logic_boolean' }
            ]
          },
          {
            kind: 'category',
            name: 'Loops',
            colour: '#a55b80',
            contents: [
              { kind: 'block', type: 'controls_repeat_ext' },
              { kind: 'block', type: 'controls_whileUntil' },
              { kind: 'block', type: 'controls_for' }
            ]
          },
          {
            kind: 'category',
            name: 'Text',
            colour: '#5ba58a',
            contents: [
              { kind: 'block', type: 'text_print' },
              { kind: 'block', type: 'text' }
            ]
          },
          {
            kind: 'category',
            name: 'Variables',
            colour: '#a58a5b',
            custom: 'VARIABLE'
          },
          {
            kind: 'category',
            name: 'Advanced',
            colour: '#aa5588',
            contents: [
              { kind: 'block', type: 'math_random_int' },
              { kind: 'block', type: 'math_number_property' }
            ]
          }
        ]
      },
      grid: {
        spacing: 20,
        length: 3,
        colour: '#eee',
        snap: true
      },
      trashcan: true
    });
  };

  useEffect(() => {
    generateChallenge();
    initializeWorkspace();

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, [level]);

  return (
    <div className="numeration-page">
      <FloatingCharacter />
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
                <button onClick={prevLevel} className="btn level-btn" disabled={level === 1}>
                  ← Previous
                </button>
                {message.startsWith('🎉') && (
                  <button onClick={nextLevel} className="btn next-level-btn">
                    Next Level →
                  </button>
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