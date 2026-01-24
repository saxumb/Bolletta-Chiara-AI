
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BillBreakdown, ChartData, SimulationMode } from '../types';
import { COLORS, GAS_COLORS } from '../constants';

interface ResultCardProps {
  results: BillBreakdown;
  mode: SimulationMode;
}

const ResultCard: React.FC<ResultCardProps> = ({ results, mode }) => {
  const isLuce = mode === 'luce';
  const colors = isLuce ? COLORS : GAS_COLORS;

  const chartData: ChartData[] = [
    { name: isLuce ? 'Materia Energia' : 'Materia Gas', value: results.materiaEnergia.total, color: colors.materia },
    { name: 'Trasporto e Gestione', value: results.trasportoGestione.total, color: colors.trasporto },
    { name: 'Oneri di Sistema', value: results.oneriSistema, color: colors.oneri },
    { name: 'Imposte e Accise', value: results.imposte, color: colors.imposte },
    { name: isLuce ? 'IVA (10%)' : 'IVA (mista)', value: results.iva, color: colors.iva },
    ...(results.canoneRai > 0 ? [{ name: 'Canone RAI', value: results.canoneRai, color: colors.canone }] : []),
  ];

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden group">
      <div className="p-8 sm:p-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left flex-1">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Stima Mensile BollettaChiara</h2>
            <div className="text-7xl font-black tracking-tighter text-slate-900 flex items-start justify-center md:justify-start">
              <span className="text-3xl mt-2 mr-1">€</span>
              {results.total.toFixed(2)}
            </div>
            
            <div className="mt-8 flex flex-col gap-3 max-w-sm">
              <div className="flex items-center gap-3">
                 <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                    <div 
                      className="h-full bg-slate-900 transition-all duration-700 ease-out" 
                      style={{ width: `${(results.summary.fixedTotal / results.total) * 100}%` }}
                    ></div>
                    <div 
                      className={`h-full transition-all duration-700 delay-100 ease-out ${isLuce ? 'bg-blue-500' : 'bg-orange-500'}`} 
                      style={{ width: `${(results.summary.variableTotal / results.total) * 100}%` }}
                    ></div>
                 </div>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
                  Fissi €{results.summary.fixedTotal.toFixed(2)}
                </span>
                <span className={`flex items-center gap-1.5 ${isLuce ? 'text-blue-600' : 'text-orange-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${isLuce ? 'bg-blue-600' : 'bg-orange-600'}`}></div>
                  Consumo €{results.summary.variableTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[220px] h-[220px] relative">
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Mix Costi</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip 
                   formatter={(value: number) => `€ ${value.toFixed(2)}`}
                   contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', fontWeight: '900', fontSize: '12px', padding: '12px 16px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8 border-t border-slate-50 pt-10">
          {chartData.map((item) => (
            <div key={item.name} className="flex justify-between items-center group/item hover:bg-slate-50 p-2 -m-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: item.color }}></div>
                <span className="text-[11px] font-bold text-slate-500 group-hover/item:text-slate-900 transition-colors uppercase tracking-tight">{item.name}</span>
              </div>
              <span className="text-xs font-black text-slate-900">€ {item.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`p-8 grid grid-cols-2 md:grid-cols-4 gap-8 ${isLuce ? 'bg-slate-900' : 'bg-orange-950'} transition-colors duration-500`}>
        <div className="border-l border-white/10 pl-5">
          <span className="block text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1.5">Materia Prima</span>
          <span className="text-lg font-black text-white">€ {results.materiaEnergia.quotaEnergia.toFixed(2)}</span>
        </div>
        <div className="border-l border-white/10 pl-5">
          <span className="block text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1.5">Distribuzione</span>
          <span className="text-lg font-black text-white">€ {results.trasportoGestione.total.toFixed(2)}</span>
        </div>
        <div className="border-l border-white/10 pl-5">
          <span className="block text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1.5">Oneri & Tax</span>
          <span className="text-lg font-black text-white">€ {(results.oneriSistema + results.imposte).toFixed(2)}</span>
        </div>
        <div className="border-l border-white/10 pl-5">
          <span className="block text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1.5">IVA Totale</span>
          <span className="text-lg font-black text-white">€ {results.iva.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
