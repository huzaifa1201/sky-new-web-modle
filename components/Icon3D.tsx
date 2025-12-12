import React, { useState, useEffect } from 'react';

interface Icon3DProps {
  conditionCode: number;
  isDay: boolean;
  size?: number;
  className?: string;
}

const Icon3D: React.FC<Icon3DProps> = ({ conditionCode, isDay, size = 64, className = "" }) => {
  const [imgError, setImgError] = useState(false);

  // Reset error state when condition changes, giving the new image a chance to load
  useEffect(() => {
    setImgError(false);
  }, [conditionCode, isDay]);
  
  // Using jsDelivr CDN instead of raw.githubusercontent for faster caching and loading speeds
  const BASE_URL = "https://cdn.jsdelivr.net/gh/Tarikul-Islam-Anik/Animated-Fluent-Emojis@master/Emojis";
  
  let assetPath = "";
  let fallbackEmoji = "🌤️";

  // Thunderstorm (2xx)
  if (conditionCode >= 200 && conditionCode < 300) {
    assetPath = "Natural/Cloud with Lightning and Rain.png";
    fallbackEmoji = "⛈";
  } 
  // Drizzle (3xx)
  else if (conditionCode >= 300 && conditionCode < 400) {
    assetPath = "Natural/Cloud with Rain.png";
    fallbackEmoji = "🌧️";
  } 
  // Rain (5xx)
  else if (conditionCode >= 500 && conditionCode < 600) {
    assetPath = "Natural/Cloud with Rain.png";
    fallbackEmoji = "🌧️";
  } 
  // Snow (6xx)
  else if (conditionCode >= 600 && conditionCode < 700) {
    assetPath = "Natural/Snowflake.png";
    fallbackEmoji = "❄️";
  } 
  // Atmosphere (7xx - Fog, Mist)
  else if (conditionCode >= 700 && conditionCode < 800) {
    assetPath = "Natural/Fog.png"; 
    fallbackEmoji = "🌫️";
  } 
  // Clear (800)
  else if (conditionCode === 800) {
    assetPath = isDay ? "Natural/Sun.png" : "Natural/Full Moon.png";
    fallbackEmoji = isDay ? "☀️" : "🌕";
  } 
  // Clouds (80x)
  else if (conditionCode > 800) {
    if (conditionCode === 801 || conditionCode === 802) {
         assetPath = isDay ? "Natural/Sun Behind Cloud.png" : "Natural/Cloud.png";
    } else {
         assetPath = "Natural/Cloud.png";
    }
    fallbackEmoji = "☁️";
  } else {
    assetPath = isDay ? "Natural/Sun.png" : "Natural/Full Moon.png";
  }

  const imageUrl = `${BASE_URL}/${assetPath}`;

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`} 
      style={{ width: size, height: size }}
    >
        {/* Glow effect background */}
        <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full blur-xl opacity-40 bg-white"
            style={{ zIndex: 0 }}
        ></div>

        {!imgError ? (
            <img 
                src={imageUrl} 
                alt={fallbackEmoji}
                className="w-full h-full object-contain drop-shadow-xl z-10 relative"
                loading="lazy"
                onError={() => setImgError(true)}
            />
        ) : (
            <span 
                className="z-10 relative select-none"
                style={{ fontSize: size * 0.6, lineHeight: 1 }}
                role="img"
                aria-label={fallbackEmoji}
            >
                {fallbackEmoji}
            </span>
        )}
    </div>
  );
};

export default Icon3D;