
import React, { useEffect, useState } from 'react';
import dummyInvitationData from './dummyInvitationData';
import { toISODate } from '../lib/utils';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../lib/firebase';

const PreviewPage = () => {
  const { templateId } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function fetchTemplate() {
      setLoading(true);
      setError(null);
      try {
        const { getApp } = await import('firebase/app');
        const { getFirestore, doc, getDoc } = await import('firebase/firestore');
        const db = getFirestore(getApp());
        const docRef = doc(db, 'templates', templateId);
        const docSnap = await getDoc(docRef);
        if (!ignore) {
          if (docSnap.exists()) {
            setTemplate(docSnap.data());
          } else {
            setError('Template tidak ditemukan.');
          }
        }
      } catch (err) {
        if (!ignore) setError('Gagal mengambil data template.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchTemplate();
    return () => { ignore = true; };
  }, [templateId]);

  // Fungsi replace placeholder {{key}} dengan data
  function fillTemplatePlaceholders(html, data) {
    // Handle blok each untuk weddingGifts
    html = html.replace(/{{#each weddingGifts}}([\s\S]*?){{\/each}}/g, (_, inner) => {
      if (!Array.isArray(data.weddingGifts)) return '';
      return data.weddingGifts.map(gift => {
        // Ganti {{key}} dalam inner dengan value dari gift
        return inner.replace(/{{(.*?)}}/g, (_, key) => gift[key.trim()] || '');
      }).join('');
    });
    // Handle placeholder biasa
    return html.replace(/{{(.*?)}}/g, (_, key) => data[key.trim()] || '');
  }

  const [templateHtml, setTemplateHtml] = useState("");
  const [invitationData, setInvitationData] = useState(dummyInvitationData);
  const [musicUrl, setMusicUrl] = useState("");

  // Firestore lookup for music URL
  useEffect(() => {
    async function fetchMusicUrl() {
      const db = getFirestore(app);
      const musicId = invitationData.selectedMusicId;
      if (!musicId) return;
      try {
        const docRef = doc(db, "music", musicId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMusicUrl(docSnap.data().url || "");
        } else {
          setMusicUrl("");
        }
      } catch (e) {
        setMusicUrl("");
      }
    }
    fetchMusicUrl();
  }, [invitationData.selectedMusicId]);

  let srcDoc = '';
  if (template) {
    // Support both flat and nested (code) structure
    const html = template.html || (template.code && template.code.html) || '';
    const css = template.css || (template.code && template.code.css) || '';
    const js = template.js || (template.code && template.code.js) || '';
    // Siapkan data dummy + ISO otomatis jika belum ada
    const data = { ...dummyInvitationData, musicUrl };
    if (!data.tanggalAkadISO && data.tanggalAkad && data.jamAkad && data.zonaWaktuAkad) {
      data.tanggalAkadISO = toISODate(data.tanggalAkad, data.jamAkad, data.zonaWaktuAkad);
    }
    if (!data.tanggalResepsiISO && data.tanggalResepsi && data.jamResepsi && data.zonaWaktuResepsi) {
      data.tanggalResepsiISO = toISODate(data.tanggalResepsi, data.jamResepsi, data.zonaWaktuResepsi);
    }
    // Inject musicUrl (URL) ke data agar placeholder {{musicUrl}} diisi URL, bukan ID
    const filledHtml = fillTemplatePlaceholders(html, data);
    srcDoc = `<style>${css}</style>\n${filledHtml}\n<script>${js}<\/script>`;
  }

  const navigate = useNavigate();
  return (
    <div className="w-full h-screen min-h-screen bg-black p-0 m-0 relative">
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen h-screen w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
          <div className="text-lg text-gray-200">Memuat preview template...</div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-2xl font-bold text-red-400 mb-2">{error}</div>
          <div className="text-gray-300">Cek kembali ID template atau hubungi admin.</div>
        </div>
      ) : (
        <>
          {/* Tombol sticky bawah di mobile, tetap di atas di desktop */}
          {/* Desktop (md+): tetap di atas */}
          <div className="hidden md:block">
            <div className="absolute top-4 left-4 z-50">
              <Button
                variant="outline"
                className="bg-white/80 border border-purple-700 text-purple-700 hover:bg-purple-700 hover:text-white hover:border-purple-800 shadow-md px-5 py-2 text-sm font-semibold rounded-full"
                onClick={() => navigate(-1)}
              >
                ← Kembali
              </Button>
            </div>
            <div className="absolute top-4 right-4 z-50">
              <Button
                className="bg-purple-700 text-white hover:bg-purple-800 hover:shadow-lg px-5 py-2 text-sm font-semibold rounded-full"
                onClick={() => navigate(`/order/${templateId}`)}
              >
                Cobain Gratis
              </Button>
            </div>
          </div>
          {/* Mobile: sticky bottom */}
          <div className="fixed bottom-0 left-0 right-0 z-50 w-full flex md:hidden bg-black/80 backdrop-blur-sm border-t border-purple-700 px-4 py-3 gap-3 justify-center">
            <Button
              variant="outline"
              className="flex-1 bg-white/80 border border-purple-700 text-purple-700 hover:bg-purple-700 hover:text-white hover:border-purple-800 shadow-md px-5 py-3 text-base font-semibold rounded-full"
  // Replace placeholders in template with data
              onClick={() => navigate(-1)}
            >
              ← Kembali
            </Button>
            <Button
              className="flex-1 bg-purple-700 text-white hover:bg-purple-800 hover:shadow-lg px-5 py-3 text-base font-semibold rounded-full"
              onClick={() => navigate(`/order/${templateId}`)}
            >
              Cobain Gratis
            </Button>
          </div>
          {/* Iframe undangan fullscreen */}
          <iframe
            title={template.name || 'Preview Template'}
            srcDoc={srcDoc}
            className="w-full h-full min-h-screen border-none bg-white"
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 10 }}
            sandbox="allow-scripts allow-same-origin"
          />
        </>
      )}
    </div>
  );
};

export default PreviewPage;
