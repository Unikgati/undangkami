import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, FileText, CreditCard, BarChart2 } from 'lucide-react';

const stats = [
    { title: "Total Pengguna", value: "1,250", icon: <Users/>, change: "+15%", changeType: "positive" },
    { title: "Template Aktif", value: "24", icon: <FileText/>, change: "+2", changeType: "positive" },
    { title: "Pesanan Bulan Ini", value: "350", icon: <CreditCard/>, change: "-5%", changeType: "negative" },
    { title: "Pendapatan", value: "Rp 52.5M", icon: <BarChart2/>, change: "+20%", changeType: "positive" },
];

const AdminOverview = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className="text-4xl font-sans font-bold mb-8 text-white">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * index, duration: 0.4 }}
                    >
                        <Card className="glass-effect border-none text-white shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-300">{stat.title}</CardTitle>
                                {React.cloneElement(stat.icon, { className: 'h-5 w-5 text-gray-400' })}
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <p className={`text-xs mt-1 ${stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                                    {stat.change} dari bulan lalu
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="mt-10">
                <Card className="glass-effect border-none text-white shadow-lg">
                    <CardHeader>
                        <CardTitle>Aktivitas Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-300">Grafik dan daftar aktivitas akan ditampilkan di sini.</p>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
};

export default AdminOverview;