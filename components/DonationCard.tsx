
import React, { useState } from 'react';

const DonationCard: React.FC = () => {
  const DONATION_LINK = "https://www.paypal.com/paypalme/saxumb"; 
  const [generatedIcons, setGeneratedIcons] = useState<{size: number, url: string}[]>([]);
  
  // Questa è la stringa Base64 del tuo SVG (presa dal manifest.json)
  const SVG_BASE64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgcng9IjEyOCIgZmlsbD0id2hpdGUiLz48cGF0aCBkPSJNMzAwIDEwMEwxNDAgMzIwaDEyMHYxMjBsMTYwLTIyMEgzMDB6IiBmaWxsPSIjM2I4MmY2Ii8+PHBhdGggZD0iTTMzMCAyMTBzNDUgNDAgNDUgOTUtMzAgNzAtNjUgNzAtNjUtMzAtNjUtNzBjMC05NSA2NS0xMjUgNjUtMTI1czEwIDIwIDEwIDUweiIgZmlsbD0iI2ZmY2M5OSIvPjwvc3ZnPg==";

  const generateIcons = () => {
    const sizes = [192, 512];
    const newIcons: {size: number, url: string}[] = [];
    
    let processed = 0;

    sizes.forEach(size => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = SVG_BASE64;
      
      img.onload = () => {
        if (ctx) {
          ctx.drawImage(img, 0, 0, size, size);
          const url = canvas.toDataURL('image/png');
          newIcons.push({ size, url });
          
          // Proviamo comunque il download automatico
          try {
            const link = document.createElement('a');
            link.download = `icon-${size}.png`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (e) {
            console.warn("Download automatico bloccato, mostro le immagini.");
          }

          processed++;
          if (processed === sizes.length) {
            // Ordina per dimensione e aggiorna stato per mostrarle
            setGeneratedIcons(newIcons.sort((a,b) => a.size - b.size));
          }
        }
      };
    });
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-3xl border border-amber-100 p-6 text-center group">
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-200/20 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm shadow-orange-100 flex items-center justify-center mb-4 text-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
          ☕
        </div>

        <h3 className="text-slate-800 font-black text-lg mb-2">Ti è stata utile?</h3>
        
        <p className="text-slate-600 text-xs leading-relaxed mb-6 max-w-[240px]">
          BollettaChiara AI è un progetto indipendente. Se l'analisi ti ha aiutato, offrimi un caffè per sostenere i costi di sviluppo!
        </p>

        <a 
          href={DONATION_LINK}
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-lg shadow-amber-900/10 hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all w-full justify-center sm:w-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-300" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          <span>Offri un caffè</span>
        </a>
        
        <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Supporta BollettaChiara AI</p>
            
            <button 
                onClick={generateIcons}
                className="text-[8px] text-slate-300 hover:text-blue-500 underline decoration-dotted transition-colors cursor-pointer"
                title="Genera gli asset PNG per iOS/Store"
            >
                [DEV] Genera Icone PNG
            </button>

            {/* SEZIONE VISIVA PER SALVATAGGIO MANUALE */}
            {generatedIcons.length > 0 && (
                <div className="mt-4 p-4 bg-white rounded-xl shadow-lg border border-slate-100 w-full animate-in slide-in-from-bottom-2 fade-in">
                    <p className="text-[10px] font-bold text-slate-500 mb-2">Fai tasto destro e "Salva immagine"</p>
                    <div className="flex justify-center gap-4">
                        {generatedIcons.map((icon) => (
                            <div key={icon.size} className="text-center">
                                <img src={icon.url} alt={`Icon ${icon.size}`} className="w-16 h-16 object-contain border border-slate-200 rounded-lg bg-slate-50 mx-auto" />
                                <span className="text-[9px] text-slate-400 font-mono mt-1">{icon.size}px</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DonationCard;
