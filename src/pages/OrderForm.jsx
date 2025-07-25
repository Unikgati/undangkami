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
import StepMusic from '@/components/orderform/StepMusic';
import StepSchedule from '@/components/orderform/StepSchedule';
import StepBrideGroom from '@/components/orderform/StepBrideGroom';
import StepParents from '@/components/orderform/StepParents';
import StepGift from '@/components/orderform/StepGift';
import StepReview from '@/components/orderform/StepReview';

// Tambah: import Firestore untuk fetch templates
import { useEffect } from 'react';

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
  const [selectedMusicId, setSelectedMusicId] = useState(null);
  // Pastikan templateId dari URL selalu masuk ke formData
  useEffect(() => {
    if (templateId) {
      setFormData(prev => ({ ...prev, templateId: templateId.toString() }));
    }
  }, [templateId]);

  // Pastikan selectedMusicId selalu masuk ke formData
  useEffect(() => {
    if (selectedMusicId) {
      setFormData(prev => ({ ...prev, selectedMusicId: selectedMusicId.toString() }));
    }
  }, [selectedMusicId]);
  const [musicList, setMusicList] = useState([]);
  const [playingId, setPlayingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const audioRefs = React.useRef({});
  // Tambah state untuk templates
  const [templates, setTemplates] = useState([]);

  // Fetch music list
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
            artist: d.artist || '',
          });
        });
        setMusicList(arr);
      });
    })();
    return () => unsub && unsub();
  }, []);

  // Fetch templates dari Firestore
  useEffect(() => {
    let unsub;
    (async () => {
      const { getApp } = await import('firebase/app');
      const { getFirestore, collection, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore(getApp());
      const q = collection(db, 'templates');
      unsub = onSnapshot(q, (snap) => {
        const arr = [];
        snap.forEach(doc => {
          const d = doc.data();
          if (d.status === 'publish') {
            arr.push({
              id: doc.id,
              name: d.name,
              ...d
            });
          }
        });
        setTemplates(arr);
      });
    })();
    return () => unsub && unsub();
  }, []);

  // Get unique categories for filter
  const categoryOptions = React.useMemo(() => {
    // Capitalize first letter for display
    const capitalize = str => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    const cats = musicList.map(m => m.category).filter(Boolean);
    const uniqueCats = Array.from(new Set(cats));
    return ['Semua', ...uniqueCats.map(capitalize)];
  }, [musicList]);

  // Filtered music list
  const filteredMusicList = selectedCategory === 'Semua'
    ? musicList
    : musicList.filter(m => {
        // Compare with capitalized category
        const capitalize = str => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
        return capitalize(m.category) === selectedCategory;
      });
  const [akadTimezoneOpen, setAkadTimezoneOpen] = useState(false);
  const akadTimezoneOptions = ["WIB", "WITA", "WIT"];
  const [resepsiTimezoneOpen, setResepsiTimezoneOpen] = useState(false);
  const resepsiTimezoneOptions = ["WIB", "WITA", "WIT"];

  const handleNext = () => {
    // Musik tidak lagi wajib dipilih
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
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 mb-4 step-icons-responsive">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center min-w-[70px] sm:min-w-[90px]">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep >= step.id ? 'bg-white text-purple-700 border-white' : 'border-gray-400 text-gray-400'}`}> 
                    {step.icon}
                  </div>
                  <p className={`mt-1 text-[0.7rem] sm:text-xs text-center transition-all duration-300 ${currentStep >= step.id ? 'text-white font-semibold' : 'text-gray-400'} step-label`}>{step.title}</p>
                </div>
              ))}
            </div>
            <style>{`
              @media (max-width: 600px) {
                .step-icons-responsive {
                  gap: 0.35rem !important;
                  margin-bottom: 0.5rem !important;
                }
                .step-icons-responsive > div {
                  min-width: 44px !important;
                }
                .step-icons-responsive .rounded-full {
                  width: 2.1rem !important;
                  height: 2.1rem !important;
                }
                .step-label {
                  display: none !important;
                }
              }
            `}</style>
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
                    <StepBrideGroom formData={formData} handleChange={handleChange} />
                  )}
                  {currentStep === 2 && (
                    <StepParents formData={formData} setFormData={setFormData} handleChange={handleChange} />
                  )}
                  {currentStep === 3 && (
                    <StepSchedule
                      formData={formData}
                      setFormData={setFormData}
                      akadTimezoneOpen={akadTimezoneOpen}
                      setAkadTimezoneOpen={setAkadTimezoneOpen}
                      akadTimezoneOptions={akadTimezoneOptions}
                      resepsiTimezoneOpen={resepsiTimezoneOpen}
                      setResepsiTimezoneOpen={setResepsiTimezoneOpen}
                      resepsiTimezoneOptions={resepsiTimezoneOptions}
                      handleChange={handleChange}
                    />
                  )}
                  {currentStep === 4 && (
                    <StepMusic
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      categoryDropdownOpen={categoryDropdownOpen}
                      setCategoryDropdownOpen={setCategoryDropdownOpen}
                      categoryOptions={categoryOptions}
                      filteredMusicList={filteredMusicList}
                      selectedMusicId={selectedMusicId}
                      setSelectedMusicId={setSelectedMusicId}
                      playingId={playingId}
                      setPlayingId={setPlayingId}
                      audioRefs={audioRefs}
                      formData={formData}
                      setFormData={setFormData}
                    />
                  )}
                  {currentStep === 5 && (
                    <StepGift toast={toast} formData={formData} setFormData={setFormData} handleChange={handleChange} />
                  )}
                  {currentStep === 6 && (
                    <StepReview formData={formData} templates={templates} musicList={musicList} />
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