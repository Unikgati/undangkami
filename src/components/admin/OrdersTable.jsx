import React from 'react';

// Hanya 2 kolom utama di mobile, kolom lain hidden sm:table-cell
const TABLE_HEADER = [
  { label: 'Pasangan', className: '' },
  { label: 'Template', className: 'hidden sm:table-cell' },
  { label: 'Link', className: 'hidden sm:table-cell' },
  { label: 'Harga', className: 'hidden sm:table-cell text-right' },
  { label: 'Status', className: 'hidden sm:table-cell' },
  { label: 'Aksi', className: '' },
];

function OrdersTable({ data, getTemplateName, formatRupiah, statusColor, handleEdit, handleProcess, handleDelete }) {
  // Tombol copy icon khusus mobile (aksi)
  const CopyIconButton = ({ link }) => {
    const [copied, setCopied] = React.useState(false);
    return (
      <button
        className="sm:hidden px-2 py-1 rounded bg-white/10 text-blue-200 hover:bg-white/20 border border-blue-300/20 flex items-center justify-center"
        title="Salin link undangan"
        onClick={async () => {
          await navigator.clipboard.writeText(link);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        type="button"
      >
        {copied ? (
          // Icon copy success (checkmark on copy icon)
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-green-400">
            <rect x="9" y="9" width="10" height="10" rx="2" stroke="currentColor" fill="none" />
            <rect x="5" y="5" width="10" height="10" rx="2" stroke="currentColor" fill="none" opacity="0.5" />
            <path d="M12 14l2 2l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          // Icon copy (two papers)
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <rect x="9" y="9" width="10" height="10" rx="2" stroke="currentColor" fill="none" />
            <rect x="5" y="5" width="10" height="10" rx="2" stroke="currentColor" fill="none" opacity="0.5" />
          </svg>
        )}
      </button>
    );
  };
  // Komponen tombol salin per baris
  const CopyButton = ({ link }) => {
    const [copied, setCopied] = React.useState(false);
    return (
      <button
        className="px-2 py-1 rounded bg-white/10 text-xs text-blue-200 hover:bg-white/20 border border-blue-300/20 flex items-center justify-center"
        title="Copy link"
        onClick={async () => {
          await navigator.clipboard.writeText(link);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? (
          <span className="text-green-400 text-base" aria-label="Disalin" title="Disalin">✔️</span>
        ) : (
          'Salin'
        )}
      </button>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg glass-effect border-none bg-card text-white shadow-lg mt-2">
      <table className="w-full text-sm md:text-base">
        <thead>
          <tr className="bg-white/10 text-white font-bold">
            <th className="py-2 px-2 sm:py-3 sm:px-4 border-b border-white/10 text-left">Pasangan</th>
            <th className="py-2 px-2 sm:py-3 sm:px-4 border-b border-white/10 text-left hidden sm:table-cell">Template</th>
            <th className="py-2 px-2 sm:py-3 sm:px-4 border-b border-white/10 text-left hidden sm:table-cell">Link</th>
            <th className="py-2 px-2 sm:py-3 sm:px-4 border-b border-white/10 text-left hidden sm:table-cell text-right">Harga</th>
            <th className="py-2 px-2 sm:py-3 sm:px-4 border-b border-white/10 text-left hidden sm:table-cell">Status</th>
            <th className="py-2 px-2 sm:py-3 sm:px-4 border-b border-white/10 text-left">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={6} className="text-center py-6 text-gray-300">Tidak ada data pesanan.</td></tr>
          ) : data.map(order => {
            // Hitung harga setelah diskon
            const price = Number(order.price) || 0;
            const discount = Number(order.discount) || 0;
            const finalPrice = price * (1 - discount / 100);
            const link = window.location.origin + '/inv/' + order.slug;
            return (
              <tr key={order.id} className="hover:bg-white/5 transition">
                <td
                  className="py-1 px-2 sm:py-2 sm:px-4 font-semibold text-white whitespace-nowrap max-w-[120px] sm:max-w-[220px] overflow-hidden truncate"
                  title={`${order.groomFullName} & ${order.brideFullName}`}
                >
                  {order.groomFullName} &amp; {order.brideFullName}
                </td>
                <td className="py-1 px-2 sm:py-2 sm:px-4 whitespace-nowrap hidden sm:table-cell">{getTemplateName(order)}</td>
                <td className="py-1 px-2 sm:py-2 sm:px-4 whitespace-nowrap max-w-[260px] overflow-hidden text-ellipsis hidden sm:table-cell">
                  {order.slug ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-200 hover:text-blue-400 truncate max-w-[160px]"
                        title={link}
                      >
                        {link}
                      </a>
                      <CopyButton link={link} />
                    </div>
                  ) : '-'}
                </td>
                <td className="py-1 px-2 sm:py-2 sm:px-4 whitespace-nowrap text-right hidden sm:table-cell">{formatRupiah(finalPrice)}</td>
                <td className="py-1 px-2 sm:py-2 sm:px-4 whitespace-nowrap hidden sm:table-cell">
                  <span className={`inline-block px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border text-xs font-bold ${statusColor(order.status)}`}>{order.status || '-'}</span>
                </td>
                <td className="py-1 px-2 sm:py-2 sm:px-4 whitespace-nowrap flex gap-1 sm:gap-2 items-center">
                  {/* Tombol copy link khusus mobile */}
                  <CopyIconButton link={window.location.origin + '/inv/' + order.slug} />
                  <button onClick={() => handleEdit(order)} className="px-2 py-1 rounded bg-white/10 text-blue-200 font-semibold hover:bg-white/20 transition text-xs border border-blue-300/20">Edit</button>
                  {order.status !== 'active' && (
                    <button onClick={() => handleProcess(order)} className="px-2 py-1 rounded bg-white/10 text-green-200 font-semibold hover:bg-white/20 transition text-xs border border-green-300/20">Proses</button>
                  )}
                  <button onClick={() => handleDelete(order)} className="px-2 py-1 rounded bg-white/10 text-red-200 font-semibold hover:bg-white/20 transition text-xs border border-red-300/20">Hapus</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default OrdersTable;