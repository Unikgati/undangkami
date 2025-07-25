import React, { useState } from 'react';

function CustomTemplateDropdown({ templateOptions, selectedTemplateId, setForm }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = React.useRef(null);
  const selected = templateOptions.find(t => t.id === selectedTemplateId);

  React.useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        className="flex h-10 w-full items-center justify-between rounded-md border-2 border-blue-200 px-3 py-2 text-sm bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
        onClick={() => setOpen(o => !o)}
      >
        {selected ? (selected.name || selected.id) : 'Pilih Template'}
        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <ul className="absolute z-10 mt-1 w-full bg-gray-900 border border-white/20 rounded shadow-lg max-h-60 overflow-y-auto">
          {templateOptions.map(opt => (
            <li
              key={opt.id}
              className={`px-4 py-2 cursor-pointer hover:bg-purple-700 transition ${selectedTemplateId === opt.id ? "bg-purple-700 text-white" : "text-white"}`}
              onClick={() => {
                setForm(prev => ({ ...prev, templateId: opt.id }));
                setOpen(false);
              }}
            >
              {opt.name || opt.id}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CustomTemplateDropdown;
