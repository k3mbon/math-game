// src/hooks/useProblems.js
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';

export const useProblems = () => {
  const [problems, setProblems] = useState([]);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    if (!user) {
      setProblems([]);
      return;
    }
    
    const load = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'problems'));
        setProblems(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.warn('Failed to load problems:', error);
        setProblems([]);
      }
    };
    load();
  }, [user]);
  
  return problems;
};
