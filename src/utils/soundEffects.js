// Sound effects utility using Web Audio API
// Generates procedural sound effects without requiring external audio files

class SoundEffects {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
  }

  // Initialize audio context (must be called after user interaction)
  async initialize() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  // Play a success sound (pleasant chime)
  playSuccess() {
    if (!this.initialized || !this.audioContext) {
      this.initialize().then(() => this.playSuccess());
      return;
    }

    try {
      const now = this.audioContext.currentTime;
      
      // Create oscillators for a pleasant chord
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 (C major chord)
      
      frequencies.forEach((freq, index) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, now);
        oscillator.type = 'sine';
        
        // Create a pleasant envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1 / frequencies.length, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        
        oscillator.start(now + index * 0.1);
        oscillator.stop(now + 0.8);
      });
    } catch (error) {
      console.warn('Failed to play success sound:', error);
    }
  }

  // Play a collect sound (higher pitched ding)
  playCollect() {
    if (!this.initialized || !this.audioContext) {
      this.initialize().then(() => this.playCollect());
      return;
    }

    try {
      const now = this.audioContext.currentTime;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(1046.5, now); // C6
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } catch (error) {
      console.warn('Failed to play collect sound:', error);
    }
  }

  // Play an error sound (lower pitched buzz)
  playError() {
    if (!this.initialized || !this.audioContext) {
      this.initialize().then(() => this.playError());
      return;
    }

    try {
      const now = this.audioContext.currentTime;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(220, now); // A3
      oscillator.type = 'sawtooth';
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      
      oscillator.start(now);
      oscillator.stop(now + 0.5);
    } catch (error) {
      console.warn('Failed to play error sound:', error);
    }
  }

  // Play a menu hover sound (soft beep)
  playMenuHover() {
    if (!this.initialized || !this.audioContext) {
      this.initialize().then(() => this.playMenuHover());
      return;
    }

    try {
      const now = this.audioContext.currentTime;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, now); // G5
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.05, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      
      oscillator.start(now);
      oscillator.stop(now + 0.15);
    } catch (error) {
      console.warn('Failed to play menu hover sound:', error);
    }
  }

  // Play a menu click sound (crisp click)
  playMenuClick() {
    if (!this.initialized || !this.audioContext) {
      this.initialize().then(() => this.playMenuClick());
      return;
    }

    try {
      const now = this.audioContext.currentTime;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(1200, now); // D6
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      
      oscillator.start(now);
      oscillator.stop(now + 0.1);
    } catch (error) {
      console.warn('Failed to play menu click sound:', error);
    }
  }

  // Play a pause sound (descending tone)
  playPause() {
    if (!this.initialized || !this.audioContext) {
      this.initialize().then(() => this.playPause());
      return;
    }

    try {
      const now = this.audioContext.currentTime;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(600, now); // D5
      oscillator.frequency.exponentialRampToValueAtTime(300, now + 0.3); // D4
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } catch (error) {
      console.warn('Failed to play pause sound:', error);
    }
  }

  // Play a resume sound (ascending tone)
  playResume() {
    if (!this.initialized || !this.audioContext) {
      this.initialize().then(() => this.playResume());
      return;
    }

    try {
      const now = this.audioContext.currentTime;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(300, now); // D4
      oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.3); // D5
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      
      oscillator.start(now);
      oscillator.stop(now + 0.3);
    } catch (error) {
      console.warn('Failed to play resume sound:', error);
    }
  }

  // Play an attack sound (swoosh)
  playAttack() {
    if (!this.initialized || !this.audioContext) {
      this.initialize().then(() => this.playAttack());
      return;
    }
    try {
      const now = this.audioContext.currentTime;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(300, now);
      oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.12, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      oscillator.start(now);
      oscillator.stop(now + 0.22);
    } catch (error) {
      console.warn('Failed to play attack sound:', error);
    }
  }

  // Play a hit sound (thud)
  playHit() {
    if (!this.initialized || !this.audioContext) {
      this.initialize().then(() => this.playHit());
      return;
    }
    try {
      const now = this.audioContext.currentTime;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(140, now);
      oscillator.frequency.exponentialRampToValueAtTime(90, now + 0.12);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      oscillator.start(now);
      oscillator.stop(now + 0.16);
    } catch (error) {
      console.warn('Failed to play hit sound:', error);
    }
  }
}

// Create a singleton instance
export const soundEffects = new SoundEffects();

// Initialize on first user interaction
let initialized = false;
const initializeOnInteraction = () => {
  if (!initialized) {
    soundEffects.initialize();
    initialized = true;
    // Remove listeners after first initialization
    document.removeEventListener('click', initializeOnInteraction);
    document.removeEventListener('keydown', initializeOnInteraction);
  }
};

// Add event listeners for user interaction
document.addEventListener('click', initializeOnInteraction);
document.addEventListener('keydown', initializeOnInteraction);
