
import React from 'react';
import WeddingGiftItem from './WeddingGiftItem';
import MusicDropdown from './MusicDropdown';
import TimezoneDropdown from './TimezoneDropdown';
import CustomTemplateDropdown from './CustomTemplateDropdown';

const EditOrderModal = ({
  show,
  order,
  form,
  weddingGifts,
  musicList,
  akadTimezoneOptions,
  resepsiTimezoneOptions,
  editAkadTimezoneOpen,
  setEditAkadTimezoneOpen,
  editResepsiTimezoneOpen,
  setEditResepsiTimezoneOpen,
  setForm,
  setWeddingGifts,
  editLoading,
  onClose,
  onChange,
  onSubmit,
  templateOptions = [] // [{id, name}]
}) => {
  if (!show || !order) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[95vw] flex items-center justify-center">
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-5 p-7 bg-white rounded-xl shadow-2xl min-w-[320px] max-w-[600px] w-full border-2 border-blue-200 relative overflow-y-auto max-h-[90vh]"
          style={{ boxSizing: 'border-box' }}
        >
          <div className="flex items-center justify-between mb-1 sticky top-0 bg-white z-10 pb-2">
            <h2 className="text-xl font-bold text-blue-800 tracking-tight">Edit Undangan</h2>
            <button type="button" onClick={onClose} className="rounded-full p-1.5 transition bg-gray-100 hover:bg-purple-100 border border-transparent hover:border-purple-400 text-gray-400 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
            </button>
          </div>
          {templateOptions.length > 0 && (
            <div className="mb-2">
              <label className="block text-sm font-semibold text-blue-700 mb-1">Template Undangan</label>
              <CustomTemplateDropdown
                templateOptions={templateOptions}
                selectedTemplateId={form.templateId}
                setForm={setForm}
              />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">Nama Lengkap Mempelai Pria</label>
              <input type="text" name="groomFullName" value={form.groomFullName} onChange={onChange} className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400" placeholder="Nama lengkap pria" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">Nama Lengkap Mempelai Wanita</label>
              <input type="text" name="brideFullName" value={form.brideFullName} onChange={onChange} className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400" placeholder="Nama lengkap wanita" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">Nama Panggilan Pria</label>
              <input type="text" name="groomNickName" value={form.groomNickName} onChange={onChange} className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400" placeholder="Panggilan pria" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">Nama Panggilan Wanita</label>
              <input type="text" name="brideNickName" value={form.brideNickName} onChange={onChange} className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400" placeholder="Panggilan wanita" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">Nama Ayah Pria</label>
              <input type="text" name="groomFather" value={form.groomFather} onChange={onChange} className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400" placeholder="Nama ayah pria" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">Nama Ibu Pria</label>
              <input type="text" name="groomMother" value={form.groomMother} onChange={onChange} className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400" placeholder="Nama ibu pria" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">Nama Ayah Wanita</label>
              <input type="text" name="brideFather" value={form.brideFather} onChange={onChange} className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400" placeholder="Nama ayah wanita" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">Nama Ibu Wanita</label>
              <input type="text" name="brideMother" value={form.brideMother} onChange={onChange} className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400" placeholder="Nama ibu wanita" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">Tanggal Akad</label>
              <input type="date" name="akadDate" value={form.akadDate} onChange={onChange} className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">Jam Akad</label>
              <input type="time" name="akadTime" value={form.akadTime} onChange={onChange} className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">Lokasi Akad</label>
              <input type="text" name="akadLocation" value={form.akadLocation} onChange={onChange} className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">Link Maps Akad</label>
              <input type="text" name="akadMaps" value={form.akadMaps} onChange={onChange} className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400" placeholder="https://maps.google.com/..." />
            </div>
            <div>
            <TimezoneDropdown
              label="Zona Waktu Akad"
              value={form.akadTimezone}
              options={akadTimezoneOptions}
              open={editAkadTimezoneOpen}
              setOpen={setEditAkadTimezoneOpen}
              setForm={setForm}
              formKey="akadTimezone"
            />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">Tanggal Resepsi</label>
              <input type="date" name="resepsiDate" value={form.resepsiDate} onChange={onChange} className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">Jam Resepsi</label>
              <input type="time" name="resepsiTime" value={form.resepsiTime} onChange={onChange} className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">Lokasi Resepsi</label>
              <input type="text" name="resepsiLocation" value={form.resepsiLocation} onChange={onChange} className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-700 mb-1">Link Maps Resepsi</label>
              <input type="text" name="resepsiMaps" value={form.resepsiMaps} onChange={onChange} className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400" placeholder="https://maps.google.com/..." />
            </div>
            <div>
            <TimezoneDropdown
              label="Zona Waktu Resepsi"
              value={form.resepsiTimezone}
              options={resepsiTimezoneOptions}
              open={editResepsiTimezoneOpen}
              setOpen={setEditResepsiTimezoneOpen}
              setForm={setForm}
              formKey="resepsiTimezone"
            />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-700 mb-1">Musik Undangan</label>
            <MusicDropdown musicList={musicList} form={form} setForm={setForm} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-700 mb-1">Wedding Gift</label>
            <div className="flex flex-col gap-2">
              {weddingGifts.map((gift, idx) => (
                <WeddingGiftItem key={idx} gift={gift} idx={idx} setWeddingGifts={setWeddingGifts} />
              ))}
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-700 to-blue-700 text-white font-bold hover:from-purple-800 hover:to-blue-800 shadow mt-1 w-fit"
                onClick={() => setWeddingGifts(gifts => [...gifts, { name: "", holder: "", account: "", type: "" }])}
              >+ Tambah Gift</button>
            </div>
          </div>
          <button type="submit" disabled={editLoading} className="inline-flex items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary hover:bg-primary/90 h-10 px-4 bg-gradient-to-r from-purple-700 to-blue-700 text-white font-bold hover:from-purple-800 hover:to-blue-800 w-full mt-2 py-2 rounded-lg shadow-lg transition-all text-base tracking-wide">
            {editLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditOrderModal;
