import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const TABLE_HEADER = [
  { label: '', className: 'w-8' },
  { label: 'Pasangan', className: 'min-w-[180px]' },
  { label: 'Link', className: 'min-w-[180px]' },
  { label: 'Aksi', className: 'min-w-[100px]' },
];



function InvitationsTable({ data, handleDelete, loading, onBulkDelete }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [filterWeek, setFilterWeek] = useState('all'); // 'all', 1, 2, 3, 'custom'
  const [customWeek, setCustomWeek] = useState(1);
  // Filter data undangan berdasarkan umur minggu
  const now = new Date();
  const filteredData = data.filter(inv => {
    if (!inv.createdAt || filterWeek === 'all') return true;
    const created = new Date(inv.createdAt);
    const diffMs = now - created;
    const diffWeek = diffMs / (1000 * 60 * 60 * 24 * 7);
    let weekLimit = 0;
    if (filterWeek === 'custom') weekLimit = customWeek;
    else weekLimit = Number(filterWeek);
    return diffWeek <= weekLimit;
  });
  const allIds = filteredData.map(inv => inv.id);

  // Reset selectedIds jika data berubah
  useEffect(() => {
    setSelectedIds([]);
  }, [data, filterWeek, customWeek]);

  const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length;

  const toggleSelectAll = () => {
    if (isAllSelected) setSelectedIds([]);
    else setSelectedIds(allIds);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length > 0) {
      setShowBulkDeleteModal(true);
    }
  };

  const confirmBulkDelete = () => {
    if (onBulkDelete && selectedIds.length > 0) {
      onBulkDelete(selectedIds);
    }
    setShowBulkDeleteModal(false);
  };

  const cancelBulkDelete = () => {
    setShowBulkDeleteModal(false);
  };

  return (
    <div className="overflow-x-auto rounded-lg glass-effect border-none bg-card text-white shadow-lg mt-2">
      {/* Filter umur undangan */}
      <div className="flex items-center justify-between gap-2 px-4 pt-4 mb-2">
        <div className="flex items-center gap-2">
          <label htmlFor="filter-week" className="text-white text-sm font-semibold">Filter umur undangan:</label>
          <select
            id="filter-week"
            value={filterWeek}
            onChange={e => setFilterWeek(e.target.value)}
            className="rounded px-2 py-1 text-sm bg-purple-700 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-700"
          >
            <option value="all">Semua</option>
            <option value="1">≤ 1 minggu</option>
            <option value="2">≤ 2 minggu</option>
            <option value="3">≤ 3 minggu</option>
            <option value="custom">Custom</option>
          </select>
          {filterWeek === 'custom' && (
            <input
              type="number"
              min={1}
              value={customWeek}
              onChange={e => setCustomWeek(Number(e.target.value) || 1)}
              className="rounded px-2 py-1 text-sm bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-700 w-20"
              placeholder="minggu"
              style={{ minWidth: 0 }}
            />
          )}
        </div>
        {/* Tombol bulk delete tetap di kanan */}
        <button
          onClick={handleBulkDelete}
          disabled={selectedIds.length === 0}
          className={`px-3 py-1 rounded bg-red-600 text-white font-semibold text-xs border border-red-300/20 shadow hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Hapus Terpilih ({selectedIds.length})
        </button>
      </div>
      {/* Modal Konfirmasi Bulk Delete */}
      {showBulkDeleteModal && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-7 min-w-[300px] max-w-[90vw] border-2 border-red-300">
            <div className="flex flex-col items-center gap-3">
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#f87171"></circle>
                <path d="M15 9l-6 6M9 9l6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              <div className="text-lg font-semibold text-red-700 text-center">
                Hapus <span className="font-bold">{selectedIds.length}</span> undangan sekaligus?
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-700 to-blue-700 text-white font-bold hover:from-purple-800 hover:to-blue-800 shadow"
                  onClick={confirmBulkDelete}
                >
                  Ya, Hapus
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 shadow"
                  onClick={cancelBulkDelete}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* ...tombol hapus terpilih sudah ada di baris filter di atas... */}
      <table className="min-w-full text-sm md:text-base">
        <thead>
          <tr className="bg-white/10 text-white font-bold">
            <th className="py-3 px-4 border-b border-white/10 text-left w-8">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                onChange={toggleSelectAll}
                aria-label="Select all"
              />
            </th>
            <th className="py-3 px-4 border-b border-white/10 text-left min-w-[180px]">Pasangan</th>
            <th className="py-3 px-4 border-b border-white/10 text-left min-w-[180px]">Link</th>
            <th className="py-3 px-4 border-b border-white/10 text-left min-w-[100px]">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={4} className="text-center py-8 text-gray-300">Memuat data...</td></tr>
          ) : filteredData.length === 0 ? (
            <tr><td colSpan={4} className="text-center py-8 text-gray-300">Tidak ada data undangan.</td></tr>
          ) : filteredData.map(inv => {
            const link = inv.slug ? (window.location.origin + '/inv/' + inv.slug) : '-';
            return (
              <tr key={inv.id} className="hover:bg-white/5 transition">
                <td className="py-2 px-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(inv.id)}
                    onChange={() => toggleSelect(inv.id)}
                    aria-label="Select invitation"
                  />
                </td>
                <td className="py-2 px-4 font-semibold text-white whitespace-nowrap max-w-[220px] overflow-hidden text-ellipsis" title={inv.name || inv.groomFullName || inv.brideFullName || ''}>
                  {inv.name || inv.groomFullName || inv.brideFullName || '-'}
                </td>
                <td className="py-2 px-4 whitespace-nowrap max-w-[260px] overflow-hidden text-ellipsis">
                  {inv.slug ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-200 hover:text-blue-400 truncate max-w-[160px] inline-block align-middle"
                      title={link}
                    >
                      {link}
                    </a>
                  ) : '-'}
                </td>
                <td className="py-2 px-4 whitespace-nowrap flex gap-2 items-center">
                  <button onClick={() => handleDelete(inv)} className="px-2 py-1 rounded bg-white/10 text-red-200 font-semibold hover:bg-white/20 transition text-xs border border-red-300/20">Hapus</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default InvitationsTable;
