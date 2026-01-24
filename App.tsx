
import React, { useState, useMemo, useEffect } from 'react';
import InputCard from './components/InputCard';
import ResultCard from './components/ResultCard';
import DonationCard from './components/DonationCard';
import ExitModal from './components/ExitModal';
import { BillInput, BillBreakdown, SimulationMode } from './types';
import { DEFAULT_INPUTS, RATES, ARERA_DISPATCHING, GAS_RATES } from './constants';
import { getEnergyAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<BillInput>(DEFAULT_INPUTS);
  const [mode, setMode] = useState<SimulationMode>('luce');
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [pwaActive, setPwaActive] = useState(false);

  // Verifica se il Service Worker è attivo (per feedback utente)
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => setPwaActive(true));
    }
  }, []);

  useEffect(() => {
    const updateStatusBar = async () => {
      try {
        const { StatusBar } = await import('@capacitor/status-bar');
        const { Style } = await import('@capacitor/status-bar');
        await StatusBar.setBackgroundColor({ color: mode === 'luce' ? '#0f172a' : '#431407' });
        await StatusBar.setStyle({ style: Style.Dark });
      } catch (e) {}
    };
    updateStatusBar();
  }, [mode]);

  useEffect(() => {
    const showModal = () => {
      const hasShown = sessionStorage.getItem('exit_modal_shown');
      if (!hasShown) {
        setIsExitModalOpen(true);
        sessionStorage.setItem('exit_modal_shown', 'true');
      }
    };
    const handleMouseLeave = (e: MouseEvent) => { if (e.clientY <= 10) showModal(); };
    window.history.pushState({ noBackExits: true }, '');
    const handlePopState = () => { showModal(); window.history.pushState({ noBackExits: true }, ''); };
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('popstate', handlePopState);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleModeChange = (newMode: SimulationMode) => {
    setMode(newMode);
    setAdvice(null);
  };

  const results = useMemo((): BillBreakdown => {
    const n = (val: number | '') => val === '' ? 0 : val;
    if (mode === 'luce') {
      const monthlyKwh = n(inputs.monthlyKwh);
      let energyPrice = 0;
      if (inputs.isMultioraria) {
        energyPrice = (n(inputs.energyPriceF1) * (inputs.percContentF1/100)) + 
                      (n(inputs.energyPriceF2) * (inputs.percContentF2/100)) + 
                      (n(inputs.energyPriceF3) * (inputs.percContentF3/100));
      } else {
        energyPrice = n(inputs.energyPrice);
      }
      const pcvFixed = n(inputs.pcvFixed);
      const kwhWithLosses = monthlyKwh * (1 + RATES.gridLossFactor);
      const dispFixedVal = inputs.autoDispatching ? ARERA_DISPATCHING.fixed : n(inputs.dispatchingFixed);
      const dispVarVal = inputs.autoDispatching ? ARERA_DISPATCHING.variable : n(inputs.dispatchingVar);
      const qe = monthlyKwh * energyPrice;
      const perdite = (monthlyKwh * RATES.gridLossFactor) * energyPrice;
      const qf = pcvFixed;
      const dispReal = dispFixedVal + (kwhWithLosses * dispVarVal);
      const mercCapReal = kwhWithLosses * (n(inputs.capacityMarketVar) || 0.005);
      const materiaEnergiaTotal = qe + perdite + qf + dispReal + mercCapReal;
      const transportQf = RATES.transportFixed;
      const transportQp = RATES.transportPower * inputs.powerKw;
      const transportQe = RATES.transportVariable * monthlyKwh;
      const uc3 = RATES.uc3Rate * monthlyKwh;
      const uc6 = (RATES.uc6FixedRate * inputs.powerKw) + (RATES.uc6VarRate * monthlyKwh);
      const trasportoGestioneTotal = transportQf + transportQp + transportQe + uc3 + uc6;
      const asos = RATES.asosRate * monthlyKwh;
      const arim = RATES.arimRate * monthlyKwh;
      const systemFixed = inputs.isResident ? 0 : RATES.systemFixedNonResident;
      const oneriSistema = asos + arim + systemFixed;
      const imposte = monthlyKwh * RATES.exciseRate;
      const imponibile = materiaEnergiaTotal + trasportoGestioneTotal + oneriSistema + imposte;
      const iva = imponibile * RATES.ivaRate;
      const canoneRai = inputs.includeCanoneRai ? RATES.canoneRaiMonthly : 0;
      const total = imponibile + iva + canoneRai;
      return {
        materiaEnergia: { quotaEnergia: qe, perditeRete: perdite, quotaFissa: qf, dispacciamento: dispReal, mercatoCapacita: mercCapReal, total: materiaEnergiaTotal },
        trasportoGestione: { quotaFissa: transportQf, quotaPotenza: transportQp, quotaEnergia: transportQe, oneriAggiuntivi: uc3 + uc6, total: trasportoGestioneTotal },
        oneriSistema, imposte, iva, canoneRai,
        summary: { fixedTotal: qf + dispFixedVal + transportQf + transportQp + canoneRai, variableTotal: total - (qf + dispFixedVal + transportQf + transportQp + canoneRai) },
        total
      };
    } else {
      const monthlySmc = n(inputs.monthlySmc);
      const gasPrice = n(inputs.gasPrice);
      const qvdFixed = n(inputs.qvdFixed);
      const gasTransportFixed = inputs.autoGasTransport ? GAS_RATES.avgTransportFixed : n(inputs.gasTransportFixed);
      const gasTransportVar = inputs.autoGasTransport ? GAS_RATES.avgTransportVar : n(inputs.gasTransportVar);
      const qGas = monthlySmc * gasPrice;
      const materiaTotal = qGas + qvdFixed;
      const transpFixed = gasTransportFixed;
      const transpVar = monthlySmc * gasTransportVar;
      const trasportoTotal = transpFixed + transpVar;
      const accise = monthlySmc * (GAS_RATES.exciseRate + GAS_RATES.regionalTax);
      const imponibile = materiaTotal + trasportoTotal + accise;
      const ivaRate = monthlySmc < 40 ? GAS_RATES.ivaLow : GAS_RATES.ivaStandard;
      const iva = imponibile * ivaRate;
      const total = imponibile + iva;
      return {
        materiaEnergia: { quotaEnergia: qGas, perditeRete: 0, quotaFissa: qvdFixed, dispacciamento: 0, mercatoCapacita: 0, total: materiaTotal },
        trasportoGestione: { quotaFissa: transpFixed, quotaPotenza: 0, quotaEnergia: transpVar, oneriAggiuntivi: 0, total: trasportoTotal },
        oneriSistema: 0, imposte: accise, iva, canoneRai: 0,
        summary: { fixedTotal: qvdFixed + transpFixed, variableTotal: total - (qvdFixed + transpFixed) },
        total
      };
    }
  }, [inputs, mode]);

  const fetchAdvice = async () => {
    setLoadingAdvice(true);
    try {
        const result = await getEnergyAdvice(inputs, results, mode);
        setAdvice(result);
    } finally {
        setLoadingAdvice(false);
    }
  };

  const isLuce = mode === 'luce';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans safe-top safe-bottom">
      <ExitModal isOpen={isExitModalOpen} onClose={() => setIsExitModalOpen(false)} isLuce={isLuce} />

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-20 flex items-center shadow-sm">
        <div className="container mx-auto px-6 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${isLuce ? 'bg-blue-600' : 'bg-orange-600'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isLuce ? "M13 10V3L4 14h7v7l9-11h-7z" : "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"} />
               </svg>
            </div>
            <h1 className="text-xl font-black tracking-tight hidden sm:block">BOLLETTA<span className={isLuce ? 'text-blue-600' : 'text-orange-600'}>CHIARA</span></h1>
          </div>

          <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
            <button onClick={() => handleModeChange('luce')} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${isLuce ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400'}`}>LUCE</button>
            <button onClick={() => handleModeChange('gas')} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${!isLuce ? 'bg-white text-orange-600 shadow-md' : 'text-slate-400'}`}>GAS</button>
          </div>
          
          <button onClick={fetchAdvice} disabled={loadingAdvice} className={`flex items-center gap-2 text-white px-5 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 ${isLuce ? 'bg-slate-900' : 'bg-orange-950'}`}>
            {loadingAdvice ? "Analisi..." : "Analisi AI"}
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-6 max-w-7xl pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <InputCard inputs={inputs} setInputs={setInputs} mode={mode} />
            <DonationCard />
          </div>
          <div className="lg:col-span-7 space-y-8">
            <ResultCard results={results} mode={mode} />
            {(advice || loadingAdvice) && (
              <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100">
                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                  <span className="text-2xl">✨</span> Analisi BollettaChiara
                </h3>
                {loadingAdvice ? <div className="space-y-4 animate-pulse"><div className="h-3 bg-slate-100 rounded-full w-3/4"></div><div className="h-3 bg-slate-100 rounded-full w-full"></div></div> : 
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-100" dangerouslySetInnerHTML={{ __html: advice?.replace(/\n/g, '<br/>') || '' }} />}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="fixed bottom-0 left-0 w-full p-6 flex flex-col items-center gap-3 z-40 pointer-events-none safe-bottom">
          <div className="pointer-events-auto flex items-center gap-4 bg-white/90 backdrop-blur-md border border-slate-200 px-6 py-3 rounded-full shadow-2xl">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${pwaActive ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                {pwaActive ? 'PWA: Attiva (Store Ready)' : 'PWA: Caricamento...'}
              </span>
            </div>
            <div className="w-[1px] h-3 bg-slate-200"></div>
            <button onClick={() => setIsExitModalOpen(true)} className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-colors">Esci</button>
          </div>
      </footer>
    </div>
  );
};

export default App;
