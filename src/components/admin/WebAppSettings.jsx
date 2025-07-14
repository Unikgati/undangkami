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
    const [deleting, setDeleting] = useState(false);

    // Ambil logoUrl dari Firestore saat komponen mount
    React.useEffect(() => {
        const fetchLogo = async () => {
            try {
                const db = getFirestore(getApp());
                const docRef = doc(db, 'settings', 'webapp');
                const docSnap = await import('firebase/firestore').then(({ getDoc }) => getDoc(docRef));
                if (docSnap.exists()) {
                    setLogoUrl(docSnap.data().logoUrl || "");
                }
            } catch (err) {
                setLogoUrl("");
            }
        };
        fetchLogo();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!logoFile) {
            toast({ title: "Logo belum dipilih", description: "Silakan pilih file logo." });
            return;
        }
        toast({ title: "Uploading...", description: "Logo sedang diupload ke Cloudinary." });
        const CLOUD_NAME = "dkfue0nxr"; // ganti dengan cloud name Anda
        const UPLOAD_PRESET = "unsigned_preset"; // ganti dengan unsigned preset Anda
        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
        const formData = new FormData();
        formData.append('file', logoFile);
        formData.append('upload_preset', UPLOAD_PRESET);
        fetch(url, {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(async data => {
            if (data.secure_url) {
                // Simpan ke Firestore
                const db = getFirestore(getApp());
                await setDoc(doc(db, 'settings', 'webapp'), { logoUrl: data.secure_url }, { merge: true });
                setLogoUrl(data.secure_url);
                toast({ title: "Berhasil!", description: "Logo berhasil diupload dan disimpan." });
                // Fetch logo again to ensure state is up to date
                try {
                    const docRef = doc(db, 'settings', 'webapp');
                    const docSnap = await import('firebase/firestore').then(({ getDoc }) => getDoc(docRef));
                    if (docSnap.exists()) {
                        setLogoUrl(docSnap.data().logoUrl || "");
                    }
                } catch {}
            } else {
                toast({ title: "Gagal upload", description: data.error?.message || 'Upload gagal.' });
            }
        })
        .catch(err => {
            toast({ title: "Error", description: err.message });
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="text-4xl font-sans font-bold mb-8 text-white">Pengaturan Web App</h1>
            <Card className="glass-effect border-none text-white shadow-lg">
                <CardHeader>
                    <CardTitle>Informasi Umum</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="appName">Nama Aplikasi</Label>
                            <Input id="appName" placeholder="Undangan Digital" className="bg-white/10" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="logo">Logo</Label>
                            {logoUrl && (
                                <div className="mb-2 flex items-center gap-4">
                                    <img src={logoUrl} alt="Logo" className="h-10 w-10 rounded bg-white" />
                                    <Button
                                        type="button"
                                        className="bg-red-500 text-white hover:bg-red-700"
                                        disabled={deleting}
                                        onClick={async () => {
                                            setDeleting(true);
                                            try {
                                                // Debug: log logoUrl
                                                console.log("DEBUG logoUrl:", logoUrl);
                                                // Ambil public_id dari url Cloudinary (path lengkap tanpa ekstensi)
                                                const urlObj = new URL(logoUrl);
                                                const path = urlObj.pathname;
                                                const uploadIdx = path.indexOf('/upload/');
                                                let publicId = null;
                                                if (uploadIdx !== -1) {
                                                    publicId = path.substring(uploadIdx + 8);
                                                    publicId = publicId.replace(/^v\d+\//, '');
                                                    publicId = publicId.replace(/\.[a-zA-Z0-9]+$/, '');
                                                }
                                                // Debug: log publicId
                                                console.log("DEBUG public_id:", publicId);
                                                if (!publicId) throw new Error("public_id tidak ditemukan");
                                                // Hapus di Cloudinary (harus lewat API backend, contoh fetch ke endpoint /api/delete-logo)
                                                const res = await fetch("/api/delete-logo", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ public_id: publicId })
                                                });
                                                const result = await res.json();
                                                // Debug: log response dari backend
                                                console.log("DEBUG delete-logo result:", result);
                                                if (result.success) {
                                                    // Hapus logoUrl di Firestore
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
                                            setDeleting(false);
                                        }}
                                    >
                                        {deleting ? "Menghapus..." : "Hapus Logo"}
                                    </Button>
                                </div>
                            )}
                            <Input id="logo" type="file" className="bg-white/10" onChange={e => setLogoFile(e.target.files[0])} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="favicon">Favicon</Label>
                            <Input id="favicon" type="file" className="bg-white/10" />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" className="bg-white text-black hover:bg-gray-200">Simpan Perubahan</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default WebAppSettings;