import React from 'react';
import { GeneratedImage } from '../types';
import { X, Download, Wand2 } from 'lucide-react';

interface ImageViewerProps {
  image: GeneratedImage | null;
  onClose: () => void;
  onRemix: (prompt: string) => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ image, onClose, onRemix }) => {
  if (!image) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `moodpaper-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemix = () => {
    onRemix(image.prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full h-full flex flex-col">
        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
          <button 
            onClick={onClose}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Main Image Container */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <img 
            src={image.url} 
            alt={image.prompt} 
            className="max-h-full max-w-full rounded-lg shadow-2xl object-contain"
          />
        </div>

        {/* Bottom Controls */}
        <div className="p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent pb-10 space-y-4">
          <p className="text-sm text-gray-300 line-clamp-2 px-2 text-center italic mb-4">
            "{image.prompt}"
          </p>
          
          <div className="flex gap-4 max-w-md mx-auto">
            <button 
              onClick={handleRemix}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-surface hover:bg-zinc-800 text-white font-medium transition-all active:scale-95 border border-zinc-700"
            >
              <Wand2 size={20} className="text-purple-400" />
              <span>Remix</span>
            </button>
            
            <button 
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary hover:bg-indigo-500 text-white font-medium transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
            >
              <Download size={20} />
              <span>다운로드</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;