// src/components/ArcadeMode.jsx
import React, { useState, useEffect } from 'react';
import { useProblems } from '../hooks/useProblems';
import './Arcade.css';

const ArcadeMode = () => {
  const problems = useProblems();
  const [current, setCurrent] = useState(null);
  const [time, setTime] = useState(60);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (problems.length) setCurrent(problems[Math.floor(Math.random() * problems.length)]);
  }, [problems]);

  useEffect(() => {
    if (time > 0) {
      const t = setTimeout(() => setTime(t => t-1), 1000);
      return () => clearTimeout(t);
    }
  }, [time]);

  const submit = e => {
    e.preventDefault();
    const ans = parseInt(e.target.answer.value);
    if (ans === current.answer) setScore(s => s + 1);
    setCurrent(problems[Math.floor(Math.random() * problems.length)]);
    e.target.reset();
  };

  if (!current) return <p>Loading…</p>;

  return (
    <div className="mode-container">
      <h2>Arcade Mode</h2>
      <div className="stats">Time: {time}s | Score: {score}</div>
      <p className="arcade-problem">
        {current.story.replace('{a}', current.a ?? current.num)
                       .replace('{b}', current.b ?? '')}
      </p>
      <form onSubmit={submit} className="arcade-form">
        <input name="answer" type="number" required placeholder="Answer" />
        <button type="submit" disabled={time === 0}>OK</button>
      </form>
      {time === 0 && <p>Final Score: {score}</p>}
    </div>
  );
};

export default ArcadeMode;
