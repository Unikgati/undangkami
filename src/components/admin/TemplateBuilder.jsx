
import React, { useState, useRef, useRef as useReactRef, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { getApp } from 'firebase/app';
import { getFirestore, collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Editor from '@monaco-editor/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Info, Save, X, Trash2, Loader2 } from 'lucide-react';


const LOCAL_STORAGE_KEY = 'templateBuilderCode';
const initialCode = (() => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { html: '', css: '', js: '' };
})();

const TemplateBuilder = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('html');
  const [code, setCode] = useState(initialCode);
  const [editorWidth, setEditorWidth] = useState(50); // persentase
  const [isDragging, setIsDragging] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    templateId: '', // Jika edit, isi dengan ID dokumen Firestore
    thumbnail: null, // File object (belum diupload)
    thumbnailUrl: '', // Preview URL lokal
    name: '',
    price: '',
    discount: '',
    category: '',
    thumbnailCloudinaryUrl: '', // URL Cloudinary (jika sudah pernah upload)
    thumbnailCloudinaryId: '', // public_id Cloudinary (untuk hapus jika diganti)
  });
  // Fetch template data if editing
  useEffect(() => {
    const templateId = location.state?.templateId;
    if (templateId) {
      // Only fetch if not already loaded
      if (!infoForm.templateId || infoForm.templateId !== templateId) {
        (async () => {
          try {
            const { getApp } = await import('firebase/app');
            const { getFirestore, doc, getDoc } = await import('firebase/firestore');
            const db = getFirestore(getApp());
            const ref = doc(db, 'templates', templateId);
            const snap = await getDoc(ref);
            if (snap.exists()) {
              const data = snap.data();
              setInfoForm(prev => ({
                ...prev,
                ...data,
                templateId: templateId,
                thumbnail: null,
                thumbnailUrl: data.thumbnail || '',
                thumbnailCloudinaryUrl: data.thumbnail || '',
                thumbnailCloudinaryId: data.thumbnailCloudinaryId || '',
              }));
              if (data.code) {
                setCode({
                  html: data.code.html || '',
                  css: data.code.css || '',
                  js: data.code.js || '',
                });
              }
            }
          } catch (err) {
            toast({
              title: 'Gagal mengambil data template',
              description: err.message || String(err),
            });
          }
        })();
      }
    }
  }, [location.state?.templateId]);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState({ show: false, type: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, onConfirm: null });
  const [showCategory, setShowCategory] = useState(false);
  const categoryRef = useReactRef(null);
  const categories = [
    { value: 'islamic', label: 'Islamic' },
    { value: 'modern', label: 'Modern' },
    { value: 'classic', label: 'Classic' },
    { value: 'simple', label: 'Simple' },
    { value: 'exclusive', label: 'Exclusive' },
  ];
  const [priceDisplay, setPriceDisplay] = useState('');
  const dragging = useRef(false);
  const navigate = useNavigate();

  const handleEditorChange = (value) => {
    const updated = { ...code, [activeTab]: value };
    setCode(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };
  // Clear localStorage on save/close if desired (optional, can remove if you want to persist always)
  const clearLocalStorage = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {}
  };

  const getPreviewContent = () => {
    return `
      <style>${code.css}</style>
      ${code.html}
      <script>${code.js}</script>
    `;
  };

  // Placeholder: upload file ke Cloudinary, return { url, public_id }
  const uploadToCloudinary = async (file) => {
    // Upload langsung ke Cloudinary pakai unsigned preset (lihat WebAppSettings.jsx)
    const CLOUD_NAME = "dkfue0nxr"; // Ganti dengan cloud name Anda
    const UPLOAD_PRESET = "unsigned_preset"; // Ganti dengan unsigned preset Anda
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    let res, data;
    try {
      res = await fetch(url, {
        method: 'POST',
        body: formData
      });
      data = await res.json();
    } catch (err) {
      console.error('Network error saat upload ke Cloudinary:', err);
      throw new Error('Network error saat upload ke Cloudinary');
    }
    if (data.secure_url && data.public_id) {
      return { url: data.secure_url, public_id: data.public_id };
    } else {
      console.error('Cloudinary response error:', data);
      throw new Error(data.error?.message || 'Upload thumbnail gagal');
    }
  };
  // Placeholder: hapus file dari Cloudinary pakai public_id
  const deleteFromCloudinary = async (publicId) => {
    // Panggil endpoint serverless untuk hapus gambar dari Cloudinary
    const res = await fetch('/api/delete-logo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: publicId })
    });
    let data = {};
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch (e) {
        // ignore parse error, treat as empty json
        data = {};
      }
    }
    if (res.ok && (data.success === undefined || data.success === true)) return true;
    throw new Error(data.error || 'Gagal menghapus thumbnail lama di Cloudinary');
  };
  // Placeholder: simpan data ke Firestore
  const saveToFirestore = async (templateData) => {
    // Jika ada templateId, update dokumen, jika tidak, tambah baru
    const db = getFirestore(getApp());
    if (templateData.templateId) {
      const ref = doc(db, 'templates', templateData.templateId);
      await setDoc(ref, templateData, { merge: true });
    } else {
      const ref = await addDoc(collection(db, 'templates'), templateData);
      templateData.templateId = ref.id;
      // Update dokumen dengan ID-nya sendiri agar bisa diedit di masa depan
      await setDoc(ref, templateData, { merge: true });
    }
    return true;
  };

  // ...existing code...
  const handleSave = async () => {
    // Validasi wajib isi
    if (!infoForm.name || !infoForm.price || !infoForm.category) {
      toast({
        title: 'Gagal menyimpan',
        description: 'Nama, harga, dan kategori template wajib diisi.',
        status: 'error',
        position: 'top-right',
      });
      return;
    }
    setSaving(true);
    try {
      let thumbnailUrl = infoForm.thumbnailCloudinaryUrl;
      let thumbnailCloudinaryId = infoForm.thumbnailCloudinaryId;
      // Jika ada file thumbnail baru (belum pernah upload atau diganti)
      if (infoForm.thumbnail) {
        // Hapus thumbnail lama jika ada
        if (thumbnailCloudinaryId) {
          try {
            await deleteFromCloudinary(thumbnailCloudinaryId);
          } catch (delErr) {
            console.error('Gagal menghapus thumbnail lama:', delErr);
          }
        }
        // Upload thumbnail baru
        try {
          const uploadRes = await uploadToCloudinary(infoForm.thumbnail);
          thumbnailUrl = uploadRes.url;
          thumbnailCloudinaryId = uploadRes.public_id;
        } catch (uploadErr) {
          console.error('Gagal upload thumbnail baru:', uploadErr);
          setModal({ show: true, type: 'error', message: 'Gagal upload thumbnail baru: ' + uploadErr.message });
          setSaving(false);
          return;
        }
      }
      // Siapkan data template
      const templateData = {
        templateId: infoForm.templateId,
        name: infoForm.name,
        price: infoForm.price,
        discount: infoForm.discount,
        category: infoForm.category,
        thumbnail: thumbnailUrl,
        thumbnailCloudinaryId,
        code: { ...code },
        createdAt: infoForm.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Tambahkan field lain sesuai kebutuhan
      };
      await saveToFirestore(templateData);
      setModal({ show: true, type: 'success', message: 'Template berhasil disimpan!' });
      clearLocalStorage();
      // Reset state infoForm jika ingin
      setInfoForm((prev) => ({ ...prev, ...templateData, thumbnail: null, thumbnailCloudinaryUrl: thumbnailUrl, thumbnailCloudinaryId }));
      // Update initialCode in memory so isDirty reflects the latest saved state
      initialCode.html = code.html;
      initialCode.css = code.css;
      initialCode.js = code.js;
    } catch (err) {
      console.error('Gagal menyimpan template:', err);
      setModal({ show: true, type: 'error', message: 'Gagal menyimpan template: ' + (err.message || err) });
    } finally {
      setSaving(false);
    }
  };

  // State untuk modal konfirmasi keluar
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Fungsi cek perubahan (dirty)
  const isDirty = () => {
    // Bandingkan dengan initialCode
    return code.html !== initialCode.html || code.css !== initialCode.css || code.js !== initialCode.js;
  };

  const handleClose = () => {
    if (isDirty()) {
      setShowExitConfirm(true);
    } else {
      clearLocalStorage();
      navigate('/admin/templates', { replace: true });
    }
  };

  const confirmExit = () => {
    clearLocalStorage();
    setShowExitConfirm(false);
    navigate('/admin/templates', { replace: true });
  };
  const cancelExit = () => {
    setShowExitConfirm(false);
  };
  const handleInfo = () => {
    setShowInfo(true);
  };

  const formatRibuan = (val) => {
    if (!val) return '';
    return val.toString().replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleInfoChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setInfoForm((prev) => ({ ...prev, thumbnail: file, thumbnailUrl: url }));
      }
    } else if (name === 'price') {
      // Only allow numbers
      const raw = value.replace(/\D/g, '');
      setPriceDisplay(formatRibuan(raw));
      setInfoForm((prev) => ({ ...prev, price: raw }));
    } else {
      setInfoForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Custom dropdown: close on click outside
  React.useEffect(() => {
    if (!showCategory) return;
    function handleClick(e) {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setShowCategory(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showCategory]);

  const handleInfoSubmit = (e) => {
    e.preventDefault();
    // Data hanya disimpan di state, tidak upload ke Cloudinary/Firestore
    setShowInfo(false);
  };

  // Drag handler
  const handleDrag = (e) => {
    if (!dragging.current) return;
    const x = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const screenW = window.innerWidth;
    let percent = (x / screenW) * 100;
    percent = Math.max(20, Math.min(80, percent));
    setEditorWidth(percent);
  };
  const handleDragStart = (e) => {
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);
  };
  const handleDragEnd = () => {
    dragging.current = false;
    setIsDragging(false);
  };

  React.useEffect(() => {
    const move = (e) => { if (dragging.current) handleDrag(e); };
    const up = () => handleDragEnd();
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, []);
  React.useEffect(() => {
    setPriceDisplay(formatRibuan(infoForm.price));
  }, [showInfo]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-gray-900 text-white flex flex-col md:flex-row gap-0 w-screen h-screen select-none">
        <div className="h-full" style={{ width: `${editorWidth}%` }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-0">
          <div className="flex items-center bg-gray-800 border-b border-gray-700">
            <TabsList>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="css">CSS</TabsTrigger>
              <TabsTrigger value="js">JavaScript</TabsTrigger>
            </TabsList>
            <div className="flex gap-2 ml-4">
              <button onClick={handleInfo} className="p-2 rounded hover:bg-blue-800 transition" title="Info Template">
                <Info className="w-5 h-5 text-blue-400" />
              </button>
              <button onClick={handleSave} className={`p-2 rounded hover:bg-purple-800 transition flex items-center justify-center`} title="Simpan" disabled={saving}>
                {saving ? (
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                ) : (
                  <Save className="w-5 h-5 text-purple-400" />
                )}
              </button>
      {/* Modal Notifikasi */}
      {/* Modal Konfirmasi keluar jika ada perubahan */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl p-7 min-w-[300px] max-w-[90vw] border-2 border-yellow-300">
            <div className="flex flex-col items-center gap-3">
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fde68a"/><path d="M12 8v4m0 4h.01" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div className="text-lg font-semibold text-yellow-700">Anda belum menyimpan perubahan. Keluar tanpa menyimpan?</div>
              <div className="flex gap-3 mt-2">
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-700 to-blue-700 text-white font-bold hover:from-purple-800 hover:to-blue-800 shadow" onClick={confirmExit}>Keluar</button>
                <button className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 shadow" onClick={cancelExit}>Batal</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {modal.show && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40">
          <div className={`bg-white rounded-xl shadow-2xl p-7 min-w-[300px] max-w-[90vw] border-2 ${modal.type === 'success' ? 'border-green-300' : 'border-red-300'}`}>
            <div className="flex flex-col items-center gap-3">
              {modal.type === 'success' ? (
                <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#4ade80"/><path d="M8 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f87171"/><path d="M15 9l-6 6M9 9l6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
              <div className={`text-lg font-semibold ${modal.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>{modal.message}</div>
              <button className="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-700 to-blue-700 text-white font-bold hover:from-purple-800 hover:to-blue-800 shadow" onClick={() => setModal({ show: false, type: '', message: '' })}>Tutup</button>
            </div>
          </div>
        </div>
      )}
              <button onClick={handleClose} className="p-2 rounded hover:bg-gray-800 transition" title="Close">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
          <TabsContent value="html">
            <Editor
              height="calc(100vh - 40px)"
              defaultLanguage="html"
              value={code.html}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: 'on' }}
            />
          </TabsContent>
          <TabsContent value="css">
            <Editor
              height="calc(100vh - 40px)"
              defaultLanguage="css"
              value={code.css}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: 'on' }}
            />
          </TabsContent>
          <TabsContent value="js">
            <Editor
              height="calc(100vh - 40px)"
              defaultLanguage="javascript"
              value={code.js}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: 'on' }}
            />
          </TabsContent>
        </Tabs>
      </div>
      {/* Modal Info Template */}
      {showInfo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-blue-50 via-white to-purple-100 border-2 border-blue-200 shadow-2xl rounded-2xl p-0 min-w-[340px] max-w-[95vw] w-full md:w-[420px] animate-fadeIn">
            <form onSubmit={handleInfoSubmit} className="flex flex-col gap-5 p-7">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-bold text-blue-800 tracking-tight">Info Template</h2>
                <button type="button" onClick={() => setShowInfo(false)} className="rounded-full p-1.5 transition bg-gray-100 hover:bg-purple-100 border border-transparent hover:border-purple-400 text-gray-400 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Thumbnail upload & preview + delete */}
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-1">Gambar Thumbnail</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    name="thumbnail"
                    onChange={handleInfoChange}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    disabled={!!infoForm.thumbnailCloudinaryId}
                  />
                  {infoForm.thumbnailUrl && (
                    <div className="relative">
                      <img src={infoForm.thumbnailUrl} alt="Thumbnail preview" className="w-16 h-16 object-cover rounded-lg border-2 border-purple-200 shadow" />
                      {infoForm.thumbnailCloudinaryId && (
                        <button
                          type="button"
                          title="Hapus thumbnail lama"
                          className="absolute -top-2 -right-2 bg-white border border-purple-200 rounded-full p-1 shadow hover:bg-red-100"
                          onClick={() => {
                            setConfirmModal({
                              show: true,
                              onConfirm: async () => {
                                try {
                                  await deleteFromCloudinary(infoForm.thumbnailCloudinaryId);
                                  setInfoForm((prev) => ({
                                    ...prev,
                                    thumbnailCloudinaryId: '',
                                    thumbnailCloudinaryUrl: '',
                                    thumbnail: null,
                                    thumbnailUrl: '',
                                  }));
                                  setModal({ show: true, type: 'success', message: 'Thumbnail lama berhasil dihapus. Silakan upload thumbnail baru.' });
                                } catch (err) {
                                  setModal({ show: true, type: 'error', message: 'Gagal menghapus thumbnail lama: ' + (err.message || err) });
                                } finally {
                                  setConfirmModal({ show: false, onConfirm: null });
                                }
                              }
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
      {/* Modal Konfirmasi Hapus Thumbnail */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl p-7 min-w-[300px] max-w-[90vw] border-2 border-red-300">
            <div className="flex flex-col items-center gap-3">
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f87171"/><path d="M15 9l-6 6M9 9l6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <div className="text-lg font-semibold text-red-700">Hapus thumbnail lama dari Cloudinary?</div>
              <div className="flex gap-3 mt-2">
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-700 to-blue-700 text-white font-bold hover:from-purple-800 hover:to-blue-800 shadow" onClick={() => { confirmModal.onConfirm && confirmModal.onConfirm(); }}>Ya, Hapus</button>
                <button className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 shadow" onClick={() => setConfirmModal({ show: false, onConfirm: null })}>Batal</button>
              </div>
            </div>
          </div>
        </div>
      )}
                    </div>
                  )}
                </div>
                {infoForm.thumbnailCloudinaryId && (
                  <p className="text-xs text-red-500 mt-1">Hapus thumbnail lama terlebih dahulu sebelum upload baru.</p>
                )}
              </div>
              {/* Nama template */}
              <div>
                <label className="block text-sm font-semibold text-blue-700 mb-1">Nama Template</label>
                <input
                  type="text"
                  name="name"
                  value={infoForm.name}
                  onChange={handleInfoChange}
                  className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400"
                  placeholder="Masukkan nama template"
                  required
                />
              </div>
              {/* Harga template & Diskon */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-blue-700 mb-1">Harga</label>
                  <input
                    type="text"
                    name="price"
                    inputMode="numeric"
                    autoComplete="off"
                    value={priceDisplay}
                    onChange={handleInfoChange}
                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400"
                    placeholder="0"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-blue-700 mb-1">Diskon (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={infoForm.discount}
                    onChange={handleInfoChange}
                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              {/* Kategori template - custom dropdown */}
              <div className="relative" ref={categoryRef}>
                <label className="block text-sm font-semibold text-blue-700 mb-1">Kategori</label>
                <button
                  type="button"
                  className={`w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white text-gray-900 font-medium flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-purple-400 transition ${showCategory ? 'ring-2 ring-purple-400' : ''}`}
                  onClick={() => setShowCategory((v) => !v)}
                  tabIndex={0}
                  aria-haspopup="listbox"
                  aria-expanded={showCategory}
                  required
                >
                  <span>{categories.find(c => c.value === infoForm.category)?.label || 'Pilih kategori'}</span>
                  <svg className={`w-4 h-4 ml-2 transition-transform ${showCategory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {showCategory && (
                  <ul className="absolute left-0 right-0 mt-2 bg-white border-2 border-blue-200 rounded-lg shadow-lg z-50 animate-fadeIn overflow-hidden">
                    {categories.map((cat) => (
                      <li
                        key={cat.value}
                        className={`px-4 py-2 cursor-pointer hover:bg-purple-100 text-gray-900 ${infoForm.category === cat.value ? 'bg-purple-50 font-bold text-purple-700' : ''}`}
                        onClick={() => {
                          setInfoForm((prev) => ({ ...prev, category: cat.value }));
                          setShowCategory(false);
                        }}
                        tabIndex={0}
                        role="option"
                        aria-selected={infoForm.category === cat.value}
                      >
                        {cat.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button type="submit" className="bg-gradient-to-r from-purple-700 to-blue-700 text-white font-bold hover:from-purple-800 hover:to-blue-800 w-full mt-2 py-2 rounded-lg shadow-lg transition-all text-base tracking-wide">Simpan Info</Button>
            </form>
          </div>
        </div>
      )}
      {/* Drag bar */}
      <div
        className={`w-0.5 h-full bg-gray-800 cursor-col-resize z-30 transition hover:bg-gray-500 ${isDragging ? 'bg-purple-900' : ''}`}
        style={{ touchAction: 'none', position: 'relative' }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        {/* Overlay saat drag untuk UX */}
        {isDragging && (
          <div className="fixed inset-0 z-40" style={{ cursor: 'col-resize' }} />
        )}
      </div>
      <div className="h-full" style={{ width: `${100 - editorWidth}%` }}>
        {/* Preview area full height */}
        <iframe
          title="preview"
          className="w-full h-full border-none"
          srcDoc={getPreviewContent()}
          sandbox="allow-scripts"
        />
      </div>
      </div>
    </>
  );
};

export default TemplateBuilder;