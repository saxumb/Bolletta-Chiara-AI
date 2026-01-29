
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { InputCard } from './components/InputCard';
import ResultCard from './components/ResultCard';
import DonationCard from './components/DonationCard';
import ExitModal from './components/ExitModal';
import { BillInput, BillBreakdown, SimulationMode } from './types';
import { DEFAULT_INPUTS, RATES, ARERA_DISPATCHING, GAS_RATES } from './constants';
import { getEnergyAdvice } from './services/geminiService';

const LOADING_MESSAGES = [
  "🔍 Analizzando i tuoi consumi...",
  "💡 Calcolando le migliori strategie di risparmio...",
  "⚙️ Verificando le tariffe ARERA aggiornate...",
  "✨ Ottimizzando il tuo profilo energetico...",
  "📝 Generando il tuo report personalizzato..."
];

const App: React.FC = () => {
  const [inputs, setInputs] = useState<BillInput>(DEFAULT_INPUTS);
  const [mode, setMode] = useState<SimulationMode>('luce');
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  
  const adviceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: number;
    if (loadingAdvice) {
      interval = window.setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loadingAdvice]);

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

      if (inputs.tariffTypeLuce === 'variable') {
        const pun = n(inputs.punValue);
        const spread = n(inputs.spreadLuce);
        energyPrice = pun + spread;
      } else {
        if (inputs.isMultioraria) {
          energyPrice = (n(inputs.energyPriceF1) * (inputs.percContentF1/100)) + 
                        (n(inputs.energyPriceF2) * (inputs.percContentF2/100)) + 
                        (n(inputs.energyPriceF3) * (inputs.percContentF3/100));
        } else {
          energyPrice = n(inputs.energyPrice);
        }
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
      let gasPrice = 0;
      
      if (inputs.tariffTypeGas === 'variable') {
        const psv = n(inputs.psvValue);
        const spread = n(inputs.spreadGas);
        gasPrice = psv + spread;
      } else {
        gasPrice = n(inputs.gasPrice);
      }

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
    setAdvice(null);
    
    setTimeout(() => {
      adviceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    try {
        const result = await getEnergyAdvice(inputs, results, mode);
        setAdvice(result);
        setTimeout(() => {
          adviceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    } finally {
        setLoadingAdvice(false);
    }
  };

  const isLuce = mode === 'luce';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans safe-top safe-bottom">
      <ExitModal isOpen={isExitModalOpen} onClose={() => setIsExitModalOpen(false)} isLuce={isLuce} />

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-20 flex items-center shadow-sm">
        <div className="container mx-auto px-6 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
             {/* DYNAMIC LOGO based on mode */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 overflow-hidden border border-slate-100 ${isLuce ? 'bg-blue-50' : 'bg-orange-50'}`}>
               {isLuce ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
               ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
               )}
            </div>
            <h1 className="text-xl font-black tracking-tight hidden sm:block text-slate-900">
              BOLLETTA<span className={`bg-clip-text text-transparent bg-gradient-to-r ${isLuce ? 'from-blue-600 to-cyan-500' : 'from-orange-600 to-amber-500'} transition-all duration-500`}>CHIARA</span>
            </h1>
          </div>

          <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
            <button onClick={() => handleModeChange('luce')} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${isLuce ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400'}`}>LUCE</button>
            <button onClick={() => handleModeChange('gas')} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${!isLuce ? 'bg-white text-orange-600 shadow-md' : 'text-slate-400'}`}>GAS</button>
          </div>
          
          <button onClick={fetchAdvice} disabled={loadingAdvice} className={`flex items-center gap-2 text-white px-5 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 ${isLuce ? 'bg-slate-900' : 'bg-orange-950'}`}>
            {loadingAdvice ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analisi...
                </span>
            ) : "Analisi AI"}
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-6 max-w-7xl pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <InputCard inputs={inputs} setInputs={setInputs} mode={mode} />
          </div>
          <div className="lg:col-span-7 space-y-8">
            <ResultCard results={results} mode={mode} />
            
            {(advice || loadingAdvice) && (
              <div ref={adviceRef} className="bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden relative scroll-mt-24">
                {loadingAdvice && <div className="absolute top-0 left-0 w-full h-1 bg-slate-100"><div className="h-full bg-blue-600 animate-[loading_2s_ease-in-out_infinite]"></div><style>{`@keyframes loading { 0% { width: 0%; left: 0%; } 50% { width: 50%; left: 25%; } 100% { width: 0%; left: 100%; } }`}</style></div>}
                
                <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
                  <span className="text-2xl">{loadingAdvice ? "🧠" : "✨"}</span> 
                  {loadingAdvice ? "L'IA sta pensando..." : "Analisi BollettaChiara"}
                </h3>

                {loadingAdvice ? (
                    <div className="space-y-8 py-4">
                        <div className="text-center space-y-4">
                            <p className="text-slate-600 font-bold animate-pulse transition-all duration-500 min-h-[24px]">
                                {LOADING_MESSAGES[loadingMessageIndex]}
                            </p>
                            <div className="flex justify-center gap-1">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                            </div>
                        </div>

                        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 text-center animate-in fade-in zoom-in duration-700 delay-300">
                             <p className="text-[11px] font-black text-amber-800 uppercase tracking-widest mb-2">Supporta lo sviluppo</p>
                             <p className="text-xs text-amber-700 mb-4">Mentre l'IA calcola il tuo risparmio, valuta di offrire un caffè allo sviluppatore per mantenere l'app gratuita!</p>
                             <a 
                                href="https://www.paypal.com/paypalme/saxumb" 
                                target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-transform"
                             >
                                ☕ Offri un caffè ora
                             </a>
                        </div>
                    </div>
                ) : (
                    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-100 animate-in fade-in duration-500" dangerouslySetInnerHTML={{ __html: advice || '' }} />
                )}
              </div>
            )}
            
            {!loadingAdvice && (
              <div className={!advice ? 'mt-0' : 'mt-8'}>
                <DonationCard />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
