import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase'; // ✅ use initialized firebase
import { useNavigate } from 'react-router-dom';
import './TeacherProblemManager.css';

const defaultProblem = {
  id: '',
  level: 1,
  type: 'evenOdd',
  story: '',
  verify: 'evenOdd',
  num: 0,
  answer: ''
};

const problemTypes = [
  'sequence', 'evenOdd', 'digitCount', 'sumDigits',
  'reverse', 'multiples', 'fibonacci', 'isPrime',
  'factorCount', 'perfectNumber', 'printPrimes'
];

// Theme toggle removed as we now use a single vibrant theme

const TeacherProblemManager = () => {
  const [problems, setProblems] = useState([]);
  const [editingProblem, setEditingProblem] = useState(defaultProblem);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const problemsCollection = collection(db, 'problems');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchProblems();
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchProblems = async () => {
    const snapshot = await getDocs(problemsCollection);
    const fetchedProblems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProblems(fetchedProblems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newProblem = { ...editingProblem };

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

  const resetForm = () => {
    setEditingProblem(defaultProblem);
    setIsEditing(false);
  };

  const handleEdit = (problem) => {
    setEditingProblem(problem);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    const docRef = doc(db, 'problems', id);
    await deleteDoc(docRef);
    fetchProblems();
  };

  return (
    <div className="teacher-manager">
      {/* Theme toggle removed as we now use a single vibrant theme */}

      <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        🧠 Problem Manager
      </motion.h2>

      <form className="problem-form" onSubmit={handleSubmit}>
        <label>
          Level:
          <input
            type="number"
            value={editingProblem.level}
            onChange={(e) => setEditingProblem({ ...editingProblem, level: parseInt(e.target.value) })}
            required
          />
        </label>

        <label>
          Type:
          <select
            value={editingProblem.type}
            onChange={(e) => setEditingProblem({ ...editingProblem, type: e.target.value, verify: e.target.value })}
          >
            {problemTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>

        <label>
          Story:
          <textarea
            value={editingProblem.story}
            onChange={(e) => setEditingProblem({ ...editingProblem, story: e.target.value })}
            required
          />
        </label>

        <label>
          Value (e.g. num, base, limit, etc.):
          <input
            type="text"
            value={JSON.stringify(editingProblem.num || editingProblem.base || editingProblem.limit || '')}
            onChange={(e) => setEditingProblem({ ...editingProblem, num: parseInt(e.target.value) })}
          />
        </label>

        <label>
          Answer:
          <input
            type="text"
            value={editingProblem.answer}
            onChange={(e) => setEditingProblem({ ...editingProblem, answer: e.target.value })}
          />
        </label>

        <div className="form-buttons">
          <button type="submit" className="btn-save">
            {isEditing ? 'Update Problem' : 'Add Problem'}
          </button>
          {isEditing && <button onClick={resetForm} className="btn-cancel" type="button">Cancel</button>}
        </div>
      </form>

      <div className="problem-list">
        {problems.map((problem) => (
          <motion.div
            className="problem-card"
            key={problem.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p><strong>Level:</strong> {problem.level}</p>
            <p><strong>Type:</strong> {problem.type}</p>
            <p><strong>Story:</strong> {problem.story}</p>
            <p><strong>Answer:</strong> {problem.answer}</p>
            <div className="card-buttons">
              <button onClick={() => handleEdit(problem)} className="btn-edit">✏️ Edit</button>
              <button onClick={() => handleDelete(problem.id)} className="btn-delete">🗑️ Delete</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TeacherProblemManager;
