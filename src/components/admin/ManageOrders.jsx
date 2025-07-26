import React, { useEffect, useState, useRef } from 'react';
import OrdersTable from './OrdersTable';
import InvitationsTable from './InvitationsTable';
import EditOrderModal from './EditOrderModal';
import DeleteOrderModal from './DeleteOrderModal';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFirestore, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import notificationSound from '@/assets/notification.mp3';

const TABLE_HEADER = [
  { label: 'Pasangan', className: 'min-w-[180px]' },
  { label: 'Template', className: 'min-w-[120px]' },
  { label: 'Link', className: 'min-w-[180px]' },
  { label: 'Harga', className: 'min-w-[100px] text-right' },
  { label: 'Status', className: 'min-w-[100px]' },
  { label: 'Aksi', className: 'min-w-[120px]' },
];

const statusColor = (status) => {
  if (status === 'active') return 'bg-green-100 text-green-700 border-green-300';
  if (status === 'preview') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
  return 'bg-gray-100 text-gray-700 border-gray-300';
};

const ManageOrders = () => {
  // State dan logic untuk invitations (PASTIKAN SEMUA DI DALAM FUNGSI INI)
  const [invitations, setInvitations] = useState([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [showDeleteInvitationModal, setShowDeleteInvitationModal] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);

  // State untuk proses WhatsApp
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [processSuccess, setProcessSuccess] = useState(false);
  const [processError, setProcessError] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);

  // Ambil data invitations dari Firestore
  useEffect(() => {
    const db = getFirestore(getApp());
    const q = query(collection(db, 'invitations'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvitations(list);
      setLoadingInvitations(false);
    });
    return () => unsub();
  }, []);

  // Handler hapus invitation
  const handleDeleteInvitation = (inv) => {
    setSelectedInvitation(inv);
    setShowDeleteInvitationModal(true);
  };

  const confirmDeleteInvitation = async () => {
    if (!selectedInvitation) return;
    const db = getFirestore(getApp());
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'invitations', selectedInvitation.id));
    } catch (e) {
      // Optional: tampilkan error
    }
    setShowDeleteInvitationModal(false);
    setSelectedInvitation(null);
  };

  const cancelDeleteInvitation = () => {
    setShowDeleteInvitationModal(false);
    setSelectedInvitation(null);
  };
  // Tombol tes notifikasi suara satu kali
  // Ref untuk audio dan id pesanan sebelumnya
  const audioRef = useRef(null);
  const prevOrderIdsRef = useRef([]);
  const [musicList, setMusicList] = useState([]);
  const [editAkadTimezoneOpen, setEditAkadTimezoneOpen] = useState(false);
  const [editResepsiTimezoneOpen, setEditResepsiTimezoneOpen] = useState(false);
  const akadTimezoneOptions = ["WIB", "WITA", "WIT"];
  const resepsiTimezoneOptions = ["WIB", "WITA", "WIT"];
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [templateNames, setTemplateNames] = useState({}); // {templateId: templateName}
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [search]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editWeddingGifts, setEditWeddingGifts] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [templateOptions, setTemplateOptions] = useState([]); // Untuk dropdown template
  // Ambil daftar template untuk dropdown
  useEffect(() => {
    let unsub;
    (async () => {
      const { getFirestore, collection, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore(getApp());
      unsub = onSnapshot(collection(db, 'templates'), (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTemplateOptions(list.map(t => ({ id: t.id, name: t.name })));
      });
    })();
    return () => { if (unsub) unsub(); };
  }, []);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'designer') window.location.href = '/admin/templates';
    if (role !== 'admin' && role !== 'cs') window.location.href = '/login';

    // Ambil data orders
    const db = getFirestore(getApp());
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, async (snap) => {
      const orderList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Deteksi pesanan baru
      const prevOrderIds = prevOrderIdsRef.current;
      const currentOrderIds = orderList.map(o => o.id);
      if (prevOrderIds.length > 0 && currentOrderIds.length > prevOrderIds.length) {
        // Ada pesanan baru
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.volume = 1;
          audioRef.current.play().catch((err) => {
            // Bisa karena autoplay policy browser
            console.warn('Gagal memutar audio notifikasi:', err);
          });
        }
      }
      prevOrderIdsRef.current = currentOrderIds;
      setOrders(orderList);
      // Ambil semua templateId unik
      const templateIds = [...new Set(orderList.map(o => o.templateId).filter(Boolean))];
      // Fetch nama template jika belum ada di cache
      const missingIds = templateIds.filter(id => !templateNames[id]);
      if (missingIds.length > 0) {
        const { getFirestore, doc, getDoc } = await import('firebase/firestore');
        const db = getFirestore(getApp());
        const newNames = {};
        await Promise.all(missingIds.map(async (id) => {
          try {
            const snap = await getDoc(doc(db, 'templates', id));
            if (snap.exists()) newNames[id] = snap.data().name || id;
            else newNames[id] = id;
          } catch { newNames[id] = id; }
        }));
        setTemplateNames(prev => ({ ...prev, ...newNames }));
      }
      setLoading(false);
    });
    return () => unsub();
    // eslint-disable-next-line
  }, []);

  // Helper format rupiah
  function formatRupiah(angka) {
    if (angka === undefined || angka === null || isNaN(Number(angka))) return '';
    return 'Rp' + Number(angka).toLocaleString('id-ID');
  }

  // Helper ambil nama template dari cache
  function getTemplateName(order) {
    return templateNames[order.templateId] || order.templateName || order.templateId || '-';
  }

  // Handler aksi (dummy, bisa dihubungkan ke fitur edit/proses/hapus)
  const handleEdit = async (order) => {
    setEditOrder(order);
    // Fetch daftar musik dari Firestore
    try {
      const db = getFirestore(getApp());
      const { collection, getDocs } = await import('firebase/firestore');
      const snap = await getDocs(collection(db, 'music'));
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMusicList(list);
      // Sinkronkan musicUrl dengan selectedMusicId jika ada
      let selectedMusicId = order.selectedMusicId || "";
      let musicUrl = order.musicUrl || order.selectedMusicUrl || "";
      if (selectedMusicId) {
        const selectedMusic = list.find(m => m.id === selectedMusicId);
        if (selectedMusic && selectedMusic.url) {
          musicUrl = selectedMusic.url;
        }
      }
      setEditForm({
        groomFullName: order.groomFullName || "",
        groomNickName: order.groomNickName || "",
        brideFullName: order.brideFullName || "",
        brideNickName: order.brideNickName || "",
        groomFather: order.groomFather || "",
        groomMother: order.groomMother || "",
        brideFather: order.brideFather || "",
        brideMother: order.brideMother || "",
        akadDate: order.akadDate || "",
        akadTime: order.akadTime || "",
        akadLocation: order.akadLocation || "",
        akadMaps: order.akadMaps || "",
        akadTimezone: order.akadTimezone || "",
        resepsiDate: order.resepsiDate || "",
        resepsiTime: order.resepsiTime || "",
        resepsiLocation: order.resepsiLocation || "",
        resepsiMaps: order.resepsiMaps || "",
        resepsiTimezone: order.resepsiTimezone || "",
        selectedMusicId,
        musicUrl,
      });
      // weddingGifts: array of object
      if (Array.isArray(order.weddingGifts)) {
        setEditWeddingGifts(order.weddingGifts);
      } else {
        setEditWeddingGifts([]);
      }
    } catch {
      setEditForm({
        groomFullName: order.groomFullName || "",
        groomNickName: order.groomNickName || "",
        brideFullName: order.brideFullName || "",
        brideNickName: order.brideNickName || "",
        groomFather: order.groomFather || "",
        groomMother: order.groomMother || "",
        brideFather: order.brideFather || "",
        brideMother: order.brideMother || "",
        akadDate: order.akadDate || "",
        akadTime: order.akadTime || "",
        akadLocation: order.akadLocation || "",
        akadMaps: order.akadMaps || "",
        akadTimezone: order.akadTimezone || "",
        resepsiDate: order.resepsiDate || "",
        resepsiTime: order.resepsiTime || "",
        resepsiLocation: order.resepsiLocation || "",
        resepsiMaps: order.resepsiMaps || "",
        resepsiTimezone: order.resepsiTimezone || "",
        weddingGifts: order.weddingGifts || "",
        selectedMusicId: order.selectedMusicId || "",
        musicUrl: order.musicUrl || order.selectedMusicUrl || "",
      });
    }
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditOrder(null);
    setEditForm({});
    setEditWeddingGifts([]);
    setEditLoading(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Fungsi replace placeholder {{key}} dengan data
  function fillTemplatePlaceholders(html, data) {
    // Handle blok each untuk weddingGifts
    html = html.replace(/{{#each weddingGifts}}([\s\S]*?){{\/each}}/g, (_, inner) => {
      if (!Array.isArray(data.weddingGifts)) return '';
      return data.weddingGifts.map(gift => {
        return inner.replace(/{{(.*?)}}/g, (_, key) => gift[key.trim()] || '');
      }).join('');
    });
    // Handle placeholder biasa
    return html.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] || '');
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editOrder) return;
    setEditLoading(true);
    const db = getFirestore(getApp());
    try {
      // Ambil templateId terbaru dari editForm (bukan dari editOrder)
      const templateId = editForm.templateId || editOrder.templateId;
      let template = null;
      if (templateId) {
        // Cek di templateNames, jika tidak ada ambil dari Firestore
        template = { id: templateId, name: templateNames[templateId] || templateId };
        // Ambil html/css/js dari Firestore templates
        const { doc, getDoc } = await import('firebase/firestore');
        const snap = await getDoc(doc(db, 'templates', templateId));
        if (snap.exists()) {
          const tdata = snap.data();
          template.html = tdata.html || (tdata.code && tdata.code.html) || '';
          template.css = tdata.css || (tdata.code && tdata.code.css) || '';
          template.js = tdata.js || (tdata.code && tdata.code.js) || '';
        }
      }
      // Generate HTML undangan baru
      const html = template?.html || '';
      const css = template?.css || '';
      const js = template?.js || '';
      // Inject field musik dari order lama jika ada
      const data = { ...editForm };
      data.weddingGifts = editWeddingGifts;
      // Musik (prioritaskan dari editForm, fallback ke editOrder)
      if (editForm.musicUrl) {
        data.musicUrl = editForm.musicUrl;
      } else if (editOrder.musicUrl) {
        data.musicUrl = editOrder.musicUrl;
      } else if (editOrder.selectedMusicUrl) {
        data.musicUrl = editOrder.selectedMusicUrl;
      }
      // Inject selectedMusicId jika ada
      if (editForm.selectedMusicId) {
        data.selectedMusicId = editForm.selectedMusicId;
      } else if (editOrder.selectedMusicId) {
        data.selectedMusicId = editOrder.selectedMusicId;
      }
      const controlScript = `\n<script>\nwindow.addEventListener('message', function(e) {\n  if (!window.document.getElementById('wedding-music')) return;\n  if (e.data === 'play-audio') {\n    window.document.getElementById('wedding-music').play();\n  } else if (e.data === 'pause-audio') {\n    window.document.getElementById('wedding-music').pause();\n  }\n});\n<\/script>`;
      const filledHtml = fillTemplatePlaceholders(html, data);
      const finalHtml = `<style>${css}</style>\n${filledHtml}\n<script>${js}<\/script>${controlScript}`;

      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'orders', editOrder.id), {
        ...editForm,
        weddingGifts: editWeddingGifts,
        html: finalHtml,
      });
      closeEditModal();
    } catch (err) {
      setEditLoading(false);
      // Optional: tampilkan error
    }
  };
  // Normalisasi nomor WhatsApp ke format 62...
  function normalizeWhatsappNumber(input) {
    if (!input) return '';
    let num = input.replace(/[^0-9+]/g, '');
    if (num.startsWith('+62')) num = num.replace('+62', '62');
    if (num.startsWith('08')) num = '62' + num.slice(1);
    if (num.startsWith('62')) return num;
    return num;
  }

  const handleProcess = async (order) => {
    setProcessingOrderId(order.id);
    setProcessSuccess(false);
    setProcessError(null);
    setShowProcessModal(false);
    // Ubah status order menjadi 'active' di Firestore
    const db = getFirestore(getApp());
    try {
      await import('firebase/firestore').then(({ doc, updateDoc }) => {
        updateDoc(doc(db, 'orders', order.id), { status: 'active' });
      });
      // Kirim pesan WhatsApp via backend Baileys
      const nomorWa = normalizeWhatsappNumber(order.whatsappNumber);
      const API_URL = 'https://api.undangceria.my.id';
      if (nomorWa && order.slug) {
        const linkUndangan = window.location.origin + '/inv/' + order.slug;
        const linkTamu = window.location.origin + '/tamu?id=' + order.slug;
        const pesan = `Alhamdulillah, undangan antum telah berhasil diaktifkan! ✨\n\n🔗 Link Undangan:\n${linkUndangan}\n\n📝 Untuk membuat link undangan dengan nama tamu:\n${linkTamu}\n\n📘 Cara membuat link undangan dengan nama tamu:\n1. Klik link Input Nama Tamu di atas\n2. Masukkan nama tamu sesuai keinginan\n3. Klik tombol Buat Link Undangan\n4. Setelah link dibuat, klik Bagikan untuk menyebarkan undangan\n\nTerima kasih atas kepercayaannya menggunakan layanan kami. Semoga acaranya berjalan lancar dan penuh keberkahan. 🤲`;

        // Kirim pesan
        const res1 = await fetch(`${API_URL}/send-whatsapp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number: nomorWa, message: pesan })
        });
        const data1 = await res1.json();
        if (data1.success) {
          setProcessSuccess(true);
          setShowProcessModal(true);
        } else {
          setProcessError(data1.error || 'Unknown error');
          setShowProcessModal(true);
        }
      } else {
        setProcessError('Nomor WhatsApp atau link undangan tidak tersedia.');
        setShowProcessModal(true);
      }
    } catch (err) {
      setProcessError(err.message);
      setShowProcessModal(true);
    }
  };

  // Reset processing state when modal is closed
  const handleCloseProcessModal = () => {
    setShowProcessModal(false);
    setProcessingOrderId(null);
  };

  const handleDelete = (order) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedOrder) return;
    const db = getFirestore(getApp());
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'orders', selectedOrder.id));
    } catch (e) {
      // Optional: tampilkan error
    }
    setShowDeleteModal(false);
    setSelectedOrder(null);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedOrder(null);
  };

  // ...OrdersTable now imported from './OrdersTable'


  // Search filter
  function filterOrders(list) {
    if (!debouncedSearch.trim()) return list;
    const s = debouncedSearch.toLowerCase();
    return list.filter(o =>
      (o.groomFullName && o.groomFullName.toLowerCase().includes(s)) ||
      (o.brideFullName && o.brideFullName.toLowerCase().includes(s)) ||
      (o.slug && o.slug.toLowerCase().includes(s)) ||
      (getTemplateName(o).toLowerCase().includes(s))
    );
  }
  const newOrders = filterOrders(orders.filter(o => o.status === 'preview' || !o.status));
  const processedOrders = filterOrders(orders.filter(o => o.status === 'active'));
  const allOrders = filterOrders(orders);


  // State untuk status notifikasi aktif
  const [notifActive, setNotifActive] = useState(false);
  // Handler untuk tes notifikasi manual
  const handleTestNotif = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1;
      audioRef.current.play()
        .then(() => setNotifActive(true))
        .catch((err) => {
          alert('Gagal memutar audio: ' + err);
        });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Audio notification for new order */}
      <audio ref={audioRef} src={notificationSound} preload="auto" style={{ display: 'none' }} />
      <div className="flex items-center mb-8 gap-2">
        <h1 className="text-2xl font-semibold font-plusjakartasans text-white">Pesanan</h1>
        <button
          type="button"
          onClick={handleTestNotif}
          title="Aktifkan Notifikasi Suara"
          className="rounded-lg border-none bg-card bg-opacity-60 backdrop-blur text-white shadow-lg flex items-center justify-center w-10 h-10 hover:bg-white/10"
          style={{background: 'rgba(40,40,80,0.7)'}}
        >
          {notifActive ? (
            // Ikon notifikasi aktif (misal: bell filled)
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              <circle cx="12" cy="19" r="2" fill="currentColor" />
            </svg>
          ) : (
            // Ikon notifikasi belum aktif (outline)
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          )}
        </button>
      </div>
      <Tabs defaultValue="new" className="w-full">
        <div className="flex items-center gap-2 mb-2">
          <TabsList className="flex bg-white/10 text-white min-w-0 flex-shrink-0">
            <TabsTrigger value="new" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white px-2 py-1 sm:px-3 sm:py-2 text-xs min-w-0">Pesanan Baru</TabsTrigger>
            <TabsTrigger value="processed" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white px-2 py-1 sm:px-3 sm:py-2 text-xs min-w-0">Pesanan Diproses</TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white px-2 py-1 sm:px-3 sm:py-2 text-xs min-w-0">Semua Pesanan</TabsTrigger>
            <TabsTrigger value="invitations" className="data-[state=active]:bg-blue-700 data-[state=active]:text-white px-2 py-1 sm:px-3 sm:py-2 text-xs min-w-0 hidden sm:inline-block">Invitations</TabsTrigger>
          </TabsList>
          <div className="flex-1 justify-end hidden sm:flex">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, link, template..."
              className="rounded px-3 py-2 text-sm bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-700 placeholder:text-gray-300 w-56"
              style={{ minWidth: 0 }}
            />
          </div>
        </div>
        <TabsContent value="invitations">
          <InvitationsTable
            data={invitations}
            loading={loadingInvitations}
            handleDelete={handleDeleteInvitation}
            onBulkDelete={async (ids) => {
              if (!ids || ids.length === 0) return;
              const db = getFirestore(getApp());
              const { doc, deleteDoc } = await import('firebase/firestore');
              // Batch delete (max 500 per batch)
              const batchSize = 500;
              for (let i = 0; i < ids.length; i += batchSize) {
                const batchIds = ids.slice(i, i + batchSize);
                await Promise.all(batchIds.map(id => deleteDoc(doc(db, 'invitations', id))));
              }
            }}
          />
        </TabsContent>
        <TabsContent value="new">
          {loading ? <div className="text-gray-300 py-8 text-center">Memuat pesanan...</div> : (
            <OrdersTable
              data={newOrders}
              getTemplateName={getTemplateName}
              formatRupiah={formatRupiah}
              statusColor={statusColor}
              handleEdit={handleEdit}
              handleProcess={handleProcess}
              handleDelete={handleDelete}
            />
          )}
        </TabsContent>
        <TabsContent value="processed">
          {loading ? <div className="text-gray-300 py-8 text-center">Memuat pesanan...</div> : (
            <OrdersTable
              data={processedOrders}
              getTemplateName={getTemplateName}
              formatRupiah={formatRupiah}
              statusColor={statusColor}
              handleEdit={handleEdit}
              handleProcess={handleProcess}
              handleDelete={handleDelete}
            />
          )}
        </TabsContent>
        <TabsContent value="all">
          {loading ? <div className="text-gray-300 py-8 text-center">Memuat pesanan...</div> : (
            <OrdersTable
              data={allOrders}
              getTemplateName={getTemplateName}
              formatRupiah={formatRupiah}
              statusColor={statusColor}
              handleEdit={handleEdit}
              handleProcess={handleProcess}
              handleDelete={handleDelete}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Modal Edit Undangan */}
      <EditOrderModal
        show={showEditModal}
        order={editOrder}
        form={editForm}
        weddingGifts={editWeddingGifts}
        musicList={musicList}
        akadTimezoneOptions={akadTimezoneOptions}
        resepsiTimezoneOptions={resepsiTimezoneOptions}
        editAkadTimezoneOpen={editAkadTimezoneOpen}
        setEditAkadTimezoneOpen={setEditAkadTimezoneOpen}
        editResepsiTimezoneOpen={editResepsiTimezoneOpen}
        setEditResepsiTimezoneOpen={setEditResepsiTimezoneOpen}
        setForm={setEditForm}
        setWeddingGifts={setEditWeddingGifts}
        editLoading={editLoading}
        onClose={closeEditModal}
        onChange={handleEditChange}
        onSubmit={handleEditSubmit}
        templateOptions={templateOptions}
      />

      {/* Modal Konfirmasi Hapus */}
      <DeleteOrderModal
        show={showDeleteModal}
        order={selectedOrder}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      {/* Modal Konfirmasi Hapus Invitation */}
      <DeleteOrderModal
        show={showDeleteInvitationModal}
        order={selectedInvitation}
        onConfirm={confirmDeleteInvitation}
        onCancel={cancelDeleteInvitation}
      />

      {/* Modal Proses WhatsApp */}
      {showProcessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full relative" style={{ boxShadow: '0 8px 32px rgba(80,40,160,0.18)' }}>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={handleCloseProcessModal}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {processSuccess ? (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-12 h-12 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none"/><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2 4-4"/></svg>
                <h2 className="text-lg font-bold text-green-700">Pesan WhatsApp berhasil dikirim!</h2>
                <p className="text-gray-700 text-center">Link undangan dan tutorial penggunaan telah dikirim ke pelanggan.</p>
                <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={handleCloseProcessModal}>Tutup</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-12 h-12 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" stroke="currentColor" fill="none"/><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 9l-6 6M9 9l6 6"/></svg>
                <h2 className="text-lg font-bold text-red-700">Gagal mengirim WhatsApp</h2>
                <p className="text-gray-700 text-center mb-4">{processError || 'Terjadi kesalahan saat mengirim pesan.'}</p>
                <div className="w-full border-t border-gray-200 my-4"></div>
                <h3 className="text-md font-semibold text-gray-800 mb-4 text-center">Pilih opsi pengiriman manual:</h3>
                {(() => {
                  const order = orders.find(o => o.id === processingOrderId);
                  if (order) {
                    const linkUndangan = window.location.origin + '/inv/' + order.slug;
                    const linkTamu = window.location.origin + '/tamu?id=' + order.slug;
                    const pesan = `Alhamdulillah, undangan antum telah berhasil diaktifkan! ✨\n\n🔗 Link Undangan:\n${linkUndangan}\n\n📝 Untuk membuat link undangan dengan nama tamu:\n${linkTamu}\n\n📘 Cara membuat link undangan dengan nama tamu:\n1. Klik link Input Nama Tamu di atas\n2. Masukkan nama tamu sesuai keinginan\n3. Klik tombol Buat Link Undangan\n4. Setelah link dibuat, klik Bagikan untuk menyebarkan undangan\n\nTerima kasih atas kepercayaannya menggunakan layanan kami. Semoga acaranya berjalan lancar dan penuh keberkahan. 🤲`;
                    const waUrl = `https://wa.me/${normalizeWhatsappNumber(order.whatsappNumber)}?text=${encodeURIComponent(pesan)}`;
                    return (
                      <div className="flex flex-col gap-4 w-full">
                        <button 
                          className="w-full px-4 py-3 bg-[#25D366] text-white rounded-lg hover:bg-[#22bf5b] flex items-center justify-center gap-2 font-medium"
                          onClick={() => window.open(waUrl, '_blank')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/>
                          </svg>
                          Kirim melalui WhatsApp
                        </button>
                      </div>
                    );
                  }
                  return null;
                })()}
                <div className="w-full border-t border-gray-200 my-4"></div>
                <button className="mt-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" onClick={handleCloseProcessModal}>Tutup</button>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ManageOrders;