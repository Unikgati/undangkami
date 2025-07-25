import React from 'react';
import { useState } from 'react';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const WebAppSettings = () => {
    const { toast } = useToast();
    const [logoFile, setLogoFile] = useState(null);
    const [logoUrl, setLogoUrl] = useState("");
    const [faviconFile, setFaviconFile] = useState(null);
    const [faviconUrl, setFaviconUrl] = useState("");
    const [deletingLogo, setDeletingLogo] = useState(false);
    const [deletingFavicon, setDeletingFavicon] = useState(false);

    // Ambil logoUrl dan faviconUrl dari Firestore saat komponen mount
    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const db = getFirestore(getApp());
                const docRef = doc(db, 'settings', 'webapp');
                const docSnap = await import('firebase/firestore').then(({ getDoc }) => getDoc(docRef));
                if (docSnap.exists()) {
                    setLogoUrl(docSnap.data().logoUrl || "");
                    setFaviconUrl(docSnap.data().faviconUrl || "");
                }
            } catch (err) {
                setLogoUrl("");
                setFaviconUrl("");
            }
        };
        fetchSettings();
    }, []);

    const CLOUD_NAME = "dkfue0nxr"; // ganti dengan cloud name Anda
    const UPLOAD_PRESET = "unsigned_preset"; // ganti dengan unsigned preset Anda

    const uploadToCloudinary = async (file) => {
        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        const res = await fetch(url, {
            method: 'POST',
            body: formData
        });
        return res.json();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const db = getFirestore(getApp());
        let updated = false;
        // Upload logo jika ada file baru
        if (logoFile) {
            toast({ title: "Uploading Logo...", description: "Logo sedang diupload ke Cloudinary." });
            const data = await uploadToCloudinary(logoFile);
            if (data.secure_url) {
                await setDoc(doc(db, 'settings', 'webapp'), { logoUrl: data.secure_url }, { merge: true });
                setLogoUrl(data.secure_url);
                toast({ title: "Berhasil!", description: "Logo berhasil diupload dan disimpan." });
                updated = true;
            } else {
                toast({ title: "Gagal upload logo", description: data.error?.message || 'Upload gagal.' });
            }
        }
        // Upload favicon jika ada file baru
        if (faviconFile) {
            toast({ title: "Uploading Favicon...", description: "Favicon sedang diupload ke Cloudinary." });
            const data = await uploadToCloudinary(faviconFile);
            if (data.secure_url) {
                await setDoc(doc(db, 'settings', 'webapp'), { faviconUrl: data.secure_url }, { merge: true });
                setFaviconUrl(data.secure_url);
                toast({ title: "Berhasil!", description: "Favicon berhasil diupload dan disimpan." });
                updated = true;
            } else {
                toast({ title: "Gagal upload favicon", description: data.error?.message || 'Upload gagal.' });
            }
        }
        if (!logoFile && !faviconFile) {
            toast({ title: "Tidak ada perubahan", description: "Silakan pilih file logo atau favicon." });
        }
        // Refresh data dari Firestore jika ada perubahan
        if (updated) {
            try {
                const docRef = doc(db, 'settings', 'webapp');
                const docSnap = await import('firebase/firestore').then(({ getDoc }) => getDoc(docRef));
                if (docSnap.exists()) {
                    setLogoUrl(docSnap.data().logoUrl || "");
                    setFaviconUrl(docSnap.data().faviconUrl || "");
                }
            } catch {}
        }
        setLogoFile(null);
        setFaviconFile(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="glass-effect border-none text-white shadow-lg">
                <CardHeader>
                    <CardTitle>Informasi Umum</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="flex-1">
                                <div className="flex flex-col gap-2 mb-2">
                                    <Label htmlFor="logo" className="min-w-[60px] mb-1">Logo</Label>
                                    {logoUrl ? (
                                        <div className="relative w-16 h-16">
                                            <img src={logoUrl} alt="Logo preview" className="block w-full h-full object-cover rounded-lg border-2 border-purple-200 shadow" />
                                            <button
                                                type="button"
                                                title="Hapus logo"
                                                className="absolute inset-0 flex items-center justify-center bg-white border border-purple-200 rounded-full p-1 shadow hover:bg-red-100 opacity-70 hover:opacity-100 w-8 h-8 m-auto"
                                                style={{ pointerEvents: deletingLogo ? 'none' : 'auto' }}
                                                disabled={deletingLogo}
                                                onClick={async () => {
                                                    setDeletingLogo(true);
                                                    try {
                                                        const urlObj = new URL(logoUrl);
                                                        const path = urlObj.pathname;
                                                        const uploadIdx = path.indexOf('/upload/');
                                                        let publicId = null;
                                                        if (uploadIdx !== -1) {
                                                            publicId = path.substring(uploadIdx + 8);
                                                            publicId = publicId.replace(/^v\d+\//, '');
                                                            publicId = publicId.replace(/\.[a-zA-Z0-9]+$/, '');
                                                        }
                                                        if (!publicId) throw new Error("public_id tidak ditemukan");
                                                        const res = await fetch("/api/delete-logo", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({ public_id: publicId })
                                                        });
                                                        const result = await res.json();
                                                        if (result.success) {
                                                            const db = getFirestore(getApp());
                                                            await setDoc(doc(db, 'settings', 'webapp'), { logoUrl: "" }, { merge: true });
                                                            setLogoUrl("");
                                                            toast({ title: "Logo dihapus", description: "Logo berhasil dihapus dari Cloudinary dan Firestore." });
                                                        } else {
                                                            throw new Error(result.error || "Gagal hapus di Cloudinary");
                                                        }
                                                    } catch (err) {
                                                        toast({ title: "Gagal hapus logo", description: err.message });
                                                    }
                                                    setDeletingLogo(false);
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-red-500"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <input id="logo" type="file" className="block max-w-xs text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-300" onChange={e => setLogoFile(e.target.files[0])} />
                                    )}
                                </div>
                            </div>
                            {/* Favicon upload dan label dihapus sesuai permintaan */}
                        </div>
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-700 to-blue-700 text-white font-bold hover:from-purple-800 hover:to-blue-800 shadow"
                            >
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default WebAppSettings;