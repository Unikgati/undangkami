import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ManageMusic = () => {
    const { toast } = useToast();

    const handleAction = (action) => {
        toast({
            title: "🚧 Fitur Belum Tersedia",
            description: `Fitur "${action}" belum diimplementasikan. 🚀`,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-sans font-bold text-white">Manajemen Musik</h1>
                <Button onClick={() => handleAction('Upload Musik')} className="bg-white text-black hover:bg-gray-200">
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
        </motion.div>
    );
};

export default ManageMusic;