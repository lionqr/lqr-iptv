
// Sound utilities for UI interactions
export const playSoundEffect = (type: 'navigate' | 'select' | 'back' | 'error' = 'navigate') => {
  // Create different audio contexts for different sound types
  const audioContext = new AudioContext();
  
  switch (type) {
    case 'navigate':
      // Soft navigation sound (when moving between items)
      playNavigationSound(audioContext);
      break;
    case 'select':
      // Selection sound (when selecting a channel or category)
      playSelectSound(audioContext);
      break;
    case 'back':
      // Back/cancel sound
      playBackSound(audioContext);
      break;
    case 'error':
      // Error sound
      playErrorSound(audioContext);
      break;
  }
};

// Soft navigation sound like FireTV stick
const playNavigationSound = (audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(1800, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(2000, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);
};

// Selection sound
const playSelectSound = (audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(1900, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(2200, audioContext.currentTime + 0.15);
  
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.15);
};

// Back/cancel sound
const playBackSound = (audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(2000, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1800, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);
};

// Error sound
const playErrorSound = (audioContext: AudioContext) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = 'sawtooth';
  oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
  
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.3);
};
