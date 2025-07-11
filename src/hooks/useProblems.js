// src/hooks/useProblems.js
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export const useProblems = () => {
  const [problems, setProblems] = useState([]);
  useEffect(() => {
    const load = async () => {
      const snapshot = await getDocs(collection(db, 'problems'));
      setProblems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    load();
  }, []);
  return problems;
};
