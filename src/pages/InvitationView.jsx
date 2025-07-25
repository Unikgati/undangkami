import React, { useEffect, useState, useRef } from 'react';
import Watermark from '@/components/ui/Watermark';
import BayarButton from '@/components/ui/BayarButton';
import MusicModal from '@/components/ui/MusicModal';
import AudioController from '@/components/ui/AudioController';
import { useParams, useSearchParams } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const InvitationView = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const guestName = searchParams.get('to');
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [invitationId, setInvitationId] = useState(null);
  const [error, setError] = useState(null);
  const [csWhatsapp, setCsWhatsapp] = useState('');
  const iframeRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Ambil undangan dari invitations
        let q = query(collection(db, 'invitations'), where('slug', '==', slug));
        let snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setInvitation(snapshot.docs[0].data());
          setInvitationId(snapshot.docs[0].id);
        } else {
          // Jika tidak ada di invitations, cek di orders
          q = query(collection(db, 'orders'), where('slug', '==', slug));
          snapshot = await getDocs(q);
          if (!snapshot.empty) {
            setInvitation(snapshot.docs[0].data());
            setInvitationId(snapshot.docs[0].id);
          } else {
            setError('Undangan tidak ditemukan.');
          }
        }
        // Ambil nomor CS
        const qCS = query(collection(db, 'users'), where('role', '==', 'cs'));
        const snapCS = await getDocs(qCS);
        if (!snapCS.empty) {
          const csUser = snapCS.docs[0].data();
          setCsWhatsapp(csUser.whatsapp || '');
        } else {
          setCsWhatsapp('');
        }
      } catch (err) {
        setError('Gagal mengambil data undangan.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  useEffect(() => {
    if (!loading && !error && invitation) {
      setShowMusicModal(true);
    }
  }, [loading, error, invitation]);

if (loading) return (
  <div className="min-h-screen flex flex-col items-center justify-center w-full h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
    <div className="text-lg text-gray-200">Memuat undangan...</div>
  </div>
);
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>;

  // Watermark preview jika invitation.status !== 'active' (atau bisa juga selalu tampil jika diinginkan)
  const showWatermark = invitation && invitation.status !== 'active';

  // Fungsi untuk memproses template dan memasukkan nama tamu
  const processTemplate = (html, guestName) => {
    if (!html) return '';
    
    // Ganti konten elemen dengan id guest-name
    if (guestName) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const guestElement = doc.getElementById('guest-name');
      if (guestElement) {
        guestElement.textContent = guestName;
      }
      return doc.documentElement.outerHTML;
    }
    return html;
  };

  // Helper untuk format ke Rupiah
  function formatRupiah(angka) {
    if (angka === undefined || angka === null || isNaN(Number(angka))) return '';
    return 'Rp' + Number(angka).toLocaleString('id-ID');
  }

  // Hitung harga bayar sesuai Homepage.jsx
  let hargaBayar = null;
  if (invitation) {
    const price = Number(invitation.price) || 0;
    const discount = Number(invitation.discount) || 0;
    hargaBayar = price * (1 - discount / 100);
  }

  return (
    <div className="w-full h-screen min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 flex items-center justify-center p-0 m-0" style={{position:'relative'}}>
      <iframe
        ref={iframeRef}
        title={invitation.slug || 'Undangan Digital'}
        srcDoc={processTemplate(invitation.html, guestName)}
        className="w-full h-full min-h-screen border-none bg-white rounded-xl shadow-xl"
        style={{ width: '100vw', height: '100vh', border: 'none', background: 'white', borderRadius: '1rem', boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
        sandbox="allow-scripts allow-same-origin"
      />
      {/* Watermark & Tombol Bayar (hanya jika status preview) */}
      {showWatermark && (
        <>
          <Watermark />
          <BayarButton 
            hargaBayar={hargaBayar} 
            formatRupiah={formatRupiah} 
            namaPria={invitation?.groomFullName || ''}
            namaWanita={invitation?.brideFullName || invitation?.brideNickName || ''}
            csWhatsapp={csWhatsapp}
            invitationId={invitationId}
          />
        </>
      )}

      {/* Modal Konfirmasi Musik */}
      {showMusicModal && (
        <MusicModal
          onPlay={() => {
            setShowMusicModal(false);
            setIsPlaying(true);
            setTimeout(() => {
              if (iframeRef.current) {
                iframeRef.current.contentWindow.postMessage('play-audio', '*');
              }
            }, 200);
          }}
          onClose={() => {
            setShowMusicModal(false);
            setIsPlaying(false);
          }}
        />
      )}

      {/* Sticky Audio Controller */}
      <AudioController
        isPlaying={isPlaying}
        onToggle={() => {
          if (!iframeRef.current) return;
          iframeRef.current.contentWindow.postMessage(
            isPlaying ? 'pause-audio' : 'play-audio',
            '*'
          );
          setIsPlaying((p) => !p);
        }}
      />
    </div>
  );
};

export default InvitationView;