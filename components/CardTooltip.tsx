import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  cardName: string;
  children: React.ReactNode;
}

const CardTooltip: React.FC<Props> = ({ cardName, children }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  
  const triggerRef = useRef<HTMLElement>(null);
  const imageCache = useRef<string | null>(null);

  const cleanName = useMemo(() => {
    let name = cardName;
    if (name.startsWith('#card:')) name = name.replace('#card:', '');
    if (name.startsWith('card:')) name = name.replace('card:', '');
    return decodeURIComponent(name).trim();
  }, [cardName]);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top, // Viewport relative for fixed positioning
        left: rect.left + (rect.width / 2)
      });
    }
    setIsHovered(true);
  };

  useEffect(() => {
    if (!isHovered || !cleanName) return;
    
    if (imageUrl || imageCache.current || error) {
        if (imageCache.current && !imageUrl) {
            setImageUrl(imageCache.current);
        }
        return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchCard = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cleanName)}`, { signal });
        
        if (!response.ok) {
           throw new Error('Card not found');
        }

        const data = await response.json();
        
        let foundImage = null;
        if (data.image_uris && data.image_uris.normal) {
            foundImage = data.image_uris.normal;
        } else if (data.card_faces && data.card_faces[0].image_uris) {
            foundImage = data.card_faces[0].image_uris.normal;
        }

        if (foundImage) {
            imageCache.current = foundImage;
            if (!signal.aborted) {
                setImageUrl(foundImage);
                setError(false);
            }
        } else {
            if (!signal.aborted) setError(true);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
             if (!signal.aborted) setError(true);
        }
      } finally {
        if (!signal.aborted) {
            setLoading(false);
        }
      }
    };

    fetchCard();

    return () => {
      controller.abort();
    };
  }, [isHovered, cleanName]);

  return (
    <>
      <span 
        ref={triggerRef}
        className="text-[#8e98bc] font-bold border-b border-dashed border-[#8e98bc]/50 cursor-help transition-colors hover:text-[#b0bce8] hover:border-solid select-text relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </span>

      {isHovered && coords && createPortal(
        <div 
          className="fixed pointer-events-none z-[99999]"
          style={{ 
            top: coords.top, 
            left: coords.left 
          }}
        >
          {/* 
              Tooltip Container:
              - translate-x-1/2: Centers horizontally on 'left' coord
              - bottom-2: Pushes it 8px (0.5rem) above the 'top' coord
              - origin-bottom: Animation starts from the text
          */}
          <div className="absolute bottom-2 left-0 transform -translate-x-1/2 w-[240px] animate-fade-in origin-bottom">
            
            <div className="relative rounded-xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.9)] bg-[#0f1216] border border-mtg-border p-1">
              
              {loading && !imageUrl && (
                <div className="h-[330px] w-full flex flex-col items-center justify-center bg-gray-900 text-mtg-accent/50 font-fantasy text-sm animate-pulse p-4 text-center">
                  <span>Summoning...</span>
                </div>
              )}
              
              {imageUrl && (
                <>
                  <img 
                    src={imageUrl} 
                    alt={cleanName} 
                    className="w-full h-auto rounded-lg"
                    loading="eager"
                  />
                  <div className="absolute bottom-1 right-2 text-[8px] text-gray-500 font-sans opacity-70 bg-black/50 px-1 rounded">
                     via Scryfall
                  </div>
                </>
              )}

              {!loading && error && !imageUrl && (
                <div className="h-[100px] w-full flex flex-col items-center justify-center bg-red-900/20 text-red-400 text-xs p-4 text-center border-t border-red-900/30">
                  <span>Image fizzled.</span>
                </div>
              )}
            </div>

            {/* Arrow Pointing Down */}
            <div className="absolute left-1/2 -bottom-1.5 w-4 h-4 bg-[#0f1216] border-r border-b border-mtg-border transform -translate-x-1/2 rotate-45"></div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default CardTooltip;