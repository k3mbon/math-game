// components/SignupPage.jsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import Navbar from './Navbar';
import '../pages/SignupPage.css';

const SignupPage = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    grade: ''
  });
  const [error, setError] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const { username, password, firstName, lastName, grade } = form;

    // Basic validation
    if (!username || !password || !firstName || !lastName) {
      setError('All fields are required.');
      return;
    }

    // Additional validation for student grade
    if (!isTeacher && !grade) {
      setError('Grade selection is required for students.');
      return;
    }

    // Simulate email for Firebase auth
    const email = isTeacher 
      ? `${username}@appdomain.com`
      : `${username}@student.app`;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const userData = {
        uid,
        role: isTeacher ? 'teacher' : 'student',
        username,
        email,
        firstName,
        lastName,
        createdAt: serverTimestamp()
      };

      // Add grade only for students
      if (!isTeacher) {
        userData.grade = grade;
      }

      await setDoc(doc(db, 'users', uid), userData);

      // Navigate based on role
      navigate(isTeacher ? '/teacher-dashboard' : '/dashboard');
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
    <>
      <Navbar />
      <div className="signup-page">
        <form onSubmit={handleRegister} className="signup-form">
          <div className="signup-toggle">
            <button
              type="button"
              className={!isTeacher ? 'active' : ''}
              onClick={() => setIsTeacher(false)}
            >
              🎓 Student
            </button>
            <button
              type="button"
              className={isTeacher ? 'active' : ''}
              onClick={() => setIsTeacher(true)}
            >
              👩‍🏫 Teacher
            </button>
          </div>

          <h2>{isTeacher ? '📝 Teacher Signup' : '🎓 Student Signup'}</h2>
          
          {error && <div className="error-msg">⚠️ {error}</div>}
          
          <input 
            name="firstName" 
            placeholder="First Name" 
            value={form.firstName} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="lastName" 
            placeholder="Last Name" 
            value={form.lastName} 
            onChange={handleChange} 
            required 
          />
          <input 
            name="username" 
            placeholder="Username (no spaces)" 
            value={form.username} 
            onChange={handleChange} 
            required 
          />
          
          {!isTeacher && (
            <select 
              name="grade" 
              value={form.grade} 
              onChange={handleChange} 
              required
            >
              <option value="">Select Grade</option>
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
              <option value="5">Grade 5</option>
              <option value="6">Grade 6</option>
            </select>
          )}
          
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            value={form.password} 
            onChange={handleChange} 
            required 
          />
          <button type="submit">{isTeacher ? 'Register' : 'Sign Up'}</button>
        </form>
      </div>
    </>
  );
};

export default SignupPage;