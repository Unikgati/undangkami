import React, { useRef } from 'react';

const StepMusic = ({
  selectedCategory,
  setSelectedCategory,
  categoryDropdownOpen,
  setCategoryDropdownOpen,
  categoryOptions,
  filteredMusicList,
  selectedMusicId,
  setSelectedMusicId,
  playingId,
  setPlayingId
}) => {
  const audioRef = useRef(null);
  return (
    <div className="space-y-6">
      {/* Category Filter - Custom Dropdown */}
      <div className="mb-2 flex flex-wrap gap-2 items-center">
        <span className="text-sm text-white">Filter kategori:</span>
        <div className="relative w-48">
          <button
            type="button"
            className="flex h-10 w-full items-center justify-between rounded-md border border-purple-400 px-3 py-2 text-sm bg-purple-900/40 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            onClick={() => setCategoryDropdownOpen((open) => !open)}
          >
            {selectedCategory}
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {categoryDropdownOpen && (
            <ul className="absolute z-10 mt-1 w-full bg-gray-900 border border-white/20 rounded shadow-lg max-h-56 overflow-y-auto">
              {categoryOptions.map((cat) => (
                <li
                  key={cat}
                  className={`px-4 py-2 cursor-pointer hover:bg-purple-700 transition ${selectedCategory === cat ? "bg-purple-700 text-white" : "text-white"}`}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCategoryDropdownOpen(false);
                  }}
                >
                  {cat}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {filteredMusicList.length === 0 ? (
        <p className="text-gray-300 text-center">Belum ada musik yang tersedia.</p>
      ) : (
        <div className="rounded-lg bg-white/5 p-2" style={{ maxHeight: '230px', overflowY: 'auto' }}>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredMusicList.map((music) => (
              <li
                key={music.id}
                className={`flex flex-row items-center justify-between py-3 px-2 rounded-lg h-full cursor-pointer ${selectedMusicId === music.id ? 'bg-purple-900/40 border-2 border-purple-400 shadow-lg' : ''}`}
                onClick={e => {
                  if (e.target.closest('button')) return;
                  setSelectedMusicId(music.id);
                  if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                    audioRef.current.src = music.url;
                    audioRef.current.load();
                    audioRef.current.oncanplay = () => {
                      audioRef.current.play().catch(e => console.log('Audio play error:', e));
                    };
                  }
                  setPlayingId(music.id);
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  <button
                    type="button"
                    className={`rounded-full p-2 bg-purple-700 hover:bg-purple-800 transition focus:outline-none focus:ring-2 focus:ring-purple-400 ${selectedMusicId === music.id ? 'ring-2 ring-purple-400' : ''}`}
                    aria-label={playingId === music.id ? 'Stop' : 'Play'}
                    onClick={ev => {
                      ev.stopPropagation();
                      if (playingId === music.id) {
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current.currentTime = 0;
                        }
                        setPlayingId(null);
                      } else {
                        if (audioRef.current) {
                          audioRef.current.pause();
                          audioRef.current.currentTime = 0;
                          audioRef.current.src = music.url;
                          audioRef.current.load();
                          audioRef.current.oncanplay = () => {
                            audioRef.current.play().catch(e => console.log('Audio play error:', e));
                          };
                        }
                        setPlayingId(music.id);
                        setSelectedMusicId(music.id);
                      }
                    }}
                  >
                    {playingId === music.id ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><polygon points="6,4 20,12 6,20" fill="currentColor" /></svg>
                    )}
                  </button>
                  <div className="flex flex-col">
                    <span className="font-plusjakartasans text-white text-base font-semibold">{music.title}</span>
                    <span className="text-xs text-purple-300 mt-1">{music.category ? music.category.charAt(0).toUpperCase() + music.category.slice(1) : ''}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <audio
            ref={audioRef}
            src={playingId ? filteredMusicList.find(m => m.id === playingId)?.url : ''}
            onEnded={() => setPlayingId(null)}
            style={{ width: 0, height: 0, visibility: 'hidden' }}
          />
        </div>
      )}
    </div>
  );
}
export default StepMusic;
