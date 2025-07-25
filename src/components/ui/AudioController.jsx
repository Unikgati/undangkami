import React from 'react';

const AudioController = ({ isPlaying, onToggle }) => (
  <div
    style={{
      position: 'fixed',
      bottom: typeof window !== 'undefined' && window.innerWidth < 768 ? 16 : 16,
      right: 16,
      zIndex: 100,
      background: 'rgba(255,255,255,0.92)',
      borderRadius: '9999px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      padding: '0.25rem 0.7rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.3rem',
      border: '1px solid #b76e79',
      minHeight: 32,
      minWidth: 32,
      transition: 'bottom 0.2s',
    }}
  >
    <button
      aria-label={isPlaying ? 'Pause music' : 'Play music'}
      onClick={onToggle}
      style={{
        background: 'none',
        border: 'none',
        outline: 'none',
        cursor: 'pointer',
        fontSize: 16,
        color: '#b76e79',
        display: 'flex',
        alignItems: 'center',
        padding: 0,
        margin: 0,
        height: 24,
        width: 24,
      }}
    >
      {isPlaying ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b76e79" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b76e79" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      )}
    </button>
    <span style={{ fontSize: 11, color: '#b76e79', fontWeight: 600, marginLeft: 2 }}>
      {isPlaying ? 'Pause' : 'Play'}
    </span>
  </div>
);

export default AudioController;
