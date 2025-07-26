import React from 'react';
import { useState } from 'react';

// Backend API 
const BASE_URL = 'https://ai-vs-hi.onrender.com';

function App() {
  // React State Hooks for input & responses
  const [input, setInput] = useState(''); // User's input message
  const [sourceLang, setSourceLang] = useState('Hindi'); // Selected Source Language
  const [targetLang, setTargetLang] = useState('Telugu'); // Selected Target Language
  const [aiResponse, setAiResponse] = useState(''); // Response from AI tone
  const [hiResponse, setHiResponse] = useState(''); // Response from HI (human-like) tone
  const [loading, setLoading] = useState(false); // Loading state while fetching translation
  const [sourceFocus, setSourceFocus] = useState(false); // Styling effect on Source Language dropdown focus
  const [targetFocus, setTargetFocus] = useState(false); // Styling effect on Target Language dropdown focus

  // Function triggered when user clicks "Translate" button
  const handleSubmit = async () => {
    if (!input.trim()) return; // If input is empty, do nothing
    setLoading(true); // Start loading spinner effect
    setAiResponse(''); // Clear previous AI response
    setHiResponse(''); // Clear previous HI response

    try {
      // 1st API call to fetch AI tone translation
      const resAI = await fetch(`${BASE_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, tone: 'ai', targetLang }) // Send message, tone=ai, and targetLang
      });
      const dataAI = await resAI.json(); // response from backend -> convert into JSON 
      setSourceLang(dataAI.detectedLang); // Update Source Language based on detected language (optional)
      setAiResponse(dataAI.translation); // Update state with AI response text

      // 2nd API call to fetch HI tone translation (human-like response)
      const resHI = await fetch(`${BASE_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, tone: 'hi', targetLang }) // Send message, tone=hi, and targetLang
      });
      const dataHI = await resHI.json(); // Get JSON response from backend
      setHiResponse(dataHI.translation); // Update state with HI response text

    } catch (err) {
      // If any API call fails, show error message
      setAiResponse('Error fetching AI response.');
      setHiResponse('Error fetching HI response.');
    }

    setLoading(false); // Stop loading spinner effect
  };

  // List of languages available in dropdown
  const languages = [
    'Hindi', 'Khariboli', 'Haryanvi', 'Braj Bhasha', 'Bundeli', 'Awadhi',
    'Bagheli', 'Bhojpuri', 'Maithili', 'Magahi', 'Garhwali', 'Kumaoni',
    'Jaunsari', 'Chhattisgarhi', 'Marwari', 'Kanauji', 'Angika', 'Tamil', 
    'Telugu', 'Kannada', 'Malayalam', 'Tulu', 'Konkani','Gujarati'
  ];

  // JSX Return — This is what renders on screen
  return (
    <div className="flex items-center justify-center w-screen min-h-screen">
      <div className="w-full max-w-3xl p-8 mx-auto text-white shadow-2xl bg-gray-800/80 backdrop-blur-md rounded-2xl"> {/* Main card box */}
        {/* App Heading */}
        <h1 className="mb-6 text-5xl font-bold text-purple-400">AI vs HI Translator</h1>

        {/* Textarea for user input */}
        <textarea
          className="w-full p-4 mb-6 text-lg text-white placeholder-gray-400 bg-gray-700 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows="3"
          placeholder="Enter your message..."
          value={input} // Controlled component linked to input state
          onChange={(e) => setInput(e.target.value)} // Updates input state on typing
        ></textarea>

        {/* Dropdowns for Source & Target Languages */}
        <div className="flex flex-col mb-6 space-y-4 md:flex-row md:space-x-4 md:space-y-0">
          
          {/* Source Language Dropdown */}
          <div className="w-full">
            <label className="block mb-2 text-xl font-semibold text-white">Source Language</label>
            <select
              className={`w-full p-3 text-lg rounded-lg ${sourceFocus ? 'text-black bg-white' : 'text-white bg-gray-700'}`}
              value={sourceLang}
              onFocus={() => setSourceFocus(true)} // Styling on focus
              onBlur={() => setSourceFocus(false)}  // Styling reset on blur
              onChange={(e) => setSourceLang(e.target.value)} // Update sourceLang state
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option> // Render language options
              ))}
            </select>
          </div>

          {/* Target Language Dropdown */}
          <div className="w-full">
            <label className="block mb-2 text-xl font-semibold text-white">Target Language</label>
            <select
              className={`w-full p-3 text-lg rounded-lg ${targetFocus ? 'text-black bg-white' : 'text-white bg-gray-700'}`}
              value={targetLang}
              onFocus={() => setTargetFocus(true)} // Styling on focus
              onBlur={() => setTargetFocus(false)}  // Styling reset on blur
              onChange={(e) => setTargetLang(e.target.value)} // Update targetLang state
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option> // Render language options
              ))}
            </select>
          </div>
        </div>

        {/* Translate Button */}
        <button
          onClick={handleSubmit} // Calls handleSubmit function on click
          className="w-full py-3 text-5xl font-bold text-white transition bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          disabled={loading} // Disable button while loading
        >
          {loading ? 'Translating...' : 'Translate'} {/* Change button text while loading */}
        </button>

        {/* AI Response Block */}
        {aiResponse && (
          <div className="mt-8 text-left">
            <h2 className="mb-2 text-2xl font-bold text-purple-400">🤖 AI Response</h2>
            <div className="p-4 bg-gray-700 rounded-lg">{aiResponse}</div>
          </div>
        )}

        {/* HI Response Block */}
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
