import React from 'react';
import { Button } from '@/components/ui/button';

const StepReview = () => (
  <div className="text-center">
    <h3 className="text-xl font-semibold font-plusjakartasans mb-4">Satu Langkah Lagi!</h3>
    <p className="text-gray-300 mb-6">Periksa kembali data Anda di halaman preview sebelum melanjutkan ke pembayaran.</p>
    <Button type="submit" size="lg" className="pulse-glow">Lihat Preview Undangan</Button>
  </div>
);

export default StepReview;
