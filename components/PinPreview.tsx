
import React from 'react';
import { GeneratedPin } from '../types';
import { getPinFilename } from '../utils/zipUtils';

interface PinPreviewProps {
  pin: GeneratedPin;
  index: number;
  onPreview: (imgUrl: string) => void;
  onEdit: () => void;
}

const PinPreview: React.FC<PinPreviewProps> = ({ pin, index, onPreview, onEdit }) => {
  
  const filename = getPinFilename(pin.keyword);

  return (
    <tr className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors group">
      <td className="px-6 py-6 align-middle">
        <div className="flex items-center gap-4">
          <span className="flex-shrink-0 w-8 h-8 bg-gray-800 text-gray-400 group-hover:bg-red-900/50 group-hover:text-red-400 transition-colors rounded-full flex items-center justify-center font-bold text-xs">
            {index + 1}
          </span>
          <div>
            <p className="text-lg font-bold text-white font-serif capitalize">{pin.keyword}</p>
            <p className="text-xs text-gray-500 font-mono mt-1">{filename}</p>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-6 align-middle">
        {pin.finalImageBase64 ? (
          <div className="flex items-center gap-4">
             <div 
                className="relative w-24 bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-700 aspect-[1/2] cursor-zoom-in hover:scale-105 transition-transform duration-300" 
                onClick={() => onPreview(pin.finalImageBase64!)}
            >
                <img 
                src={pin.finalImageBase64} 
                alt={`Pinterest Pin for ${pin.keyword}`}
                className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all"></div>
            </div>
            
            {/* Quick Edit Button next to preview for easy access */}
            <button 
                onClick={onEdit}
                className="md:hidden w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700"
                title="Edit Image"
            >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
          </div>
        ) : (
           <div className="w-24 aspect-[1/2] bg-gray-800 animate-pulse rounded-lg border border-gray-700"></div>
        )}
      </td>
      
      <td className="px-6 py-6 align-middle text-right">
        <div className="flex flex-col items-end gap-2">
            {/* Status Badge */}
            {pin.uploadLink ? (
                <div className="inline-flex items-center gap-2 text-gray-200 bg-gray-800 px-3 py-1 rounded-full text-xs font-bold border border-gray-700">
                    <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                    GitHub Link
                </div>
            ) : (
                <div className="inline-flex items-center gap-2 text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full text-xs font-bold border border-gray-800">
                    Pending Upload
                </div>
            )}

            {/* Edit Button - Desktop */}
            {pin.finalImageBase64 && (
                <button 
                    onClick={onEdit}
                    className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-800"
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Magic Edit
                </button>
            )}
        </div>
      </td>
    </tr>
  );
};

export default PinPreview;
