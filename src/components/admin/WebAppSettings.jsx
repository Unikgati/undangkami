import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const WebAppSettings = () => {
    const { toast } = useToast();

    const handleSubmit = (e) => {
        e.preventDefault();
        toast({
            title: "🚧 Fitur Belum Tersedia",
            description: "Penyimpanan pengaturan belum diimplementasikan. 🚀",
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
                            <Input id="logo" type="file" className="bg-white/10" />
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