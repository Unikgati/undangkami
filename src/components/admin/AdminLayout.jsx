import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavLink, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Music, CreditCard, Users, Settings, LogOut, Home } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/lib/firebase';
import { doc } from 'firebase/firestore';

const adminMenuItems = [
    { title: 'Overview', icon: <LayoutDashboard/>, path: '/admin' },
    { title: 'Kelola Template', icon: <FileText/>, path: '/admin/templates' },
    { title: 'Manajemen Musik', icon: <Music/>, path: '/admin/music' },
    { title: 'Manajemen Pesanan', icon: <CreditCard/>, path: '/admin/orders' },
    { title: 'Manajemen Pembayaran', icon: <CreditCard/>, path: '/admin/payments' },
    { title: 'Manajemen User', icon: <Users/>, path: '/admin/users' },
    { title: 'Pengaturan Web', icon: <Settings/>, path: '/admin/settings' },
];

const AdminLayout = ({ children }) => {
    const { toast } = useToast();
    const [logoUrl, setLogoUrl] = useState(null);
    // Ambil role dari localStorage
    const [role, setRole] = useState(() => localStorage.getItem('role') || '');
    const navigate = useNavigate();

    useEffect(() => {
        import('firebase/firestore').then(({ onSnapshot }) => {
            const docRef = doc(db, 'settings', 'webapp');
            const unsubscribe = onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    setLogoUrl(docSnap.data().logoUrl);
                } else {
                    setLogoUrl(null);
                }
            });
            return unsubscribe;
        });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast({
            title: "Logout Berhasil",
            description: "Anda telah keluar dari dashboard.",
        });
        navigate('/login');
    };

    return (
        <>
            <Helmet>
                <title>Admin Dashboard</title>
                <meta name="description" content="Dashboard Admin untuk Undangan Digital." />
            </Helmet>
            <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white">
                <motion.aside 
                    initial={{ x: -250 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="w-64 p-4 flex flex-col glass-effect-sidebar border-r border-white/10"
                    style={{ position: 'sticky', top: 0, height: '100vh', zIndex: 20 }}
                >
                    <div className="flex items-center gap-3 mb-10">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="max-h-12 max-w-32 object-contain" style={{ height: 'auto', width: 'auto', display: 'block' }} />
                        ) : (
                            <img src="/logo192.png" alt="Logo" className="h-10 w-10 rounded-full border border-purple-400" />
                        )}
                    </div>
                    <nav className="flex-grow">
                        <ul>
                            {(role === 'admin' ? adminMenuItems
                                : role === 'cs' ? [adminMenuItems[3]]
                                : role === 'designer' ? [adminMenuItems[1]]
                                : []
                            ).map((item) => (
                                <li key={item.title} className="mb-2">
                                    <NavLink 
                                        to={item.path}
                                        end={item.path === '/admin'}
                                        className={({ isActive }) =>
                                            `flex items-center p-3 rounded-lg transition-all duration-300 ${
                                                isActive ? 'bg-white/20 text-white font-semibold' : 'text-gray-300 hover:bg-white/10'
                                            }`
                                        }
                                    >
                                        {React.cloneElement(item.icon, { className: 'h-5 w-5 mr-3' })}
                                        <span>{item.title}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="mt-auto">
                         <Link to="/" className="flex items-center p-3 rounded-lg text-gray-300 hover:bg-white/10 transition-all duration-300 mb-2">
                            <Home className="h-5 w-5 mr-3" />
                            <span>Kembali ke Homepage</span>
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center p-3 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300">
                            <LogOut className="h-5 w-5 mr-3" />
                            <span>Logout</span>
                        </button>
                    </div>
                </motion.aside>
                <main className="flex-1 p-6 md:p-10">
                    {children}
                </main>
            </div>
        </>
    );
};

export default AdminLayout;