import React from 'react';

const LoadingSpinner: React.FC = () => (
  // Added h-16 w-16 so the container takes up physical space matching the largest ring
  <div className="relative flex justify-center items-center h-16 w-16">
    {/* Outer ring */}
    <div className="absolute animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
    {/* Inner ring */}
    <div className="absolute animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-mtg-accent animation-delay-150" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
    {/* Core */}
    <div className="h-4 w-4 bg-white rounded-full animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
  </div>
);

export default LoadingSpinner;