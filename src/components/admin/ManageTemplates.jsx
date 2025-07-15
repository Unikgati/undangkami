import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlusCircle, Pencil, Trash2, Copy, FileText, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const ManageTemplates = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [templates, setTemplates] = useState([]);
    const [deletingId, setDeletingId] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleAction = (action) => {
        if (action === 'Buat Template Baru') {
            navigate('/admin/templates/builder');
        } else {
            toast({
                title: "🚧 Fitur Belum Tersedia",
                description: `Fitur "${action}" belum diimplementasikan. 🚀`,
            });
        }
    };

    useEffect(() => {
        const fetchTemplates = async () => {
            setLoading(true);
            try {
                const { getApp } = await import('firebase/app');
                const { getFirestore, collection, getDocs } = await import('firebase/firestore');
                const db = getFirestore(getApp());
                const querySnapshot = await getDocs(collection(db, 'templates'));
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTemplates(data);
            } catch (err) {
                toast({
                    title: 'Gagal mengambil data',
                    description: err.message || String(err),
                });
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-sans font-bold text-white">Kelola Template</h1>
                <Button onClick={() => handleAction('Buat Template Baru')} className="bg-white text-black hover:bg-gray-200">
                    <PlusCircle className="mr-2 h-4 w-4" /> Buat Template Baru
                </Button>
            </div>
            <Card className="glass-effect border-none text-white shadow-lg">
                <CardHeader>
                    <CardTitle>Daftar Template</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-gray-300">Memuat data template...</p>
                    ) : templates.length === 0 ? (
                        <p className="text-gray-300">Belum ada template yang tersimpan.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                            {templates.map(template => (
                                <div
                                    key={template.id}
                                    className="glass-effect bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-white/10 backdrop-blur-md rounded-2xl px-3 py-6 flex flex-col items-center gap-2 border border-purple-300 shadow-lg hover:scale-[1.03] hover:shadow-2xl transition-all duration-200 cursor-pointer mx-auto"
                                    style={{ minWidth: '220px', maxWidth: '260px', minHeight: '340px' }}
                                >
                                    <div className="w-40 aspect-square mb-3 rounded-xl border border-purple-400 overflow-hidden bg-gray-100 flex items-center justify-center">
                                        {template.thumbnail ? (
                                            <img
                                                src={template.thumbnail}
                                                alt={template.name}
                                                className="w-full h-full object-cover"
                                                style={{ aspectRatio: '1/1', display: 'block' }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs bg-gray-200">No Image</div>
                                        )}
                                    </div>
                                    <div className="font-bold text-lg text-white text-center line-clamp-2 break-words drop-shadow-lg">{template.name}</div>
                                    <div className="text-xs text-blue-200 text-center">Kategori: <span className="font-semibold text-blue-100">{template.category}</span></div>
                                    <div className="text-xs text-green-200 text-center">Harga: <span className="font-semibold text-green-100">Rp {template.price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</span></div>
                                    {template.discount && Number(template.discount) > 0 && (
                                        <div className="text-xs text-yellow-200 text-center">Diskon: {template.discount}%</div>
                                    )}
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            title="Edit"
                                            className="p-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white shadow flex items-center justify-center"
                                            onClick={() => navigate('/admin/templates/builder', { state: { templateId: template.id } })}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            title="Hapus"
                                            className={`p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow flex items-center justify-center ${deletingId === template.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={deletingId === template.id}
                                            onClick={async () => {
                                                if (deletingId) return;
                                                if (!window.confirm('Yakin ingin menghapus template ini?')) return;
                                                setDeletingId(template.id);
                                                try {
                                                    // Hapus gambar dari Cloudinary jika ada
                                                    if (template.thumbnailCloudinaryId) {
                                                        await fetch('/api/delete-logo', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ public_id: template.thumbnailCloudinaryId })
                                                        });
                                                    }
                                                    // Hapus dokumen dari Firestore
                                                    const { getApp } = await import('firebase/app');
                                                    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
                                                    const db = getFirestore(getApp());
                                                    await deleteDoc(doc(db, 'templates', template.id));
                                                    setTemplates(prev => prev.filter(t => t.id !== template.id));
                                                    toast({ title: 'Berhasil dihapus', description: 'Template berhasil dihapus.' });
                                                } catch (err) {
                                                    toast({ title: 'Gagal menghapus', description: err.message || String(err) });
                                                } finally {
                                                    setDeletingId(null);
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            title="Duplikat"
                                            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow flex items-center justify-center"
                                            onClick={() => {/* TODO: handle duplicate */}}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <button
                                            title={template.status === 'publish' ? 'Published' : 'Draft'}
                                            className={`p-2 rounded-lg ${template.status === 'publish' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'} text-white shadow flex items-center justify-center`}
                                            onClick={() => {/* TODO: handle status toggle */}}
                                        >
                                            {template.status === 'publish' ? <CheckCircle2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ManageTemplates;