import React, { useState, useRef, useEffect } from 'react';

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'cs', label: 'Customer Service' },
  { value: 'designer', label: 'Designer' },
];

const CustomDropdown = ({ value, onChange, disabledOptions = [], placeholder = 'Pilih role' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className={`w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white text-gray-900 font-medium flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all ${open ? 'ring-2 ring-purple-400' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={value ? 'text-purple-700 font-bold' : 'text-gray-400'}>
          {value ? roles.find(r => r.value === value)?.label : placeholder}
        </span>
        <svg className={`ml-2 w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <ul className="absolute left-0 right-0 mt-2 bg-white border-2 border-blue-200 rounded-lg shadow-lg z-50 animate-fadeIn">
          {roles.map(role => (
            <li
              key={role.value}
              className={`px-4 py-2 cursor-pointer transition text-gray-900 ${value === role.value ? 'bg-purple-50 font-bold text-purple-700' : ''} ${disabledOptions.includes(role.value) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-100'}`}
              onClick={() => {
                if (!disabledOptions.includes(role.value)) {
                  onChange(role.value);
                  setOpen(false);
                }
              }}
            >
              {role.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
