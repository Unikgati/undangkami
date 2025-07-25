
import React, { useRef, useEffect } from 'react';

function TimezoneDropdown({ label, value, options, open, setOpen, setForm, formKey }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, setOpen]);

  return (
    <div ref={dropdownRef}>
      <label className="block text-sm font-semibold text-blue-700 mb-1">{label}</label>
      <div className="relative w-full">
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between rounded-md border-2 border-blue-200 px-3 py-2 text-sm bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
          onClick={() => setOpen((open) => !open)}
        >
          {value || `Pilih Zona Waktu`}
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </button>
        {open && (
          <ul className="absolute z-10 mt-1 w-full bg-gray-900 border border-white/20 rounded shadow-lg">
            {options.map((option) => (
              <li
                key={option}
                className={`px-4 py-2 cursor-pointer hover:bg-purple-700 transition ${value === option ? "bg-purple-700 text-white" : "text-white"}`}
                onClick={() => {
                  setForm(prev => ({ ...prev, [formKey]: option }));
                  setOpen(false);
                }}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default TimezoneDropdown;
