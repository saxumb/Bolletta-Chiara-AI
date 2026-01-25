
// Default Inputs
export const DEFAULT_INPUTS = {
  // LUCE
  tariffTypeLuce: 'fixed' as const,
  punValue: 0.10,   // Valore indicativo PUN
  spreadLuce: 0.02, // Spread indicativo
  
  monthlyKwh: 220,
  isMultioraria: false,
  energyPrice: 0.125,
  energyPriceF1: 0.145,
  energyPriceF2: 0.135,
  energyPriceF3: 0.110,
  percContentF1: 33,
  percContentF2: 33,
  percContentF3: 34,
  powerKw: 3,
  pcvFixed: 12.00,         
  dispatchingFixed: -0.916, 
  dispatchingVar: 0.012,    
  capacityMarketVar: 0.005, 
  isResident: true,
  includeCanoneRai: true,
  marketType: 'free' as const,
  autoDispatching: true,    

  // GAS
  tariffTypeGas: 'fixed' as const,
  psvValue: 0.40,  // Valore indicativo PSV
  spreadGas: 0.10, // Spread indicativo

  monthlySmc: 100,
  gasPrice: 0.45,
  qvdFixed: 10.00,
  autoGasTransport: true,
  gasTransportFixed: 6.50,
  gasTransportVar: 0.16,
};

// LUCE: Valori Standard Dispacciamento
export const ARERA_DISPATCHING = {
  fixed: -0.916,   
  variable: 0.0098 
};

// LUCE: Tariffe Regolate
export const RATES = {
  gridLossFactor: 0.102,   
  transportFixed: 1.72,    
  transportPower: 1.79,    
  transportVariable: 0.0085, 
  uc3Rate: 0.0014,
  uc6FixedRate: 0.015,
  uc6VarRate: 0.00005,
  asosRate: 0.0285,        
  arimRate: 0.0016,        
  systemFixedNonResident: 2.15, 
  exciseRate: 0.0227,      
  ivaRate: 0.10,           
  canoneRaiMonthly: 7.50,  
};

// GAS: Tariffe e Costanti
export const GAS_RATES = {
  conversionC: 1, 
  exciseRate: 0.159, 
  regionalTax: 0.020,
  ivaLow: 0.10,
  ivaStandard: 0.22,
  avgTransportFixed: 6.50, 
  avgTransportVar: 0.18,   
};

export const COLORS = {
  materia: '#3b82f6',
  trasporto: '#10b981',
  oneri: '#f59e0b',
  imposte: '#ef4444',
  iva: '#8b5cf6',
  canone: '#64748b',
};

export const GAS_COLORS = {
  materia: '#f97316',
  trasporto: '#84cc16',
  oneri: '#eab308',
  imposte: '#ef4444',
  iva: '#a855f7',
  canone: '#94a3b8',
};