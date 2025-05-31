import './App.css';
import BlocklyComponent from './components/BlocklyComponent';

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <h1>🧮 Math Coding Game</h1>
        <p>Use blocks to solve math puzzles!</p>
      </header>

      <main className="main-content">
        <BlocklyComponent />
      </main>
    </div>
  );
}

export default App;
