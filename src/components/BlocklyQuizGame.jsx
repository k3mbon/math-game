import React, { useState, useEffect } from 'react';
import './BlocklyQuizGame.css';
import BlocklyComponent from './BlocklyComponent';

const BlocklyQuizGame = ({ question, correctAnswer, onComplete }) => {
  const [userAnswer, setUserAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  // This function would be called when the user runs their Blockly code
  const checkAnswer = (result) => {
    setUserAnswer(result);
    const correct = result === correctAnswer;
    setIsCorrect(correct);
    setFeedback(correct ? 'Correct! Well done!' : 'Try again!');
    
    if (correct) {
      onComplete(true);
    }
  };

  return (
    <div className="blockly-quiz-game">
      <h3>{question}</h3>
      
      <div className="blockly-container">
        <BlocklyComponent 
          onRun={checkAnswer}
          toolboxConfiguration={[
            {
              "kind": "category",
              "name": "Logic",
              "contents": [
                {"kind": "block", "type": "controls_if"},
                {"kind": "block", "type": "logic_compare"},
                {"kind": "block", "type": "logic_operation"}
              ]
            },
            {
              "kind": "category",
              "name": "Math",
              "contents": [
                {"kind": "block", "type": "math_number"},
                {"kind": "block", "type": "math_arithmetic"}
              ]
            }
          ]}
        />
      </div>
      
      {userAnswer !== null && (
        <div className={`feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          <p>{feedback}</p>
          <p>Your answer: {userAnswer}</p>
          {!isCorrect && <p>Expected answer: {correctAnswer}</p>}
        </div>
      )}
    </div>
  );
};

export default BlocklyQuizGame;