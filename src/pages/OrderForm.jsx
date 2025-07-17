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
  const [musicList, setMusicList] = useState([]);
  const [playingId, setPlayingId] = useState(null);
  const audioRefs = React.useRef({});
  React.useEffect(() => {
    let unsub;
    (async () => {
      const { getApp } = await import('firebase/app');
      const { getFirestore, collection, onSnapshot, query, orderBy } = await import('firebase/firestore');
      const db = getFirestore(getApp());
      const q = query(collection(db, 'music'), orderBy('createdAt', 'desc'));
      unsub = onSnapshot(q, (snap) => {
        const arr = [];
        snap.forEach(doc => {
          const d = doc.data();
          arr.push({
            id: doc.id,
            title: d.name,
            category: d.category,
            url: d.url,
          });
        });
        setMusicList(arr);
      });
    })();
    return () => unsub && unsub();
  }, []);
  const [akadTimezoneOpen, setAkadTimezoneOpen] = useState(false);
  const akadTimezoneOptions = ["WIB", "WITA", "WIT"];
  const [resepsiTimezoneOpen, setResepsiTimezoneOpen] = useState(false);
  const resepsiTimezoneOptions = ["WIB", "WITA", "WIT"];

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
    hidden: { opacity: 0, x: 10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
  };

  return (
    <>
      <Helmet>
        <title>{`Form Pemesanan Undangan - Langkah ${currentStep}`}</title>
        <meta name="description" content={`Isi data undangan Anda. Template ID: ${templateId}`} />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-purple-900 font-plusjakartasans">
        <Card className="w-full max-w-3xl glass-effect text-white border-none shadow-2xl font-plusjakartasans">
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
            <CardTitle className="text-center font-plusjakartasans text-3xl">{steps[currentStep - 1].title}</CardTitle>
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
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold font-plusjakartasans mb-4">Mempelai Pria</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label htmlFor="groomFullName">Nama Lengkap</Label><Input id="groomFullName" name="groomFullName" onChange={handleChange} placeholder="Contoh: John Doe" className="bg-white/10" /></div>
                        <div><Label htmlFor="groomNickName">Nama Panggilan</Label><Input id="groomNickName" name="groomNickName" onChange={handleChange} placeholder="Contoh: John" className="bg-white/10" /></div>
                      </div>
                      <h3 className="text-xl font-semibold font-plusjakartasans mt-6 mb-4">Mempelai Wanita</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label htmlFor="brideFullName">Nama Lengkap</Label><Input id="brideFullName" name="brideFullName" onChange={handleChange} placeholder="Contoh: Jane Doe" className="bg-white/10" /></div>
                        <div><Label htmlFor="brideNickName">Nama Panggilan</Label><Input id="brideNickName" name="brideNickName" onChange={handleChange} placeholder="Contoh: Jane" className="bg-white/10" /></div>
                      </div>
                    </div>
                  )}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold font-plusjakartasans mb-4">Orang Tua Mempelai Pria</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label htmlFor="groomFather">Nama Ayah</Label><Input id="groomFather" name="groomFather" onChange={handleChange} placeholder="Nama Ayah" className="bg-white/10" /></div>
                        <div><Label htmlFor="groomMother">Nama Ibu</Label><Input id="groomMother" name="groomMother" onChange={handleChange} placeholder="Nama Ibu" className="bg-white/10" /></div>
                      </div>
                      <h3 className="text-xl font-semibold font-plusjakartasans mt-6 mb-4">Orang Tua Mempelai Wanita</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label htmlFor="brideFather">Nama Ayah</Label><Input id="brideFather" name="brideFather" onChange={handleChange} placeholder="Nama Ayah" className="bg-white/10" /></div>
                        <div><Label htmlFor="brideMother">Nama Ibu</Label><Input id="brideMother" name="brideMother" onChange={handleChange} placeholder="Nama Ibu" className="bg-white/10" /></div>
                      </div>
                    </div>
                  )}
                  {currentStep === 3 && (
                     <div className="space-y-4">
                        <h3 className="text-xl font-semibold font-plusjakartasans mb-4">Akad Nikah</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><Label htmlFor="akadDate">Tanggal</Label><Input id="akadDate" name="akadDate" type="date" onChange={handleChange} className="bg-white/10" /></div>
                          <div>
                            <Label htmlFor="akadTime">Waktu</Label>
                            <div className="flex gap-2">
                              <Input id="akadTime" name="akadTime" type="time" onChange={handleChange} className="bg-white/10" />
                              <div className="relative w-full">
                                <button
                                  type="button"
                                  className="flex h-10 w-full items-center justify-between rounded-md border border-input px-3 py-2 text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                                  onClick={() => setAkadTimezoneOpen((open) => !open)}
                                >
                                  {formData.akadTimezone || "Pilih Zona Waktu"}
                                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {akadTimezoneOpen && (
                                  <ul className="absolute z-10 mt-1 w-full bg-gray-900 border border-white/20 rounded shadow-lg">
                                    {akadTimezoneOptions.map((option) => (
                                      <li
                                        key={option}
                                        className={`px-4 py-2 cursor-pointer hover:bg-purple-700 transition ${formData.akadTimezone === option ? "bg-purple-700 text-white" : "text-white"}`}
                                        onClick={() => {
                                          setFormData((prev) => ({ ...prev, akadTimezone: option }));
                                          setAkadTimezoneOpen(false);
                                        }}
                                      >
                                        {option}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div><Label htmlFor="akadLocation">Lokasi</Label><Input id="akadLocation" name="akadLocation" onChange={handleChange} placeholder="Nama Gedung/Jalan" className="bg-white/10" /></div>
                        <div><Label htmlFor="akadMaps">Link Google Maps</Label><Input id="akadMaps" name="akadMaps" onChange={handleChange} placeholder="https://maps.app.goo.gl/..." className="bg-white/10" /></div>
                        
                        <h3 className="text-xl font-semibold font-plusjakartasans mt-6 mb-4">Resepsi</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><Label htmlFor="resepsiDate">Tanggal</Label><Input id="resepsiDate" name="resepsiDate" type="date" onChange={handleChange} className="bg-white/10" /></div>
                          <div>
                            <Label htmlFor="resepsiTime">Waktu</Label>
                            <div className="flex gap-2">
                              <Input id="resepsiTime" name="resepsiTime" type="time" onChange={handleChange} className="bg-white/10" />
                              <div className="relative w-full">
                                <button
                                  type="button"
                                  className="flex h-10 w-full items-center justify-between rounded-md border border-input px-3 py-2 text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                                  onClick={() => setResepsiTimezoneOpen((open) => !open)}
                                >
                                  {formData.resepsiTimezone || "Pilih Zona Waktu"}
                                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </button>
                                {resepsiTimezoneOpen && (
                                  <ul className="absolute z-10 mt-1 w-full bg-gray-900 border border-white/20 rounded shadow-lg">
                                    {resepsiTimezoneOptions.map((option) => (
                                      <li
                                        key={option}
                                        className={`px-4 py-2 cursor-pointer hover:bg-purple-700 transition ${formData.resepsiTimezone === option ? "bg-purple-700 text-white" : "text-white"}`}
                                        onClick={() => {
                                          setFormData((prev) => ({ ...prev, resepsiTimezone: option }));
                                          setResepsiTimezoneOpen(false);
                                        }}
                                      >
                                        {option}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div><Label htmlFor="resepsiLocation">Lokasi</Label><Input id="resepsiLocation" name="resepsiLocation" onChange={handleChange} placeholder="Nama Gedung/Jalan" className="bg-white/10" /></div>
                        <div><Label htmlFor="resepsiMaps">Link Google Maps</Label><Input id="resepsiMaps" name="resepsiMaps" onChange={handleChange} placeholder="https://maps.app.goo.gl/..." className="bg-white/10" /></div>
                    </div>
                  )}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      {musicList.length === 0 ? (
                        <p className="text-gray-300 text-center">Belum ada musik yang tersedia.</p>
                      ) : (
                        <ul className="divide-y divide-white/10 rounded-lg bg-white/5 p-2">
                          {musicList.map((music) => (
                            <li key={music.id} className="flex items-center justify-between py-3 px-2">
                              <div className="flex flex-col">
                                <span className="font-plusjakartasans text-white text-base font-semibold">{music.title}</span>
                                <span className="text-xs text-purple-300 mt-1">{music.category}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className={`rounded-full p-2 bg-purple-700 hover:bg-purple-800 transition focus:outline-none focus:ring-2 focus:ring-purple-400`}
                                  onClick={() => {
                                    if (playingId === music.id) {
                                      audioRefs.current[music.id]?.pause();
                                      setPlayingId(null);
                                    } else {
                                      Object.values(audioRefs.current).forEach(a => a?.pause());
                                      audioRefs.current[music.id]?.play();
                                      setPlayingId(music.id);
                                    }
                                  }}
                                >
                                  {playingId === music.id ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" /></svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><polygon points="6,4 20,12 6,20" fill="currentColor" /></svg>
                                  )}
                                </button>
                                <audio
                                  ref={el => audioRefs.current[music.id] = el}
                                  src={music.url}
                                  onEnded={() => setPlayingId(null)}
                                  style={{ display: 'none' }}
                                />
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  {currentStep === 5 && (
                    <div className="text-center">
                        <h3 className="text-xl font-semibold font-plusjakartasans mb-4">Informasi Hadiah Pernikahan</h3>
                        <p className="text-gray-300">Anda dapat menambahkan beberapa rekening bank atau e-wallet.</p>
                        <Button type="button" variant="secondary" className="mt-4" onClick={() => toast({ title: "🚧 Fitur Belum Tersedia" })}>+ Tambah Rekening</Button>
                    </div>
                  )}
                  {currentStep === 6 && (
                    <div className="text-center">
                      <h3 className="text-xl font-semibold font-plusjakartasans mb-4">Satu Langkah Lagi!</h3>
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