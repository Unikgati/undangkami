import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const InvitationView = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);

  useEffect(() => {
    async function fetchInvitation() {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, 'invitations'), where('slug', '==', slug));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setInvitation(snapshot.docs[0].data());
        } else {
          setError('Undangan tidak ditemukan.');
        }
      } catch (err) {
        setError('Gagal mengambil data undangan.');
      } finally {
        setLoading(false);
      }
    }
    fetchInvitation();
  }, [slug]);

  useEffect(() => {
    if (!loading && !error && invitation) {
      setShowMusicModal(true);
    }
  }, [loading, error, invitation]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Memuat undangan...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>;
  if (!invitation) return null;

  return (
    <div className="w-full h-screen min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 flex items-center justify-center p-0 m-0">
      <iframe
        ref={iframeRef}
        title={invitation.slug || 'Undangan Digital'}
        srcDoc={invitation.html}
        className="w-full h-full min-h-screen border-none bg-white rounded-xl shadow-xl"
        style={{ width: '100vw', height: '100vh', border: 'none', background: 'white', borderRadius: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
        sandbox="allow-scripts allow-same-origin"
      />

      {/* Modal Konfirmasi Musik */}
      {showMusicModal && (
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
                onClick={() => {
                  setShowMusicModal(false);
                  setIsPlaying(true);
                  setTimeout(() => {
                    if (iframeRef.current) {
                      iframeRef.current.contentWindow.postMessage('play-audio', '*');
                    }
                  }, 200);
                }}
              >Putar</button>
              <button
                style={{
                  background: '#eee', color: '#b76e79', border: 'none', borderRadius: 8, padding: '0.5rem 1.2rem', fontWeight: 600, fontSize: 15, cursor: 'pointer',
                }}
                onClick={() => {
                  setShowMusicModal(false);
                  setIsPlaying(false);
                }}
              >Jangan</button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Audio Controller */}
      <div
        style={{
          position: 'fixed',
          bottom: typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 16,
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
          onClick={() => {
            if (!iframeRef.current) return;
            iframeRef.current.contentWindow.postMessage(
              isPlaying ? 'pause-audio' : 'play-audio',
              '*'
            );
            setIsPlaying((p) => !p);
          }}
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
    </div>
  );
};

export default InvitationView;
