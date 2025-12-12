import React, { useState, useEffect } from 'react';

// TypeScript declaration for the custom web component properties
interface ModelViewerProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  src?: string;
  poster?: string;
  alt?: string;
  'auto-rotate'?: boolean;
  'camera-controls'?: boolean;
  'disable-zoom'?: boolean;
  'shadow-intensity'?: string;
  exposure?: string;
}

interface Icon3DProps {
  conditionCode: number;
  isDay: boolean;
  size?: number;
  className?: string;
}

const Icon3D: React.FC<Icon3DProps> = ({ conditionCode, isDay, size = 64, className = "" }) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state if props change (e.g. scrolling in list)
  useEffect(() => {
    setHasError(false);
  }, [conditionCode, isDay]);

  // Microsoft Fluent 3D Assets Base URL
  const BASE_URL = "https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets";
  
  // Asset Logic
  let assetPath = "";
  let fallbackEmoji = "🌤️";

  // Thunderstorm (2xx)
  if (conditionCode >= 200 && conditionCode < 300) {
    // Matches the "SkyNow" logo style (Cloud + Lightning + Rain)
    assetPath = "Cloud%20with%20lightning%20and%20rain/3D/cloud_with_lightning_and_rain_3d";
    fallbackEmoji = "⛈";
  } 
  // Drizzle/Rain (3xx, 5xx)
  else if (conditionCode >= 300 && conditionCode < 600) {
    assetPath = "Cloud%20with%20rain/3D/cloud_with_rain_3d";
    fallbackEmoji = "🌧️";
  } 
  // Snow (6xx)
  else if (conditionCode >= 600 && conditionCode < 700) {
    assetPath = "Snowflake/3D/snowflake_3d";
    fallbackEmoji = "❄️";
  } 
  // Atmosphere / Cloud
  else if ((conditionCode >= 700 && conditionCode < 800) || conditionCode > 800) {
    // "Cloud" is generally safe
    assetPath = "Cloud/3D/cloud_3d";
    fallbackEmoji = "☁️";
  } 
  // Clear (800)
  else {
    // "Sun" and "Full moon" are the most standard assets.
    assetPath = isDay ? "Sun/3D/sun_3d" : "Full%20moon/3D/full_moon_3d";
    fallbackEmoji = isDay ? "☀️" : "🌕";
  }

  const modelUrl = `${BASE_URL}/${assetPath}.glb`;
  const imageUrl = `${BASE_URL}/${assetPath}.png`;

  // Performance Optimization: Only use 3D model for large sizes
  const use3DModel = size > 100;

  // Render Fallback Emoji if image failed
  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.8 }}
      >
        {fallbackEmoji}
      </div>
    );
  }

  // Use type casting for the custom element
  const ModelViewer = 'model-viewer' as unknown as React.ElementType<ModelViewerProps>;

  return (
    <div 
      className={`relative flex items-center justify-center ${className}`} 
      style={{ width: size, height: size }}
    >
        {/* Glow effect background */}
        <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full blur-2xl opacity-40 bg-white"
            style={{ zIndex: 0 }}
        ></div>

        {use3DModel ? (
            <ModelViewer
                src={modelUrl}
                poster={imageUrl}
                alt="Weather Icon"
                auto-rotate
                disable-zoom
                camera-controls={false}
                shadow-intensity="1"
                exposure="1.2"
                style={{ width: '100%', height: '100%', zIndex: 10 }}
            >
            </ModelViewer>
        ) : (
            <img 
                src={imageUrl} 
                alt="Weather Icon" 
                className="w-full h-full object-contain drop-shadow-lg z-10 relative"
                loading="lazy"
                onError={() => setHasError(true)}
            />
        )}
    </div>
  );
};

export default Icon3D;