import React, { useState, useRef } from 'react';
import { GeneratedPin, GenerationState, PinConfig, GitHubConfig } from './types';
import GeneratorForm from './components/GeneratorForm';
import PinPreview from './components/PinPreview';
import GitHubAuthForm from './components/GitHubAuthForm';
import EditModal from './components/EditModal';
import { generateImage } from './services/geminiService';
import { createCompositePin } from './utils/imageUtils';
import { getPinFilename } from './utils/zipUtils';
import { uploadImageToGitHub } from './services/githubService';

const App: React.FC = () => {
  // Auth State
  const [githubConfig, setGithubConfig] = useState<GitHubConfig | null>(null);

  // App State
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    step: 'idle'
  });
  
  const [results, setResults] = useState<GeneratedPin[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editingPin, setEditingPin] = useState<GeneratedPin | null>(null);
  
  // Upload State
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (config: PinConfig) => {
    const total = config.keywords.length;
    let completed = 0;

    for (const keyword of config.keywords) {
      setState({ 
        isGenerating: true, 
        step: 'image1',
        currentKeyword: keyword,
        progress: { current: completed + 1, total }
      });

      if (completed === 0 && resultsRef.current) {
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }

      try {
        // Construct Prompts from Templates
        const prompt1 = config.promptTop.replace(/{keyword}/gi, keyword);
        const prompt2 = config.promptBottom.replace(/{keyword}/gi, keyword);
        
        setState(prev => ({ ...prev, step: 'image1' }));
        const image1Base64 = await generateImage(prompt1);

        setState(prev => ({ ...prev, step: 'image2' }));
        const image2Base64 = await generateImage(prompt2);

        setState(prev => ({ ...prev, step: 'compositing' }));
        const finalImageBase64 = await createCompositePin(
            image1Base64, 
            image2Base64, 
            "", 
            keyword, 
            config.website,
            config.colors
        );

        const newPin: GeneratedPin = {
          id: Date.now().toString() + Math.random(),
          keyword: keyword,
          image1Base64,
          image2Base64,
          finalImageBase64,
          createdAt: Date.now(),
          website: config.website
        };

        setResults(prev => [newPin, ...prev]);

      } catch (error) {
        console.error(`Error processing ${keyword}:`, error);
      }
      
      completed++;
    }

    setState({ 
      isGenerating: false, 
      step: 'complete',
      currentKeyword: undefined,
      progress: undefined
    });
  };

  const handleUpload = async () => {
    if (!githubConfig) return;
    
    setIsUploading(true);
    setUploadProgress({ current: 0, total: results.length });

    const updatedResults = [...results];
    let count = 0;

    for (let i = 0; i < updatedResults.length; i++) {
        const pin = updatedResults[i];
        if (pin.finalImageBase64 && !pin.uploadLink) {
            try {
                const filename = getPinFilename(pin.keyword);
                const link = await uploadImageToGitHub(pin.finalImageBase64, filename, githubConfig);
                updatedResults[i] = { ...pin, uploadLink: link };
                setResults([...updatedResults]);
            } catch (e) {
                console.error(`Failed to upload ${pin.keyword}`, e);
            }
        }
        count++;
        setUploadProgress({ current: count, total: results.length });
    }

    setIsUploading(false);
    handleFinalizeCSV(updatedResults);
  };

  const handleFinalizeCSV = (pinsToExport: GeneratedPin[]) => {
    const headers = ['Focus Keyword', 'Image Link'];
    
    // Sort pins by creation time (Ascending) so the CSV order matches the input order
    const sortedPins = [...pinsToExport].sort((a, b) => a.createdAt - b.createdAt);

    const rows = sortedPins.map(pin => {
      const safeKeyword = `"${pin.keyword}"`;
      const safeLink = `"${pin.uploadLink || ''}"`;
      return [safeKeyword, safeLink].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'pinterest_upload_links.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all generated pins? This action cannot be undone.')) {
      setResults([]);
      setUploadProgress(null);
      setIsUploading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveEdit = (newImage: string) => {
    if (!editingPin) return;
    
    setResults(prevResults => 
      prevResults.map(pin => 
        pin.id === editingPin.id 
          ? { ...pin, finalImageBase64: newImage, uploadLink: undefined } // Reset upload link if edited
          : pin
      )
    );
    setEditingPin(null);
  };

  // -- RENDER AUTH SCREEN IF NOT CONNECTED --
  if (!githubConfig) {
    return <GitHubAuthForm onConnect={setGithubConfig} />;
  }

  // -- MAIN APP --
  return (
    <div className="min-h-screen bg-gray-950 pb-20 text-white">
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-red-500 shadow-lg border border-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h1 className="text-2xl font-bold font-serif tracking-tight text-white">PinFlow <span className="text-gray-500 font-sans text-sm ml-1 px-2 py-0.5 bg-gray-800 rounded-full border border-gray-700">Private</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-300 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                Authenticated: {githubConfig.repo}
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{results.length} Pins</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        
        {results.length === 0 && !state.isGenerating && (
            <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-white mb-4 leading-tight">
                Your Personal <br className="hidden md:block" />
                <span className="text-red-500">Creative Workspace</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Private, secure, and automated pin generation.
            </p>
            </div>
        )}

        <div className={`${results.length > 0 ? 'mb-12' : ''}`}>
            <GeneratorForm onGenerate={handleGenerate} isGenerating={state.isGenerating} />
        </div>

        {state.isGenerating && (
          <div className="max-w-2xl mx-auto mb-16 animate-fade-in bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 bg-gray-800 w-full">
               <div 
                 className="h-full bg-red-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                 style={{ width: `${state.progress ? (state.progress.current / state.progress.total) * 100 : 0}%`}}
               ></div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-white">
                    Processing: <span className="text-red-500">"{state.currentKeyword}"</span>
                </span>
                <span className="text-sm text-gray-500 font-medium">
                    {state.progress?.current} of {state.progress?.total}
                </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
                 <StepIndicator label="Data" active={false} completed={true} />
                 <StepIndicator label="Visual 1" active={state.step === 'image1'} completed={['image2', 'compositing'].includes(state.step)} />
                 <StepIndicator label="Visual 2" active={state.step === 'image2'} completed={['compositing'].includes(state.step)} />
                 <StepIndicator label="Mixing" active={state.step === 'compositing'} completed={false} />
            </div>
          </div>
        )}

        {results.length > 0 && (
            <div ref={resultsRef} className="space-y-4">
                <div className="flex items-center justify-end gap-4 bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-800 animate-fade-in">
                     <div className="text-right mr-auto hidden md:block">
                        <p className="text-sm font-bold text-white">Batch Actions</p>
                        <p className="text-xs text-gray-500">Manage your results</p>
                     </div>
                     
                    <button 
                        onClick={handleClearAll}
                        disabled={isUploading}
                        className="px-5 py-3 rounded-xl font-bold text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        Clear All
                    </button>

                    <button 
                        onClick={handleUpload}
                        disabled={isUploading}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm shadow-md hover:shadow-xl transform hover:-translate-y-0.5 text-white
                             ${isUploading ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-red-600 hover:bg-red-700'}
                        `}
                    >
                         {isUploading ? (
                             <span>Uploading {uploadProgress?.current}/{uploadProgress?.total}...</span>
                         ) : (
                            <>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                                Upload & Get CSV
                            </>
                         )}
                    </button>
                </div>

                <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 overflow-hidden animate-fade-in">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-900 border-b border-gray-800">
                                <tr>
                                    <th className="px-6 py-5 font-bold text-gray-500 text-xs uppercase tracking-wider w-1/3">Keyword</th>
                                    <th className="px-6 py-5 font-bold text-gray-500 text-xs uppercase tracking-wider w-1/3">Pin Preview</th>
                                    <th className="px-6 py-5 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800 bg-gray-900">
                                {results.map((pin, index) => (
                                    <PinPreview 
                                        key={pin.id} 
                                        pin={pin} 
                                        index={index} 
                                        onPreview={setPreviewImage}
                                        onEdit={() => setEditingPin(pin)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

      </main>

      {/* Edit Modal */}
      {editingPin && editingPin.finalImageBase64 && (
        <EditModal 
            isOpen={true}
            onClose={() => setEditingPin(null)}
            initialImage={editingPin.finalImageBase64}
            onSave={handleSaveEdit}
        />
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
            className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex items-center justify-center p-4 cursor-pointer animate-fade-in backdrop-blur-md"
            onClick={() => setPreviewImage(null)}
        >
            <div className="relative max-w-2xl max-h-[90vh] shadow-2xl rounded-lg overflow-hidden border border-gray-800">
                <img 
                    src={previewImage} 
                    alt="Full Preview" 
                    className="w-full h-full object-contain max-h-[90vh]"
                />
            </div>
        </div>
      )}
    </div>
  );
};

const StepIndicator: React.FC<{ label: string, active: boolean, completed: boolean }> = ({ label, active, completed }) => {
    let colorClass = "bg-gray-800 text-gray-600 border-gray-700";
    if (completed) colorClass = "bg-green-900/30 text-green-400 border-green-900/50";
    if (active) colorClass = "bg-red-900/30 text-red-400 border-red-900/50 animate-pulse";

    return (
        <div className={`text-xs font-bold uppercase tracking-wider py-2 px-1 text-center rounded border ${colorClass}`}>
            {label}
        </div>
    )
}

export default App;