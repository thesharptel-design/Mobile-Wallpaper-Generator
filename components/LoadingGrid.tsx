import React from 'react';

const LoadingGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 gap-3 p-4 w-full max-w-md mx-auto">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="aspect-[9/16] bg-surface rounded-xl overflow-hidden relative animate-pulse-fast">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
          <div className="absolute bottom-4 left-4 right-4 h-2 bg-secondary/20 rounded"></div>
          <div className="absolute bottom-8 left-4 right-8 h-2 bg-secondary/20 rounded"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingGrid;