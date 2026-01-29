
import { GoogleGenAI } from "@google/genai";
import { BillInput, BillBreakdown, SimulationMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getEnergyAdvice = async (inputs: BillInput, results: BillBreakdown, mode: SimulationMode): Promise<string> => {
  const isLuce = mode === 'luce';
  const typeLabel = isLuce ? "Elettrica" : "del Gas";
  const unit = isLuce ? "kWh" : "Smc";
  
  const consumption = isLuce ? (inputs.monthlyKwh || 0) : (inputs.monthlySmc || 0);
  
  let detailsSpecifici = "";
  let priceInfo = "";

  if (isLuce) {
    const power = inputs.powerKw;
    const isVariable = inputs.tariffTypeLuce === 'variable';
    
    // Determine Tariff Type
    let tariffaLabel = "";
    if (isVariable) {
        tariffaLabel = "Variabile (Indicizzata PUN)";
    } else {
        tariffaLabel = inputs.isMultioraria ? "Fissa Multioraria (F1/F2/F3)" : "Fissa Monoraria";
    }

    detailsSpecifici = `
    - Potenza Impegnata: ${power} kW
    - Tipologia Contratto: ${tariffaLabel}
    `;

    if (isVariable) {
        priceInfo = `- Prezzo Index (PUN): ${inputs.punValue} €/kWh\n- Spread/Fee: ${inputs.spreadLuce} €/kWh`;
    } else if (inputs.isMultioraria) {
      priceInfo = `
      - Prezzi Fissi per Fascia: F1 ${inputs.energyPriceF1 || 0}€, F2 ${inputs.energyPriceF2 || 0}€, F3 ${inputs.energyPriceF3 || 0}€
      - Distribuzione Consumi: F1 ${inputs.percContentF1}%, F2 ${inputs.percContentF2}%, F3 ${inputs.percContentF3}%
      `;
    } else {
      priceInfo = `- Prezzo Fisso Monorario: ${inputs.energyPrice || 0} €/kWh`;
    }
  } else {
    // Gas
    const isVariable = inputs.tariffTypeGas === 'variable';
    const tariffaLabel = isVariable ? "Variabile (Indicizzata PSV)" : "Prezzo Fisso";
    
    detailsSpecifici = `- Tipologia Contratto: ${tariffaLabel}`;

    if (isVariable) {
        priceInfo = `- Prezzo Index (PSV): ${inputs.psvValue} €/Smc\n- Spread/Fee: ${inputs.spreadGas} €/Smc`;
    } else {
        priceInfo = `- Prezzo Fisso Materia Prima: ${inputs.gasPrice || 0} €/Smc`;
    }
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
    
    ISTRUZIONI DI FORMATTAZIONE (IMPORTANTE):
    - NON USARE MARKDOWN. Non usare simboli come #, *, o trattini markdown.
    - Genera SOLO codice HTML valido e pulito.
    - Usa il tag <h3> per i titoli delle sezioni.
    - Usa il tag <p> per i paragrafi.
    - Usa il tag <strong> per evidenziare numeri e concetti chiave.
    - Usa i tag <ul> e <li> per le liste dei consigli.
    - Non includere i tag <html>, <head> o <body>, restituisci solo il contenuto.
    
    ${isLuce ? `
    Analisi specifica richiesta nel testo:
    1. Valuta il dimensionamento della potenza (${inputs.powerKw} kW).
    2. Commenta la convenienza della tariffa scelta (${inputs.tariffTypeLuce === 'variable' ? 'Variabile PUN' : 'Fissa'}) rispetto all'attuale mercato.
    ` : ''}

    Usa uno stile professionale, empatico e molto diretto.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Non è stato possibile generare l'analisi al momento.";
  } catch (error) {
    console.error("Error fetching Gemini advice:", error);
    return "Errore nella connessione con l'AI di BollettaChiara. Riprova tra poco.";
  }
};
