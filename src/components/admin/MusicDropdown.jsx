
import React, { useRef, useEffect } from 'react';

function MusicDropdown({ musicList, form, setForm }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!form.musicDropdownOpen) return;
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setForm(prev => ({ ...prev, musicDropdownOpen: false }));
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [form.musicDropdownOpen, setForm]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        className="flex h-10 w-full items-center justify-between rounded-md border-2 border-blue-200 px-3 py-2 text-sm bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
        onClick={() => setForm(prev => ({ ...prev, musicDropdownOpen: !prev.musicDropdownOpen }))}
      >
        {(() => {
          const selected = musicList.find(m => m.id === form.selectedMusicId);
          return selected ? `${selected.name}${selected.artist ? ' - ' + selected.artist : ''}` : 'Pilih Musik';
        })()}
        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {form.musicDropdownOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-gray-900 border border-white/20 rounded shadow-lg max-h-60 overflow-y-auto">
          {musicList.map(m => (
            <li
              key={m.id}
              className={`px-4 py-2 cursor-pointer hover:bg-purple-700 transition ${form.selectedMusicId === m.id ? "bg-purple-700 text-white" : "text-white"}`}
              onClick={() => {
                setForm(prev => ({
                  ...prev,
                  selectedMusicId: m.id,
                  musicUrl: m.url || "",
                  musicDropdownOpen: false
                }));
              }}
            >
              {m.name}{m.artist ? ` - ${m.artist}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default MusicDropdown;
