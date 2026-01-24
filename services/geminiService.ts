
import { GoogleGenAI } from "@google/genai";
import { BillInput, BillBreakdown, SimulationMode } from "../types";

export const getEnergyAdvice = async (inputs: BillInput, results: BillBreakdown, mode: SimulationMode): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isLuce = mode === 'luce';
  const typeLabel = isLuce ? "Elettrica" : "del Gas";
  const unit = isLuce ? "kWh" : "Smc";
  
  const consumption = isLuce ? (inputs.monthlyKwh || 0) : (inputs.monthlySmc || 0);
  
  let detailsSpecifici = "";
  let priceInfo = "";

  if (isLuce) {
    const power = inputs.powerKw;
    const tariffa = inputs.isMultioraria ? "Multioraria (Fasce F1/F2/F3)" : "Monoraria";
    
    detailsSpecifici = `
    - Potenza Impegnata: ${power} kW
    - Tipologia Contratto: ${tariffa}
    `;

    if (inputs.isMultioraria) {
      priceInfo = `
      - Prezzi per Fascia: F1 ${inputs.energyPriceF1 || 0}€, F2 ${inputs.energyPriceF2 || 0}€, F3 ${inputs.energyPriceF3 || 0}€
      - Distribuzione Consumi Utente: F1 ${inputs.percContentF1}%, F2 ${inputs.percContentF2}%, F3 ${inputs.percContentF3}%
      `;
    } else {
      priceInfo = `- Prezzo Monorario: ${inputs.energyPrice || 0} €/kWh`;
    }
  } else {
    priceInfo = `- Prezzo Materia Prima: ${inputs.gasPrice || 0} €/Smc`;
  }

  const prompt = `
    Agisci come l'assistente virtuale ufficiale di "BollettaChiara AI".
    Il tuo obiettivo è portare trasparenza nel mercato energetico italiano.
    
    Analizza i seguenti dati di una simulazione bolletta ${typeLabel}:

    DATI GENERALI:
    - Consumo Mensile: ${consumption} ${unit}
    - Costo Totale Stimato: ${results.total.toFixed(2)} €
    
    DETTAGLI TECNICI:
    ${detailsSpecifici}
    ${priceInfo}

    BREAKDOWN COSTI:
    - Materia Energia/Gas: ${results.materiaEnergia.total.toFixed(2)}€
    - Trasporto e Gestione Contatore: ${results.trasportoGestione.total.toFixed(2)}€
    - Oneri di Sistema e Accise: ${(results.oneriSistema + results.imposte).toFixed(2)}€
    - IVA: ${results.iva.toFixed(2)}€

    RICHIESTA:
    Fornisci un'analisi "Chiara" e 3 consigli pratici per il risparmio.
    
    ${isLuce ? `
    Analisi specifica richiesta:
    1. Valuta il dimensionamento della potenza (${inputs.powerKw} kW).
    2. Valuta se la tariffa (${inputs.isMultioraria ? 'Multioraria' : 'Monoraria'}) è ottimale per i prezzi inseriti.
    ` : ''}

    Usa uno stile professionale, empatico e molto diretto. Formatta in Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Non è stato possibile generare l'analisi al momento.";
  } catch (error) {
    console.error("Error fetching Gemini advice:", error);
    return "Errore nella connessicatione con l'AI di BollettaChiara. Riprova tra poco.";
  }
};
