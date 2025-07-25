
import React, { useState, useEffect } from 'react';


// invitationId: ID dokumen undangan di Firestore (koleksi invitations)
const BayarButton = ({ hargaBayar, formatRupiah, namaPria, namaWanita, csWhatsapp, invitationId }) => {
  // Fungsi untuk memindahkan dokumen undangan ke orders
  const moveInvitationToOrders = async () => {
    if (!invitationId) return;
    try {
      const { getFirestore, doc, getDoc, setDoc, deleteDoc } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      const db = getFirestore(getApp());
      const invitationRef = doc(db, 'invitations', invitationId);
      const invitationSnap = await getDoc(invitationRef);
      if (!invitationSnap.exists()) return;
      const invitationData = invitationSnap.data();
      // Simpan ke orders dengan ID yang sama
      const orderRef = doc(db, 'orders', invitationId);
      await setDoc(orderRef, invitationData);
      // Hapus dari invitations
      await deleteDoc(invitationRef);
    } catch (err) {
      // Optional: tampilkan error ke user
      alert('Gagal memindahkan undangan ke orders. Silakan coba lagi.');
      throw err;
    }
  };
  const [showModal, setShowModal] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    let unsub;
    (async () => {
      const { getFirestore, collection, onSnapshot, query, orderBy } = await import('firebase/firestore');
      const { getApp } = await import('firebase/app');
      const db = getFirestore(getApp());
      const q = query(collection(db, 'payments'), orderBy('type', 'asc'));
      unsub = onSnapshot(q, (snap) => {
        setPayments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });
    })();
    return () => unsub && unsub();
  }, []);

  const handleConfirm = () => {
    setShowModal(false);
    alert('Konfirmasi pembayaran berhasil!');
  };

  return (
    <>
      {/* Tombol Bayar hanya muncul jika modal tidak tampil */}
      {!showModal && (
        <>
          <button
            onClick={() => setShowModal(true)}
            style={{
              position: 'fixed',
              zIndex: 100000,
              left: 16,
              bottom: 16,
              border: 'none',
              borderRadius: 9999,
              padding: '0.35rem 1.1rem',
              fontWeight: 700,
              fontSize: 14,
              boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'block',
            }}
            className="bayar-btn-mobile bg-gradient-to-r from-purple-700 to-blue-700 text-white"
          >{hargaBayar ? `Bayar ${formatRupiah(hargaBayar)}` : 'Bayar'}</button>
          <button
            onClick={() => setShowModal(true)}
            style={{
              position: 'fixed',
              zIndex: 100000,
              right: 32,
              top: 24,
              border: 'none',
              borderRadius: 9999,
              padding: '0.35rem 1.1rem',
              fontWeight: 700,
              fontSize: 14,
              boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'none',
            }}
            className="bayar-btn-desktop bg-gradient-to-r from-purple-700 to-blue-700 text-white"
          >{hargaBayar ? `Bayar ${formatRupiah(hargaBayar)}` : 'Bayar'}</button>
          <style>{`
            @media (min-width: 768px) {
              .bayar-btn-mobile { display: none !important; }
              .bayar-btn-desktop { display: block !important; }
            }
            @media (max-width: 767px) {
              .bayar-btn-mobile { display: block !important; }
              .bayar-btn-desktop { display: none !important; }
            }
          `}</style>
        </>
      )}

      {/* Modal Pembayaran */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeInModal">
          <div
            className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-2xl shadow-2xl border border-blue-200 relative overflow-hidden modal-bayar-responsive"
            style={{ boxShadow: '0 8px 32px rgba(60,60,180,0.13)', width: '100%', maxWidth: '360px', minWidth: '0', margin: '0 12px' }}
          >
            <button
              onClick={() => setShowModal(false)}
              aria-label="Tutup"
              className="absolute top-2 right-2 text-blue-400 hover:text-blue-700 text-2xl font-bold transition focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{
                background: 'none',
                border: 'none',
                borderRadius: '50%',
                padding: '10px',
                outline: 'none',
                boxShadow: 'none',
                cursor: 'pointer',
                minWidth: '40px',
                minHeight: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
            >
              <span style={{ pointerEvents: 'none', fontSize: '1.7rem', lineHeight: 1 }}>×</span>
            </button>
            <div className="px-4 pt-6 pb-5 flex flex-col gap-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-blue-800 mb-1 text-center tracking-tight drop-shadow">Konfirmasi Pembayaran</h2>
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm sm:text-base font-semibold text-blue-700">Jumlah yang harus dibayarkan:</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-purple-900 mt-1 drop-shadow-sm">{formatRupiah(hargaBayar)}</div>
              </div>
              <hr className="my-2 border-blue-100" />
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-2">Pilih salah satu metode pembayaran:</label>
                {loading ? (
                  <div className="text-gray-400 text-center py-4">Memuat metode pembayaran...</div>
                ) : payments.length === 0 ? (
                  <div className="text-gray-400 text-center py-4">Belum ada metode pembayaran tersedia.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {payments.map((p) => (
                      <div
                        key={p.id}
                        className="border border-blue-200 rounded-xl p-3 sm:p-2 flex flex-col gap-0.5 bg-white shadow hover:shadow-lg transition duration-150 cursor-pointer hover:border-blue-400"
                        style={{ boxShadow: '0 2px 8px rgba(60,60,180,0.07)' }}
                      >
                        <div className="font-bold text-base sm:text-lg text-blue-900 mb-0.5">{p.type}</div>
                        <div className="flex items-center text-base sm:text-lg text-blue-700 font-semibold tracking-wide mb-0.5">
                          <span>{p.number}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(p.number);
                              setCopiedId(p.id);
                              setTimeout(() => setCopiedId(null), 1200);
                            }}
                            aria-label="Copy nomor"
                            className="ml-2 px-1 py-0.5 rounded hover:bg-blue-100 active:bg-blue-200 focus:outline-none"
                            style={{ lineHeight: 1, fontSize: '1rem', display: 'flex', alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer' }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="9" y="9" width="10" height="13" rx="2" stroke="#2563eb" strokeWidth="2"/><rect x="3" y="3" width="10" height="13" rx="2" stroke="#2563eb" strokeWidth="2"/></svg>
                          </button>
                          {copiedId === p.id && (
                            <span className="ml-2 text-xs text-green-600 font-semibold">Tersalin!</span>
                          )}
                        </div>
                        <div className="text-xs text-blue-500">a.n. <span className="font-semibold text-blue-700">{p.name}</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 text-xs sm:text-sm text-blue-700 font-semibold text-center bg-blue-50 rounded-lg py-2 px-2 sm:px-3 border border-blue-100">
                Setelah melakukan pembayaran, lakukan konfirmasi ke admin agar undangan Anda diaktifkan.
              </div>
              <a
                href={`https://wa.me/${csWhatsapp || '6285961462361'}?text=Halo%20admin,%20Saya%20atas%20nama%20${encodeURIComponent(namaPria || '')}%20dan%20${encodeURIComponent(namaWanita || '')}%20ingin%20konfirmasi%20pembayaran.%20Terima%20kasih.`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-700 text-white font-bold hover:from-green-600 hover:to-green-800 shadow text-center text-base sm:text-lg tracking-wide drop-shadow"
                onClick={(e) => {
                  setShowModal(false);
                  // Buka WhatsApp langsung agar tidak diblokir popup
                  const waUrl = `https://wa.me/${csWhatsapp || '6285961462361'}?text=Halo%20admin,%20Saya%20atas%20nama%20${encodeURIComponent(namaPria || '')}%20dan%20${encodeURIComponent(namaWanita || '')}%20ingin%20konfirmasi%20pembayaran.%20Terima%20kasih.`;
                  window.open(waUrl, '_blank', 'noopener,noreferrer');
                  // Jalankan proses pindah undangan ke orders di background
                  setTimeout(() => {
                    moveInvitationToOrders();
                  }, 100);
                  // Tidak perlu preventDefault agar fallback tetap jalan jika popup diblokir
                }}
                style={{ transition: 'all 0.18s' }}
              >
                Konfirmasi via WhatsApp
              </a>
            </div>
          </div>
          <style>{`
            @keyframes fadeInModal {
              from { opacity: 0; transform: scale(0.97); }
              to { opacity: 1; transform: scale(1); }
            }
            .animate-fadeInModal { animation: fadeInModal 0.22s cubic-bezier(.4,2,.3,1); }
            .modal-bayar-responsive {
              width: 100%;
              max-width: 360px;
              min-width: 0;
              margin: 0 12px;
              border-radius: 1.1rem;
              padding: 0;
            }
            @media (max-width: 600px) {
              .modal-bayar-responsive {
                max-width: 99vw !important;
                margin: 0 2vw !important;
                border-radius: 1.1rem !important;
              }
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default BayarButton;
