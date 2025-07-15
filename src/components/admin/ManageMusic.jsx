import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ManageMusic = () => {
    const [progress, setProgress] = React.useState(0);
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
                        // Simpan ke Firestore
                        const { getApp } = await import('firebase/app');
                        const { getFirestore, collection, addDoc } = await import('firebase/firestore');
                        const db = getFirestore(getApp());
                        await addDoc(collection(db, 'music'), {
                            name: form.name,
                            category: form.category,
                            url: result.secure_url,
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
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-sans font-bold text-white">Manajemen Musik</h1>
                <Button onClick={handleOpenModal} className="bg-white text-black hover:bg-gray-200">
                    <Upload className="mr-2 h-4 w-4" /> Upload Musik
                </Button>
            </div>
            <Card className="glass-effect border-none text-white shadow-lg">
                <CardHeader>
                    <CardTitle>Daftar Musik Latar</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-300">Daftar musik yang tersedia akan ditampilkan di sini. Anda dapat mengunggah file baru atau menghapus yang sudah ada.</p>
                </CardContent>
            </Card>

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

export default ManageMusic;