import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ManagePayments = () => {
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
                <h1 className="text-4xl font-sans font-bold text-white">Manajemen Pembayaran</h1>
                <Button onClick={() => handleAction('Tambah Rekening')} className="bg-white text-black hover:bg-gray-200">
                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Rekening
                </Button>
            </div>
            <Card className="glass-effect border-none text-white shadow-lg">
                <CardHeader>
                    <CardTitle>Rekening Tujuan Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-300">Daftar rekening bank dan e-wallet untuk menerima pembayaran akan ditampilkan di sini.</p>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ManagePayments;