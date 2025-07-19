import React, { useState } from 'react';
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
import ReactDOM from 'react-dom';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';

// Sekarang menerima prop templates (array daftar template) dan musicList
const StepReview = ({ formData, templates = [], musicList = [] }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [invitationUrl, setInvitationUrl] = useState("");

  // Cari nama template berdasarkan id
  const selectedTemplate = templates.find(
    t => t.id?.toString() === (formData?.templateId?.toString() || formData?.template?.toString())
  );
  // Cari musik pilihan berdasarkan id
  const selectedMusic = musicList.find(
    m => m.id?.toString() === formData?.selectedMusicId?.toString()
  );

  // Fungsi untuk generate slug dari nama panggilan mempelai
  function generateSlug(groom, bride) {
    const slugify = str => (str || "").toString().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `${slugify(groom)}-${slugify(bride)}`;
  }

  // Fungsi replace placeholder {{key}} dengan data
  function fillTemplatePlaceholders(html, data) {
    // Handle blok each untuk weddingGifts
    html = html.replace(/{{#each weddingGifts}}([\s\S]*?){{\/each}}/g, (_, inner) => {
      if (!Array.isArray(data.weddingGifts)) return '';
      return data.weddingGifts.map(gift => {
        return inner.replace(/{{(.*?)}}/g, (_, key) => gift[key.trim()] || '');
      }).join('');
    });
    // Handle placeholder biasa
    return html.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] || '');
  }

  // Handler submit yang sudah include inject dan upload ke storage
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setSuccess(false);
    setError(null);
    setInvitationUrl("");
    try {
      // Generate slug
      const slug = generateSlug(formData.groomNickName || formData.groomFullName, formData.brideNickName || formData.brideFullName);

      // Siapkan data undangan
      const html = selectedTemplate?.html || (selectedTemplate?.code && selectedTemplate.code.html) || '';
      const css = selectedTemplate?.css || (selectedTemplate?.code && selectedTemplate.code.css) || '';
      const js = selectedTemplate?.js || (selectedTemplate?.code && selectedTemplate.code.js) || '';
      const data = { ...formData };
      if (selectedMusic && selectedMusic.url) data.musicUrl = selectedMusic.url;
      const controlScript = `\n<script>\nwindow.addEventListener('message', function(e) {\n  if (!window.document.getElementById('wedding-music')) return;\n  if (e.data === 'play-audio') {\n    window.document.getElementById('wedding-music').play();\n  } else if (e.data === 'pause-audio') {\n    window.document.getElementById('wedding-music').pause();\n  }\n});\n<\/script>`;
      const filledHtml = fillTemplatePlaceholders(html, data);
      const finalHtml = `<style>${css}</style>\n${filledHtml}\n<script>${js}<\/script>${controlScript}`;

      // Simpan undangan ke Firestore (koleksi 'invitations')
      await addDoc(collection(db, 'invitations'), {
        ...formData,
        slug,
        html: finalHtml,
        templateId: selectedTemplate?.id || formData?.templateId || formData?.template,
        createdAt: new Date().toISOString(),
        status: 'active',
      });

      // Tampilkan link undangan di modal sukses
      setInvitationUrl(`/inv/${slug}`);
      setSuccess(true);
    } catch (err) {
      setError('Gagal menyimpan data undangan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Komponen Modal dengan React Portal
  const Modal = ({ open, onClose, title, children }) => {
    if (!open) return null;
    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="relative bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 border-2 border-purple-400 rounded-2xl shadow-2xl p-7 max-w-sm w-full animate-fadeIn">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-purple-200 hover:text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-full transition"
            aria-label="Tutup"
            tabIndex={0}
          >
            ×
          </button>
          {title && <h3 className="text-xl font-bold mb-3 text-center text-white drop-shadow">{title}</h3>}
          <div className="text-center text-white text-base font-medium">{children}</div>
        </div>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn { animation: fadeIn 0.2s ease; }
        `}</style>
      </div>,
      document.body
    );
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">

      {/* 1. Template yang dipilih */}
      <div className="bg-white/10 rounded-lg p-4">
        <h4 className="font-semibold text-white mb-2">Template yang Dipilih</h4>
        <div className="text-white">{selectedTemplate?.name || formData?.template || formData?.templateId || '-'}</div>
      </div>

      {/* 2. Nama mempelai */}
      <div className="bg-white/10 rounded-lg p-4">
        <h4 className="font-semibold text-white mb-2">Nama Mempelai</h4>
        <div className="text-white">{formData?.groomFullName || '-'} &amp; {formData?.brideFullName || '-'}</div>
      </div>

      {/* 3. Jadwal & lokasi */}
      <div className="bg-white/10 rounded-lg p-4">
        <h4 className="font-semibold text-white mb-2">Jadwal &amp; Lokasi</h4>
        {/* Akad */}
        <div className="mb-4">
          <span className="font-medium text-purple-300">Akad Nikah</span>
          <ul className="text-white ml-2 mt-1">
            <li><span className="font-medium">Tanggal:</span> {formData?.akadDate || '-'}</li>
            <li><span className="font-medium">Jam:</span> {formData?.akadTime || '-'}</li>
            <li><span className="font-medium">Zona Waktu:</span> {formData?.akadTimezone || '-'}</li>
            <li><span className="font-medium">Lokasi:</span> {formData?.akadLocation || '-'}</li>
            {formData?.akadMaps && (
              <li><span className="font-medium">Maps:</span> <a href={formData.akadMaps} target="_blank" rel="noopener noreferrer" className="underline text-blue-300">Lihat di Google Maps</a></li>
            )}
          </ul>
        </div>
        {/* Resepsi */}
        <div>
          <span className="font-medium text-purple-300">Resepsi</span>
          <ul className="text-white ml-2 mt-1">
            <li><span className="font-medium">Tanggal:</span> {formData?.resepsiDate || '-'}</li>
            <li><span className="font-medium">Jam:</span> {formData?.resepsiTime || '-'}</li>
            <li><span className="font-medium">Zona Waktu:</span> {formData?.resepsiTimezone || '-'}</li>
            <li><span className="font-medium">Lokasi:</span> {formData?.resepsiLocation || '-'}</li>
            {formData?.resepsiMaps && (
              <li><span className="font-medium">Maps:</span> <a href={formData.resepsiMaps} target="_blank" rel="noopener noreferrer" className="underline text-blue-300">Lihat di Google Maps</a></li>
            )}
          </ul>
        </div>
      </div>

      {/* 4. Musik pilihan */}
      <div className="bg-white/10 rounded-lg p-4">
        <h4 className="font-semibold text-white mb-2">Musik Pilihan</h4>
        <div className="text-white">
          {selectedMusic
            ? `${selectedMusic.title}${selectedMusic.artist ? ' - ' + selectedMusic.artist : ''}`
            : formData?.musicTitle
              ? `${formData.musicTitle}${formData.musicArtist ? ' - ' + formData.musicArtist : ''}`
              : formData?.selectedMusicName
                ? formData.selectedMusicName
                : formData?.selectedMusicId
                  ? `ID: ${formData.selectedMusicId}`
                  : '-' }
        </div>
      </div>

      {/* 5. Wedding Gift */}
      <div className="bg-white/10 rounded-lg p-4">
        <h4 className="font-semibold text-white mb-2">Wedding Gift</h4>
        {(formData?.weddingGifts && formData.weddingGifts.length > 0) ? (
          <ul className="text-white space-y-2">
            {formData.weddingGifts.map((gift, idx) => (
              <li key={idx} className="border-b border-white/10 pb-2 last:border-b-0">
                <span className="font-medium">{gift.type === 'bank' ? 'Bank' : 'E-wallet'}:</span> {gift.name}<br />
                <span className="font-medium">No:</span> {gift.account}<br />
                <span className="font-medium">Atas Nama:</span> {gift.holder}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-white">-</div>
        )}
      </div>

      <div className="text-center space-y-2">
        <Button
          type="button"
          disabled={loading}
          onClick={handleSubmit}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-white text-black hover:bg-gray-200 w-full"
        >
          {loading ? 'Menyimpan...' : 'Submit'}
        </Button>
      </div>

      {/* Modal Sukses */}
      <Modal
        open={success}
        onClose={() => setSuccess(false)}
        title="Berhasil"
      >
        <div className="flex flex-col items-center mb-4">
          <span className="mb-2">
            {/* Ikon centang success SVG */}
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="22" fill="#22c55e" stroke="#bbf7d0" strokeWidth="4"/>
              <path d="M16 25.5L22 31L33 19" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <div className="text-white font-semibold drop-shadow text-lg mb-2">Data berhasil disimpan!</div>
          {invitationUrl && (
            <div className="text-center mt-2">
              <div className="text-white text-sm mb-1">Link undangan Anda:</div>
              <a href={invitationUrl} target="_blank" rel="noopener noreferrer" className="break-all text-blue-200 underline font-semibold">{window.location.origin}{invitationUrl}</a>
            </div>
          )}
        </div>
        <Button
          onClick={() => setSuccess(false)}
          className="w-full mt-2 bg-white text-purple-800 font-bold border-2 border-purple-400 hover:bg-purple-100 transition"
        >Tutup</Button>
      </Modal>

      {/* Modal Error */}
      <Modal
        open={!!error}
        onClose={() => setError(null)}
        title="Gagal"
      >
        <div className="text-red-300 font-semibold mb-4 drop-shadow">{error}</div>
        <Button
          onClick={() => setError(null)}
          className="w-full mt-2 bg-white text-purple-800 font-bold border-2 border-purple-400 hover:bg-purple-100 transition"
        >Tutup</Button>
      </Modal>
    </div>
  );
};

export default StepReview;
