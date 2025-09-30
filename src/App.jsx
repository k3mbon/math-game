// App.jsx
import './App.css?v=1';
import './components/temp.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, Suspense, lazy } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { DataTable } from './components/data-table';

// Core components (keep as direct imports for faster initial load)
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Navbar from './components/Navbar';
import NotFound from './components/NotFound';
import { CharacterProvider } from './contexts/CharacterContext';
import { GameProgressProvider } from './contexts/GameProgressContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { auth, db } from './firebase';

import LandingPage from './components/LandingPage';
const IterationPage = lazy(() => import('./components/IterationPage'));
const NumerationPage = lazy(() => import('./components/NumerationPage'));
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard'));
const DashboardRedirect = lazy(() => import('./components/DashboardRedirect'));
const DashboardPage = lazy(() => import('./components/DashboardPage'));
const ArcadeMode = lazy(() => import('./components/Arcade'));
const Game1 = lazy(() => import('./components/Game1'));
const GrassTerrainDemo = lazy(() => import('./pages/GrassTerrainDemo'));
const ZenoTerrainGame = lazy(() => import('./components/ZenoTerrainGame'));
const ZenoGameNew = lazy(() => import('./components/ZenoGameNew'));
// Import OpenWorldGame and related components directly to avoid module fetch errors
import OpenWorldGame from './components/OpenWorldGame';
import SimpleOpenWorldGame from './components/SimpleOpenWorldGame';
import CanvasRenderer from './components/CanvasRenderer';
const GameComparison = lazy(() => import('./components/GameComparison'));
const TestGame = lazy(() => import('./components/TestGame'));
const GameStart = lazy(() => import('./components/GameStart'));
const CharacterDemo = lazy(() => import('./pages/CharacterDemo'));
const CharacterAnimationGIF = lazy(() => import('./components/CharacterAnimationGIF'));
const WorldEditorDemo = lazy(() => import('./components/WorldEditorDemo'));
const TerrainDesigner = lazy(() => import('./pages/TerrainDesigner'));
const TerrainDesignerSimple = lazy(() => import('./pages/TerrainDesignerSimple'));
const TerrainGameDemo = lazy(() => import('./pages/TerrainGameDemo'));
const TerrainDemo = lazy(() => import('./pages/TerrainDemo'));

const data = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
  },
  {
    id: "489e1d43",
    amount: 75,
    status: "success",
    email: "test@test.com",
  },
  {
    id: "489e1d44",
    amount: 200,
    status: "failed",
    email: "another@example.com",
  },
];

const columns = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
];

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
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              {/* Public game preview routes */}
              <Route path="/iteration" element={<IterationPage />} />
              <Route path="/numeration" element={<NumerationPage />} />
              <Route path="/zeno" element={<ZenoGameNew />} />
              
              {/* Test routes (temporarily public) */}
              <Route path="/test-game" element={<TestGame />} />
              <Route path="/game-start" element={<GameStart />} />
              <Route path="/open-world-game" element={<OpenWorldGame />} />
              <Route path="/simple-open-world" element={<SimpleOpenWorldGame />} />
              <Route path="/game-comparison" element={<GameComparison />} />
              <Route path="/character-demo" element={<CharacterDemo />} />
              <Route path="/character-gif" element={<CharacterAnimationGIF />} />
              <Route path="/world-editor" element={<WorldEditorDemo />} />
              <Route path="/terrain-designer" element={<TerrainDesigner />} />
              <Route path="/terrain-designer-simple" element={<TerrainDesignerSimple />} />
              <Route path="/terrain-game-demo" element={<TerrainGameDemo />} />
              <Route path="/grass-terrain-demo" element={<GrassTerrainDemo />} />
              <Route path="/terrain-demo" element={<TerrainDemo />} />
              
              {/* Protected routes shown only when authenticated */}
              {user && (
                <>
                  <Route path="/dashboard" element={<DashboardRedirect />} />
                  <Route path="/dashboard-home" element={<DashboardPage />} />
                  
                  {/* Game routes */}
                  <Route path="/arcade" element={<ArcadeMode />} />
                  <Route path="/zeno" element={<ZenoGameNew />} />
                  
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
              )}
              
              {/* 404 fallback */}
              <Route path="*" element={<NotFound />} />
              <Route path="/test-table" element={<DataTable columns={columns} data={data} />} />
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
