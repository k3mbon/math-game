// components/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import Navbar from './Navbar';
import { Person, School, Warning } from '@mui/icons-material';
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
    <>
      <Navbar />
      <div className="login-page">
        <form onSubmit={handleLogin} className="login-form">
          <div className="login-toggle">
            <button
              type="button"
              className={!isTeacher ? 'active' : ''}
              onClick={() => setIsTeacher(false)}
            >
              <Person sx={{ marginRight: '8px', fontSize: '1.2rem' }} /> Student
            </button>
            <button
              type="button"
              className={isTeacher ? 'active' : ''}
              onClick={() => setIsTeacher(true)}
            >
              <School sx={{ marginRight: '8px', fontSize: '1.2rem' }} /> Teacher
            </button>
          </div>

          <h2>{isTeacher ? 'Teacher Login' : 'Student Login'}</h2>
          
          {error && <p className="error-msg"><Warning sx={{ marginRight: '8px', fontSize: '1.1rem' }} /> {error}</p>}
          
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
          
          <button type="button" onClick={handleGuest} className="guest-btn">Continue as Guest</button>
        </form>
      </div>
    </>
  );
};

export default LoginPage;
