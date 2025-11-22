
import React, { useState, useEffect } from 'react';
import { editImage } from '../services/geminiService';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage: string;
  onSave: (newImage: string) => void;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, initialImage, onSave }) => {
  const [currentImage, setCurrentImage] = useState(initialImage);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when modal opens with a new image
  useEffect(() => {
    if (isOpen) {
        setCurrentImage(initialImage);
        setPrompt('');
        setIsProcessing(false);
    }
  }, [isOpen, initialImage]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    try {
      const newImage = await editImage(currentImage, prompt);
      setCurrentImage(newImage);
      setPrompt(''); 
    } catch (e) {
      console.error(e);
      alert("Failed to edit image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    onSave(currentImage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-gray-900 w-full max-w-6xl rounded-2xl border border-gray-800 flex flex-col md:flex-row overflow-hidden shadow-2xl max-h-[90vh] h-[800px]">
        {/* Image Area */}
        <div className="flex-1 bg-black flex items-center justify-center p-4 md:p-8 relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
            <div className="relative h-full flex items-center justify-center w-full">
                 <img src={currentImage} className="max-w-full max-h-full object-contain shadow-2xl rounded-sm border border-gray-800" alt="Editing" />
            </div>
            
             {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10">
                    <div className="text-center p-8">
                         <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-6"></div>
                        <p className="text-2xl font-bold text-white mb-2">AI is working magic...</p>
                        <p className="text-gray-400">Applying your changes to the image</p>
                    </div>
                </div>
            )}
        </div>

        {/* Controls Area */}
        <div className="w-full md:w-[400px] bg-gray-900 p-6 md:p-8 flex flex-col border-l border-gray-800">
            <div className="mb-8">
                 <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                     </div>
                     <h3 className="text-2xl font-serif font-bold text-white">Magic Edit</h3>
                 </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Use AI to modify your pin. Describe what you want to change, add, or remove.
                </p>
            </div>

            <div className="flex-1 flex flex-col gap-4 min-h-0">
                <div className="flex-1 flex flex-col">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Instructions</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Examples:&#10;• Add a vintage film filter&#10;• Make the background blue&#10;• Add snowflakes&#10;• Make it look like a sketch"
                        className="w-full flex-1 p-4 bg-gray-800 rounded-xl border border-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:outline-none resize-none text-base leading-relaxed placeholder-gray-600"
                        disabled={isProcessing}
                    />
                </div>
                
                <button
                    onClick={handleGenerate}
                    disabled={isProcessing || !prompt.trim()}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                        isProcessing || !prompt.trim()
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-500 hover:to-orange-500 shadow-lg hover:shadow-red-900/30 hover:-translate-y-1'
                    }`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Generate Edit
                </button>
            </div>

            <div className="mt-8 flex gap-3 pt-6 border-t border-gray-800">
                <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-400 hover:bg-gray-800 hover:text-white transition-colors border border-transparent hover:border-gray-700">
                    Cancel
                </button>
                <button onClick={handleSave} className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-all shadow-lg flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    Save Changes
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
