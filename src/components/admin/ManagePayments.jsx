import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ManagePayments = () => {
    const { toast } = useToast();
    const [showModal, setShowModal] = React.useState(false);
    const [form, setForm] = React.useState({
        type: '',
        number: '',
        name: '',
    });
    const [payments, setPayments] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [selectedPayment, setSelectedPayment] = React.useState(null);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [editForm, setEditForm] = React.useState({ type: '', number: '', name: '' });

    // Handler untuk edit
    const handleEdit = (payment) => {
        setEditForm({ type: payment.type, number: payment.number, name: payment.name });
        setSelectedPayment(payment);
        setShowEditModal(true);
    };

    // Handler perubahan input edit
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(f => ({ ...f, [name]: value }));
    };

    // Simpan perubahan edit
    const handleEditSave = async (e) => {
        e.preventDefault();
        if (!editForm.type || !editForm.number || !editForm.name) {
            toast({ title: 'Lengkapi semua field', description: 'Semua data wajib diisi.' });
            return;
        }
        try {
            const { getApp } = await import('firebase/app');
            const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
            const db = getFirestore(getApp());
            await updateDoc(doc(db, 'payments', selectedPayment.id), {
                type: editForm.type,
                number: editForm.number,
                name: editForm.name,
            });
            toast({ title: 'Berhasil diupdate', description: 'Rekening berhasil diupdate.' });
            setShowEditModal(false);
            setSelectedPayment(null);
        } catch (err) {
            toast({ title: 'Gagal update', description: err.message || String(err) });
        }
    };

    // Batal edit
    const handleEditCancel = () => {
        setShowEditModal(false);
        setSelectedPayment(null);
    };

    // Show modal instead of alert
    const handleDelete = (payment) => {
        setSelectedPayment(payment);
        setShowDeleteModal(true);
    };

    // Confirm delete
    const confirmDelete = async () => {
        if (!selectedPayment) return;
        try {
            const { getApp } = await import('firebase/app');
            const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
            const db = getFirestore(getApp());
            await deleteDoc(doc(db, 'payments', selectedPayment.id));
            toast({ title: 'Berhasil dihapus', description: 'Rekening berhasil dihapus.' });
        } catch (err) {
            toast({ title: 'Gagal menghapus', description: err.message || String(err) });
        }
        setShowDeleteModal(false);
        setSelectedPayment(null);
    };

    // Cancel delete
    const cancelDelete = () => {
        setShowDeleteModal(false);
        setSelectedPayment(null);
    };

    // Ambil data rekening dari Firestore
    React.useEffect(() => {
        let unsub;
        (async () => {
            setLoading(true);
            const { getApp } = await import('firebase/app');
            const { getFirestore, collection, onSnapshot, query, orderBy } = await import('firebase/firestore');
            const db = getFirestore(getApp());
            const q = query(collection(db, 'payments'), orderBy('type', 'asc'));
            unsub = onSnapshot(q, (snap) => {
                setPayments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoading(false);
            });
        })();
        return () => unsub && unsub();
    }, []);

    const handleOpenModal = () => setShowModal(true);
    const handleCloseModal = () => {
        setShowModal(false);
        setForm({ type: '', number: '', name: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.type || !form.number || !form.name) {
            toast({ title: 'Lengkapi semua field', description: 'Semua data wajib diisi.' });
            return;
        }
        try {
            const { getApp } = await import('firebase/app');
            const { getFirestore, collection, addDoc } = await import('firebase/firestore');
            const db = getFirestore(getApp());
            await addDoc(collection(db, 'payments'), {
                type: form.type,
                number: form.number,
                name: form.name,
                createdAt: new Date(),
            });
            toast({ title: 'Berhasil', description: 'Rekening berhasil disimpan.' });
            handleCloseModal();
        } catch (err) {
            toast({ title: 'Gagal menyimpan', description: err.message || String(err) });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-semibold font-plusjakartasans text-white sm:text-lg md:text-2xl">Pembayaran</h1>
                <Button onClick={handleOpenModal} className="bg-white text-black hover:bg-gray-200">
                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Rekening
                </Button>
            </div>
            <Card className="glass-effect border-none text-white shadow-lg">
                <CardContent className="mt-4">
                    {loading ? (
                        <div className="text-gray-300">Memuat daftar rekening...</div>
                    ) : payments.length === 0 ? (
                        <div className="text-gray-400">Belum ada rekening yang ditambahkan.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-2 w-full">
                            {payments.map((p) => (
                                <div
                                    key={p.id}
                                    className="bg-transparent border border-purple-400 rounded-2xl px-3 py-6 flex flex-col items-start gap-2 shadow-lg hover:scale-[1.03] hover:shadow-2xl transition-all duration-200 cursor-pointer w-full
                                    sm:w-auto sm:bg-gradient-to-br sm:from-purple-900/40 sm:via-blue-900/30 sm:to-white/10 sm:backdrop-blur-md sm:border-purple-300"
                                    style={{ minHeight: '100px' }}
                                >
                                    <div className="font-bold text-lg text-white text-left line-clamp-2 break-words drop-shadow-lg mb-2">{p.type}</div>
                                    <div className="text-base text-blue-100 text-left break-words font-semibold mb-1">{p.number}</div>
                                    <div className="text-xs text-blue-200 text-left">a.n. <span className="font-semibold text-blue-100">{p.name}</span></div>
                                    <div className="flex gap-2 mt-2">
                                        <button title="Edit" className="p-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white shadow flex items-center justify-center" onClick={() => handleEdit(p)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                                        </button>
                                        <button title="Hapus" className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow flex items-center justify-center" onClick={() => handleDelete(p)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal Konfirmasi Hapus */}
            {showDeleteModal && selectedPayment && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-7 min-w-[300px] max-w-[90vw] border-2 border-red-300">
                        <div className="flex flex-col items-center gap-3">
                            <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" fill="#f87171"></circle>
                                <path d="M15 9l-6 6M9 9l6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                            <div className="text-lg font-semibold text-red-700 text-center">
                                Hapus rekening <span className="font-bold">{selectedPayment.type}</span>?
                            </div>
                            <div className="flex gap-3 mt-2">
                                <button
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-700 to-blue-700 text-white font-bold hover:from-purple-800 hover:to-blue-800 shadow"
                                    onClick={confirmDelete}
                                >
                                    Ya, Hapus
                                </button>
                                <button
                                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 shadow"
                                    onClick={cancelDelete}
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Edit Rekening */}
            {showEditModal && selectedPayment && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-7 min-w-[340px] max-w-[95vw] border-2 border-blue-300">
                        <form onSubmit={handleEditSave} className="flex flex-col gap-5">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-xl font-bold text-blue-800 tracking-tight">Edit Rekening / E-Wallet</h2>
                                <button type="button" onClick={handleEditCancel} className="rounded-full p-1.5 transition bg-gray-100 hover:bg-purple-100 border border-transparent hover:border-purple-400 text-gray-400 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400">
                                    <span className="sr-only">Tutup</span>
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-blue-700 mb-1">Bank / E-Wallet</label>
                                <input
                                    type="text"
                                    name="type"
                                    value={editForm.type}
                                    onChange={handleEditChange}
                                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400"
                                    placeholder="Masukkan nama bank atau e-wallet"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-blue-700 mb-1">Nomor Rekening / E-Wallet</label>
                                <input
                                    type="text"
                                    name="number"
                                    value={editForm.number}
                                    onChange={handleEditChange}
                                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400"
                                    placeholder="Masukkan nomor rekening / e-wallet"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-blue-700 mb-1">Atas Nama</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editForm.name}
                                    onChange={handleEditChange}
                                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400"
                                    placeholder="Masukkan nama pemilik rekening / e-wallet"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 mt-2 justify-end">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 shadow"
                                    onClick={handleEditCancel}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-700 to-blue-700 text-white font-bold hover:from-purple-800 hover:to-blue-800 shadow"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal Tambah Rekening */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-100 border-2 border-blue-200 shadow-2xl rounded-2xl p-0 min-w-[340px] max-w-[95vw] w-full md:w-[420px] animate-fadeIn">
                        <form onSubmit={handleSave} className="flex flex-col gap-5 p-7">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-xl font-bold text-blue-800 tracking-tight">Tambah Rekening / E-Wallet</h2>
                                <button type="button" onClick={handleCloseModal} className="rounded-full p-1.5 transition bg-gray-100 hover:bg-purple-100 border border-transparent hover:border-purple-400 text-gray-400 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400">
                                    <span className="sr-only">Tutup</span>
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            {/* Input Bank/E-Wallet Manual */}
                            <div>
                                <label className="block text-sm font-semibold text-blue-700 mb-1">Bank / E-Wallet</label>
                                <input
                                    type="text"
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400"
                                    placeholder="Masukkan nama bank atau e-wallet"
                                    required
                                />
                            </div>
                            {/* Input Nomor Rekening / E-Wallet */}
                            <div>
                                <label className="block text-sm font-semibold text-blue-700 mb-1">Nomor Rekening / E-Wallet</label>
                                <input
                                    type="text"
                                    name="number"
                                    value={form.number}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400"
                                    placeholder="Masukkan nomor rekening / e-wallet"
                                    required
                                />
                            </div>
                            {/* Input Atas Nama */}
                            <div>
                                <label className="block text-sm font-semibold text-blue-700 mb-1">Atas Nama</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400"
                                    placeholder="Masukkan nama pemilik rekening / e-wallet"
                                    required
                                />
                            </div>
                            <Button type="submit" className="bg-gradient-to-r from-purple-700 to-blue-700 text-white font-bold hover:from-purple-800 hover:to-blue-800 w-full mt-2 py-2 rounded-lg shadow-lg transition-all text-base tracking-wide">Simpan</Button>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ManagePayments;