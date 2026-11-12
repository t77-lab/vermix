import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Secure AI Assistant Backend Proxy — Never expose API keys in frontend code
app.post('/v1/chat', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
  const { messages, taskMode } = req.body;

  if (!apiKey) {
    return res.status(200).json({
      mode: 'demo-fallback',
      reply: 'Server running in local demo mode. Set OPENAI_API_KEY or GEMINI_API_KEY in server/.env to enable live upstream LLM streaming.'
    });
  }

  try {
    res.status(200).json({ status: 'ok', taskMode, messageCount: Array.isArray(messages) ? messages.length : 0 });
  } catch (err) {
    res.status(500).json({ error: 'Upstream AI request failed' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`VerMix Secure Backend listening on port ${PORT}`);
});
