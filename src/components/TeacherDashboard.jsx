// components/TeacherDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './LoginPage.css';
import './TeacherDashboard.css';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';

const problemsCollection = collection(db, 'problems');
const studentsCollection = collection(db, 'students');

const defaultProblem = {
  id: '',
  level: 1,
  type: 'evenOdd',
  story: '',
  verify: 'evenOdd',
  num: 0,
  a: 0,
  b: 0,
  answer: ''
};

const defaultStudent = {
  firstName: '',
  lastName: '',
  grade: '',
  username: '',
  password: ''
};

const problemTypes = [
  'sequence', 'evenOdd', 'digitCount', 'sumDigits',
  'reverse', 'multiples', 'fibonacci', 'isPrime',
  'factorCount', 'perfectNumber', 'printPrimes', 'gcd'
];

const TeacherDashboard = () => {
  const [problems, setProblems] = useState([]);
  const [students, setStudents] = useState([]);
  const [editingProblem, setEditingProblem] = useState(defaultProblem);
  const [newStudent, setNewStudent] = useState(defaultStudent);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) navigate('/login');
      else {
        fetchProblems();
        fetchStudents();
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchProblems = async () => {
    const snapshot = await getDocs(problemsCollection);
    const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProblems(fetched);
  };

  const fetchStudents = async () => {
    const snapshot = await getDocs(studentsCollection);
    const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setStudents(fetched);
  };

  const handleProblemSubmit = async (e) => {
    e.preventDefault();
    let newProblem = { ...editingProblem };

    // Remove unused fields
    if (newProblem.type !== 'gcd') {
      delete newProblem.a;
      delete newProblem.b;
    }
    if (!['evenOdd', 'sumDigits', 'digitCount', 'reverse', 'fibonacci'].includes(newProblem.type)) {
      delete newProblem.num;
    }

    if (!newProblem.id) {
      const docRef = await addDoc(problemsCollection, newProblem);
      newProblem.id = docRef.id;
    } else {
      const docRef = doc(db, 'problems', newProblem.id);
      await updateDoc(docRef, newProblem);
    }

    fetchProblems();
    resetForm();
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!newStudent.username || !newStudent.password) return;

    const docRef = doc(studentsCollection, newStudent.username);
    await setDoc(docRef, {
      firstName: newStudent.firstName,
      lastName: newStudent.lastName,
      grade: newStudent.grade,
      username: newStudent.username
    });

    await setDoc(doc(db, 'users', newStudent.username), {
      role: 'student',
      username: newStudent.username,
      password: newStudent.password
    });

    setNewStudent(defaultStudent);
    setEditingStudent(null);
    fetchStudents();
  };

  const resetForm = () => {
    setEditingProblem(defaultProblem);
    setIsEditing(false);
  };

  const handleEditProblem = (problem) => {
    setEditingProblem({ ...defaultProblem, ...problem }); // Merge with default for missing fields
    setIsEditing(true);
  };

  const handleDeleteProblem = async (id) => {
    const docRef = doc(db, 'problems', id);
    await deleteDoc(docRef);
    fetchProblems();
  };

  const handleEditStudent = (student) => {
    setNewStudent({ ...student, password: '' });
    setEditingStudent(student.username);
  };

  const handleDeleteStudent = async (username) => {
    await deleteDoc(doc(db, 'students', username));
    await deleteDoc(doc(db, 'users', username));
    fetchStudents();
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="teacher-dashboard">
      <div className="dashboard-header">
        <h2>🧠 Teacher Dashboard</h2>
        <div className="header-buttons">
          <button onClick={() => navigate('/dashboard-home')} className="btn">🏠 Home</button>
          <button onClick={handleLogout} className="btn logout">🚪 Logout</button>
        </div>
      </div>

      <h3>➕ Add Problem</h3>
      <form className="problem-form" onSubmit={handleProblemSubmit}>
        <label>
          Level:
          <input type="number" value={editingProblem.level} onChange={(e) => setEditingProblem({ ...editingProblem, level: parseInt(e.target.value) })} required />
        </label>
        <label>
          Type:
          <select value={editingProblem.type} onChange={(e) => setEditingProblem({ ...editingProblem, type: e.target.value, verify: e.target.value })}>
            {problemTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label>
          Story:
          <textarea value={editingProblem.story} onChange={(e) => setEditingProblem({ ...editingProblem, story: e.target.value })} required />
        </label>

        {/* Show a & b if type is gcd */}
        {editingProblem.type === 'gcd' && (
          <>
            <label>
              a:
              <input type="number" value={editingProblem.a} onChange={(e) => setEditingProblem({ ...editingProblem, a: parseInt(e.target.value) })} />
            </label>
            <label>
              b:
              <input type="number" value={editingProblem.b} onChange={(e) => setEditingProblem({ ...editingProblem, b: parseInt(e.target.value) })} />
            </label>
          </>
        )}

        {/* Show num for relevant types */}
        {['evenOdd', 'sumDigits', 'digitCount', 'reverse', 'fibonacci'].includes(editingProblem.type) && (
          <label>
            Num:
            <input type="number" value={editingProblem.num} onChange={(e) => setEditingProblem({ ...editingProblem, num: parseInt(e.target.value) })} />
          </label>
        )}

        <label>
          Answer:
          <input type="text" value={editingProblem.answer} onChange={(e) => setEditingProblem({ ...editingProblem, answer: e.target.value })} />
        </label>

        <div className="form-buttons">
          <button type="submit">{isEditing ? 'Update Problem' : 'Add Problem'}</button>
          {isEditing && <button onClick={resetForm} type="button">Cancel</button>}
        </div>
      </form>

      <div className="problem-list">
        {problems.map((problem) => (
          <motion.div className="problem-card" key={problem.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
            <p><strong>Level:</strong> {problem.level}</p>
            <p><strong>Type:</strong> {problem.type}</p>
            <p><strong>Story:</strong> {problem.story}</p>
            {problem.a !== undefined && <p><strong>a:</strong> {problem.a}</p>}
            {problem.b !== undefined && <p><strong>b:</strong> {problem.b}</p>}
            {problem.num !== undefined && <p><strong>Num:</strong> {problem.num}</p>}
            <p><strong>Answer:</strong> {problem.answer}</p>
            <div className="card-buttons">
              <button onClick={() => handleEditProblem(problem)}>✏️ Edit</button>
              <button onClick={() => handleDeleteProblem(problem.id)}>🗑️ Delete</button>
            </div>
          </motion.div>
        ))}
      </div>

      <h3>👩‍🎓 {editingStudent ? 'Edit Student' : 'Add Student'}</h3>
      <form className="student-form" onSubmit={handleStudentSubmit}>
        <input name="firstName" placeholder="First Name" value={newStudent.firstName} onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })} required />
        <input name="lastName" placeholder="Last Name" value={newStudent.lastName} onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })} required />
        <input name="username" placeholder="Username" value={newStudent.username} onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })} required />
        <input name="grade" placeholder="Grade" value={newStudent.grade} onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })} required />
        <input name="password" type="password" placeholder="Password" value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} required />
        <button type="submit">{editingStudent ? 'Update Student' : 'Add Student'}</button>
      </form>

      <div className="student-list">
        {students.map((student) => (
          <div key={student.id} className="student-card">
            <div className="student-icon">👩‍🎓</div>
            <div className="student-info">
              <h4>{student.firstName} {student.lastName}</h4>
              <p>Username: {student.username}</p>
              <p>Grade: {student.grade}</p>
              <div className="card-buttons">
                <button onClick={() => handleEditStudent(student)}>✏️</button>
                <button onClick={() => handleDeleteStudent(student.username)}>🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherDashboard;
