
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

  // Ottimizzazione per App Nativa: Gestione StatusBar e Colori
  useEffect(() => {
    const updateStatusBar = async () => {
      try {
        // Tentiamo di importare Capacitor solo se siamo in ambiente mobile
        const { StatusBar } = await import('@capacitor/status-bar');
        const { Style } = await import('@capacitor/status-bar');
        
        await StatusBar.setBackgroundColor({ color: mode === 'luce' ? '#0f172a' : '#431407' });
        await StatusBar.setStyle({ style: Style.Dark });
      } catch (e) {
        // Ignora se non siamo su un device reale o plugin non presente
      }
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

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10) showModal();
    };

    window.history.pushState({ noBackExits: true }, '');
    const handlePopState = () => {
      showModal();
      window.history.pushState({ noBackExits: true }, '');
    };

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
        const p1 = n(inputs.energyPriceF1);
        const p2 = n(inputs.energyPriceF2);
        const p3 = n(inputs.energyPriceF3);
        const f1 = inputs.percContentF1 / 100;
        const f2 = inputs.percContentF2 / 100;
        const f3 = inputs.percContentF3 / 100;
        energyPrice = (p1 * f1) + (p2 * f2) + (p3 * f3);
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

      const fixedBase = qf + dispFixedVal + transportQf + transportQp + (RATES.uc6FixedRate * inputs.powerKw) + systemFixed;
      const fixedIVA = fixedBase * RATES.ivaRate;
      const fixedTotal = fixedBase + fixedIVA + canoneRai;

      const total = imponibile + iva + canoneRai;
      const variableTotal = total - fixedTotal;

      return {
        materiaEnergia: { quotaEnergia: qe, perditeRete: perdite, quotaFissa: qf, dispacciamento: dispReal, mercatoCapacita: mercCapReal, total: materiaEnergiaTotal },
        trasportoGestione: { quotaFissa: transportQf, quotaPotenza: transportQp, quotaEnergia: transportQe, oneriAggiuntivi: uc3 + uc6, total: trasportoGestioneTotal },
        oneriSistema,
        imposte,
        iva,
        canoneRai,
        summary: { fixedTotal, variableTotal },
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
      
      const fixedBase = qvdFixed + transpFixed;
      const fixedTotal = fixedBase + (fixedBase * ivaRate);
      const total = imponibile + iva;

      return {
        materiaEnergia: { quotaEnergia: qGas, perditeRete: 0, quotaFissa: qvdFixed, dispacciamento: 0, mercatoCapacita: 0, total: materiaTotal },
        trasportoGestione: { quotaFissa: transpFixed, quotaPotenza: 0, quotaEnergia: transpVar, oneriAggiuntivi: 0, total: trasportoTotal },
        oneriSistema: 0,
        imposte: accise,
        iva,
        canoneRai: 0,
        summary: { fixedTotal, variableTotal: total - fixedTotal },
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

  const exportReport = () => {
    const isLuce = mode === 'luce';
    const content = `
BOLLETTA CHIARA AI - REPORT SIMULAZIONE ${isLuce ? 'LUCE' : 'GAS'}
--------------------------------------------------
Consumo: ${isLuce ? inputs.monthlyKwh : inputs.monthlySmc} ${isLuce ? 'kWh' : 'Smc'}
Costo Totale Stimato: € ${results.total.toFixed(2)}

DETTAGLIO COSTI:
- Materia ${isLuce ? 'Energia' : 'Gas'}: € ${results.materiaEnergia.total.toFixed(2)}
- Trasporto e Gestione: € ${results.trasportoGestione.total.toFixed(2)}
- Oneri di Sistema: € ${results.oneriSistema.toFixed(2)}
- Imposte e Accise: € ${results.imposte.toFixed(2)}
- IVA: € ${results.iva.toFixed(2)}
${results.canoneRai > 0 ? `- Canone RAI: € ${results.canoneRai.toFixed(2)}` : ''}

RIEPILOGO:
- Quota Fissa (indipendente dai consumi): € ${results.summary.fixedTotal.toFixed(2)}
- Quota Variabile (legata ai consumi): € ${results.summary.variableTotal.toFixed(2)}
--------------------------------------------------
Generato da BollettaChiara AI il ${new Date().toLocaleDateString('it-IT')}
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BollettaChiara_AI_Report_${isLuce ? 'Luce' : 'Gas'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isLuce = mode === 'luce';
  const textPrimary = isLuce ? 'text-blue-600' : 'text-orange-600';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-blue-100 font-sans safe-top safe-bottom">
      <ExitModal isOpen={isExitModalOpen} onClose={() => setIsExitModalOpen(false)} isLuce={isLuce} />

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:rotate-6 ${isLuce ? 'bg-blue-600 shadow-blue-500/20' : 'bg-orange-600 shadow-orange-500/20'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isLuce ? "M13 10V3L4 14h7v7l9-11h-7z" : "M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"} />
               </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tight text-slate-800">BOLLETTA<span className={textPrimary}>CHIARA</span> <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-md text-slate-500 align-top ml-1">AI</span></h1>
            </div>
          </div>

          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner">
            <button onClick={() => handleModeChange('luce')} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${isLuce ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400'}`}>LUCE</button>
            <button onClick={() => handleModeChange('gas')} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${!isLuce ? 'bg-white text-orange-600 shadow-md' : 'text-slate-400'}`}>GAS</button>
          </div>
          
          <div className="flex items-center gap-2">
              <button 
                onClick={exportReport}
                className="hidden md:flex items-center justify-center p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all active:scale-90"
                title="Esporta Report"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <button onClick={fetchAdvice} disabled={loadingAdvice} className={`flex items-center gap-2 text-white px-5 py-2.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 ${isLuce ? 'bg-slate-900 shadow-blue-500/10' : 'bg-orange-950 shadow-orange-500/10'}`}>
                {loadingAdvice ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : "Analisi AI"}
              </button>
          </div>
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
              <div className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-full h-1 ${isLuce ? 'bg-blue-600' : 'bg-orange-600'} opacity-20`}></div>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isLuce ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black text-slate-800">Analisi BollettaChiara</h3>
                </div>
                {loadingAdvice ? (
                  <div className="space-y-4 py-4 animate-pulse">
                    <div className="h-3 bg-slate-100 rounded-full w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded-full w-full"></div>
                    <div className="h-3 bg-slate-100 rounded-full w-2/3"></div>
                  </div>
                ) : (
                  <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-100" dangerouslySetInnerHTML={{ __html: advice?.replace(/\n/g, '<br/>') || '' }} />
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="fixed bottom-0 left-0 w-full p-6 flex justify-center pointer-events-none z-40 safe-bottom">
          <button onClick={() => setIsExitModalOpen(true)} className="pointer-events-auto bg-white/80 backdrop-blur-md border border-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest px-8 py-3 rounded-full hover:bg-slate-900 hover:text-white transition-all shadow-2xl">Esci da BollettaChiara</button>
      </footer>
    </div>
  );
};

export default App;
