import React from 'react';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { app, db } from '@/lib/firebase';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where, setDoc, doc, onSnapshot } from 'firebase/firestore';

const ManageUsers = () => {
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [deleteUserId, setDeleteUserId] = React.useState(null);
    const { toast } = useToast();
    const [showModal, setShowModal] = React.useState(false);
    const [form, setForm] = React.useState({
        name: '',
        username: '',
        password: '',
        role: '',
        whatsapp: '',
    });
    const [editUserId, setEditUserId] = React.useState(null); // id user yang sedang diedit
    const [loadingSave, setLoadingSave] = React.useState(false);
    const [loadingDelete, setLoadingDelete] = React.useState(false);
    // Data user dari Firestore
    const [users, setUsers] = React.useState([]);

    // Ambil data user dari Firestore saat mount
    React.useEffect(() => {
        const q = query(collection(db, 'users'));
        const unsub = onSnapshot(q, (snap) => {
            setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, []);

    // Cek apakah sudah ada admin/cs
    const hasAdmin = users.some(u => u.role === 'admin');
    const hasCS = users.some(u => u.role === 'cs');

    const handleOpenModal = () => {
        setForm({ name: '', username: '', password: '', role: '', whatsapp: '' });
        setEditUserId(null);
        setShowModal(true);
    };
    const handleCloseModal = () => {
        setShowModal(false);
        setForm({ name: '', username: '', password: '', role: '', whatsapp: '' });
    };
    const handleOpenDeleteModal = (userId) => {
        setDeleteUserId(userId);
        setShowDeleteModal(true);
    };
    const handleCloseDeleteModal = () => {
        setDeleteUserId(null);
        setShowDeleteModal(false);
    };
    // Hapus user dari Firestore dan Firebase Auth
    const handleDeleteUser = async () => {
        if (!deleteUserId) return;
        setLoadingDelete(true);
        try {
            // Hapus dokumen user dari Firestore
            const { deleteDoc } = await import('firebase/firestore');
            await deleteDoc(doc(db, 'users', deleteUserId));
            // Panggil API serverless untuk hapus user dari Firebase Auth
            const res = await fetch('/api/delete-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: deleteUserId }),
            });
            let result = null;
            try {
                result = await res.json();
            } catch (jsonErr) {
                toast({
                    title: 'Gagal hapus user dari Auth',
                    description: 'Respons server tidak valid JSON. Kemungkinan ada error pada API serverless atau environment variable.'
                });
                setLoadingDelete(false);
                handleCloseDeleteModal();
                return;
            }
            if (res.ok && result.success) {
                toast({ title: 'User dihapus', description: 'User berhasil dihapus dari database dan Auth.' });
            } else {
                toast({ title: 'User dihapus sebagian', description: 'User dihapus dari database, tapi gagal dihapus dari Auth: ' + (result.error || 'Unknown error') });
            }
            setLoadingDelete(false);
            handleCloseDeleteModal();
        } catch (err) {
            toast({ title: 'Gagal hapus user', description: err.message || String(err) });
            setLoadingDelete(false);
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };
    const handleSave = async (e) => {
        e.preventDefault();
        setLoadingSave(true);
        if (!form.name || !form.username || (!editUserId && !form.password) || !form.role || (form.role === 'cs' && !form.whatsapp)) {
            toast({
                title: 'Lengkapi semua field',
                description: 'Semua data wajib diisi. Username hanya boleh huruf, angka, titik, dan underscore, tanpa spasi atau karakter khusus. Username akan digunakan sebagai email login (username@undangkami.com).'
            });
            setLoadingSave(false);
            return;
        }
        // Validasi username unik di Firestore (kecuali jika edit dan username tidak berubah)
        const usernameExists = users.some(u => u.username === form.username && u.id !== editUserId);
        if (usernameExists) {
            toast({ title: 'Username sudah digunakan', description: 'Silakan pilih username lain.' });
            setLoadingSave(false);
            return;
        }
        if (editUserId) {
            // Edit user: update Firestore
            try {
                await setDoc(doc(db, 'users', editUserId), {
                    name: form.name,
                    username: form.username,
                    role: form.role,
                    whatsapp: form.whatsapp || '',
                    uid: editUserId,
                }, { merge: true });
                toast({ title: 'User berhasil diupdate', description: `User ${form.name} berhasil diedit.` });
                handleCloseModal();
            } catch (err) {
                toast({ title: 'Gagal edit user', description: err.message || String(err) });
            }
            setLoadingSave(false);
        } else {
            // Tambah user baru
            try {
                // Buat user di Firebase Auth (pakai email dummy: username@undangkami.com)
                const auth = getAuth(app);
                const email = `${form.username}@undangkami.com`;
                const cred = await createUserWithEmailAndPassword(auth, email, form.password);
                // Simpan data user ke Firestore
                await setDoc(doc(db, 'users', cred.user.uid), {
                    name: form.name,
                    username: form.username,
                    role: form.role,
                    whatsapp: form.whatsapp || '',
                    createdAt: new Date().toISOString(),
                    uid: cred.user.uid,
                });
                toast({ title: 'User berhasil ditambah', description: `User ${form.name} (${form.role}) berhasil dibuat.` });
                handleCloseModal();
            } catch (err) {
                toast({ title: 'Gagal tambah user', description: err.message || String(err) });
            }
            setLoadingSave(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-semibold font-plusjakartasans text-white sm:text-lg md:text-2xl">User</h1>
                <Button onClick={handleOpenModal} className="bg-white text-black hover:bg-gray-200">
                    <UserPlus className="mr-2 h-4 w-4" /> Tambah User
                </Button>
            </div>
            <Card className="glass-effect border-none text-white shadow-lg">
                <CardContent className="mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {users.length === 0 && (
                            <div className="text-blue-200">Belum ada user terdaftar.</div>
                        )}
                        {users.map(user => (
                            <div
                                key={user.id}
                                className="bg-transparent border border-purple-400 rounded-2xl px-3 py-6 flex flex-col items-start gap-2 shadow-lg hover:scale-[1.03] hover:shadow-2xl transition-all duration-200 cursor-pointer relative w-full
                                sm:bg-gradient-to-br sm:from-purple-900/40 sm:via-blue-900/30 sm:to-white/10 sm:backdrop-blur-md sm:border-purple-300"
                                style={{ minHeight: 100 }}
                            >
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg mb-2">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M4 20c0-3.314 3.134-6 7-6s7 2.686 7 6" />
                                    </svg>
                                </div>
                                <div className="font-bold text-lg text-white text-left line-clamp-2 break-words drop-shadow-lg">{user.name}</div>
                                <div className="text-base text-blue-100 text-left break-words font-semibold">{user.role === 'admin' ? 'Admin' : user.role === 'cs' ? 'Customer Service' : user.role === 'designer' ? 'Designer' : user.role}</div>
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            title="Edit"
                                            className="p-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white shadow flex items-center justify-center"
                                            onClick={() => {
                                                setEditUserId(user.id);
                                                setForm({
                                                    name: user.name || '',
                                                    username: user.username || '',
                                                    password: '',
                                                    role: user.role || '',
                                                    whatsapp: user.whatsapp || '',
                                                });
                                                setShowModal(true);
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                                        </button>
                                        <button
                                            title="Hapus"
                                            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow flex items-center justify-center"
                                            onClick={() => handleOpenDeleteModal(user.id)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Modal Tambah User */}
            {/* Modal Konfirmasi Hapus User */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-7 min-w-[300px] max-w-[90vw] border-2 border-red-300">
                        <div className="flex flex-col items-center gap-3">
                            <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" fill="#f87171"></circle>
                                <path d="M15 9l-6 6M9 9l6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                            <div className="text-lg font-semibold text-red-700 text-center">
                                Hapus user ini?
                            </div>
                            <div className="flex gap-3 mt-2">
                                <button
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-700 to-blue-700 text-white font-bold hover:from-purple-800 hover:to-blue-800 shadow flex items-center justify-center min-w-[110px]"
                                    onClick={handleDeleteUser}
                                    disabled={loadingDelete}
                                >
                                    {loadingDelete ? (
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>
                                    ) : 'Ya, Hapus'}
                                </button>
                                <button
                                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 shadow"
                                    onClick={handleCloseDeleteModal}
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-7 min-w-[340px] max-w-[95vw] border-2 border-blue-300">
                        <form onSubmit={handleSave} className="flex flex-col gap-5">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-xl font-bold text-blue-800 tracking-tight">{editUserId ? 'Edit User' : 'Tambah User'}</h2>
                                <button type="button" onClick={handleCloseModal} className="rounded-full p-1.5 transition bg-gray-100 hover:bg-purple-100 border border-transparent hover:border-purple-400 text-gray-400 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400">
                                    <span className="sr-only">Tutup</span>
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-blue-700 mb-1">Nama User</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400"
                                    placeholder="Masukkan nama user"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-blue-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400"
                                    placeholder="Masukkan username"
                                    required
                                />
                                <div className="text-xs text-blue-500 mt-1"></div>
                            </div>
                            {!editUserId && (
                                <div>
                                    <label className="block text-sm font-semibold text-blue-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400"
                                        placeholder="Masukkan password"
                                        required
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-semibold text-blue-700 mb-1">Role</label>
                                <CustomDropdown
                                    value={form.role}
                                    onChange={role => setForm(f => ({ ...f, role }))}
                                    disabledOptions={[hasAdmin ? 'admin' : null, hasCS ? 'cs' : null].filter(Boolean)}
                                    placeholder="Pilih role"
                                />
                                {(form.role === 'admin' && hasAdmin && !editUserId) && (
                                    <div className="text-xs text-red-500 mt-1">Admin sudah ada, tidak bisa tambah lagi.</div>
                                )}
                                {(form.role === 'cs' && hasCS && !editUserId) && (
                                    <div className="text-xs text-red-500 mt-1">CS sudah ada, tidak bisa tambah lagi.</div>
                                )}
                            </div>
                            {form.role === 'cs' && (
                                <div>
                                    <label className="block text-sm font-semibold text-blue-700 mb-1">Nomor WhatsApp</label>
                                    <input
                                        type="text"
                                        name="whatsapp"
                                        value={form.whatsapp}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400"
                                        placeholder="Masukkan nomor WhatsApp"
                                        required
                                    />
                                </div>
                            )}
                            <div className="flex gap-3 mt-2 justify-end">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 shadow"
                                    onClick={handleCloseModal}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-700 to-blue-700 text-white font-bold hover:from-purple-800 hover:to-blue-800 shadow flex items-center justify-center min-w-[110px]"
                                    disabled={loadingSave}
                                >
                                    {loadingSave ? (
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>
                                    ) : (editUserId ? 'Simpan Perubahan' : 'Simpan')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default ManageUsers;