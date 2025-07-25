import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// ...existing code...

const StepGift = ({ formData, setFormData }) => {
  // Pastikan satu wedding gift muncul secara default
  React.useEffect(() => {
    if (!formData.weddingGifts || formData.weddingGifts.length === 0) {
      setFormData(prev => ({
        ...prev,
        weddingGifts: [
          { type: 'bank', name: '', account: '', holder: '' }
        ]
      }));
    }
  }, []);
  // Dropdown state for each gift
  const [dropdownOpen, setDropdownOpen] = React.useState({});

  // Add new gift option
  const addWeddingGift = () => {
    setFormData(prev => ({
      ...prev,
      weddingGifts: [
        ...(prev.weddingGifts || []),
        { type: 'bank', name: '', account: '', holder: '' }
      ]
    }));
  };

  // Remove gift option
  const removeWeddingGift = (index) => {
    setFormData(prev => ({
      ...prev,
      weddingGifts: prev.weddingGifts.filter((_, i) => i !== index)
    }));
    setDropdownOpen(prev => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  };

  // Edit gift option
  const handleWeddingGiftChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      weddingGifts: prev.weddingGifts.map((gift, i) =>
        i === index ? { ...gift, [field]: value } : gift
      )
    }));
  };

  // Custom dropdown options
  const typeOptions = [
    { value: 'bank', label: 'Bank' },
    { value: 'ewallet', label: 'E-wallet' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold mb-4 text-white">Informasi Wedding Gift (Cashless)</h4>
        <p className="text-white mb-4">
          Tambahkan informasi rekening atau e-wallet untuk memudahkan tamu memberikan hadiah kepadamu.
        </p>
      </div>

      {/* Field WhatsApp Client */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="whatsappNumber">Nomor WhatsApp</Label>
          <Input
            id="whatsappNumber"
            name="whatsappNumber"
            type="text"
            placeholder="Contoh: 6281234567890"
            value={formData.whatsappNumber || ""}
            onChange={e => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
            className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white/10 text-white"
          />
        </div>
      </div>

      {(formData.weddingGifts || []).map((gift, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4 relative">
          <div className="flex justify-between items-center">
            <h5 className="font-semibold">Opsi Wedding Gift {index + 1}</h5>
            {(formData.weddingGifts.length > 1) && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => removeWeddingGift(index)}
                className="text-red-600 hover:bg-red-50 hover:text-red-600"
              >
                Hapus
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Jenis</Label>
              <div className="relative w-full">
                <button
                  type="button"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input px-3 py-2 text-sm bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                  onClick={() => setDropdownOpen(prev => ({ ...prev, [index]: !prev[index] }))}
                >
                  {typeOptions.find(opt => opt.value === gift.type)?.label}
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {dropdownOpen[index] && (
                  <ul className="absolute z-10 mt-1 w-full bg-gray-900 border border-white/20 rounded shadow-lg max-h-56 overflow-y-auto custom-scrollbar">
                    {typeOptions.map(opt => (
                      <li
                        key={opt.value}
                        className={`px-4 py-2 cursor-pointer hover:bg-purple-700 transition ${gift.type === opt.value ? 'bg-purple-700 text-white' : 'text-white'}`}
                        onClick={() => {
                          handleWeddingGiftChange(index, 'type', opt.value);
                          setDropdownOpen(prev => ({ ...prev, [index]: false }));
                        }}
                      >
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div>
              <Label>Nama {gift.type === 'bank' ? 'Bank' : 'E-wallet'}</Label>
              <Input
                value={gift.name}
                onChange={e => handleWeddingGiftChange(index, 'name', e.target.value)}
                placeholder={gift.type === 'bank' ? 'Bank BCA' : 'Dana'}
                required
                className="bg-white/10"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nomor {gift.type === 'bank' ? 'Rekening' : 'E-wallet'}</Label>
              <Input
                value={gift.account}
                onChange={e => handleWeddingGiftChange(index, 'account', e.target.value)}
                placeholder={gift.type === 'bank' ? '1234567890' : '081234567890'}
                required
                className="bg-white/10"
              />
            </div>
            <div>
              <Label>Nama Pemilik</Label>
              <Input
                value={gift.holder}
                onChange={e => handleWeddingGiftChange(index, 'holder', e.target.value)}
                placeholder="Nama pemilik rekening"
                required
                className="bg-white/10"
              />
            </div>
          </div>
        </div>
      ))}

      <Button 
        type="button" 
        onClick={addWeddingGift}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-white text-black hover:bg-gray-200 w-full"
      >
        Tambah Opsi Wedding Gift
      </Button>
    </div>
  );
};

export default StepGift;
