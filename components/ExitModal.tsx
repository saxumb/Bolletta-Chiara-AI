
import React, { useEffect } from 'react';

interface ExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLuce: boolean;
}

const ExitModal: React.FC<ExitModalProps> = ({ isOpen, onClose, isLuce }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const DONATION_LINK = "https://www.paypal.com/paypalme/saxumb";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl shadow-black/20 overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
        <div className={`h-2 w-full ${isLuce ? 'bg-blue-600' : 'bg-orange-600'}`}></div>
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          aria-label="Chiudi"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8 sm:p-10 text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner rotate-3 transition-transform hover:scale-110 duration-500">
            💡
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-3 leading-tight">
            Tutto chiaro con <br/>BollettaChiara AI?
          </h2>
          
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            Spero che questa analisi ti aiuti a risparmiare davvero. Se apprezzi l'indipendenza di questo progetto, puoi supportarlo con un piccolo gesto.
          </p>

          <div className="space-y-3">
            <a 
              href={DONATION_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95 ${isLuce ? 'bg-blue-600 shadow-blue-500/30' : 'bg-orange-600 shadow-orange-500/30'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              Supporta il progetto
            </a>

            <button 
              onClick={onClose}
              className="w-full py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Continua la simulazione
            </button>
          </div>
        </div>

        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BollettaChiara AI - Indipendente e Gratuito</p>
        </div>
      </div>
    </div>
  );
};

export default ExitModal;
