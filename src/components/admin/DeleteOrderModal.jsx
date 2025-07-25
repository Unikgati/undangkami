import React from 'react';

const DeleteOrderModal = ({ show, order, onConfirm, onCancel }) => {
  if (!show || !order) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-7 min-w-[300px] max-w-[90vw] border-2 border-red-300">
        <div className="flex flex-col items-center gap-3">
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill="#f87171"></circle>
            <path d="M15 9l-6 6M9 9l6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <div className="text-lg font-semibold text-red-700 text-center">
            Hapus undangan <span className="font-bold">{order.groomFullName} &amp; {order.brideFullName}</span>?
          </div>
          <div className="flex gap-3 mt-2">
            <button
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-700 to-blue-700 text-white font-bold hover:from-purple-800 hover:to-blue-800 shadow"
              onClick={onConfirm}
            >
              Ya, Hapus
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 shadow"
              onClick={onCancel}
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteOrderModal;
