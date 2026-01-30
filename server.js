import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint per ottenere l'analisi IA
app.post('/api/energy-advice', async (req, res) => {
  try {
    const { inputs, results, mode } = req.body;

    // Verifica che la chiave API sia configurata
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'API Key non configurata sul server' 
      });
    }

    const ai = new GoogleGenAI({ apiKey });

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

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const advice = response.text || "Non è stato possibile generare l'analisi al momento.";
    res.json({ advice });

  } catch (error) {
    console.error('Errore nel generare il consiglio:', error);
    res.status(500).json({ 
      error: 'Errore nell\'elaborazione della richiesta' 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
