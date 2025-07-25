import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const PreviewInvitation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    const orderRef = doc(db, 'orders', orderId);
    const unsub = onSnapshot(orderRef, (snap) => {
      if (snap.exists()) {
        setOrderData(snap.data());
      } else {
        setOrderData(null);
        navigate('/');
      }
    });
    return () => unsub();
  }, [orderId, navigate]);

  if (!orderData) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <>
      <Helmet>
        <title>{`Preview: ${orderData.groomNickName || 'Mempelai Pria'} & ${orderData.brideNickName || 'Mempelai Wanita'}`}</title>
        <meta name="description" content="Preview undangan digital sementara Anda." />
      </Helmet>
      <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-purple-900 to-indigo-900 text-white font-playfair">
        <div className="relative max-w-2xl mx-auto invitation-preview">
          <Card className="glass-effect shadow-2xl border-none">
            <CardContent className="p-8 md:p-12 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-lg text-gray-300">The Wedding Of</p>
                <h1 className="text-5xl md:text-7xl font-bold my-4 gradient-text">{orderData.groomNickName} & {orderData.brideNickName}</h1>
                <p className="text-xl text-gray-300">Kami mengundang Anda untuk merayakan hari bahagia kami.</p>
              </motion.div>
              
              <div className="my-10 border-t border-white/20"></div>

              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }}>
                <h2 className="text-3xl font-semibold mb-4">Akad Nikah</h2>
                <p className="text-lg">{new Date(orderData.akadDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-lg">Pukul {orderData.akadTime}</p>
                <p className="text-lg mt-2">{orderData.akadLocation}</p>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="mt-8">
                <h2 className="text-3xl font-semibold mb-4">Resepsi</h2>
                <p className="text-lg">{new Date(orderData.resepsiDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-lg">Pukul {orderData.resepsiTime}</p>
                <p className="text-lg mt-2">{orderData.resepsiLocation}</p>
              </motion.div>
            </CardContent>
          </Card>
          
          <div className="watermark">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-yellow-500">Bayar Sekarang</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }} 
          className="text-center mt-8"
        >
          <Button size="lg" className="pulse-glow bg-white text-black hover:bg-gray-200" onClick={() => navigate(`/payment/${orderId}`)}>
            Lanjutkan ke Pembayaran
          </Button>
        </motion.div>
      </div>
    </>
  );
};

export default PreviewInvitation;