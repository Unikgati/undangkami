import React from 'react';

const MusicModal = ({ onPlay, onClose }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.45)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <div style={{
      background: 'white',
      borderRadius: 16,
      padding: '2rem 1.5rem',
      boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
      maxWidth: 320,
      textAlign: 'center',
    }}>
      <div style={{ fontWeight: 700, fontSize: 18, color: '#b76e79', marginBottom: 12 }}>Putar Musik?</div>
      <div style={{ color: '#444', fontSize: 15, marginBottom: 24 }}>Apakah Anda ingin memutar musik undangan saat dibuka?</div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button
          style={{
            background: '#b76e79', color: 'white', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 600, fontSize: 15, cursor: 'pointer',
          }}
          onClick={onPlay}
        >Putar</button>
        <button
          style={{
            background: '#eee', color: '#b76e79', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 600, fontSize: 15, cursor: 'pointer',
          }}
          onClick={onClose}
        >Jangan</button>
      </div>
    </div>
  </div>
);

export default MusicModal;
