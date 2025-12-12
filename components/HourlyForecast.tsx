import React from 'react';
import { HourlyWeather } from '../types';
import Icon3D from './Icon3D';

interface HourlyForecastProps {
  data: HourlyWeather[];
  darkMode: boolean;
  onSeeMore: () => void;
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ data, darkMode, onSeeMore }) => {
  return (
    <div className={`w-full rounded-3xl p-6 mb-6 transition-colors duration-300 ${darkMode ? 'glass-panel' : 'light-glass-panel'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-medium ${darkMode ? 'text-white/90' : 'text-slate-800'}`}>Today</h3>
        <button 
          onClick={onSeeMore} 
          className={`text-sm cursor-pointer hover:underline ${darkMode ? 'text-blue-300' : 'text-blue-600 font-semibold'}`}
        >
          7 days &gt;
        </button>
      </div>
      
      {/* Removed no-scrollbar to ensure visibility. Added pb-4 for scrollbar spacing. */}
      <div className="flex overflow-x-auto gap-4 pb-4 scroll-smooth">
        {data.slice(0, 24).map((hour, index) => {
          const date = new Date(hour.dt * 1000);
          const hours = date.getHours();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const formattedHour = hours % 12 || 12;
          const isNow = index === 0;

          // Card Logic - Increased contrast/opacity for better visibility
          let cardClass = "";
          let textClass = "";
          let tempClass = "";
          
          if (isNow) {
              cardClass = darkMode 
                ? 'bg-blue-600 shadow-lg shadow-blue-500/30 scale-105 border border-blue-400' 
                : 'bg-blue-500 text-white shadow-lg shadow-blue-500/40 scale-105';
              textClass = "text-white/95 font-semibold";
              tempClass = "text-white font-bold";
          } else {
              // Increased bg opacity for non-active cards
              cardClass = darkMode 
                ? 'bg-slate-800/80 hover:bg-slate-700 border border-white/10' 
                : 'bg-white/80 border border-blue-100 hover:bg-white shadow-sm';
              textClass = darkMode ? "text-white/80" : "text-slate-700 font-medium";
              tempClass = darkMode ? "text-white font-semibold" : "text-slate-900 font-bold";
          }

          return (
            <div 
              key={hour.dt}
              className={`flex-shrink-0 flex flex-col items-center justify-between p-3 rounded-2xl w-[80px] h-[140px] transition-all duration-300 ${cardClass}`}
            >
              <span className={`text-xs ${textClass}`}>
                {isNow ? 'NOW' : `${formattedHour} ${ampm}`}
              </span>
              
              <Icon3D 
                conditionCode={hour.weather[0].id} 
                isDay={hour.weather[0].icon.includes('d')} 
                size={40}
              />
              
              <span className={`text-base ${tempClass}`}>
                {Math.round(hour.temp)}°
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HourlyForecast;