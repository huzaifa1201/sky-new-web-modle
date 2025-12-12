import React from 'react';
import { DailyWeather } from '../types';
import Icon3D from './Icon3D';

interface DailyForecastProps {
  data: DailyWeather[];
  darkMode: boolean;
  onDayClick: (day: DailyWeather) => void;
}

const DailyForecast: React.FC<DailyForecastProps> = ({ data, darkMode, onDayClick }) => {
  return (
    <div className={`w-full rounded-3xl p-6 mb-10 transition-colors duration-300 ${darkMode ? 'glass-panel' : 'light-glass-panel'}`}>
      <h3 className={`text-lg font-medium mb-4 ${darkMode ? 'text-white/90' : 'text-slate-800'}`}>Next Forecast</h3>
      <div className="flex flex-col gap-4">
        {data.slice(1, 8).map((day) => {
          const date = new Date(day.dt * 1000);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
          const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return (
            <div 
                key={day.dt} 
                onClick={() => onDayClick(day)}
                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${darkMode ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-white/50 active:bg-white/70'}`}
            >
              <div className="flex-1">
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{dayName}</p>
                <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-slate-500'}`}>{monthDay}</p>
              </div>
              
              <div className="flex-1 flex justify-center">
                 <Icon3D 
                    conditionCode={day.weather[0].id} 
                    isDay={true} 
                    size={32}
                  />
              </div>
              
              <div className="flex-1 flex justify-end items-center gap-3">
                <span className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{Math.round(day.temp.max)}°</span>
                <span className={`text-sm ${darkMode ? 'text-white/40' : 'text-slate-400'}`}>{Math.round(day.temp.min)}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyForecast;