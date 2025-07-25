import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const StepBrideGroom = ({ formData, handleChange }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold font-plusjakartasans mb-4">Mempelai Pria</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><Label htmlFor="groomFullName">Nama Lengkap</Label><Input id="groomFullName" name="groomFullName" value={formData?.groomFullName || ""} onChange={handleChange} placeholder="Contoh: John Doe" className="bg-white/10" /></div>
      <div><Label htmlFor="groomNickName">Nama Panggilan</Label><Input id="groomNickName" name="groomNickName" value={formData?.groomNickName || ""} onChange={handleChange} placeholder="Contoh: John" className="bg-white/10" /></div>
    </div>
    <h3 className="text-xl font-semibold font-plusjakartasans mt-6 mb-4">Mempelai Wanita</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><Label htmlFor="brideFullName">Nama Lengkap</Label><Input id="brideFullName" name="brideFullName" value={formData?.brideFullName || ""} onChange={handleChange} placeholder="Contoh: Jane Doe" className="bg-white/10" /></div>
      <div><Label htmlFor="brideNickName">Nama Panggilan</Label><Input id="brideNickName" name="brideNickName" value={formData?.brideNickName || ""} onChange={handleChange} placeholder="Contoh: Jane" className="bg-white/10" /></div>
    </div>
    {/* Field WhatsApp client dihapus, hanya ada data mempelai */}
  </div>
);

export default StepBrideGroom;
