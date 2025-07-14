import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Editor from '@monaco-editor/react';
import { useNavigate } from 'react-router-dom';
import { Info, Save, X } from 'lucide-react';

const initialCode = {
  html: '<div>Hello World!</div>',
  css: 'div { color: purple; }',
  js: 'console.log("Hello World!");'
};

const TemplateBuilder = () => {
  const [activeTab, setActiveTab] = useState('html');
  const [code, setCode] = useState(initialCode);
  const [editorWidth, setEditorWidth] = useState(50); // persentase
  const [isDragging, setIsDragging] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const dragging = useRef(false);
  const navigate = useNavigate();

  const handleEditorChange = (value) => {
    setCode({ ...code, [activeTab]: value });
  };

  const getPreviewContent = () => {
    return `
      <style>${code.css}</style>
      ${code.html}
      <script>${code.js}</script>
    `;
  };

  const handleSave = () => {
    // TODO: implement save logic (e.g. to Firestore)
    alert('Template berhasil disimpan!');
  };
  const handleClose = () => {
    navigate(-1);
  };
  const handleInfo = () => {
    setShowInfo(true);
  };

  // Drag handler
  const handleDrag = (e) => {
    if (!dragging.current) return;
    const x = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const screenW = window.innerWidth;
    let percent = (x / screenW) * 100;
    percent = Math.max(20, Math.min(80, percent));
    setEditorWidth(percent);
  };
  const handleDragStart = (e) => {
    e.preventDefault();
    dragging.current = true;
    setIsDragging(true);
  };
  const handleDragEnd = () => {
    dragging.current = false;
    setIsDragging(false);
  };

  React.useEffect(() => {
    const move = (e) => { if (dragging.current) handleDrag(e); };
    const up = () => handleDragEnd();
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 text-white flex flex-col md:flex-row gap-0 w-screen h-screen select-none">
      <div className="h-full" style={{ width: `${editorWidth}%` }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-0">
          <div className="flex items-center bg-gray-800 border-b border-gray-700">
            <TabsList>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="css">CSS</TabsTrigger>
              <TabsTrigger value="js">JavaScript</TabsTrigger>
            </TabsList>
            <div className="flex gap-2 ml-4">
              <button onClick={handleInfo} className="p-2 rounded hover:bg-blue-800 transition" title="Info Template">
                <Info className="w-5 h-5 text-blue-400" />
              </button>
              <button onClick={handleSave} className="p-2 rounded hover:bg-purple-800 transition" title="Simpan">
                <Save className="w-5 h-5 text-purple-400" />
              </button>
              <button onClick={handleClose} className="p-2 rounded hover:bg-gray-800 transition" title="Close">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
          <TabsContent value="html">
            <Editor
              height="calc(100vh - 40px)"
              defaultLanguage="html"
              value={code.html}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: 'on' }}
            />
          </TabsContent>
          <TabsContent value="css">
            <Editor
              height="calc(100vh - 40px)"
              defaultLanguage="css"
              value={code.css}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: 'on' }}
            />
          </TabsContent>
          <TabsContent value="js">
            <Editor
              height="calc(100vh - 40px)"
              defaultLanguage="javascript"
              value={code.js}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: 'on' }}
            />
          </TabsContent>
        </Tabs>
      </div>
      {/* Modal Info Template */}
      {showInfo && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50">
          <div className="bg-white text-gray-900 rounded-lg shadow-lg p-6 min-w-[300px] max-w-[90vw]">
            <h2 className="text-lg font-bold mb-2">Info Template</h2>
            <p className="mb-4">Template ini berisi HTML, CSS, dan JavaScript yang dapat Anda edit dan preview secara real-time. Simpan untuk menyimpan perubahan.</p>
            <Button onClick={() => setShowInfo(false)} className="bg-blue-700 text-white hover:bg-blue-800 w-full">Tutup</Button>
          </div>
        </div>
      )}
      {/* Drag bar */}
      <div
        className={`w-0.5 h-full bg-gray-800 cursor-col-resize z-50 transition hover:bg-gray-500 ${isDragging ? 'bg-purple-900' : ''}`}
        style={{ touchAction: 'none', position: 'relative' }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        {/* Overlay saat drag untuk UX */}
        {isDragging && (
          <div className="fixed inset-0 z-40" style={{ cursor: 'col-resize' }} />
        )}
      </div>
      <div className="h-full" style={{ width: `${100 - editorWidth}%` }}>
        {/* Preview area full height */}
        <iframe
          title="preview"
          className="w-full h-full border-none"
          srcDoc={getPreviewContent()}
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );
};

export default TemplateBuilder;
