import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ManageOrders = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="text-4xl font-sans font-bold mb-8 text-white">Manajemen Pesanan</h1>
            <Tabs defaultValue="new" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/10 text-white">
                    <TabsTrigger value="new">Pesanan Baru</TabsTrigger>
                    <TabsTrigger value="processed">Pesanan Diproses</TabsTrigger>
                    <TabsTrigger value="all">Semua Pesanan</TabsTrigger>
                </TabsList>
                <TabsContent value="new">
                    <Card className="glass-effect border-none text-white shadow-lg mt-4">
                        <CardHeader><CardTitle>Pesanan Baru</CardTitle></CardHeader>
                        <CardContent><p className="text-gray-300">Daftar pesanan yang baru masuk dan belum diproses.</p></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="processed">
                    <Card className="glass-effect border-none text-white shadow-lg mt-4">
                        <CardHeader><CardTitle>Pesanan Diproses</CardTitle></CardHeader>
                        <CardContent><p className="text-gray-300">Daftar pesanan yang sedang atau sudah diproses.</p></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="all">
                    <Card className="glass-effect border-none text-white shadow-lg mt-4">
                        <CardHeader><CardTitle>Semua Pesanan</CardTitle></CardHeader>
                        <CardContent><p className="text-gray-300">Riwayat semua pesanan yang pernah ada.</p></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
};

export default ManageOrders;