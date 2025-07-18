import React from 'react';
import { Button } from '@/components/ui/button';

const StepGift = ({ toast }) => (
  <div className="text-center">
    <h3 className="text-xl font-semibold font-plusjakartasans mb-4">Informasi Hadiah Pernikahan</h3>
    <p className="text-gray-300">Anda dapat menambahkan beberapa rekening bank atau e-wallet.</p>
    <Button type="button" variant="secondary" className="mt-4" onClick={() => toast({ title: "🚧 Fitur Belum Tersedia" })}>+ Tambah Rekening</Button>
  </div>
);

export default StepGift;
