import React from 'react';
import { Link } from 'react-router-dom';
import './GameComparison.css';

const GameComparison = () => {
  return (
    <div className="game-comparison">
      <div className="comparison-header">
        <h1>🎮 Open World Game Comparison</h1>
        <p>Compare the original asset-heavy version with the optimized simple version</p>
      </div>

      <div className="comparison-grid">
        <div className="game-version original">
          <div className="version-header">
            <h2>🖼️ Original Version</h2>
            <span className="version-tag original-tag">Asset Heavy</span>
          </div>
          
          <div className="version-preview">
            <div className="preview-placeholder original-preview">
              <div className="asset-icons">
                <span>🌳</span>
                <span>🏔️</span>
                <span>🌊</span>
                <span>👑</span>
              </div>
              <p>Complex sprites & tilesets</p>
            </div>
          </div>

          <div className="version-features">
            <h3>Features:</h3>
            <ul>
              <li>📦 External PNG/GIF assets</li>
              <li>🎨 Complex sprite animations</li>
              <li>🖼️ Detailed tilesets</li>
              <li>👑 Character GIF animations</li>
              <li>🌲 Downloaded asset library</li>
              <li>💾 Higher memory usage</li>
            </ul>
          </div>

          <div className="version-performance">
            <h3>Performance:</h3>
            <div className="performance-bars">
              <div className="performance-item">
                <span>Loading Speed:</span>
                <div className="bar"><div className="fill" style={{width: '40%'}}></div></div>
              </div>
              <div className="performance-item">
                <span>Memory Usage:</span>
                <div className="bar"><div className="fill high" style={{width: '80%'}}></div></div>
              </div>
              <div className="performance-item">
                <span>Render Speed:</span>
                <div className="bar"><div className="fill" style={{width: '60%'}}></div></div>
              </div>
            </div>
          </div>

          <Link to="/open-world" className="play-button original-button">
            🎮 Play Original Version
          </Link>
        </div>

        <div className="game-version optimized">
          <div className="version-header">
            <h2>⚡ Optimized Version</h2>
            <span className="version-tag optimized-tag">Simple Assets</span>
          </div>
          
          <div className="version-preview">
            <div className="preview-placeholder optimized-preview">
              <div className="simple-shapes">
                <div className="shape circle"></div>
                <div className="shape triangle"></div>
                <div className="shape square"></div>
                <div className="shape diamond"></div>
              </div>
              <p>Geometric shapes & patterns</p>
            </div>
          </div>

          <div className="version-features">
            <h3>Features:</h3>
            <ul>
              <li>🎯 Pure geometric shapes</li>
              <li>✨ Canvas-based animations</li>
              <li>🎨 Procedural patterns</li>
              <li>🔵 Simple player representation</li>
              <li>🚀 No external dependencies</li>
              <li>💚 Minimal memory footprint</li>
            </ul>
          </div>

          <div className="version-performance">
            <h3>Performance:</h3>
            <div className="performance-bars">
              <div className="performance-item">
                <span>Loading Speed:</span>
                <div className="bar"><div className="fill good" style={{width: '95%'}}></div></div>
              </div>
              <div className="performance-item">
                <span>Memory Usage:</span>
                <div className="bar"><div className="fill good" style={{width: '25%'}}></div></div>
              </div>
              <div className="performance-item">
                <span>Render Speed:</span>
                <div className="bar"><div className="fill good" style={{width: '90%'}}></div></div>
              </div>
            </div>
          </div>

          <Link to="/simple-open-world" className="play-button optimized-button">
            ⚡ Play Optimized Version
          </Link>
        </div>
      </div>

      <div className="optimization-details">
        <h2>🔧 Optimization Techniques Applied</h2>
        
        <div className="optimization-grid">
          <div className="optimization-item">
            <div className="optimization-icon">🎨</div>
            <h3>Asset Replacement</h3>
            <p>Replaced complex PNG/GIF assets with simple geometric shapes drawn directly on canvas</p>
          </div>
          
          <div className="optimization-item">
            <div className="optimization-icon">⚡</div>
            <h3>Reduced Loading</h3>
            <p>Eliminated image loading delays by using procedural generation for all visual elements</p>
          </div>
          
          <div className="optimization-item">
            <div className="optimization-icon">💾</div>
            <h3>Memory Efficiency</h3>
            <p>Significantly reduced memory usage by removing large image assets from memory</p>
          </div>
          
          <div className="optimization-item">
            <div className="optimization-icon">🎯</div>
            <h3>Simplified Rendering</h3>
            <p>Streamlined rendering pipeline with basic shapes instead of complex sprite operations</p>
          </div>
          
          <div className="optimization-item">
            <div className="optimization-icon">🌊</div>
            <h3>Animated Effects</h3>
            <p>Maintained visual appeal with mathematical animations for water, lava, and crystals</p>
          </div>
          
          <div className="optimization-item">
            <div className="optimization-icon">📱</div>
            <h3>Better Compatibility</h3>
            <p>Improved performance on lower-end devices and slower internet connections</p>
          </div>
        </div>
      </div>

      <div className="technical-details">
        <h2>🛠️ Technical Implementation</h2>
        
        <div className="tech-comparison">
          <div className="tech-column">
            <h3>Original Approach</h3>
            <ul>
              <li>Multiple image asset loading</li>
              <li>Complex sprite sheet handling</li>
              <li>GIF animation processing</li>
              <li>Tileset-based terrain rendering</li>
              <li>Asset dependency management</li>
            </ul>
          </div>
          
          <div className="tech-column">
            <h3>Optimized Approach</h3>
            <ul>
              <li>Pure canvas drawing operations</li>
              <li>Mathematical shape generation</li>
              <li>Procedural animation calculations</li>
              <li>Color-based terrain identification</li>
              <li>Zero external asset dependencies</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="recommendation">
        <h2>💡 Recommendation</h2>
        <p>
          For production games, consider starting with the <strong>optimized version</strong> for:
        </p>
        <ul>
          <li>🚀 Faster initial loading times</li>
          <li>📱 Better mobile device performance</li>
          <li>🌐 Reduced bandwidth usage</li>
          <li>🔧 Easier maintenance and updates</li>
        </ul>
        <p>
          Add detailed assets later as progressive enhancements when performance allows.
        </p>
      </div>
    </div>
  );
};

export default GameComparison;