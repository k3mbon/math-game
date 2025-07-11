// App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';

import LandingPage from './components/LandingPage';
import IterationPage from './components/IterationPage';
import NumerationPage from './components/NumerationPage';
import TeacherDashboard from './components/TeacherDashboard';
import LoginPage from './components/LoginPage';
import TeacherRegisterPage from './components/TeacherRegisterPage';
import { CharacterProvider } from './contexts/CharacterContext';
import { GameProgressProvider } from './contexts/GameProgressContext';
import DashboardRedirect from './components/DashboardRedirect';
import DashboardPage from './components/DashboardPage';
import NotFound from './components/NotFound'; // Adjust path if needed
import ArcadeMode from './components/Arcade';

import { auth, db } from './firebase';
import Game1 from './components/Game1';

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role);
          } else if (currentUser.isAnonymous) {
            setRole('guest');
          } else {
            setRole(null);
          }
        } catch {
          setRole(currentUser.isAnonymous ? 'guest' : null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="loading-screen">Loading...</div>;

  // Import Game1 component

  return (
    <CharacterProvider>
      <GameProgressProvider>
        <Router>
          <div className="app-container">
            <Routes>
              {/* Default to landing page if user exists */}
              <Route path="/" element={user ? <LandingPage /> : <Navigate to="/login" />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register-teacher" element={<TeacherRegisterPage />} />
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/dashboard-home" element={<DashboardPage />} />
              <Route path="/arcade" element={<ArcadeMode />} />

              {/* Add route for Game1 */}
              <Route path="/game1" element={<Game1 />} />

              {/* Role-based access */}
              {role === 'teacher' && (
                <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
              )}
              {(role === 'student' || role === 'guest') && (
                <>
                  <Route path="/iteration" element={<IterationPage />} />
                  <Route path="/numeration">
                    <Route index element={<NumerationPage />} />
                  </Route>
                </>
              )}

              {/* 404 fallback — should be the LAST route */}
              <Route path="*" element={<NotFound />} />

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </Router>
      </GameProgressProvider>
    </CharacterProvider>
  );
}

export default App;
