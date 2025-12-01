
import React, { useState, useRef, useEffect } from 'react';
import { generateWallpapers } from './services/geminiService';
import { GeneratedImage, GenerationState } from './types';
import LoadingGrid from './components/LoadingGrid';
import ImageViewer from './components/ImageViewer';
import SettingsModal from './components/SettingsModal';
import { getApiKey } from './utils/storage';
import { Sparkles, Image as ImageIcon, Search, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [state, setState] = useState<GenerationState>({ isLoading: false, error: null });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Check for API key on mount
  useEffect(() => {
    if (!getApiKey()) {
      // Small delay to let UI render before showing modal if needed
      setTimeout(() => setIsSettingsOpen(true), 500);
    }
  }, []);

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || state.isLoading) return;

    if (!getApiKey()) {
      setIsSettingsOpen(true);
      return;
    }

    // Dismiss keyboard on mobile
    if (inputRef.current) {
      inputRef.current.blur();
    }

    setState({ isLoading: true, error: null });
    // Clear previous images to show loading state cleanly
    setImages([]); 

    try {
      const generatedImages = await generateWallpapers(prompt);
      setImages(generatedImages);
      // Scroll to top of results slightly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      setState({ isLoading: false, error: error.message });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleRemix = (remixPrompt: string) => {
    setPrompt(remixPrompt);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-background text-white pb-32 font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-lg">
            <ImageIcon size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            MoodPaper
          </h1>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-secondary hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md mx-auto pt-6 px-4">
        
        {/* Error Message */}
        {state.error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm text-center">
            {state.error}
          </div>
        )}

        {/* Empty State */}
        {!state.isLoading && images.length === 0 && !state.error && (
          <div className="flex flex-col items-center justify-center mt-20 text-center space-y-4 px-8 opacity-60">
            <Sparkles size={48} className="text-secondary mb-2" />
            <p className="text-lg font-medium text-white">나만의 배경화면을 만들어보세요</p>
            <p className="text-sm text-secondary leading-relaxed">
              "비오는 도쿄의 네온 사인 거리",<br/>
              "파스텔 톤의 몽환적인 구름",<br/>
              "사이버펑크 고양이"
            </p>
          </div>
        )}

        {/* Loading State */}
        {state.isLoading && <LoadingGrid />}

        {/* Image Grid */}
        {images.length > 0 && !state.isLoading && (
          <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-bottom-4 duration-500 fade-in">
            {images.map((img) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className="group relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-transform active:scale-[0.98]"
              >
                <img
                  src={img.url}
                  alt={img.prompt}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </button>
            ))}
          </div>
        )}
        
        <div ref={bottomRef} className="h-4" />
      </main>

      {/* Input Area - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-background via-background to-transparent pb-8">
        <form 
          onSubmit={handleGenerate}
          className="max-w-md mx-auto relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
              <Search size={18} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="어떤 분위기를 원하시나요?"
              className="w-full pl-11 pr-4 py-4 bg-surface/90 backdrop-blur-md border border-white/10 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-xl text-base"
              disabled={state.isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!prompt.trim() || state.isLoading}
            className="p-4 bg-primary hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95 flex items-center justify-center min-w-[3.5rem]"
          >
            {state.isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles size={20} />
            )}
          </button>
        </form>
      </div>

      {/* Full Screen Viewer */}
      {selectedImage && (
        <ImageViewer 
          image={selectedImage} 
          onClose={() => setSelectedImage(null)} 
          onRemix={handleRemix}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default App;
