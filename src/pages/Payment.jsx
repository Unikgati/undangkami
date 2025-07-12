import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Copy } from 'lucide-react';

const paymentDetails = {
  total: 150000,
  accounts: [
    { type: 'Bank BCA', name: 'PT Digital Kreatif', number: '1234567890' },
    { type: 'GoPay', name: 'Digital Kreatif', number: '081234567890' },
  ],
};

const Payment = () => {
  const { orderId } = useParams();
  const { toast } = useToast();

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Tersalin!",
      description: `${text} telah disalin ke clipboard.`,
    });
  };
  
  const handleConfirm = () => {
    const message = `Halo Admin, saya ingin konfirmasi pembayaran untuk pesanan ID: ${orderId}.`;
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <Helmet>
        <title>Pembayaran - Undangan Digital</title>
        <meta name="description" content="Selesaikan pembayaran untuk mengaktifkan undangan digital Anda." />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-purple-900">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md glass-effect text-white border-none shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="font-playfair text-3xl">Selesaikan Pembayaran</CardTitle>
              <CardDescription className="text-gray-300">Aktifkan undangan Anda dengan melakukan pembayaran.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-white/10 text-center">
                <p className="text-lg">Total Pembayaran</p>
                <p className="text-4xl font-bold font-playfair">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(paymentDetails.total)}
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-center font-semibold">Silakan transfer ke salah satu rekening berikut:</p>
                {paymentDetails.accounts.map((acc, index) => (
                  <div key={index} className="p-3 rounded-lg bg-white/5">
                    <p className="font-bold">{acc.type}</p>
                    <p>a.n. {acc.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="font-mono">{acc.number}</p>
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(acc.number)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-400 mb-4">Setelah melakukan pembayaran, mohon konfirmasi melalui WhatsApp.</p>
                <Button size="lg" className="w-full pulse-glow bg-green-500 hover:bg-green-600 text-white" onClick={handleConfirm}>
                  Konfirmasi via WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default Payment;