import React, { useState, useEffect } from 'react';
import { globalBenchmark } from '../utils/performanceBenchmark';
import './PerformanceMonitor.css';

const PerformanceMonitor = ({ visible = false, position = 'top-right' }) => {
  const [metrics, setMetrics] = useState({});
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const updateMetrics = () => {
      const currentMetrics = globalBenchmark.getCurrentMetrics();
      setMetrics(currentMetrics);
    };

    // Update metrics every 500ms
    const interval = setInterval(updateMetrics, 500);
    
    // Set up performance issue callback
    globalBenchmark.setCallbacks({
      onPerformanceIssue: (issues) => {
        console.warn('Performance issues detected:', issues);
      }
    });

    return () => {
      clearInterval(interval);
    };
  }, [visible]);

  if (!visible) return null;

  const getStatusColor = (value, threshold, inverse = false) => {
    const isGood = inverse ? value < threshold : value > threshold;
    return isGood ? '#4CAF50' : value < threshold * 0.7 ? '#FF9800' : '#F44336';
  };

  return (
    <div className={`performance-monitor ${position}`}>
      <div className="performance-header" onClick={() => setShowDetails(!showDetails)}>
        <span className="performance-title">Performance</span>
        <span className="performance-toggle">{showDetails ? '−' : '+'}</span>
      </div>
      
      <div className="performance-summary">
        <div className="metric-item">
          <span className="metric-label">FPS:</span>
          <span 
            className="metric-value"
            style={{ color: getStatusColor(metrics.frameRate?.current || 0, 50) }}
          >
            {(metrics.frameRate?.current || 0).toFixed(1)}
          </span>
        </div>
        
        <div className="metric-item">
          <span className="metric-label">Frame:</span>
          <span 
            className="metric-value"
            style={{ color: getStatusColor(metrics.renderTime?.current || 0, 16.67, true) }}
          >
            {(metrics.renderTime?.current || 0).toFixed(1)}ms
          </span>
        </div>
        
        {metrics.memory?.used && (
          <div className="metric-item">
            <span className="metric-label">Memory:</span>
            <span 
              className="metric-value"
              style={{ color: getStatusColor(metrics.memory.used, 100, true) }}
            >
              {metrics.memory.used.toFixed(1)}MB
            </span>
          </div>
        )}
      </div>

      {showDetails && (
        <div className="performance-details">
          <div className="detail-section">
            <h4>Frame Rate</h4>
            <div className="detail-row">
              <span>Current: {(metrics.frameRate?.current || 0).toFixed(1)} FPS</span>
            </div>
            <div className="detail-row">
              <span>Average: {(metrics.frameRate?.average || 0).toFixed(1)} FPS</span>
            </div>
            <div className="detail-row">
              <span>Min: {(metrics.frameRate?.min || 0).toFixed(1)} FPS</span>
            </div>
            <div className="detail-row">
              <span>Max: {(metrics.frameRate?.max || 0).toFixed(1)} FPS</span>
            </div>
          </div>

          <div className="detail-section">
            <h4>Timing</h4>
            <div className="detail-row">
              <span>Render: {(metrics.renderTime?.current || 0).toFixed(2)}ms</span>
            </div>
            <div className="detail-row">
              <span>Update: {(metrics.updateTime?.current || 0).toFixed(2)}ms</span>
            </div>
            <div className="detail-row">
              <span>Render Avg: {(metrics.renderTime?.average || 0).toFixed(2)}ms</span>
            </div>
            <div className="detail-row">
              <span>Update Avg: {(metrics.updateTime?.average || 0).toFixed(2)}ms</span>
            </div>
          </div>

          {metrics.memory?.used && (
            <div className="detail-section">
              <h4>Memory</h4>
              <div className="detail-row">
                <span>Used: {metrics.memory.used.toFixed(1)}MB</span>
              </div>
              <div className="detail-row">
                <span>Total: {metrics.memory.total.toFixed(1)}MB</span>
              </div>
              {metrics.memory.limit && (
                <div className="detail-row">
                  <span>Limit: {metrics.memory.limit.toFixed(1)}MB</span>
                </div>
              )}
            </div>
          )}

          <div className="performance-actions">
            <button 
              className="action-button"
              onClick={() => {
                const report = globalBenchmark.generateReport();
                console.log('Performance Report:', report);
                alert('Performance report logged to console');
              }}
            >
              Generate Report
            </button>
            <button 
              className="action-button"
              onClick={() => {
                globalBenchmark.reset();
                alert('Performance metrics reset');
              }}
            >
              Reset Metrics
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;