import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, PartyPopper, Heart, Users, MapPin, Music, Gift } from 'lucide-react';

const steps = [
  { id: 1, title: 'Data Mempelai', icon: <Heart className="h-6 w-6" /> },
  { id: 2, title: 'Data Orang Tua', icon: <Users className="h-6 w-6" /> },
  { id: 3, title: 'Waktu & Lokasi', icon: <MapPin className="h-6 w-6" /> },
  { id: 4, title: 'Pilih Musik', icon: <Music className="h-6 w-6" /> },
  { id: 5, title: 'Wedding Gift', icon: <Gift className="h-6 w-6" /> },
  { id: 6, title: 'Review & Submit', icon: <PartyPopper className="h-6 w-6" /> },
];

const OrderForm = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const orderId = `order_${Date.now()}`;
    localStorage.setItem(orderId, JSON.stringify({ ...formData, templateId }));
    toast({
      title: "Sukses!",
      description: "Data Anda telah disimpan sementara. Mengarahkan ke halaman preview.",
    });
    navigate(`/preview/${orderId}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const slideVariants = {
    hidden: { opacity: 0, x: 200 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -200 },
  };

  return (
    <>
      <Helmet>
        <title>{`Form Pemesanan Undangan - Langkah ${currentStep}`}</title>
        <meta name="description" content={`Isi data undangan Anda. Template ID: ${templateId}`} />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-purple-900">
        <Card className="w-full max-w-3xl glass-effect text-white border-none shadow-2xl">
          <CardHeader>
            <div className="flex justify-center items-center gap-4 mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= step.id ? 'bg-white text-purple-700 border-white' : 'border-gray-400 text-gray-400'}`}>
                    {step.icon}
                  </div>
                   <p className={`mt-2 text-xs text-center transition-all duration-300 ${currentStep >= step.id ? 'text-white font-semibold' : 'text-gray-400'}`}>{step.title}</p>
                </div>
              ))}
            </div>
            <CardTitle className="text-center font-playfair text-3xl">{steps[currentStep - 1].title}</CardTitle>
            <CardDescription className="text-center text-gray-300">Lengkapi data untuk undangan Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                >
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold font-playfair mb-4">Mempelai Pria</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label htmlFor="groomFullName">Nama Lengkap</Label><Input id="groomFullName" name="groomFullName" onChange={handleChange} placeholder="Contoh: John Doe" className="bg-white/10" /></div>
                        <div><Label htmlFor="groomNickName">Nama Panggilan</Label><Input id="groomNickName" name="groomNickName" onChange={handleChange} placeholder="Contoh: John" className="bg-white/10" /></div>
                      </div>
                      <h3 className="text-xl font-semibold font-playfair mt-6 mb-4">Mempelai Wanita</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label htmlFor="brideFullName">Nama Lengkap</Label><Input id="brideFullName" name="brideFullName" onChange={handleChange} placeholder="Contoh: Jane Doe" className="bg-white/10" /></div>
                        <div><Label htmlFor="brideNickName">Nama Panggilan</Label><Input id="brideNickName" name="brideNickName" onChange={handleChange} placeholder="Contoh: Jane" className="bg-white/10" /></div>
                      </div>
                    </div>
                  )}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold font-playfair mb-4">Orang Tua Mempelai Pria</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label htmlFor="groomFather">Nama Ayah</Label><Input id="groomFather" name="groomFather" onChange={handleChange} placeholder="Nama Ayah" className="bg-white/10" /></div>
                        <div><Label htmlFor="groomMother">Nama Ibu</Label><Input id="groomMother" name="groomMother" onChange={handleChange} placeholder="Nama Ibu" className="bg-white/10" /></div>
                      </div>
                      <h3 className="text-xl font-semibold font-playfair mt-6 mb-4">Orang Tua Mempelai Wanita</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label htmlFor="brideFather">Nama Ayah</Label><Input id="brideFather" name="brideFather" onChange={handleChange} placeholder="Nama Ayah" className="bg-white/10" /></div>
                        <div><Label htmlFor="brideMother">Nama Ibu</Label><Input id="brideMother" name="brideMother" onChange={handleChange} placeholder="Nama Ibu" className="bg-white/10" /></div>
                      </div>
                    </div>
                  )}
                  {currentStep === 3 && (
                     <div className="space-y-4">
                        <h3 className="text-xl font-semibold font-playfair mb-4">Akad Nikah</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><Label htmlFor="akadDate">Tanggal</Label><Input id="akadDate" name="akadDate" type="date" onChange={handleChange} className="bg-white/10" /></div>
                          <div><Label htmlFor="akadTime">Waktu</Label><Input id="akadTime" name="akadTime" type="time" onChange={handleChange} className="bg-white/10" /></div>
                        </div>
                        <div><Label htmlFor="akadLocation">Lokasi</Label><Input id="akadLocation" name="akadLocation" onChange={handleChange} placeholder="Nama Gedung/Jalan" className="bg-white/10" /></div>
                        <div><Label htmlFor="akadMaps">Link Google Maps</Label><Input id="akadMaps" name="akadMaps" onChange={handleChange} placeholder="https://maps.app.goo.gl/..." className="bg-white/10" /></div>
                        
                        <h3 className="text-xl font-semibold font-playfair mt-6 mb-4">Resepsi</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><Label htmlFor="resepsiDate">Tanggal</Label><Input id="resepsiDate" name="resepsiDate" type="date" onChange={handleChange} className="bg-white/10" /></div>
                          <div><Label htmlFor="resepsiTime">Waktu</Label><Input id="resepsiTime" name="resepsiTime" type="time" onChange={handleChange} className="bg-white/10" /></div>
                        </div>
                        <div><Label htmlFor="resepsiLocation">Lokasi</Label><Input id="resepsiLocation" name="resepsiLocation" onChange={handleChange} placeholder="Nama Gedung/Jalan" className="bg-white/10" /></div>
                        <div><Label htmlFor="resepsiMaps">Link Google Maps</Label><Input id="resepsiMaps" name="resepsiMaps" onChange={handleChange} placeholder="https://maps.app.goo.gl/..." className="bg-white/10" /></div>
                    </div>
                  )}
                  {currentStep === 4 && (
                    <div className="text-center">
                        <h3 className="text-xl font-semibold font-playfair mb-4">Pilih Musik Latar</h3>
                        <p className="text-gray-300">Fitur ini masih dalam tahap pengembangan.</p>
                        <Button type="button" variant="secondary" className="mt-4" onClick={() => toast({ title: "🚧 Fitur Belum Tersedia" })}>Lihat Pilihan Musik</Button>
                    </div>
                  )}
                  {currentStep === 5 && (
                    <div className="text-center">
                        <h3 className="text-xl font-semibold font-playfair mb-4">Informasi Hadiah Pernikahan</h3>
                        <p className="text-gray-300">Anda dapat menambahkan beberapa rekening bank atau e-wallet.</p>
                        <Button type="button" variant="secondary" className="mt-4" onClick={() => toast({ title: "🚧 Fitur Belum Tersedia" })}>+ Tambah Rekening</Button>
                    </div>
                  )}
                  {currentStep === 6 && (
                    <div className="text-center">
                      <h3 className="text-xl font-semibold font-playfair mb-4">Satu Langkah Lagi!</h3>
                      <p className="text-gray-300 mb-6">Periksa kembali data Anda di halaman preview sebelum melanjutkan ke pembayaran.</p>
                      <Button type="submit" size="lg" className="pulse-glow">Lihat Preview Undangan</Button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" onClick={handlePrev} disabled={currentStep === 1} className="bg-transparent border-white text-white hover:bg-white hover:text-black">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                </Button>
                {currentStep < steps.length && (
                  <Button type="button" onClick={handleNext} className="bg-white text-black hover:bg-gray-200">
                    Lanjut <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default OrderForm;