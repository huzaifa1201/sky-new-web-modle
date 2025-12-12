import React from 'react';

interface Icon3DProps {
  conditionCode: number;
  isDay: boolean;
  size?: number;
  className?: string;
}

const Icon3D: React.FC<Icon3DProps> = ({ conditionCode, isDay, size = 64, className = "" }) => {
  
  // Using Tarikul-Islam-Anik/Animated-Fluent-Emojis for stable, high-quality 3D-style images
  const BASE_URL = "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis";
  
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
    // 511 is freezing rain -> Snow/Rain mix? using Rain for safety
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
    assetPath = "Natural/Fog.png"; // Fallback to cloud if fog doesn't exist in set, but Fog exists
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
         // Partly cloudy
         assetPath = isDay ? "Natural/Sun Behind Cloud.png" : "Natural/Cloud.png";
    } else {
         // Overcast
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

        <img 
            src={imageUrl} 
            alt={fallbackEmoji}
            className="w-full h-full object-contain drop-shadow-xl z-10 relative"
            loading="lazy"
            onError={(e) => {
                // If image fails, hide it and show emoji (though these URLs are stable)
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).parentElement!.innerText = fallbackEmoji;
            }}
        />
    </div>
  );
};

export default Icon3D;