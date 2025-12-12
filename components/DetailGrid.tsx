import React from 'react';
import { CurrentWeather } from '../types';
import { Wind, Droplets, Gauge, Sunrise, Sunset, Eye } from 'lucide-react';

interface DetailGridProps {
  data: CurrentWeather;
  darkMode: boolean;
}

const DetailGrid: React.FC<DetailGridProps> = ({ data, darkMode }) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const Item = ({ icon: Icon, label, value, subValue }: { icon: any, label: string, value: string, subValue?: string }) => (
    <div className={`border rounded-2xl p-4 flex flex-col justify-between h-28 backdrop-blur-sm transition-colors duration-300 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white/40 border-white/30 hover:bg-white/50'}`}>
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-full ${darkMode ? 'bg-white/10' : 'bg-white/50'}`}>
            <Icon size={18} className={`${darkMode ? 'text-white/80' : 'text-slate-700'}`} />
        </div>
        {subValue && <span className={`text-xs ${darkMode ? 'text-white/40' : 'text-slate-500'}`}>{subValue}</span>}
      </div>
      <div>
        <p className={`text-xs uppercase tracking-wider mb-1 ${darkMode ? 'text-white/60' : 'text-slate-500 font-medium'}`}>{label}</p>
        <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{value}</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Item icon={Wind} label="Wind" value={`${Math.round(data.wind_speed)} km/h`} subValue={`${data.wind_deg}°`} />
      <Item icon={Droplets} label="Humidity" value={`${data.humidity}%`} />
      <Item icon={Gauge} label="Pressure" value={`${data.pressure} hPa`} />
      <Item icon={Eye} label="Visibility" value={`${(data.visibility / 1000).toFixed(1)} km`} />
      <Item icon={Sunrise} label="Sunrise" value={formatTime(data.sunrise)} />
      <Item icon={Sunset} label="Sunset" value={formatTime(data.sunset)} />
    </div>
  );
};

export default DetailGrid;