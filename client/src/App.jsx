import React from 'react';
import { useState } from 'react';
const BASE_URL = 'https://ai-vs-hi.onrender.com';

function App() {
  const [input, setInput] = useState('');
  const [sourceLang, setSourceLang] = useState('Hindi');
  const [targetLang, setTargetLang] = useState('Telugu');
  const [aiResponse, setAiResponse] = useState('');
  const [hiResponse, setHiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [sourceFocus, setSourceFocus] = useState(false);
  const [targetFocus, setTargetFocus] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setAiResponse('');
    setHiResponse('');

    try {
      const resAI = await fetch(`${BASE_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, tone: 'ai', targetLang })
      });
      const dataAI = await resAI.json();
      setSourceLang(dataAI.detectedLang); // Optional UI update
      setAiResponse(dataAI.translation);

      const resHI = await fetch(`${BASE_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, tone: 'hi', targetLang })
      });
      const dataHI = await resHI.json();
      setHiResponse(dataHI.translation);

    } catch (err) {
      setAiResponse('Error fetching AI response.');
      setHiResponse('Error fetching HI response.');
    }

    setLoading(false);
  };


  const languages = [
    'Hindi', 'Khariboli', 'Haryanvi', 'Braj Bhasha', 'Bundeli', 'Awadhi',
    'Bagheli', 'Bhojpuri', 'Maithili', 'Magahi', 'Garhwali', 'Kumaoni',
    'Jaunsari', 'Chhattisgarhi', 'Marwari', 'Kanauji', 'Angika', 'Tamil', 
    'Telugu', 'Kannada', 'Malayalam', 'Tulu', 'Konkani'
  ];

  return (
    <div className="flex items-center justify-center w-screen min-h-screen">
      <div className="w-full max-w-3xl p-8 mx-auto text-white shadow-2xl bg-gray-800/80 backdrop-blur-md rounded-2xl">
        <h1 className="mb-6 text-5xl font-bold text-purple-400">AI vs HI Translator</h1>

        <textarea
          className="w-full p-4 mb-6 text-lg text-white placeholder-gray-400 bg-gray-700 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows="3"
          placeholder="Enter your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        ></textarea>

        <div className="flex flex-col mb-6 space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          {/* Source Language Dropdown */}
          <div className="w-full">
            <label className="block mb-2 text-xl font-semibold text-white">Source Language</label>
            <select
              className={`w-full p-3 text-lg rounded-lg ${sourceFocus ? 'text-black bg-white' : 'text-white bg-gray-700'}`}
              value={sourceLang}
              onFocus={() => setSourceFocus(true)}
              onBlur={() => setSourceFocus(false)}
              onChange={(e) => setSourceLang(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Target Language Dropdown */}
          <div className="w-full">
            <label className="block mb-2 text-xl font-semibold text-white">Target Language</label>
            <select
              className={`w-full p-3 text-lg rounded-lg ${targetFocus ? 'text-black bg-white' : 'text-white bg-gray-700'}`}
              value={targetLang}
              onFocus={() => setTargetFocus(true)}
              onBlur={() => setTargetFocus(false)}
              onChange={(e) => setTargetLang(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-3 text-5xl font-bold text-white transition bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Translating...' : 'Translate'}
        </button>

        {aiResponse && (
          <div className="mt-8 text-left">
            <h2 className="mb-2 text-2xl font-bold text-purple-400">🤖 AI Response</h2>
            <div className="p-4 bg-gray-700 rounded-lg">{aiResponse}</div>
          </div>
        )}

        {hiResponse && (
          <div className="mt-6 text-left">
            <h2 className="mb-2 text-2xl font-bold text-blue-400">🧠 HI Response</h2>
            <div className="p-4 bg-gray-700 rounded-lg">{hiResponse}</div>
          </div>
        )}
      </div>
    </div>  
  );
}

export default App;
