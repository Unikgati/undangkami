import React from 'react';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
// ...existing code...
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, FileText, CreditCard, BarChart2 } from 'lucide-react';
import ChartCard from './ChartCard';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// ...existing code...

const AdminOverview = () => {
    const [totalInvitations, setTotalInvitations] = React.useState(0);
    const [totalTemplates, setTotalTemplates] = React.useState(0);
    const [totalOrders, setTotalOrders] = React.useState(0);
    // Chart states
    const [orderStats, setOrderStats] = React.useState([]); // [{date, count}]
    const [templateStats, setTemplateStats] = React.useState([]); // [{name, count}]
    const [musicStats, setMusicStats] = React.useState([]); // [{title, count}]
    // Proteksi akses berdasarkan role
    React.useEffect(() => {
        const role = localStorage.getItem('role');
        if (role === 'designer') window.location.href = '/admin/templates';
        if (role === 'cs') window.location.href = '/admin/orders';
        if (role !== 'admin') window.location.href = '/login';
    }, []);

    // Ambil total undangan dari Firestore secara real-time (invitations + orders)
    React.useEffect(() => {
        const db = getFirestore();
        const invitationsRef = collection(db, 'invitations');
        const ordersRef = collection(db, 'orders');
        let invitationsCount = 0;
        let ordersCount = 0;
        const unsubInvitations = onSnapshot(invitationsRef, (snapshot) => {
            invitationsCount = snapshot.size;
            setTotalInvitations(invitationsCount + ordersCount);
        });
        const unsubOrders = onSnapshot(ordersRef, (snapshot) => {
            ordersCount = snapshot.size;
            setTotalInvitations(invitationsCount + ordersCount);
            setTotalOrders(snapshot.size);
        });
        return () => {
            unsubInvitations();
            unsubOrders();
        };
    }, []);

    // Ambil total template dari Firestore secara real-time
    React.useEffect(() => {
        const db = getFirestore();
        const templatesRef = collection(db, 'templates');
        const unsubTemplates = onSnapshot(templatesRef, (snapshot) => {
            setTotalTemplates(snapshot.size);
        });
        return () => unsubTemplates();
    }, []);

    // Statistik dashboard
    const stats = [
        { title: "Total Undangan", value: totalInvitations.toLocaleString(), icon: <Users />, change: "", changeType: "positive" },
        { title: "Total Template", value: totalTemplates.toLocaleString(), icon: <FileText />, change: "", changeType: "positive" },
        { title: "Total Pesanan", value: totalOrders.toLocaleString(), icon: <CreditCard />, change: "", changeType: "positive" },
    ];

    // Ambil statistik order per hari, template terpopuler, musik terpopuler
    React.useEffect(() => {
        const db = getFirestore();
        const ordersRef = collection(db, 'orders');
        const musicRef = collection(db, 'music');
        let musicMap = {};
        let ordersData = null;
        let musicReady = false;
        let ordersReady = false;

        const processStats = () => {
            if (!musicReady || !ordersReady) return;
            // Order per hari (7 hari terakhir)
            const orderByDate = {};
            const templateCount = {};
            const musicCount = {};
            const now = new Date();
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(now.getDate() - i);
                const key = d.toISOString().slice(0, 10);
                orderByDate[key] = 0;
            }
            ordersData.forEach(doc => {
                const data = doc.data();
                // Order per hari
                if (data.createdAt) {
                    const dateKey = (new Date(data.createdAt)).toISOString().slice(0, 10);
                    if (orderByDate[dateKey] !== undefined) orderByDate[dateKey]++;
                }
                // Template terpopuler
                if (data.templateId) {
                    templateCount[data.templateId] = (templateCount[data.templateId] || 0) + 1;
                }
                // Musik terpopuler
                if (data.selectedMusicId) {
                    musicCount[data.selectedMusicId] = (musicCount[data.selectedMusicId] || 0) + 1;
                }
            });
            // Format orderStats
            setOrderStats(Object.entries(orderByDate).map(([date, count]) => ({ date, count })));
            // Format templateStats (ambil nama template dari koleksi templates)
            const templatesRef = collection(db, 'templates');
            onSnapshot(templatesRef, (templatesSnap) => {
                const idToName = {};
                templatesSnap.forEach(doc => {
                    const d = doc.data();
                    idToName[doc.id] = d.name || doc.id;
                });
                const arr = Object.entries(templateCount)
                    .map(([id, count]) => ({ name: idToName[id] || id, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 7);
                setTemplateStats(arr);
            });
            // Musik terpopuler (ambil judul/artis dari koleksi music berdasarkan id)
            const arrMusic = Object.entries(musicCount)
                .map(([id, count]) => ({ title: musicMap[id] || id, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 7);
            setMusicStats(arrMusic);
        };

        const unsubMusic = onSnapshot(musicRef, (musicSnap) => {
            musicMap = {};
            musicSnap.forEach(doc => {
                const d = doc.data();
                musicMap[doc.id] = d.artist ? `${d.name} - ${d.artist}` : d.name;
            });
            musicReady = true;
            processStats();
        });
        const unsubOrders = onSnapshot(ordersRef, (snapshot) => {
            ordersData = snapshot.docs;
            ordersReady = true;
            processStats();
        });
        return () => {
            unsubOrders();
            unsubMusic();
        };
    }, []);

    // Chart data
    const orderChartData = {
        labels: orderStats.map(o => o.date),
        datasets: [
            {
                label: 'Order per Hari',
                data: orderStats.map(o => o.count),
                borderColor: '#a78bfa',
                backgroundColor: 'rgba(167,139,250,0.2)',
                tension: 0.3,
                fill: true,
            },
        ],
    };
    const templateChartData = {
        labels: templateStats.map(t => t.name),
        datasets: [
            {
                label: 'Template Terpopuler',
                data: templateStats.map(t => t.count),
                backgroundColor: '#f472b6',
            },
        ],
    };
    const musicChartData = {
        labels: musicStats.map(m => m.title),
        datasets: [
            {
                label: 'Musik Terpopuler',
                data: musicStats.map(m => m.count),
                backgroundColor: '#38bdf8',
            },
        ],
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <>
                <h1 className="text-2xl font-semibold font-plusjakartasans mb-6 text-white">Dashboard Overview</h1>
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
                                    {stat.change && (
                                        <p className={`text-xs mt-1 ${stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'}`}>
                                            {stat.change} dari bulan lalu
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ChartCard title="Orderan">
                        <Line data={orderChartData} options={{
                            responsive: true,
                            plugins: {
                                legend: { display: false },
                                title: { display: false },
                            },
                            scales: {
                                x: { ticks: { color: '#fff' }, grid: { color: '#444' } },
                                y: { ticks: { color: '#fff' }, grid: { color: '#444' } },
                            },
                        }} />
                    </ChartCard>
                    <ChartCard title="Template Populer">
                        <Bar data={templateChartData} options={{
                            indexAxis: 'y',
                            responsive: true,
                            plugins: {
                                legend: { display: false },
                                title: { display: false },
                            },
                            scales: {
                                x: { ticks: { color: '#fff' }, grid: { color: '#444' } },
                                y: { ticks: { color: '#fff' }, grid: { color: '#444' } },
                            },
                        }} />
                    </ChartCard>
                    <ChartCard title="Musik Populer">
                        <Bar data={musicChartData} options={{
                            indexAxis: 'y',
                            responsive: true,
                            plugins: {
                                legend: { display: false },
                                title: { display: false },
                            },
                            scales: {
                                x: { ticks: { color: '#fff' }, grid: { color: '#444' } },
                                y: { ticks: { color: '#fff' }, grid: { color: '#444' } },
                            },
                        }} />
                    </ChartCard>
                </div>
                {/* Bagian Aktivitas Terbaru dihapus sesuai permintaan */}
            </>
        </motion.div>
    );
}

export default AdminOverview;