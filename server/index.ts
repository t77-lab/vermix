import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
const ai = geminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null;

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Xabar bo‘sh bo‘lishi mumkin emas' });
    }
    if (!ai) {
      return res.status(503).json({
        error: 'Serverda GEMINI_API_KEY topilmadi. Railway Variables bo‘limini tekshiring.',
      });
    }

    const mapped = history.slice(-8).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const firstUserIdx = mapped.findIndex((m: { role: string }) => m.role === 'user');
    const validHistory = firstUserIdx >= 0 ? mapped.slice(firstUserIdx) : [];

    const contents = [
      ...validHistory,
      { role: 'user', parts: [{ text: message }] },
    ];

    let lastError: any = null;
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction:
              'Sen VerMix platformasining aqlli AI yordamchisisan. Foydalanuvchiga o‘zbek tilida aniq, tushunarli va foydali javob ber.',
          },
        });
        return res.json({ reply: response.text || 'Javob olinmadi.', model: modelName });
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} ishlamadi (${err?.status || err?.message}), keyingisi sinab ko‘rilmoqda...`);
      }
    }

    throw lastError || new Error('Hech bir Gemini modeli javob bermadi');
  } catch (err: any) {
    console.error('Gemini API xatosi:', err);
    res.status(500).json({ error: err?.message || 'AI server xatosi' });
  }
});

const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

app.use((_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`VerMix full-stack server ${PORT}-portda ishga tushdi`);
});