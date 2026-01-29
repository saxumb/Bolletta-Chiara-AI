
import React, { useState, useEffect } from 'react';

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Verifica se è già installata (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    
    if (isStandalone) return;

    // Rileva iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Cattura l'evento di installazione su Android/Chrome
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Su iOS facciamo vedere il messaggio dopo 5 secondi se non è standalone
    if (ios) {
      const timer = setTimeout(() => setIsVisible(true), 5000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-slate-900 text-white p-5 rounded-[2rem] shadow-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-inner overflow-hidden flex-shrink-0">
             <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgcng9IjEyOCIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNMzAwIDEwMEwxNDAgMzIwaDEyMHYxMjBsMTYwLTIyMEgzMDB6IiBmaWxsPSIjM2I4MmY2Ii8+PHBhdGggZD0iTTMzMCAyMTBzNDUgNDAgNDUgOTUtMzAgNzAtNjUgNzAtNjUtMzAtNjUtNzBjMC05NSA2NS0xMjUgNjUtMTI1czEwIDIwIDIwIDUweiIgZmlsbD0iI2ZmY2M5OSIvPjwvc3ZnPg==" className="w-10 h-10" alt="App Icon" />
          </div>
          <div>
            <h4 className="text-sm font-black tracking-tight">Installa BollettaChiara</h4>
            <p className="text-[10px] text-slate-400 font-medium">Usa l'app velocemente dalla tua Home</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isIOS ? (
            <div className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2">
              Tocca <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg> e poi "Aggiungi a Home"
            </div>
          ) : (
            <button 
              onClick={handleInstallClick}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
            >
              Installa Ora
            </button>
          )}
          <button 
            onClick={() => setIsVisible(false)}
            className="p-2 text-slate-500 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
