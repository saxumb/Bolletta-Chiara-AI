
import React, { useEffect } from 'react';

const AdBanner: React.FC = () => {
  useEffect(() => {
    // Scommenta questo blocco quando hai il tuo ID AdSense e vai in produzione
    /*
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (e) {
      console.error("AdSense error", e);
    }
    */
  }, []);

  return (
    <div className="w-full bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center h-[250px] overflow-hidden relative group transition-all hover:bg-slate-100">
      
      {/* 
          ---------------------------------------------------------
          AREA ADSENSE REALE
          Quando avrai l'account approvato, sostituisci il contenuto 
          di questo div con il codice fornito da Google.
          Esempio:
          
          <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-IL_TUO_ID_CLIENTE"
             data-ad-slot="IL_TUO_ID_SLOT"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
          ---------------------------------------------------------
      */}

      {/* Placeholder Visivo (Rimuovi quando inserisci il codice reale) */}
      <div className="text-center p-6 opacity-40 group-hover:opacity-60 transition-opacity select-none">
        <div className="w-12 h-12 bg-slate-300 rounded-xl mx-auto mb-3 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
        </div>
        <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-1">Spazio Pubblicitario</span>
        <p className="text-[10px] font-bold text-slate-400">Supporta lo sviluppo dell'app</p>
      </div>
      
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-slate-200 rounded text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Ad</div>
    </div>
  );
};

export default AdBanner;
