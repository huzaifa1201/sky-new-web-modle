import React from 'react';
import { DailyWeather } from '../types';
import Icon3D from './Icon3D';
import { X, Wind, Droplets, Gauge, Sunrise, Sunset, CloudRain, Thermometer } from 'lucide-react';

interface DayDetailModalProps {
  data: DailyWeather;
  darkMode: boolean;
  onClose: () => void;
}

const DayDetailModal: React.FC<DayDetailModalProps> = ({ data, darkMode, onClose }) => {
  const date = new Date(data.dt * 1000);
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const formatTime = (timestamp: number) => {
    // Note: If using OneCall API, timestamp is correct. 
    // If using standard fallback, sunrise/set might be approximated from current day in service.
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const Item = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <div className={`p-3 rounded-xl flex flex-col items-center justify-center text-center gap-1 ${darkMode ? 'bg-white/5' : 'bg-blue-50'}`}>
      <Icon size={20} className={`mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
      <span className={`text-xs uppercase tracking-wide ${darkMode ? 'text-white/50' : 'text-slate-500'}`}>{label}</span>
      <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-100 transition-all ${
          darkMode 
            ? 'bg-slate-900 border border-white/10 text-white' 
            : 'bg-white text-slate-800'
        }`}
      >
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'}`}
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <h2 className="text-2xl font-bold">{dayName}</h2>
          <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-slate-500'}`}>{fullDate}</p>
          
          <div className="my-4">
             <Icon3D 
                conditionCode={data.weather[0].id} 
                isDay={true} 
                size={120}
            />
          </div>
          
          <div className="flex items-end gap-2 mb-2">
             <span className="text-5xl font-bold">{Math.round(data.temp.max)}°</span>
             <span className={`text-2xl mb-1 ${darkMode ? 'text-white/50' : 'text-slate-400'}`}>/ {Math.round(data.temp.min)}°</span>
          </div>
          <p className="px-3 py-1 rounded-full text-sm font-medium capitalize bg-blue-500/20 text-blue-500 border border-blue-500/30">
             {data.weather[0].description}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Item icon={Wind} label="Wind" value={`${Math.round(data.wind_speed)} km/h`} />
          <Item icon={Droplets} label="Humidity" value={`${data.humidity}%`} />
          <Item icon={CloudRain} label="Rain" value={`${Math.round(data.pop * 100)}%`} />
          <Item icon={Gauge} label="Pressure" value={`${data.pressure} hPa`} />
          {/* Note: Sunrise/Sunset might be estimated depending on API tier */}
          <Item icon={Sunrise} label="Sunrise" value={formatTime(data.sunrise)} /> 
          <Item icon={Sunset} label="Sunset" value={formatTime(data.sunset)} />
        </div>
      </div>
    </div>
  );
};

export default DayDetailModal;