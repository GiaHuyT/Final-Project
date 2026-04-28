"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronRight, Check } from "lucide-react";

interface SwipeButtonProps {
  text: string;
  onConfirm: () => void;
  disabled?: boolean;
}

export function SwipeButton({ text, onConfirm, disabled = false }: SwipeButtonProps) {
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0); // 0 to 1
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  const startSwipe = (clientX: number) => {
    if (disabled || isConfirmed) return;
    setIsSwiping(true);
  };

  const handleMove = (clientX: number) => {
    if (!isSwiping || disabled || isConfirmed) return;
    if (!containerRef.current || !thumbRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const thumbWidth = thumbRef.current.getBoundingClientRect().width;
    
    const maxDistance = containerRect.width - thumbWidth - 8; // 4px padding on each side
    let newX = clientX - containerRect.left - (thumbWidth / 2);
    
    if (newX < 0) newX = 0;
    if (newX > maxDistance) newX = maxDistance;
    
    const progress = newX / maxDistance;
    setSwipeProgress(progress);
  };

  const endSwipe = () => {
    if (!isSwiping || disabled || isConfirmed) return;
    setIsSwiping(false);
    
    if (swipeProgress > 0.85) {
      setSwipeProgress(1);
      setIsConfirmed(true);
      setTimeout(() => {
        onConfirm();
        setTimeout(() => {
          setIsConfirmed(false);
          setSwipeProgress(0);
        }, 500);
      }, 300);
    } else {
      setSwipeProgress(0);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleMouseUp = () => endSwipe();

    if (isSwiping) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isSwiping, swipeProgress]);

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (isSwiping) e.preventDefault();
      handleMove(e.touches[0].clientX);
    };
    const handleTouchEnd = () => endSwipe();

    if (isSwiping) {
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isSwiping, swipeProgress]);

  // Calculate actual pixel offset for thumb
  const maxPixels = containerRef.current && thumbRef.current 
    ? containerRef.current.offsetWidth - thumbRef.current.offsetWidth - 8
    : 0;
  
  const thumbOffset = swipeProgress * maxPixels;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-14 rounded-full flex items-center overflow-hidden transition-colors duration-300 ${disabled ? 'bg-slate-200' : isConfirmed ? 'bg-emerald-500' : 'bg-slate-900'} p-1`}
      style={{ touchAction: 'none' }}
    >
      <div className={`absolute inset-0 flex items-center justify-center font-bold text-sm select-none transition-opacity duration-300 pointer-events-none ${isConfirmed ? 'opacity-0' : 'opacity-100'} ${disabled ? 'text-slate-400' : 'text-slate-300'}`}>
        {text}
      </div>

      <div className={`absolute inset-0 flex items-center justify-center font-bold text-sm text-white select-none transition-opacity duration-300 pointer-events-none ${isConfirmed ? 'opacity-100' : 'opacity-0'}`}>
        Thành công
      </div>

      {!isConfirmed && (
        <div 
          className="absolute left-1 top-1 bottom-1 bg-blue-600/30 rounded-full"
          style={{ width: `calc(${thumbOffset}px + 48px)` }}
        />
      )}

      <div 
        ref={thumbRef}
        onMouseDown={(e) => startSwipe(e.clientX)}
        onTouchStart={(e) => startSwipe(e.touches[0].clientX)}
        className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shadow-md cursor-grab active:cursor-grabbing transition-transform ${isSwiping ? 'scale-95' : ''} ${disabled ? 'bg-slate-300 cursor-not-allowed' : 'bg-white'}`}
        style={{ 
          transform: `translateX(${thumbOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {isConfirmed ? (
          <Check className="w-6 h-6 text-emerald-500" />
        ) : (
          <ChevronRight className={`w-6 h-6 ${disabled ? 'text-slate-400' : 'text-blue-600'}`} />
        )}
      </div>
    </div>
  );
}
