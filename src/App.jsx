// App.jsx
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, Suspense, lazy } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';

// Core components (keep as direct imports for faster initial load)
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Navbar from './components/Navbar';
import NotFound from './components/NotFound';
import { CharacterProvider } from './contexts/CharacterContext';
import { GameProgressProvider } from './contexts/GameProgressContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { auth, db } from './firebase';

// Lazy load heavy components
const LandingPage = lazy(() => import('./components/LandingPage'));
const IterationPage = lazy(() => import('./components/IterationPage'));
const NumerationPage = lazy(() => import('./components/NumerationPage'));
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard'));
const DashboardRedirect = lazy(() => import('./components/DashboardRedirect'));
const DashboardPage = lazy(() => import('./components/DashboardPage'));
const ArcadeMode = lazy(() => import('./components/Arcade'));
const Game1 = lazy(() => import('./components/Game1'));
const OpenWorldGame = lazy(() => import('./components/OpenWorldGame'));
const SimpleOpenWorldGame = lazy(() => import('./components/SimpleOpenWorldGame'));
const GameComparison = lazy(() => import('./components/GameComparison'));
const TestGame = lazy(() => import('./components/TestGame'));
const CharacterDemo = lazy(() => import('./pages/CharacterDemo'));
const CharacterAnimationGIF = lazy(() => import('./components/CharacterAnimationGIF'));
const WorldEditorDemo = lazy(() => import('./components/WorldEditorDemo'));

// AppContent component to use router hooks
function AppContent() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

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

  return (
    <div className="app-container">
      {user && location.pathname !== '/login' && location.pathname !== '/signup' && (
        <Navbar />
      )}
      <Suspense fallback={<div className="loading-screen">Loading...</div>}>
        <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Test routes (temporarily public) */}
              <Route path="/test-game" element={<TestGame />} />
              <Route path="/open-world" element={<OpenWorldGame />} />
              <Route path="/simple-open-world" element={<SimpleOpenWorldGame />} />
              <Route path="/game-comparison" element={<GameComparison />} />
              <Route path="/character-demo" element={<CharacterDemo />} />
              <Route path="/character-gif" element={<CharacterAnimationGIF />} />
              <Route path="/world-editor" element={<WorldEditorDemo />} />
              
              {/* Protected routes with Navbar */}
              {user ? (
                <>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/dashboard" element={<DashboardRedirect />} />
                  <Route path="/dashboard-home" element={<DashboardPage />} />
                  
                  {/* Game routes */}
                  <Route path="/arcade" element={<ArcadeMode />} />
                  <Route path="/game1" element={<Game1 />} />
                  
                  {/* Role-based routes */}
                  {role === 'teacher' && (
                    <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                  )}
                  
                  {(role === 'student' || role === 'guest') && (
                    <>
                      <Route path="/iteration" element={<IterationPage />} />
                      <Route path="/numeration" element={<NumerationPage />} />
                    </>
                  )}
                </>
              ) : (
                <Route path="*" element={<Navigate to="/login" />} />
              )}
              
              {/* 404 fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
      </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <CharacterProvider>
        <GameProgressProvider>
          <Router>
            <AppContent />
          </Router>
        </GameProgressProvider>
      </CharacterProvider>
    </ThemeProvider>
  );
}

export default App;
