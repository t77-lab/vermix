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

async function getCandidateModels(): Promise<string[]> {
  if (!ai) {
    throw new Error('Serverda GEMINI_API_KEY sozlanmagan (Railway Variables bo‘limini tekshiring)');
  }

  const pager = await ai.models.list();
  const available: string[] = [];

  for await (const m of pager) {
    const name = (m.name || '').replace(/^models\//, '');
    if (
      name.includes('gemini') &&
      !name.includes('embedding') &&
      !name.includes('imagen') &&
      !name.includes('2.5') &&
      !name.includes('2.0')
    ) {
      available.push(name);
    }
  }

  // Avval gemini-3.8-flash, keyin boshqa yangi flash modellar, oxirida qolganlari
  const sorted = [
    ...available.filter((n) => n.includes('3.8-flash')),
    ...available.filter((n) => n.includes('flash') && !n.includes('3.8-flash')),
    ...available.filter((n) => !n.includes('flash')),
  ];

  if (!sorted.includes('gemini-3.8-flash')) {
    sorted.unshift('gemini-3.8-flash');
  }

  return Array.from(new Set(sorted));
}

async function handleChatRequest(req: express.Request, res: express.Response) {
  try {
    const { message, history = [] } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Xabar matni bo‘sh bo‘lishi mumkin emas.' });
    }
    if (!ai) {
      return res.status(503).json({
        error: 'AI xizmati ulanmagan: Railway Variables bo‘limida GEMINI_API_KEY ko‘rsatilmagan.',
      });
    }

    const mapped = history.slice(-10).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const firstUserIdx = mapped.findIndex((m: { role: string }) => m.role === 'user');
    const validHistory = firstUserIdx >= 0 ? mapped.slice(firstUserIdx) : [];

    const contents = [
      ...validHistory,
      { role: 'user', parts: [{ text: message.trim() }] },
    ];

    const candidates = await getCandidateModels();
    let lastError: any = null;

    for (const modelName of candidates) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction:
              'Sen "VerMix — Shaxsiy Raqamli Ekotizim" platformasining aqlli AI yordamchisisan. Foydalanuvchiga o‘zbek tilida qisqa, aniq, do‘stona va foydali javob ber.',
          },
        });
        return res.json({ reply: response.text || 'Javob shakllantirilmadi.', model: modelName });
      } catch (err: any) {
        lastError = err;
        // Agar model eskirgan yoki topilmasa (404), ro'yxatdagi keyingi modelga o'tadi
        if (err?.status === 404 || String(err?.message || '').includes('404')) {
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('Ishlaydigan Gemini modeli topilmadi.');
  } catch (err: any) {
    console.error('Gemini API xatosi:', err);
    res.status(500).json({
      error: err?.message || 'AI serveri bilan bog‘lanishda xatolik yuz berdi.',
    });
  }
}

app.post('/api/chat', handleChatRequest);
app.post('/api/ai/chat', handleChatRequest);

const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

app.use((_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`VerMix server http://localhost:${PORT} manzilida ishga tushdi`);
});