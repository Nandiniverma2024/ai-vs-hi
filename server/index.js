import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
const PORT = 5000;

app.get('/', (_, res) => {
  res.send('AI vs HI Translator Backend is Running');
});

// (Optional) API Usage Checker
app.get('/usage', async (_, res) => {
  try {
    const keyRes = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` }
    });
    const info = await keyRes.json();
    res.json(info);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Usage fetch failed' });
  }
});

app.post('/translate', async (req, res) => {
  const { message, tone } = req.body;

  try {
    // Language Detection Prompt
    const langDetectPrompt = `
Identify the language of the following sentence. Only reply with "Hindi", "Telugu", or "Other".
Sentence: "${message}"
`;

    const langRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.MODEL_ID,
        messages: [{ role: 'user', content: langDetectPrompt }],
        max_tokens: 10
      })
    });

    const langData = await langRes.json();
    const detectedLang = langData.choices[0].message.content.trim().toLowerCase();

    let systemPrompt = '';

    if (detectedLang.includes('hindi')) {
      if (tone === 'ai') {
        systemPrompt = `
You are an AI assistant trained to reply in Hindi. Use formal, clear, and grammatically correct Hindi. Maintain professional tone, avoid switching to English or other languages.`;
      } else if (tone === 'hi') {
        systemPrompt = `
तुम एक भावनात्मक और इंसानी सहायक हो। उपयोगकर्ता हिंदी में बात कर रहा है, तो तुम हर जवाब को अपनापन, सहानुभूति और भावनाओं के साथ हिंदी में दो। गुस्सा, प्यार, दुख, या खुशी – जैसे भी यूज़र बोले, उसी भावना के साथ उत्तर दो।`;
      } else {
        return res.status(400).json({ error: 'Invalid tone specified' });
      }
    } else if (detectedLang.includes('telugu')) {
      if (tone === 'ai') {
        systemPrompt = `
You are an AI assistant trained to reply in Telugu. Use clear, professional Telugu. Avoid mixing languages unless the user does.`;
      } else if (tone === 'hi') {
        systemPrompt = `
మీరు ఒక భావోద్వేగములు కలిగిన మానవ సహాయకులు. వినియోగదారు తెలుగులో మాట్లాడుతున్నప్పుడు మీరు ప్రేమతో, ఆప్యాయతతో, మరియు భావోద్వేగాలతో తెలుగులోనే సమాధానం ఇవ్వాలి. వారి భావనలను పట్టించుకొని స్పందించండి.`;
      } else {
        return res.status(400).json({ error: 'Invalid tone specified' });
      }
    } else {
      // Other Indian Dialects Handling
      if (tone === 'ai') {
        systemPrompt = `
You are an AI language assistant designed for Indian users. Detect the exact language and dialect of the user's input (such as Hindi, Khariboli, Haryanvi, Braj Bhasha, Bundeli, Awadhi, Bagheli, Bhojpuri, Maithili, Magahi, Garhwali, Kumaoni, Jaunsari, Chhattisgarhi, Marwari, Kanauji, Angika, etc.).
Always reply in the exact same language and dialect as the user's input. Do not switch to Hindi, Urdu, Punjabi, or English unless the user's input is in that language.
Keep the tone formal, accurate, and clear while preserving local dialect expressions.`;
      } else if (tone === 'hi') {
        systemPrompt = `
You are an emotional human-like assistant designed for Indian users. Detect the user's input dialect (such as Hindi, Khariboli, Haryanvi, Braj Bhasha, Bundeli, Awadhi, Bagheli, Bhojpuri, Maithili, Magahi, Garhwali, Kumaoni, Jaunsari, Chhattisgarhi, Marwari, Kanauji, Angika, etc.).
Always respond in the same dialect, making the user feel a personal, emotional connection, as if their own friend is replying.
Express empathy, emotions, and regional familiarity in every reply.`;
      } else {
        return res.status(400).json({ error: 'Invalid tone specified' });
      }
    }

    // Final AI Response Call
    const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.MODEL_ID,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1000
      })
    });

    const contentType = apiRes.headers.get('content-type');
    if (!apiRes.ok || !contentType.includes('application/json')) {
      const errText = await apiRes.text();
      console.error('AI API Error:', errText);
      return res.status(500).json({ translation: 'AI response failed.' });
    }

    const data = await apiRes.json();
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid AI JSON Response:', data);
      return res.status(500).json({ translation: 'AI returned invalid response structure.' });
    }

    return res.json({ translation: data.choices[0].message.content });

  } catch (err) {
    console.error('Catch Error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
