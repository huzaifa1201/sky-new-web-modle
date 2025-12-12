import React, { useState, useEffect, useRef } from 'react';
import { WeatherData, AppScreen, UnitSystem, CitySearchResult, DailyWeather } from './types';
import { fetchWeather, reverseGeocode, searchCity } from './services/weatherService';
import Icon3D from './components/Icon3D';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import DetailGrid from './components/DetailGrid';
import DayDetailModal from './components/DayDetailModal';
import Footer from './components/Footer';
import { Search, Settings, MapPin, Navigation, ArrowLeft, Loader2, X, Sun, Moon, Thermometer, AlertCircle, LocateFixed } from 'lucide-react';

const App = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.SPLASH);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState<string>('Loading...');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [units, setUnits] = useState<UnitSystem>(UnitSystem.METRIC);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CitySearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<CitySearchResult[]>([]);
  const [selectedDay, setSelectedDay] = useState<DailyWeather | null>(null);
  
  // Theme state
  const [darkMode, setDarkMode] = useState(true);

  // Ref for scrolling to daily forecast
  const dailyRef = useRef<HTMLDivElement>(null);

  // Initial Load
  useEffect(() => {
    const init = async () => {
      try {
        // Load history
        const savedHistory = localStorage.getItem('skyNow_history');
        if (savedHistory) setSearchHistory(JSON.parse(savedHistory));

        // Get Location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            await loadWeatherData(latitude, longitude);
            // Artificial delay for splash animation
            setTimeout(() => setScreen(AppScreen.HOME), 3500); 
          }, (err) => {
            console.error("Geo error", err);
            // Default location: London
            loadWeatherData(51.5074, -0.1278).then(() => {
               setTimeout(() => setScreen(AppScreen.HOME), 3500);
            });
          });
        } else {
             loadWeatherData(51.5074, -0.1278).then(() => {
               setTimeout(() => setScreen(AppScreen.HOME), 3500);
            });
        }
      } catch (e) {
        console.error(e);
        setErrorMsg("Failed to initialize app.");
        setLoading(false);
      }
    };
    init();
  }, []);

  const loadWeatherData = async (lat: number, lon: number, unitOverride?: UnitSystem) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [weatherData, location] = await Promise.all([
        fetchWeather(lat, lon, unitOverride || units),
        reverseGeocode(lat, lon)
      ]);
      setWeather(weatherData);
      setLocationName(location);
    } catch (error) {
      console.error(error);
      setErrorMsg("Unable to fetch weather data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const results = await searchCity(query);
        setSearchResults(results);
      } catch(e) {
        // Silently fail for search suggestions
      }
    } else {
      setSearchResults([]);
    }
  };

  const selectCity = async (city: CitySearchResult) => {
    // Save to history
    const newHistory = [city, ...searchHistory.filter(h => h.lat !== city.lat)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('skyNow_history', JSON.stringify(newHistory));
    
    await loadWeatherData(city.lat, city.lon);
    setScreen(AppScreen.HOME);
    setSearchQuery('');
    setSearchResults([]);
  };

  const scrollToDaily = () => {
      if (dailyRef.current) {
          dailyRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        await loadWeatherData(latitude, longitude);
      }, (err) => {
        console.error("Geo error", err);
        setLoading(false);
        alert("Unable to retrieve location. Please check your permissions.");
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // --- Screens ---

  // 1. Splash Screen
  if (screen === AppScreen.SPLASH) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center z-50">
        <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            {/* Displaying conditionCode 200 (Thunderstorm) to match the SkyNow logo (Cloud+Rain+Lightning) */}
            <Icon3D conditionCode={200} isDay={true} size={150} className="animate-bounce-slow" />
        </div>
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-purple-200 mt-8 tracking-tighter">SkyNow</h1>
        <p className="text-white/50 mt-2 font-light tracking-widest">WEATHER FORECAST</p>
      </div>
    );
  }

  // 2. Search Screen
  if (screen === AppScreen.SEARCH) {
    return (
      <div className={`min-h-screen p-6 transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-blue-50 text-slate-800'}`}>
        <div className="flex items-center gap-4 mb-8">
            <button 
                onClick={() => setScreen(AppScreen.HOME)} 
                className={`p-2 rounded-full transition ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white shadow hover:bg-slate-100'}`}
            >
                <ArrowLeft size={24} className={darkMode ? 'text-white' : 'text-slate-800'} />
            </button>
            <h2 className="text-xl font-semibold">Search City</h2>
        </div>
        
        <div className="relative mb-8">
            <input 
                type="text" 
                placeholder="Search for a city..." 
                className={`w-full rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-lg ${darkMode ? 'bg-white/5 border border-white/10 text-white placeholder-white/30' : 'bg-white border border-slate-200 text-slate-800 placeholder-slate-400'}`}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
            />
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-white/40' : 'text-slate-400'}`} size={20} />
            {searchQuery && (
                <button onClick={() => setSearchQuery('')} className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-white/40' : 'text-slate-400'}`}>
                    <X size={18} />
                </button>
            )}
        </div>

        <div className="space-y-4">
            {searchResults.length > 0 ? (
                searchResults.map((city, idx) => (
                    <div key={idx} onClick={() => selectCity(city)} className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50'}`}>
                         <div className="flex items-center gap-3">
                             <MapPin size={18} className="text-blue-500" />
                             <div>
                                 <p className="font-medium">{city.name}</p>
                                 <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-slate-500'}`}>{city.state ? `${city.state}, ` : ''}{city.country}</p>
                             </div>
                         </div>
                         <Navigation size={16} className={darkMode ? 'text-white/30' : 'text-slate-400'} />
                    </div>
                ))
            ) : searchQuery.length === 0 && searchHistory.length > 0 ? (
                <>
                    <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-white/40' : 'text-slate-500'}`}>Recent Searches</h3>
                    {searchHistory.map((city, idx) => (
                        <div key={idx} onClick={() => selectCity(city)} className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between group ${darkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full transition ${darkMode ? 'bg-white/5 text-white/60 group-hover:bg-blue-500/20 group-hover:text-blue-400' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                                    <MapPin size={16} />
                                </div>
                                <span className={`font-medium ${darkMode ? 'text-white' : 'text-slate-700'}`}>{city.name}, {city.country}</span>
                            </div>
                        </div>
                    ))}
                </>
            ) : searchQuery.length > 0 ? (
                 <div className={`text-center py-10 ${darkMode ? 'text-white/30' : 'text-slate-400'}`}>Searching...</div>
            ) : null}
        </div>
      </div>
    );
  }

  // 3. Settings Screen
  if (screen === AppScreen.SETTINGS) {
      return (
        <div className={`min-h-screen p-6 transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-white' : 'bg-blue-50 text-slate-800'}`}>
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => setScreen(AppScreen.HOME)} 
                    className={`p-2 rounded-full transition ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white shadow hover:bg-slate-100'}`}
                >
                    <ArrowLeft size={24} className={darkMode ? 'text-white' : 'text-slate-800'} />
                </button>
                <h2 className="text-xl font-semibold">Settings</h2>
            </div>

            <div className="space-y-4">
                <div className={`p-5 rounded-2xl flex items-center justify-between ${darkMode ? 'glass-panel' : 'bg-white shadow-sm border border-slate-200'}`}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 text-purple-500 rounded-xl">
                            <Thermometer size={24} />
                        </div>
                        <div>
                            <p className="font-medium">Temperature Unit</p>
                            <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-slate-500'}`}>{units === UnitSystem.METRIC ? 'Celsius (°C)' : 'Fahrenheit (°F)'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            const newUnits = units === UnitSystem.METRIC ? UnitSystem.IMPERIAL : UnitSystem.METRIC;
                            setUnits(newUnits);
                            if(weather) loadWeatherData(weather.lat, weather.lon, newUnits);
                        }} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                    >
                        Switch to {units === UnitSystem.METRIC ? '°F' : '°C'}
                    </button>
                </div>

                <div className={`p-5 rounded-2xl flex items-center justify-between ${darkMode ? 'glass-panel' : 'bg-white shadow-sm border border-slate-200'}`}>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 text-blue-500 rounded-xl">
                            {darkMode ? <Moon size={24} /> : <Sun size={24} />}
                        </div>
                        <div>
                            <p className="font-medium">Theme</p>
                            <p className={`text-sm ${darkMode ? 'text-white/50' : 'text-slate-500'}`}>{darkMode ? 'Dark Mode' : 'Light Mode'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setDarkMode(!darkMode)} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                    >
                        Toggle
                    </button>
                </div>
                
                <div className="mt-8 p-4 text-center">
                    <p className={`text-xs ${darkMode ? 'text-white/30' : 'text-slate-400'}`}>SkyNow Version 1.0.0</p>
                </div>
            </div>
        </div>
      );
  }

  // 4. Home Screen
  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-gradient-to-br from-slate-900 via-[#1e1b4b] to-slate-900 text-white' : 'bg-gradient-to-br from-blue-300 via-blue-100 to-white text-slate-800'}`}>
      {/* Background decoration */}
      <div className={`fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none ${darkMode ? 'bg-purple-600/20' : 'bg-purple-300/40'}`}></div>
      <div className={`fixed bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full blur-[100px] pointer-events-none ${darkMode ? 'bg-blue-600/20' : 'bg-blue-300/40'}`}></div>

      {loading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Loader2 className="animate-spin text-white" size={48} />
          </div>
      )}

      {/* Detail Modal Overlay */}
      {selectedDay && (
          <DayDetailModal 
            data={selectedDay} 
            darkMode={darkMode} 
            onClose={() => setSelectedDay(null)} 
          />
      )}

      {/* Error State */}
      {errorMsg && !loading && !weather && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center p-6 text-center bg-slate-900">
             <div className="p-4 bg-red-500/20 rounded-full mb-4">
                 <AlertCircle size={48} className="text-red-400" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Oops!</h3>
             <p className="text-white/60 mb-6 max-w-xs">{errorMsg}</p>
             <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition text-white"
             >
                Try Again
             </button>
        </div>
      )}

      {weather && !errorMsg && (
        <div className="relative max-w-lg mx-auto min-h-screen flex flex-col p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 z-10">
            <button onClick={() => setScreen(AppScreen.SEARCH)} className={`p-3 backdrop-blur-md rounded-2xl border transition shadow-lg ${darkMode ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-white/60 border-white/40 text-slate-700 hover:bg-white'}`}>
              <Search size={22} />
            </button>
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                    <h2 className={`font-medium text-lg tracking-wide flex items-center gap-1 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        <MapPin size={14} className="text-blue-500" />
                        {locationName.split(',')[0]}
                    </h2>
                    <button 
                        onClick={handleUseMyLocation}
                        className={`p-1.5 rounded-full transition ${darkMode ? 'bg-white/10 hover:bg-white/20 text-blue-300' : 'bg-blue-100 hover:bg-blue-200 text-blue-600'}`}
                        title="Use My Location"
                    >
                        <LocateFixed size={14} />
                    </button>
                </div>
                <p className={`text-xs mt-0.5 font-light ${darkMode ? 'text-white/50' : 'text-slate-500'}`}>{new Date().toLocaleDateString('en-US', {weekday: 'long', day: 'numeric', month: 'long'})}</p>
            </div>
            <button onClick={() => setScreen(AppScreen.SETTINGS)} className={`p-3 backdrop-blur-md rounded-2xl border transition shadow-lg ${darkMode ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-white/60 border-white/40 text-slate-700 hover:bg-white'}`}>
              <Settings size={22} />
            </button>
          </div>

          {/* Main Weather Card */}
          <div className="flex-1 flex flex-col items-center justify-center mb-8 relative z-10">
            <div className="relative w-64 h-64 flex items-center justify-center">
                 {/* Large glow behind the icon */}
                <div className={`absolute inset-0 rounded-full blur-3xl ${darkMode ? 'bg-gradient-to-tr from-blue-500/30 to-purple-500/30' : 'bg-gradient-to-tr from-blue-300/40 to-purple-300/40'}`}></div>
                <Icon3D 
                    conditionCode={weather.current.weather[0].id} 
                    isDay={weather.current.weather[0].icon.includes('d')} 
                    size={180} 
                    className="animate-float" 
                />
            </div>
            
            <div className="text-center mt-[-20px]">
                <h1 className={`text-8xl font-bold tracking-tighter drop-shadow-lg ${darkMode ? 'text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60' : 'text-slate-800'}`}>
                    {Math.round(weather.current.temp)}°
                </h1>
                <p className={`text-xl font-medium capitalize mt-2 py-1 px-4 rounded-full inline-block backdrop-blur-md border ${darkMode ? 'text-blue-200 bg-white/10 border-white/10' : 'text-blue-700 bg-white/50 border-white/30'}`}>
                    {weather.current.weather[0].description}
                </p>
                <div className={`flex gap-4 justify-center mt-4 text-sm ${darkMode ? 'text-white/70' : 'text-slate-600'}`}>
                    <span>H: {Math.round(weather.daily[0].temp.max)}°</span>
                    <span>L: {Math.round(weather.daily[0].temp.min)}°</span>
                </div>
            </div>
          </div>

          {/* Content Scrollable Area */}
          <div className="w-full z-10 space-y-2">
             {/* Detail Grid */}
             <DetailGrid data={weather.current} darkMode={darkMode} />

             {/* Hourly Forecast */}
             <HourlyForecast data={weather.hourly} darkMode={darkMode} onSeeMore={scrollToDaily} />

             {/* Daily Forecast */}
             <div ref={dailyRef}>
                 <DailyForecast 
                    data={weather.daily} 
                    darkMode={darkMode} 
                    onDayClick={(day) => setSelectedDay(day)}
                 />
             </div>

             {/* Footer */}
             <Footer darkMode={darkMode} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;