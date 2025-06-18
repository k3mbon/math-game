import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import IterationPage from './components/IterationPage';
import NumerationPage from './components/NumerationPage';
import { CharacterProvider } from './contexts/CharacterContext';
import { GameProgressProvider } from './contexts/GameProgressContext';

function App() {
  return (
    <CharacterProvider>
      <GameProgressProvider>
        <Router>
          <div className="app-container">
            <Routes>
              {/* LandingPage as the default route */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/iteration" element={<IterationPage />} />
              <Route path="/numeration" element={<NumerationPage />} />
            </Routes>
          </div>
        </Router>
      </GameProgressProvider>
    </CharacterProvider>
  );
}

export default App;