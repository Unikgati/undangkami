import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


const StepSchedule = ({ formData, setFormData, akadTimezoneOpen, setAkadTimezoneOpen, akadTimezoneOptions, resepsiTimezoneOpen, setResepsiTimezoneOpen, resepsiTimezoneOptions }) => (
  <div className="space-y-8">
    <h3 className="text-xl font-semibold font-plusjakartasans mb-4">Akad Nikah</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="akadDate">Tanggal</Label>
        <Input id="akadDate" name="akadDate" type="date" value={formData?.akadDate || ""} onChange={e => setFormData(prev => ({ ...prev, akadDate: e.target.value }))} className="bg-white/10" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="akadTime">Waktu & Zona Waktu</Label>
        <div className="flex gap-2">
          <Input id="akadTime" name="akadTime" type="time" value={formData?.akadTime || ""} onChange={e => setFormData(prev => ({ ...prev, akadTime: e.target.value }))} className="bg-white/10 w-1/2" />
          <div className="relative w-1/2">
            <button
              type="button"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input px-3 py-2 text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              onClick={() => setAkadTimezoneOpen((open) => !open)}
            >
              {formData.akadTimezone || "Zona Waktu"}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {akadTimezoneOpen && (
              <ul className="absolute z-10 mt-1 w-full bg-gray-900 border border-white/20 rounded shadow-lg">
                {akadTimezoneOptions.map((option) => (
                  <li
                    key={option}
                    className={`px-4 py-2 cursor-pointer hover:bg-purple-700 transition ${formData.akadTimezone === option ? "bg-purple-700 text-white" : "text-white"}`}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, akadTimezone: option }));
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
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="akadLocation">Lokasi</Label>
        <Input id="akadLocation" name="akadLocation" value={formData?.akadLocation || ""} onChange={e => setFormData(prev => ({ ...prev, akadLocation: e.target.value }))} placeholder="Nama Gedung/Jalan" className="bg-white/10" />
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="akadMaps">Link Google Maps</Label>
        <Input id="akadMaps" name="akadMaps" value={formData?.akadMaps || ""} onChange={e => setFormData(prev => ({ ...prev, akadMaps: e.target.value }))} placeholder="https://maps.app.goo.gl/..." className="bg-white/10" />
      </div>
    </div>
    <h3 className="text-xl font-semibold font-plusjakartasans mt-8 mb-4">Resepsi</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="resepsiDate">Tanggal</Label>
        <Input id="resepsiDate" name="resepsiDate" type="date" value={formData?.resepsiDate || ""} onChange={e => setFormData(prev => ({ ...prev, resepsiDate: e.target.value }))} className="bg-white/10" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="resepsiTime">Waktu & Zona Waktu</Label>
        <div className="flex gap-2">
          <Input id="resepsiTime" name="resepsiTime" type="time" value={formData?.resepsiTime || ""} onChange={e => setFormData(prev => ({ ...prev, resepsiTime: e.target.value }))} className="bg-white/10 w-1/2" />
          <div className="relative w-1/2">
            <button
              type="button"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input px-3 py-2 text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              onClick={() => setResepsiTimezoneOpen((open) => !open)}
            >
              {formData.resepsiTimezone || "Zona Waktu"}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {resepsiTimezoneOpen && (
              <ul className="absolute z-10 mt-1 w-full bg-gray-900 border border-white/20 rounded shadow-lg">
                {resepsiTimezoneOptions.map((option) => (
                  <li
                    key={option}
                    className={`px-4 py-2 cursor-pointer hover:bg-purple-700 transition ${formData.resepsiTimezone === option ? "bg-purple-700 text-white" : "text-white"}`}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, resepsiTimezone: option }));
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
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="resepsiLocation">Lokasi</Label>
        <Input id="resepsiLocation" name="resepsiLocation" value={formData?.resepsiLocation || ""} onChange={e => setFormData(prev => ({ ...prev, resepsiLocation: e.target.value }))} placeholder="Nama Gedung/Jalan" className="bg-white/10" />
      </div>
      <div className="flex flex-col gap-2 sm:col-span-2">
        <Label htmlFor="resepsiMaps">Link Google Maps</Label>
        <Input id="resepsiMaps" name="resepsiMaps" value={formData?.resepsiMaps || ""} onChange={e => setFormData(prev => ({ ...prev, resepsiMaps: e.target.value }))} placeholder="https://maps.app.goo.gl/..." className="bg-white/10" />
      </div>
    </div>
  </div>
);

export default StepSchedule;
