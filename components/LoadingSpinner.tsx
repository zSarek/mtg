import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="relative flex justify-center items-center h-20 w-20">
    {/* Outer ring - Eclipse Shadow */}
    <div className="absolute animate-spin rounded-full h-20 w-20 border-t-2 border-l-2 border-mtg-eclipse opacity-80" style={{ animationDuration: '3s' }}></div>
    
    {/* Middle ring - Sun Gold */}
    <div className="absolute animate-spin rounded-full h-14 w-14 border-b-2 border-r-2 border-mtg-accent opacity-90" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
    
    {/* Inner ring - Leaf Green */}
    <div className="absolute animate-spin rounded-full h-8 w-8 border-t-2 border-mtg-leaf" style={{ animationDuration: '1s' }}></div>
    
    {/* Core - Pulsing Light */}
    <div className="h-2 w-2 bg-white rounded-full animate-pulse shadow-[0_0_20px_rgba(220,177,88,1)]"></div>
  </div>
);

export default LoadingSpinner;