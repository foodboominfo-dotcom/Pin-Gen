
import React, { useState } from 'react';
import { PinConfig, ColorTheme } from '../types';

interface GeneratorFormProps {
  onGenerate: (config: PinConfig) => void;
  isGenerating: boolean;
}

const DEFAULT_PROMPT_TOP = "Aesthetic, minimalist, high quality vertical photography of {keyword}, top down view or flat lay, soft lighting, pinterest style, photorealistic, 8k resolution";
const DEFAULT_PROMPT_BOTTOM = "Aesthetic, minimalist, high quality vertical photography of {keyword}, lifestyle detail shot or close up, warm tones, pinterest style, photorealistic, 8k resolution";

const PRESETS: { name: string; theme: ColorTheme }[] = [
  { name: 'Classic Red', theme: { band: '#ffffff', text: '#1a1a1a', accent: '#e60023', url: '#666666' } },
  { name: 'Luxury Dark', theme: { band: '#1a1a1a', text: '#ffffff', accent: '#fbbf24', url: '#cccccc' } },
  { name: 'Warm Boho', theme: { band: '#fdf6e3', text: '#5c4033', accent: '#d97706', url: '#8c7366' } },
  { name: 'Fresh Nature', theme: { band: '#064e3b', text: '#ffffff', accent: '#34d399', url: '#a7f3d0' } },
  { name: 'Modern Blue', theme: { band: '#1e3a8a', text: '#ffffff', accent: '#60a5fa', url: '#bfdbfe' } },
];

const GeneratorForm: React.FC<GeneratorFormProps> = ({ onGenerate, isGenerating }) => {
  const [keywordsInput, setKeywordsInput] = useState('');
  const [website, setWebsite] = useState('');
  
  const [promptTop, setPromptTop] = useState(DEFAULT_PROMPT_TOP);
  const [promptBottom, setPromptBottom] = useState(DEFAULT_PROMPT_BOTTOM);
  
  // Custom Colors State
  const [colors, setColors] = useState<ColorTheme>(PRESETS[0].theme);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const keywords = keywordsInput
      .split('\n')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (keywords.length > 0) {
      onGenerate({ 
        keywords,
        website: website.trim(),
        colors,
        promptTop,
        promptBottom
      });
    }
  };

  const keywordCount = keywordsInput.split('\n').filter(k => k.trim().length > 0).length;

  const applyPreset = (theme: ColorTheme) => {
    setColors(theme);
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-800">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-white mb-2">Create Viral Pins</h2>
        <p className="text-gray-400">Generate aesthetic, keyword-optimized pins in seconds.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Website Input */}
        <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Website Name</label>
            <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="www.yourwebsite.com"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder-gray-500 transition-all"
            disabled={isGenerating}
            />
        </div>

        {/* Prompt Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                    Top Image Prompt <span className="text-gray-500 font-normal">(Use <code>{'{keyword}'}</code>)</span>
                </label>
                <textarea
                    value={promptTop}
                    onChange={(e) => setPromptTop(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm text-gray-300 placeholder-gray-600 font-mono resize-none"
                    disabled={isGenerating}
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                    Bottom Image Prompt <span className="text-gray-500 font-normal">(Use <code>{'{keyword}'}</code>)</span>
                </label>
                <textarea
                    value={promptBottom}
                    onChange={(e) => setPromptBottom(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm text-gray-300 placeholder-gray-600 font-mono resize-none"
                    disabled={isGenerating}
                />
            </div>
        </div>
            
        {/* Color Controls */}
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <label className="block text-sm font-bold text-gray-300 mb-4">Design Colors</label>
            
            {/* Presets */}
            <div className="flex flex-wrap gap-2 mb-6">
                {PRESETS.map((preset, idx) => (
                    <button
                        key={idx}
                        type="button"
                        onClick={() => applyPreset(preset.theme)}
                        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-xs text-gray-300 transition-colors"
                    >
                        {preset.name}
                    </button>
                ))}
            </div>

            {/* Custom Pickers */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Band / Bg</label>
                    <div className="flex items-center gap-2 bg-gray-800 p-2 rounded border border-gray-700">
                        <input 
                            type="color" 
                            value={colors.band} 
                            onChange={(e) => setColors({...colors, band: e.target.value})}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                        />
                        <span className="text-xs font-mono text-gray-400">{colors.band}</span>
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Text Color</label>
                    <div className="flex items-center gap-2 bg-gray-800 p-2 rounded border border-gray-700">
                         <input 
                            type="color" 
                            value={colors.text} 
                            onChange={(e) => setColors({...colors, text: e.target.value})}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                        />
                        <span className="text-xs font-mono text-gray-400">{colors.text}</span>
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Accent Line</label>
                    <div className="flex items-center gap-2 bg-gray-800 p-2 rounded border border-gray-700">
                         <input 
                            type="color" 
                            value={colors.accent} 
                            onChange={(e) => setColors({...colors, accent: e.target.value})}
                            className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                        />
                        <span className="text-xs font-mono text-gray-400">{colors.accent}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-2">
            Focus Keywords <span className="text-gray-500 font-normal">(One per line)</span>
          </label>
          <textarea
            value={keywordsInput}
            onChange={(e) => setKeywordsInput(e.target.value)}
            placeholder="Healthy Dinner Recipes&#10;Minimalist Home Decor&#10;Summer Outfit Ideas"
            rows={5}
            className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-white text-lg placeholder-gray-600 resize-none transition-all"
            disabled={isGenerating}
          />
        </div>

        <button
          type="submit"
          disabled={isGenerating || keywordCount === 0}
          className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all transform 
            ${isGenerating || keywordCount === 0 
              ? 'bg-gray-700 cursor-not-allowed text-gray-500 shadow-none' 
              : 'bg-red-600 hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-red-900/50'
            }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating {keywordCount} Pins...
            </span>
          ) : (
            `Generate ${keywordCount > 0 ? keywordCount : ''} Pins`
          )}
        </button>
      </form>
    </div>
  );
};

export default GeneratorForm;
