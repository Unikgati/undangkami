import React from 'react';

const Watermark = () => (
  <div style={{
    position: 'fixed',
    zIndex: 99999,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    pointerEvents: 'none',
    paddingBottom: '20vh',
  }}>
    <span style={{
      fontSize: 'clamp(1.1rem,3vw,2.2rem)',
      fontWeight: 700,
      color: '#000',
      background: 'rgba(255,255,255,0.6)',
      borderRadius: 6,
      opacity: 0.22,
      textAlign: 'center',
      userSelect: 'none',
      letterSpacing: 1,
      padding: '1px 10px',
    }}>Hanya Preview</span>
    <span style={{
      marginTop: 8,
      fontSize: 'clamp(0.7rem,1.5vw,0.95rem)',
      fontWeight: 400,
      color: '#000',
      opacity: 0.28,
      textAlign: 'center',
      userSelect: 'none',
      background: 'rgba(255,255,255,0.6)',
      borderRadius: 6,
      padding: '1px 10px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      maxWidth: '90vw',
      lineHeight: 1.2,
      letterSpacing: 0.05,
    }}>
      Lakukan pembayaran untuk menghilangkan watermark.
    </span>
  </div>
);

export default Watermark;
