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
    { title: 'Template', icon: <FileText/>, path: '/admin/templates' },
    { title: 'Musik', icon: <Music/>, path: '/admin/music' },
    { title: 'Pesanan', icon: <CreditCard/>, path: '/admin/orders' },
    { title: 'Pembayaran', icon: <CreditCard/>, path: '/admin/payments' },
    { title: 'User', icon: <Users/>, path: '/admin/users' },
    { title: 'Settings', icon: <Settings/>, path: '/admin/settings' },
];

const AdminLayout = ({ children }) => {
    const { toast } = useToast();
    const [logoUrl, setLogoUrl] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false); // for mobile
    // Ambil role dari localStorage
    const [role, setRole] = useState(() => localStorage.getItem('role') || '');
    const [newOrderCount, setNewOrderCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
    // Ambil jumlah pesanan baru
    import('firebase/firestore').then(({ collection, query, where, onSnapshot }) => {
        const q = query(collection(db, 'orders'), where('status', 'in', ['preview', null]));
        const unsub = onSnapshot(q, (snap) => {
            setNewOrderCount(snap.size);
        });
        return unsub;
    });
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
            {/* Hamburger button for mobile only (bottom right) */}
            <button
                className="fixed bottom-4 right-4 z-30 flex items-center justify-center md:hidden bg-purple-700 rounded-full p-3 shadow-lg focus:outline-none"
                onClick={() => setSidebarOpen(true)}
                aria-label="Buka menu sidebar"
            >
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Tutup overlay sidebar"
                />
            )}
            <div className="flex min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white">
                {/* Sidebar desktop (tetap seperti sekarang) */}
                <motion.aside
                    initial={{ x: 0 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="hidden md:flex w-64 p-4 flex-col glass-effect-sidebar border-r border-white/10"
                    style={{ position: 'sticky', top: 0, height: '100vh', zIndex: 20 }}
                >
                    <div className="flex items-center gap-3 mb-10">
                        {logoUrl && (
                            <img src={logoUrl} alt="Logo" className="max-h-12 max-w-32 object-contain" style={{ height: 'auto', width: 'auto', display: 'block' }} />
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
                                        <span className="relative flex items-center">
                                            {item.title}
                                            {item.title === 'Pesanan' && newOrderCount > 0 && (
                                                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold w-6 h-6">
                                                    {newOrderCount}
                                                </span>
                                            )}
                                        </span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="mt-auto">
                         <Link to="/" className="flex items-center p-3 rounded-lg text-gray-300 hover:bg-white/10 transition-all duration-300 mb-2">
                            <Home className="h-5 w-5 mr-3" />
                            <span>Homepage</span>
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center p-3 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300">
                            <LogOut className="h-5 w-5 mr-3" />
                            <span>Logout</span>
                        </button>
                    </div>
                </motion.aside>
                {/* Sidebar mobile (slide in/out) */}
                <motion.aside
                    initial={{ x: -250 }}
                    animate={{ x: sidebarOpen ? 0 : -250 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`fixed md:hidden top-0 left-0 z-30 h-full w-64 p-4 flex flex-col glass-effect-sidebar border-r border-white/10 bg-gray-900/90 backdrop-blur-lg transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    style={{ maxHeight: '100vh' }}
                >
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            {logoUrl && (
                                <img src={logoUrl} alt="Logo" className="max-h-12 max-w-32 object-contain" style={{ height: 'auto', width: 'auto', display: 'block' }} />
                            )}
                        </div>
                        <button
                            className="text-white hover:text-purple-400 focus:outline-none"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Tutup menu sidebar"
                        >
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
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
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        {React.cloneElement(item.icon, { className: 'h-5 w-5 mr-3' })}
                                        <span className="relative flex items-center">
                                            {item.title}
                                            {item.title === 'Pesanan' && newOrderCount > 0 && (
                                                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs font-bold w-6 h-6">
                                                    {newOrderCount}
                                                </span>
                                            )}
                                        </span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="mt-auto">
                        <Link to="/" className="flex items-center p-3 rounded-lg text-gray-300 hover:bg-white/10 transition-all duration-300 mb-2" onClick={() => setSidebarOpen(false)}>
                            <Home className="h-5 w-5 mr-3" />
                            <span>Homepage</span>
                        </Link>
                        <button onClick={() => { setSidebarOpen(false); handleLogout(); }} className="w-full flex items-center p-3 rounded-lg text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300">
                            <LogOut className="h-5 w-5 mr-3" />
                            <span>Logout</span>
                        </button>
                    </div>
                </motion.aside>
                {/* Main content */}
                <main className="flex-1 p-4 sm:p-6 md:p-10">
                    {children}
                </main>
            </div>
        </>
    );
};

export default AdminLayout;