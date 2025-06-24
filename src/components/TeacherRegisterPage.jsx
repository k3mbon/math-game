// components/TeacherRegisterPage.jsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import './LoginPage.css';

const TeacherRegisterPage = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const { username, password, firstName, lastName } = form;

    // Basic validation
    if (!username || !password || !firstName || !lastName) {
      setError('All fields are required.');
      return;
    }

    // Simulate email for Firebase auth
    const email = `${username}@appdomain.com`;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        uid,
        role: 'teacher',
        username,
        email,
        firstName,
        lastName,
        createdAt: serverTimestamp()
      });

      navigate('/teacher-dashboard');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Username is already taken.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid username format.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="login-page">
      <h2>📝 Register as Teacher</h2>
      <form onSubmit={handleRegister} className="login-form">
        <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
        <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
        <input name="username" placeholder="Username (no spaces)" value={form.username} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">Register</button>
      </form>
      {error && <p className="error-msg">⚠️ {error}</p>}
    </div>
  );
};

export default TeacherRegisterPage;
