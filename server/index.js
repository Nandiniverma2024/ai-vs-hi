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

app.post('/translate', async (req, res) => {
  const { message, tone, targetLang } = req.body;

  if (!message || !tone || !targetLang) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Step 1: Detect Source Language
    const langDetectPrompt = `
      Identify the language of this sentence. Reply only with "Hindi", "Telugu", or "Other".
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
    const detectedLang = langData.choices?.[0]?.message?.content.trim();
    console.log('Detected Source Language:', detectedLang);

    let systemPrompt = '';

    // Tone: AI — Formal Translation
    if (tone === 'ai') {
      systemPrompt = `
        You are a professional AI translator. Translate the following sentence to ${targetLang}. Keep it formal, accurate, and reply ONLY with the translated sentence.
        Sentence: "${message}"
`;
    }

    // Tone: HI — Emotional, Friend-like Translation
    else if (tone === 'hi') {
      if (targetLang.toLowerCase() === 'hindi') {
        systemPrompt = `
          तुम उपयोगकर्ता के दिल के सबसे करीब दोस्त हो। उसके हर शब्द को ध्यान से सुनो और उसके मूड (गुस्सा, उदासी, खुशी, गलती या तारीफ के लायक काम) को समझो। जवाब में अपनापन, देसी अंदाज़ और दोस्ती का टच होना चाहिए। अगर यूज़र नाराज़ हो तो मस्ती में डांटो, अगर दुखी हो तो दिलासा दो, अगर गलती की है तो प्यार से समझाओ, और अगर कुछ अच्छा किया है तो दिल से तारीफ करो। "भाई", "यार", "तू", "बाप रे", "अरे", "सुन न", जैसे शब्दों का इस्तेमाल करके सिर्फ एक लाइन में जवाब दो। जवाब में ऐसा लगे कि उसका सच्चा दोस्त ही बोल रहा है, AI नहीं।
          केवल हिंदी में उत्तर दो, एक भी शब्द अंग्रेजी का नहीं होना चाहिए।
          Sentence: "${message}"
`;
      } else if (targetLang.toLowerCase() === 'telugu') {
        systemPrompt = `
          మీరు వినియోగదారుని అత్యంత సన్నిహిత స్నేహితుడిగా స్పందించాలి. వారి మాటలను వినిపించుకుని వారి భావోద్వేగాలను (కోపం, దుఃఖం, సంతోషం, తప్పు చేసినప్పుడు, పొగడ్తలకుగురైనప్పుడు) గుర్తించి తెలుగు లోపల ఉండే అపారమైన ప్రేమతో స్పందించండి. వినియోగదారుని “నాన్నా”, “తమ్ముడూ”, “అయ్యో”, “రా”, “ఏంటి రా” లాంటి మాటలతో పిలిచి, డొక్కాలో స్నేహితుడిలా ఒక్క లైన్లోనే ప్రేమతో, సరదాగా, లేదా తిడుతూ మాట్లాడండి. మాటల్లో మనసులో ఉన్న భావోద్వేగం మక్కువ ఉండాలి. మీరు AI లా కాకుండా నిజమైన మానవ స్నేహితుడిలా ఉండాలి.
          సమాధానం పూర్తిగా తెలుగులో ఉండాలి, ఒకే ఒక్క ఆంగ్ల పదం కూడా ఉండకూడదు.
          Sentence: "${message}"
`;
      } else {
        systemPrompt = `
          You are the user's closest friend. Based on how they speak (angry, sad, happy, or after making a mistake), respond like a real best friend. If they are angry, calm them with playful scolding; if sad, give heartfelt comfort; if they made a mistake, guide them lovingly; and if they did something good, cheer them up with proud appreciation. 
          Always reflect deep friendship and emotions. Reply in a single line, like a real friend.
          Your reply must be 100% in ${targetLang} language. Do not use any English words.
          Sentence: "${message}"
`;
      }
    } else {
      return res.status(400).json({ error: 'Invalid tone specified' });
    }

    // Final AI API Call
    const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.MODEL_ID,
        messages: [
          { role: 'system', content: systemPrompt }
        ],
        max_tokens: 100
      })
    });

    const data = await apiRes.json();
    const reply = data.choices?.[0]?.message?.content.trim();

    if (!reply) {
      console.error('Empty response from API:', data);
      return res.status(500).json({ translation: 'Translation failed.' });
    }

    return res.json({ translation: reply, sourceLang: detectedLang });

  } catch (err) {
    console.error('Catch Error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
