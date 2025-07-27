// Importing necessary modules
import express from 'express';       
import cors from 'cors';             
import bodyParser from 'body-parser';
import fetch from 'node-fetch';      
import dotenv from 'dotenv';         
dotenv.config();                     

const app = express();              

// Middleware
app.use(cors());                     
app.use(bodyParser.json());          

const PORT = process.env.PORT || 5000; 

// GET request to check if server is running
app.get('/', (_, res) => {
  res.send('AI vs HI Translator Backend is Running');
});

// POST request for translation
app.post('/translate', async (req, res) => {
  const { message, tone, targetLang } = req.body; 

  // Check if required fields are present
  if (!message || !tone || !targetLang) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Step 1: Detect Source Language using AI prompt
    const langDetectPrompt = `
      Identify the language of this sentence. Reply only with "Hindi", "Telugu", or "Other".
      Sentence: "${message}"
    `;

    // API call to OpenRouter for language detection
    const langRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` // Authorization using API Key
      },
      body: JSON.stringify({
        model: process.env.MODEL_ID,  // AI Model ID from environment variable
        messages: [{ role: 'user', content: langDetectPrompt }], // User prompt to detect language
        max_tokens: 10                // Limit the token usage for short response
      })
    });

    const langData = await langRes.json();  // Parse the response
    const detectedLang = langData.choices?.[0]?.message?.content.trim(); // Extract detected language
    console.log('Detected Source Language:', detectedLang); // Log detected language in console

    let systemPrompt = ''; // Will store the AI prompt based on tone and target language

    // Tone: AI (Formal Translation)
    if (tone === 'ai') {
      systemPrompt = `
        You are a professional AI translator. Translate the following sentence to ${targetLang}. Keep it formal, accurate, and reply ONLY with the translated sentence.
        Sentence: "${message}"
      `;
    }

    // Tone: HI (Emotional, Friend-like Translation)
    else if (tone === 'hi') {
      if (targetLang.toLowerCase() === 'hindi') {
        // Hindi Emotional Prompt
        systemPrompt = `
          तुम उपयोगकर्ता के दिल के सबसे करीब दोस्त हो। उसके हर शब्द को ध्यान से सुनो और उसके मूड (गुस्सा, उदासी, खुशी, गलती या तारीफ के लायक काम) को समझो। जवाब में अपनापन, देसी अंदाज़ और दोस्ती का टच होना चाहिए। अगर यूज़र नाराज़ हो तो मस्ती में डांटो, अगर दुखी हो तो दिलासा दो, अगर गलती की है तो प्यार से समझाओ, और अगर कुछ अच्छा किया है तो दिल से तारीफ करो। "भाई", "यार", "तू", "बाप रे", "अरे", "सुन न", जैसे शब्दों का इस्तेमाल करके सिर्फ एक लाइन में जवाब दो। जवाब में ऐसा लगे कि उसका सच्चा दोस्त ही बोल रहा है, AI नहीं।
          केवल हिंदी में उत्तर दो, एक भी शब्द अंग्रेजी का नहीं होना चाहिए।
          Sentence: "${message}"
        `;
      } else if (targetLang.toLowerCase() === 'telugu') {
        // Telugu Emotional Prompt
        systemPrompt = `
          మీరు వినియోగదారుని అత్యంత సన్నిహిత స్నేహితుడిగా స్పందించాలి. వారి మాటలను వినిపించుకుని వారి భావోద్వేగాలను (కోపం, దుఃఖం, సంతోషం, తప్పు చేసినప్పుడు, పొగడ్తలకుగురైనప్పుడు) గుర్తించి తెలుగు లోపల ఉండే అపారమైన ప్రేమతో స్పందించండి. వినియోగదారుని “నాన్నా”, “తమ్ముడూ”, “అయ్యో”, “రా”, “ఏంటి రా” లాంటి మాటలతో పిలిచి, డొక్కాలో స్నేహితుడిలా ఒక్క లైన్లోనే ప్రేమతో, సరదాగా, లేదా తిడుతూ మాట్లాడండి. మాటల్లో మనసులో ఉన్న భావోద్వేగం మక్కువ ఉండాలి. మీరు AI లా కాకుండా నిజమైన మానవ స్నేహితుడిలా ఉండాలి.
          సమాధానం పూర్తిగా తెలుగులో ఉండాలి, ఒకే ఒక్క ఆంగ్ల పదం కూడా ఉండకూడదు।
          Sentence: "${message}"
        `;
      } else {
        // Default Emotional Prompt for Other Languages
        systemPrompt = `
          You are the user's closest friend. Based on how they speak (angry, sad, happy, or after making a mistake), respond like a real best friend. If they are angry, calm them with playful scolding; if sad, give heartfelt comfort; if they made a mistake, guide them lovingly; and if they did something good, cheer them up with proud appreciation. 
          Always reflect deep friendship and emotions. Reply in a single line, like a real friend.
          Your reply must be 100% in ${targetLang} language. Do not use any English words.
          Sentence: "${message}"
        `;
      }
    } else {
      // If tone is not 'ai' or 'hi', return error
      return res.status(400).json({ error: 'Invalid tone specified' });
    }

    // Step 2: Final API Call to get the translated/emotional response
    const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` // Authorization using API Key
      },
      body: JSON.stringify({
        model: process.env.MODEL_ID, // AI Model ID
        messages: [
          { role: 'system', content: systemPrompt } // System role prompt to control tone and style
        ],
        max_tokens: 100  // Response token limit
      })
    });

    const data = await apiRes.json();  // Parse the response JSON
    const reply = data.choices?.[0]?.message?.content.trim(); // Extract the AI's reply

    // If API returns no reply, send error response
    if (!reply) {
      console.error('Empty response from API:', data);
      return res.status(500).json({ translation: 'Translation failed.' });
    }

    // Send successful translation response with detected source language
    return res.json({ translation: reply, sourceLang: detectedLang });

  } catch (err) {
    // Handle unexpected errors
    console.error('Catch Error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Start server and listen on specified port
app.listen(PORT, () => console.log(`Server is running at http://localhost:${PORT}`));
