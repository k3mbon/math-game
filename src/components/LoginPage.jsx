// components/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);
  const [error, setError] = useState('');

  const next = location.state?.next || '';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim().toLowerCase();
    const email = isTeacher
      ? `${trimmedUsername}@appdomain.com`
      : `${trimmedUsername}@student.app`;

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      const role = userDoc.exists() ? userDoc.data().role : null;

      if (role === 'teacher') navigate('/teacher-dashboard');
      else if (role === 'student') navigate('/dashboard');
      else if (next) navigate(`/${next}`);
      else navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGuest = async () => {
    setError('');
    try {
      await signInAnonymously(auth);
      if (next) navigate(`/${next}`);
      else navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-toggle">
        <button
          className={!isTeacher ? 'active' : ''}
          onClick={() => setIsTeacher(false)}
        >
          👦 Student
        </button>
        <button
          className={isTeacher ? 'active' : ''}
          onClick={() => setIsTeacher(true)}
        >
          👩‍🏫 Teacher
        </button>
      </div>

      <h2>{isTeacher ? 'Teacher Login' : 'Student Login'}</h2>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>

      <button onClick={handleGuest} className="guest-btn">Continue as Guest</button>
      {error && <p className="error-msg">⚠️ {error}</p>}
    </div>
  );
};

export default LoginPage;
