import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, MessageSquare, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const userMenuItems = [
    { title: 'Statistik RSVP', icon: <BarChart/>, featureKey: 'rsvp' },
    { title: 'Daftar Ucapan', icon: <MessageSquare/>, featureKey: 'wishes' },
    { title: 'Edit Undangan', icon: <Edit/>, featureKey: 'edit' },
];

const UserDashboard = () => {
    const { toast } = useToast();

    const handleCardClick = (feature) => {
        toast({
            title: "🚧 Fitur Belum Tersedia",
            description: `Fitur ${feature} belum diimplementasikan. Anda bisa memintanya di prompt berikutnya! 🚀`,
        });
    };

    return (
        <>
            <Helmet>
                <title>User Dashboard - Undangan Digital</title>
                <meta name="description" content="Kelola undangan Anda dan lihat respon dari tamu." />
            </Helmet>
            <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 to-purple-900 text-white">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-playfair font-bold mb-8">Dashboard Pengguna</h1>
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {userMenuItems.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * index, duration: 0.4 }}
                            whileHover={{ y: -5, scale: 1.03 }}
                        >
                            <Card 
                                className="glass-effect h-full flex flex-col justify-center items-center text-center p-6 cursor-pointer border-none"
                                onClick={() => handleCardClick(item.title)}
                            >
                                <div className="text-purple-300 mb-4">{React.cloneElement(item.icon, { className: 'h-12 w-12' })}</div>
                                <CardHeader>
                                    <CardTitle className="text-xl font-semibold">{item.title}</CardTitle>
                                </CardHeader>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default UserDashboard;