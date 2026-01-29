
import React from 'react';

const DonationCard: React.FC = () => {
  const DONATION_LINK = "https://www.paypal.com/paypalme/saxumb"; 
  
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

        <div className="flex flex-col gap-3 w-full sm:w-auto">
          <a 
            href={DONATION_LINK}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-lg shadow-amber-900/10 hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            <span>Offri un caffè</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default DonationCard;
