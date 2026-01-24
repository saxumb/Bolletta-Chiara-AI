
import React, { useState } from 'react';
import { BillInput, SimulationMode } from '../types';
import { ARERA_DISPATCHING, GAS_RATES } from '../constants';

interface InputCardProps {
  inputs: BillInput;
  setInputs: (val: BillInput) => void;
  mode: SimulationMode;
}

const InputCard: React.FC<InputCardProps> = ({ inputs, setInputs, mode }) => {
  const [showDist, setShowDist] = useState(false);

  const handleChange = (key: keyof BillInput, value: any) => {
    setInputs({ ...inputs, [key]: value });
  };

  const isLuce = mode === 'luce';
  const ThemeIcon = isLuce 
    ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ) 
    : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
      </svg>
    );

  const quickVals = isLuce ? [0, 150, 220, 400] : [0, 50, 100, 200];

  const handleNumChange = (key: keyof BillInput, val: string) => {
    if (val === '') {
      handleChange(key, '');
    } else {
      handleChange(key, parseFloat(val));
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className={`p-6 transition-colors duration-300 ${isLuce ? 'bg-slate-900' : 'bg-orange-950'}`}>
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isLuce ? 'bg-blue-500/20' : 'bg-orange-500/20'}`}>
            {ThemeIcon}
          </div>
          {isLuce ? 'Parametri Luce' : 'Parametri Gas'}
        </h2>
      </div>

      <div className="p-6 space-y-8">
        {/* SECTION: CONSUMO */}
        <section>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            {isLuce ? 'Consumo Mensile (kWh)' : 'Consumo Mensile (Smc)'}
          </label>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type="number"
                value={isLuce ? inputs.monthlyKwh : inputs.monthlySmc}
                onChange={(e) => handleNumChange(isLuce ? 'monthlyKwh' : 'monthlySmc', e.target.value)}
                className={`w-full pl-4 pr-16 py-4 bg-slate-50 border-2 rounded-2xl transition-all text-xl font-bold text-slate-800 outline-none ${isLuce ? 'border-slate-100 focus:border-blue-500 focus:bg-white' : 'border-slate-100 focus:border-orange-500 focus:bg-white'}`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                {isLuce ? 'kWh' : 'Smc'}
              </span>
            </div>
            <div className="flex gap-2">
              {quickVals.map(val => (
                <button
                  key={val}
                  onClick={() => handleChange(isLuce ? 'monthlyKwh' : 'monthlySmc', val)}
                  className={`flex-1 py-2 text-[10px] font-bold rounded-xl border transition-all ${
                    (isLuce ? inputs.monthlyKwh : inputs.monthlySmc) === val 
                    ? (isLuce ? 'bg-blue-600 text-white border-blue-600' : 'bg-orange-600 text-white border-orange-600')
                    : `bg-white text-slate-500 border-slate-200 ${isLuce ? 'hover:border-blue-300' : 'hover:border-orange-300'}`
                  }`}
                >
                  {val === 0 ? 'Vacanza' : `${val} ${isLuce ? 'kWh' : 'Smc'}`}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* --- SEZIONE LUCE --- */}
        {isLuce && (
          <div className="space-y-6">
            {/* TIPO TARIFFA */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">Tipo Tariffa</label>
              <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
                <button 
                  onClick={() => handleChange('isMultioraria', false)}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${!inputs.isMultioraria ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >
                  MONORARIA
                </button>
                <button 
                  onClick={() => handleChange('isMultioraria', true)}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${inputs.isMultioraria ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >
                  FASCE (F1, F2, F3)
                </button>
              </div>
            </div>

            {/* PREZZI ENERGIA */}
            {!inputs.isMultioraria ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Energia (€/kWh)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={inputs.energyPrice}
                      onChange={(e) => handleNumChange('energyPrice', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 transition-all font-semibold text-slate-700 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Potenza (kW)</label>
                    <select
                      value={inputs.powerKw}
                      onChange={(e) => handleChange('powerKw', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 transition-all font-semibold text-slate-700 outline-none appearance-none"
                    >
                      {[1.5, 3, 4.5, 6, 10].map(v => <option key={v} value={v}>{v} kW</option>)}
                    </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-amber-500">☀️</span>
                        <label className="text-[9px] font-black text-blue-800 uppercase">F1</label>
                      </div>
                      <input 
                        type="number" step="0.0001" value={inputs.energyPriceF1} 
                        onChange={(e) => handleNumChange('energyPriceF1', e.target.value)}
                        className="w-full bg-transparent border-b border-blue-200 outline-none font-bold text-blue-900 text-sm"
                      />
                    </div>
                    <div className="bg-cyan-50 p-3 rounded-2xl border border-cyan-100">
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-cyan-500">⛅</span>
                        <label className="text-[9px] font-black text-cyan-800 uppercase">F2</label>
                      </div>
                      <input 
                        type="number" step="0.0001" value={inputs.energyPriceF2} 
                        onChange={(e) => handleNumChange('energyPriceF2', e.target.value)}
                        className="w-full bg-transparent border-b border-cyan-200 outline-none font-bold text-cyan-900 text-sm"
                      />
                    </div>
                    <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-slate-400">🌙</span>
                        <label className="text-[9px] font-black text-slate-600 uppercase">F3</label>
                      </div>
                      <input 
                        type="number" step="0.0001" value={inputs.energyPriceF3} 
                        onChange={(e) => handleNumChange('energyPriceF3', e.target.value)}
                        className="w-full bg-transparent border-b border-slate-300 outline-none font-bold text-slate-800 text-sm"
                      />
                    </div>
                 </div>

                 {/* DISTRIBUZIONE % */}
                 <div className="border-t border-slate-100 pt-3">
                    <button 
                      onClick={() => setShowDist(!showDist)}
                      className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                    >
                      <span>Distribuzione Consumo %</span>
                      <span>{showDist ? '▲' : '▼'}</span>
                    </button>
                    {showDist && (
                      <div className="grid grid-cols-3 gap-4 mt-3 animate-in slide-in-from-top-2 duration-300">
                        <div>
                          <label className="block text-[8px] text-slate-400 mb-1">F1 %</label>
                          <input type="number" value={inputs.percContentF1} onChange={(e) => handleChange('percContentF1', parseInt(e.target.value))} className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-bold" />
                        </div>
                        <div>
                          <label className="block text-[8px] text-slate-400 mb-1">F2 %</label>
                          <input type="number" value={inputs.percContentF2} onChange={(e) => handleChange('percContentF2', parseInt(e.target.value))} className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-bold" />
                        </div>
                        <div>
                          <label className="block text-[8px] text-slate-400 mb-1">F3 %</label>
                          <input type="number" value={inputs.percContentF3} onChange={(e) => handleChange('percContentF3', parseInt(e.target.value))} className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-bold" />
                        </div>
                      </div>
                    )}
                 </div>

                 <div className="pt-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Potenza (kW)</label>
                    <select
                      value={inputs.powerKw}
                      onChange={(e) => handleChange('powerKw', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-500 transition-all font-semibold text-slate-700 outline-none appearance-none"
                    >
                      {[1.5, 3, 4.5, 6, 10].map(v => <option key={v} value={v}>{v} kW</option>)}
                    </select>
                </div>
              </div>
            )}

            {/* COSTI FISSI LUCE */}
            <section className="bg-blue-50/50 border border-blue-100 p-5 rounded-3xl space-y-4">
                 <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Costi Fissi e Dispacciamento</h3>
                </div>
                
                <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Quota Fissa (PCV)</label>
                    <div className="relative">
                        <input
                        type="number"
                        value={inputs.pcvFixed}
                        onChange={(e) => handleNumChange('pcvFixed', e.target.value)}
                        className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">€</span>
                    </div>
                </div>

                <div className="pt-2 border-t border-blue-200">
                     <div className="flex justify-between items-center mb-3">
                        <label className="text-[9px] font-bold text-slate-400 uppercase">Dispacciamento</label>
                        <button 
                            onClick={() => handleChange('autoDispatching', !inputs.autoDispatching)}
                            className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all ${inputs.autoDispatching ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
                        >
                            {inputs.autoDispatching ? 'AUTO (ARERA)' : 'MANUALE'}
                        </button>
                    </div>
                    
                    {inputs.autoDispatching ? (
                         <div className="bg-blue-100/50 rounded-lg p-2 flex justify-between items-center border border-blue-100">
                            <span className="text-[10px] text-blue-800 font-medium">Valori Standard Applicati</span>
                            <div className="text-right">
                            <span className="block text-[10px] font-bold text-slate-600">Fisso: {ARERA_DISPATCHING.fixed} €</span>
                            <span className="block text-[10px] font-bold text-slate-600">Var: {ARERA_DISPATCHING.variable} €/kWh</span>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Quota Fissa</label>
                                <div className="relative">
                                    <input
                                    type="number"
                                    value={inputs.dispatchingFixed}
                                    onChange={(e) => handleNumChange('dispatchingFixed', e.target.value)}
                                    className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">€</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Quota Var.</label>
                                <div className="relative">
                                    <input
                                    type="number"
                                    step="0.001"
                                    value={inputs.dispatchingVar}
                                    onChange={(e) => handleNumChange('dispatchingVar', e.target.value)}
                                    className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">€/kwh</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
          </div>
        )}

        {/* --- SEZIONE GAS --- */}
        {!isLuce && (
          <>
            <section className="bg-orange-50/50 border border-orange-100 p-5 rounded-3xl space-y-4">
                 <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-[10px] font-black text-orange-800 uppercase tracking-widest">La tua Offerta (Dipende dal Fornitore)</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Materia Prima</label>
                        <div className="relative">
                            <input
                            type="number"
                            step="0.0001"
                            value={inputs.gasPrice}
                            onChange={(e) => handleNumChange('gasPrice', e.target.value)}
                            className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">€/Smc</span>
                        </div>
                    </div>
                    <div>
                         <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Quota Fissa (QVD)</label>
                        <div className="relative">
                            <input
                            type="number"
                            value={inputs.qvdFixed}
                            onChange={(e) => handleNumChange('qvdFixed', e.target.value)}
                            className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">€/mese</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="p-5 border border-slate-100 rounded-3xl space-y-4">
                 <div className="flex justify-between items-center mb-2">
                     <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                        </svg>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trasporto e Gestione Contatore (ARERA)</h3>
                    </div>
                    <button 
                        onClick={() => handleChange('autoGasTransport', !inputs.autoGasTransport)}
                        className={`text-[9px] font-bold px-2 py-1 rounded-md transition-all ${inputs.autoGasTransport ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
                    >
                        {inputs.autoGasTransport ? 'STIMA AUTO' : 'MANUALE'}
                    </button>
                </div>
                
                {inputs.autoGasTransport ? (
                    <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">Tariffe di rete stabilite dall'autorità (uguali per tutti i fornitori)</p>
                         <div className="flex justify-center gap-4 mt-2">
                            <span className="text-[10px] font-bold text-slate-400">Quota Fissa: ~{GAS_RATES.avgTransportFixed}€</span>
                            <span className="text-[10px] font-bold text-slate-400">Quota Var: ~{GAS_RATES.avgTransportVar}€/Smc</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Quota Fissa Rete</label>
                            <div className="relative">
                                <input
                                type="number"
                                value={inputs.gasTransportFixed}
                                onChange={(e) => handleNumChange('gasTransportFixed', e.target.value)}
                                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">€/mese</span>
                            </div>
                        </div>
                         <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Quota Var. Rete</label>
                            <div className="relative">
                                <input
                                type="number"
                                step="0.01"
                                value={inputs.gasTransportVar}
                                onChange={(e) => handleNumChange('gasTransportVar', e.target.value)}
                                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">€/Smc</span>
                            </div>
                        </div>
                    </div>
                )}
            </section>
          </>
        )}

        {/* TOGGLES EXTRA LUCE (Resident / Canone) */}
        {isLuce && (
          <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer" onClick={() => handleChange('isResident', !inputs.isResident)}>
                <div className="flex flex-col">
                  <span className="text-sm text-slate-700 font-bold">Residente</span>
                  <span className="text-[10px] text-slate-400">Sconto oneri di sistema</span>
                </div>
                <button className={`w-12 h-6 rounded-full transition-all relative ${inputs.isResident ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${inputs.isResident ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer" onClick={() => handleChange('includeCanoneRai', !inputs.includeCanoneRai)}>
                <div className="flex flex-col">
                  <span className="text-sm text-slate-700 font-bold">Canone RAI</span>
                  <span className="text-[10px] text-slate-400">Quota 7.50€/mese</span>
                </div>
                <button className={`w-12 h-6 rounded-full transition-all relative ${inputs.includeCanoneRai ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${inputs.includeCanoneRai ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default InputCard;
