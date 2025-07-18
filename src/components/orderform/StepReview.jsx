import React from 'react';
import { Button } from '@/components/ui/button';

// Sekarang menerima prop templates (array daftar template) dan musicList
const StepReview = ({ formData, templates = [], musicList = [] }) => {
  // Debug: cek isi data
  console.log('StepReview formData:', formData);
  console.log('StepReview templates:', templates);
  console.log('StepReview musicList:', musicList);
  // Cari nama template berdasarkan id
  const selectedTemplate = templates.find(
    t => t.id?.toString() === (formData?.templateId?.toString() || formData?.template?.toString())
  );
  // Cari musik pilihan berdasarkan id
  const selectedMusic = musicList.find(
    m => m.id?.toString() === formData?.selectedMusicId?.toString()
  );
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

      <div className="text-center">
        <Button type="submit" size="lg" className="pulse-glow">Lihat Preview Undangan</Button>
      </div>
    </div>
  );
};

export default StepReview;
