import React from 'react';

function WeddingGiftItem({ gift, idx, setWeddingGifts }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center w-full">
      <input
        type="text"
        className="px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400 w-full text-sm"
        placeholder="Name"
        value={gift.name || ""}
        onChange={e => {
          const val = e.target.value;
          setWeddingGifts(gifts => gifts.map((g, i) => i === idx ? { ...g, name: val } : g));
        }}
      />
      <input
        type="text"
        className="px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400 w-full text-sm"
        placeholder="Holder"
        value={gift.holder || ""}
        onChange={e => {
          const val = e.target.value;
          setWeddingGifts(gifts => gifts.map((g, i) => i === idx ? { ...g, holder: val } : g));
        }}
      />
      <input
        type="text"
        className="px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 font-medium placeholder-gray-400 w-full text-sm"
        placeholder="Account"
        value={gift.account || ""}
        onChange={e => {
          const val = e.target.value;
          setWeddingGifts(gifts => gifts.map((g, i) => i === idx ? { ...g, account: val } : g));
        }}
      />
      <div className="relative w-full">
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between rounded-lg border-2 border-blue-200 px-3 py-2 text-sm bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
          onClick={() => {
            setWeddingGifts(gifts => gifts.map((g, i) => i === idx ? { ...g, typeDropdownOpen: !g.typeDropdownOpen } : g));
          }}
        >
          {gift.type === "ewallet" ? "E-Wallet" : gift.type === "bank" ? "Bank" : "Pilih Tipe"}
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {gift.typeDropdownOpen && (
          <ul className="absolute z-10 mt-1 w-full bg-gray-900 border border-white/20 rounded shadow-lg">
            {["ewallet", "bank"].map((option) => (
              <li
                key={option}
                className={`px-4 py-2 cursor-pointer hover:bg-purple-700 transition ${gift.type === option ? "bg-purple-700 text-white" : "text-white"}`}
                onClick={() => {
                  setWeddingGifts(gifts => gifts.map((g, i) => i === idx ? { ...g, type: option, typeDropdownOpen: false } : g));
                }}
              >
                {option === "ewallet" ? "E-Wallet" : "Bank"}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="button"
        className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-bold hover:bg-red-200 border-2 border-red-200"
        onClick={() => setWeddingGifts(gifts => gifts.filter((_, i) => i !== idx))}
      >Hapus</button>
    </div>
  );
}

export default WeddingGiftItem;
