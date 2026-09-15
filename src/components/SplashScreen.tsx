import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { themeConfig } = useApp();
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Total duration: 1800ms display, then 400ms fade out transition
    const timer = setTimeout(() => {
      setFadingOut(true);
    }, 1700);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2100);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      id="nudge-splash-screen"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center select-none transition-opacity duration-400 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: themeConfig.bgMain,
        color: themeConfig.textPrimary,
      }}
      aria-label="Nudge Loading Screen"
    >
      <div className="flex flex-col items-center text-center px-6 max-w-sm animate-in fade-in zoom-in-95 duration-700 ease-out">
        {/* Logo container */}
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-md mb-5 relative transition-transform"
          style={{
            backgroundColor: themeConfig.accentSubtle,
            color: themeConfig.accent,
            border: `2px solid ${themeConfig.accent}40`,
          }}
        >
          <span className="transform transition-transform hover:scale-110">🌿</span>
          {/* Subtle breathing glow */}
          <div
            className="absolute inset-0 rounded-3xl animate-ping opacity-20 pointer-events-none"
            style={{ backgroundColor: themeConfig.accent }}
          />
        </div>

        {/* Brand Name & Assistant Badge */}
        <div className="flex items-center gap-2 mb-2">
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ color: themeConfig.textPrimary }}
          >
            Nudge
          </h1>
          <span
            className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: themeConfig.accentSubtle,
              color: themeConfig.accentText,
            }}
          >
            Assistant
          </span>
        </div>

        {/* Existing Brand Tagline */}
        <p
          className="text-sm font-medium mb-8"
          style={{ color: themeConfig.textSecondary }}
        >
          Everyday life & self-care in sync
        </p>

        {/* Subtle, soft loading indicator */}
        <div className="flex items-center gap-1.5 mt-2">
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ backgroundColor: themeConfig.accent, animationDelay: '0ms' }}
          />
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ backgroundColor: themeConfig.accent, animationDelay: '150ms' }}
          />
          <div
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ backgroundColor: themeConfig.accent, animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
};
