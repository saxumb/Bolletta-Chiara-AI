
export type SimulationMode = 'luce' | 'gas';
export type TariffType = 'fixed' | 'variable';

export interface BillInput {
  // Common / Electricity
  tariffTypeLuce: TariffType;
  punValue: number | '';
  spreadLuce: number | '';

  monthlyKwh: number | '';
  isMultioraria: boolean;
  energyPrice: number | ''; // Monoraria
  energyPriceF1: number | ''; // Fascia F1
  energyPriceF2: number | ''; // Fascia F2
  energyPriceF3: number | ''; // Fascia F3
  percContentF1: number; // Distribuzione % F1
  percContentF2: number; // Distribuzione % F2
  percContentF3: number; // Distribuzione % F3
  
  powerKw: number;
  pcvFixed: number | '';
  dispatchingFixed: number | '';
  dispatchingVar: number | '';
  capacityMarketVar: number | '';
  isResident: boolean;
  includeCanoneRai: boolean;
  marketType: 'free' | 'protected';
  autoDispatching: boolean;
  
  // Gas Specific
  tariffTypeGas: TariffType;
  psvValue: number | '';
  spreadGas: number | '';

  monthlySmc: number | '';
  gasPrice: number | '';
  qvdFixed: number | '';
  autoGasTransport: boolean;
  gasTransportFixed: number | '';
  gasTransportVar: number | '';
}

export interface BillBreakdown {
  materiaEnergia: {
    quotaEnergia: number;
    perditeRete: number;
    quotaFissa: number;
    dispacciamento: number;
    mercatoCapacita: number;
    total: number;
  };
  trasportoGestione: {
    quotaFissa: number;
    quotaPotenza: number;
    quotaEnergia: number;
    oneriAggiuntivi: number;
    total: number;
  };
  oneriSistema: number;
  imposte: number;
  iva: number;
  canoneRai: number;
  summary: {
    fixedTotal: number;
    variableTotal: number;
  };
  total: number;
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}