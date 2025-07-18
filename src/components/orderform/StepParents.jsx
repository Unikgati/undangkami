import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const StepParents = ({ formData, handleChange }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold font-plusjakartasans mb-4">Orang Tua Mempelai Pria</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><Label htmlFor="groomFather">Nama Ayah</Label><Input id="groomFather" name="groomFather" value={formData?.groomFather || ""} onChange={handleChange} placeholder="Nama Ayah" className="bg-white/10" /></div>
      <div><Label htmlFor="groomMother">Nama Ibu</Label><Input id="groomMother" name="groomMother" value={formData?.groomMother || ""} onChange={handleChange} placeholder="Nama Ibu" className="bg-white/10" /></div>
    </div>
    <h3 className="text-xl font-semibold font-plusjakartasans mt-6 mb-4">Orang Tua Mempelai Wanita</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div><Label htmlFor="brideFather">Nama Ayah</Label><Input id="brideFather" name="brideFather" value={formData?.brideFather || ""} onChange={handleChange} placeholder="Nama Ayah" className="bg-white/10" /></div>
      <div><Label htmlFor="brideMother">Nama Ibu</Label><Input id="brideMother" name="brideMother" value={formData?.brideMother || ""} onChange={handleChange} placeholder="Nama Ibu" className="bg-white/10" /></div>
    </div>
  </div>
);

export default StepParents;
