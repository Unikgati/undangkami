import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ManageMusic = () => {
    const [deletingId, setDeletingId] = React.useState(null);
    const [confirmDelete, setConfirmDelete] = React.useState({ show: false, music: null });
    const [progress, setProgress] = React.useState(0);
    const [musicList, setMusicList] = React.useState([]);
    const [musicLoading, setMusicLoading] = React.useState(true);
    const categories = [
        { value: 'ayat', label: "Ayat Al-Qur'an" },
        { value: 'nasyid', label: 'Nasyid' },
    ];
    const [showCategory, setShowCategory] = React.useState(false);
    const categoryRef = React.useRef(null);
    React.useEffect(() => {
        function handleClickOutside(e) {
            if (categoryRef.current && !categoryRef.current.contains(e.target)) {
                setShowCategory(false);
            }
        }
        if (showCategory) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showCategory]);
    const { toast } = useToast();
    const [showModal, setShowModal] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [form, setForm] = React.useState({
        name: '',
        category: '',
        file: null,
    });

    // Ambil data musik dari Firestore
    React.useEffect(() => {
        let unsub;
        (async () => {
            setMusicLoading(true);
            const { getApp } = await import('firebase/app');
            const { getFirestore, collection, onSnapshot, query, orderBy } = await import('firebase/firestore');
            const db = getFirestore(getApp());
            const q = query(collection(db, 'music'), orderBy('createdAt', 'desc'));
            unsub = onSnapshot(q, (snap) => {
                setMusicList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setMusicLoading(false);
            });
        })();
        return () => unsub && unsub();
    }, []);

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => {
        setShowModal(false);
        setForm({ name: '', category: '', file: null });
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'file') {
            setForm(f => ({ ...f, file: files[0] }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.category || !form.file) {
            toast({ title: 'Lengkapi semua field', description: 'Nama lagu, kategori, dan file musik wajib diisi.' });
            return;
        }
        setLoading(true);
        setProgress(0);
        try {
            // Upload langsung ke Cloudinary unsigned preset
            const CLOUD_NAME = "dkfue0nxr"; // ganti dengan cloud name Anda
            const UPLOAD_PRESET = "unsigned_preset"; // ganti dengan unsigned preset Anda
            const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
            const data = new FormData();
            data.append('file', form.file);
            data.append('upload_preset', UPLOAD_PRESET);
            await new Promise((resolve, reject) => {
                const xhr = new window.XMLHttpRequest();
                xhr.open('POST', url);
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        setProgress(Math.round((e.loaded / e.total) * 100));
                    }
                };
                xhr.onload = async function () {
                    if (xhr.status === 200) {
                        const result = JSON.parse(xhr.responseText);
                        if (!result.secure_url) return reject(new Error('Upload gagal'));
                        // Simpan ke Firestore, tambahkan public_id
                        const { getApp } = await import('firebase/app');
                        const { getFirestore, collection, addDoc } = await import('firebase/firestore');
                        const db = getFirestore(getApp());
                        await addDoc(collection(db, 'music'), {
                            name: form.name,
                            category: form.category,
                            url: result.secure_url,
                            public_id: result.public_id,
                            createdAt: new Date(),
                        });
                        toast({ title: 'Berhasil!', description: 'Musik berhasil diunggah.' });
                        handleCloseModal();
                        resolve();
                    } else {
                        reject(new Error('Upload gagal'));
                    }
                };
                xhr.onerror = function () {
                    reject(new Error('Upload gagal'));
                };
                xhr.send(data);
            });
        } catch (err) {
            toast({ title: 'Gagal upload', description: err.message || 'Terjadi kesalahan.' });
        } finally {
            setLoading(false);
            setProgress(0);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-8">
                <h1 className="text-2xl font-semibold font-plusjakartasans text-white m-0 sm:text-lg md:text-2xl">Manajemen Musik</h1>
                <Button onClick={handleOpenModal} className="bg-white text-black hover:bg-gray-200 w-full sm:w-auto">
                    <Upload className="mr-2 h-4 w-4" /> Upload Musik
                </Button>
            </div>
            <Card className="glass-effect border-none text-white shadow-lg">
                
                <CardContent className="mt-4">
                    {musicLoading ? (
                        <div className="text-gray-300">Memuat daftar musik...</div>
                    ) : musicList.length === 0 ? (
                        <div className="text-gray-400">Belum ada musik yang diunggah.</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 mt-2 w-full">
                            {musicList.map((music) => (
                                <MusicPlayerCard
                                    key={music.id}
                                    music={music}
                                    categories={categories}
                                    onDelete={() => setConfirmDelete({ show: true, music })}
                                    deletingId={deletingId}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal konfirmasi hapus musik */}
            {confirmDelete.show && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl shadow-2xl p-7 min-w-[300px] max-w-[90vw] border-2 border-red-300">
                        <div className="flex flex-col items-center gap-3">
                            <svg width="40" height="40" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f87171"/><path d="M15 9l-6 6M9 9l6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            <div className="text-lg font-semibold text-red-700 text-center">Hapus musik <span className="font-bold">{confirmDelete.music?.name}</span>?</div>
                            <div className="flex gap-3 mt-2">
                                <button
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-700 to-blue-700 text-white font-bold hover:from-purple-800 hover:to-blue-800 shadow"
                                    onClick={async () => {
                                        setDeletingId(confirmDelete.music.id);
                                        setConfirmDelete({ show: false, music: null });
                                        try {
                                            // Hapus file dari Cloudinary via serverless function
                                            if (confirmDelete.music.public_id) {
                                                const res = await fetch('/api/delete-music', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ public_id: confirmDelete.music.public_id })
                                                });
                                                const result = await res.json();
                                                if (!result.success) {
                                                    toast({ title: 'Gagal hapus Cloudinary', description: result.error || JSON.stringify(result) });
                                                }
                                            }
                                            // Hapus dokumen dari Firestore
                                            const { getApp } = await import('firebase/app');
                                            const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
                                            const db = getFirestore(getApp());
                                            await deleteDoc(doc(db, 'music', confirmDelete.music.id));
                                            setMusicList(prev => prev.filter(m => m.id !== confirmDelete.music.id));
                                            toast({ title: 'Berhasil dihapus', description: 'Musik berhasil dihapus.' });
                                        } catch (err) {
                                            toast({ title: 'Gagal menghapus', description: err.message || String(err) });
                                        } finally {
                                            setDeletingId(null);
                                        }
                                    }}
                                >Ya, Hapus</button>
                                <button
                                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 shadow"
                                    onClick={() => setConfirmDelete({ show: false, music: null })}
                                >Batal</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Upload Musik - style seragam */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-100 border-2 border-blue-200 shadow-2xl rounded-2xl p-0 min-w-[340px] max-w-[95vw] w-full md:w-[420px] animate-fadeIn">
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-7">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-xl font-bold text-blue-800 tracking-tight">Upload Musik Baru</h2>
                                <button type="button" onClick={handleCloseModal} className="rounded-full p-1.5 transition bg-gray-100 hover:bg-purple-100 border border-transparent hover:border-purple-400 text-gray-400 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-blue-700 mb-1">File Musik</label>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    name="file"
                                    onChange={handleChange}
                                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300"
                                    required
                                />
                                {form.file && (
                                    <div className="mt-2 text-xs text-blue-700 font-semibold">{form.file.name}</div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-blue-700 mb-1">Nama Lagu</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400"
                                    placeholder="Masukkan nama lagu"
                                    required
                                />
                            </div>
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
                                    <span>{categories.find(c => c.value === form.category)?.label || 'Pilih kategori'}</span>
                                    <svg className={`w-4 h-4 ml-2 transition-transform ${showCategory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {showCategory && (
                                    <ul className="absolute left-0 right-0 mt-2 bg-white border-2 border-blue-200 rounded-lg shadow-lg z-50 animate-fadeIn overflow-hidden">
                                        {categories.map((cat) => (
                                            <li
                                                key={cat.value}
                                                className={`px-4 py-2 cursor-pointer hover:bg-purple-100 text-gray-900 ${form.category === cat.value ? 'bg-purple-50 font-bold text-purple-700' : ''}`}
                                                onClick={() => {
                                                    setForm(f => ({ ...f, category: cat.value }));
                                                    setShowCategory(false);
                                                }}
                                                tabIndex={0}
                                                role="option"
                                                aria-selected={form.category === cat.value}
                                            >
                                                {cat.label}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <button type="submit" className="bg-gradient-to-r from-purple-700 to-blue-700 text-white font-bold hover:from-purple-800 hover:to-blue-800 w-full mt-2 py-2 rounded-lg shadow-lg transition-all text-base tracking-wide" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
                            {loading && (
                                <div className="w-full h-2 bg-blue-100 rounded-lg overflow-hidden mt-2">
                                    <div className="h-full bg-gradient-to-r from-purple-400 to-blue-500 animate-pulse" style={{ width: `${progress}%`, transition: 'width 0.2s' }} />
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

// Komponen custom audio player card
const MusicPlayerCard = ({ music, categories, onDelete, deletingId }) => {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const audioRef = React.useRef(null);

    // Format waktu mm:ss
    const formatTime = (sec) => {
        if (!sec || isNaN(sec)) return '00:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Play/pause handler
    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    };

    // Update time
    React.useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const update = () => setCurrentTime(audio.currentTime);
        const setDur = () => setDuration(audio.duration);
        audio.addEventListener('timeupdate', update);
        audio.addEventListener('loadedmetadata', setDur);
        audio.addEventListener('ended', () => setIsPlaying(false));
        return () => {
            audio.removeEventListener('timeupdate', update);
            audio.removeEventListener('loadedmetadata', setDur);
            audio.removeEventListener('ended', () => setIsPlaying(false));
        };
    }, []);

    // Sync play state
    React.useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        return () => {
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
        };
    }, []);

    // Seek handler
    const handleSeek = (e) => {
        const audio = audioRef.current;
        if (!audio) return;
        const percent = Number(e.target.value);
        audio.currentTime = percent * duration / 100;
        setCurrentTime(audio.currentTime);
    };

    return (
        <div
            className="bg-transparent border border-purple-400 rounded-xl px-2 py-3 flex flex-col items-center gap-1.5 transition-all duration-200 cursor-pointer
            w-full max-w-xs sm:rounded-2xl sm:px-3 sm:py-6 sm:gap-2
            sm:bg-gradient-to-br sm:from-purple-900/40 sm:via-blue-900/30 sm:to-white/10 sm:backdrop-blur-md sm:border-purple-300 sm:shadow-lg sm:hover:scale-[1.03] sm:hover:shadow-2xl
            min-h-[180px] sm:min-h-[220px] lg:min-h-[240px]"
        >
            <div className="w-full flex justify-end mb-2">
                <button
                    title="Hapus"
                    className={`p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow flex items-center justify-center ${deletingId === music.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={deletingId === music.id}
                    onClick={() => {
                        if (deletingId) return;
                        onDelete();
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H8a2 2 0 01-2-2V6h12z" /></svg>
                </button>
            </div>
            <div className="font-bold text-[15px] sm:text-lg text-white text-center line-clamp-2 break-words drop-shadow-lg mb-1 sm:mb-2">{music.name}</div>
            <div className="text-xs text-blue-200 text-center">Kategori: <span className="font-semibold text-blue-100">{categories.find(c => c.value === music.category)?.label || music.category}</span></div>
            <div className="flex flex-col items-center justify-center w-full max-w-xs mt-2">
                <audio ref={audioRef} src={music.url} preload="metadata" className="hidden" />
                <div className="flex items-center gap-2 w-full mt-2">
                    <button
                        onClick={handlePlayPause}
                        className="p-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white shadow flex items-center justify-center"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><polygon points="6,4 20,12 6,20" /></svg>
                        )}
                    </button>
                    <input
                        type="range"
                        min={0}
                        max={100}
                        value={duration ? Math.round((currentTime / duration) * 100) : 0}
                        onChange={handleSeek}
                        className="w-full h-2 accent-purple-700 bg-blue-100 rounded-lg overflow-hidden"
                        style={{ accentColor: '#7c3aed' }}
                        aria-label="Seek"
                    />
                </div>
                <div className="flex justify-between w-full text-xs text-white font-semibold mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
};

export default ManageMusic;