import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GuestForm = () => {
  const [guestName, setGuestName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get invitation ID from URL parameter
  const searchParams = new URLSearchParams(location.search);
  const invitationId = searchParams.get('id');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    
    // Generate the personalized invitation link
    const encodedName = encodeURIComponent(guestName);
    const personalLink = `${window.location.origin}/inv/${invitationId}?to=${encodedName}`;
    setGeneratedLink(personalLink);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      alert('Link berhasil disalin!');
    } catch (err) {
      alert('Gagal menyalin link');
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Undangan Digital',
          text: 'Silakan buka undangan digital Anda',
          url: generatedLink
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  const testLink = () => {
    window.open(generatedLink, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Buat Link Undangan Personal
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Tamu Undangan
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Masukkan nama tamu..."
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition duration-200"
          >
            Buat Link Undangan
          </button>
        </form>

        {generatedLink && (
          <div className="mt-6 space-y-4">
            <div className="p-3 bg-gray-50 rounded-md break-all">
              <p className="text-sm text-gray-600">Link Undangan Personal:</p>
              <p className="text-sm font-medium text-gray-800">{generatedLink}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={copyToClipboard}
                className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition duration-200 text-sm"
              >
                Salin Link
              </button>
              <button
                onClick={shareLink}
                className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition duration-200 text-sm"
              >
                Bagikan Link
              </button>
              <button
                onClick={testLink}
                className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition duration-200 text-sm"
              >
                Tes Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestForm;
