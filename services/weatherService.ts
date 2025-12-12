import { WeatherData, CitySearchResult, CurrentWeather, HourlyWeather, DailyWeather, WeatherCondition } from '../types';

// Open-Meteo WMO Code Mapping
const mapWMOCode = (code: number, isDay: number): WeatherCondition[] => {
  const iconSuffix = isDay ? 'd' : 'n';
  let id = 800;
  let main = 'Clear';
  let description = 'Clear sky';

  // 0: Clear sky
  if (code === 0) { 
      id = 800; 
      main = 'Clear'; 
      description = 'Clear sky'; 
  }
  // 1, 2, 3: Mainly clear, partly cloudy, and overcast
  else if (code === 1) { id = 801; main = 'Clouds'; description = 'Mainly clear'; }
  else if (code === 2) { id = 802; main = 'Clouds'; description = 'Partly cloudy'; }
  else if (code === 3) { id = 803; main = 'Clouds'; description = 'Overcast'; }
  // 45, 48: Fog
  else if ([45, 48].includes(code)) { id = 701; main = 'Mist'; description = 'Fog'; }
  // 51, 53, 55: Drizzle
  else if ([51, 53, 55].includes(code)) { id = 300; main = 'Drizzle'; description = 'Drizzle'; }
  // 56, 57: Freezing Drizzle
  else if ([56, 57].includes(code)) { id = 300; main = 'Drizzle'; description = 'Freezing Drizzle'; }
  // 61, 63, 65: Rain
  else if ([61, 63, 65].includes(code)) { id = 500; main = 'Rain'; description = 'Rain'; }
  // 66, 67: Freezing Rain
  else if ([66, 67].includes(code)) { id = 500; main = 'Rain'; description = 'Freezing Rain'; }
  // 71, 73, 75: Snow fall
  else if ([71, 73, 75].includes(code)) { id = 600; main = 'Snow'; description = 'Snow fall'; }
  // 77: Snow grains
  else if (code === 77) { id = 600; main = 'Snow'; description = 'Snow grains'; }
  // 80, 81, 82: Rain showers
  else if ([80, 81, 82].includes(code)) { id = 521; main = 'Rain'; description = 'Rain showers'; }
  // 85, 86: Snow showers
  else if ([85, 86].includes(code)) { id = 600; main = 'Snow'; description = 'Snow showers'; }
  // 95, 96, 99: Thunderstorm
  else if ([95, 96, 99].includes(code)) { id = 200; main = 'Thunderstorm'; description = 'Thunderstorm'; }

  return [{ id, main, description, icon: `${id}${iconSuffix}` }];
};

export const fetchWeather = async (lat: number, lon: number, units: string = 'metric'): Promise<WeatherData> => {
  try {
    const unitParam = units === 'imperial' ? 'fahrenheit' : 'celsius';
    const windUnit = units === 'imperial' ? 'mph' : 'kmh';
    
    // Fetch generic weather data from Open-Meteo
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto&temperature_unit=${unitParam}&wind_speed_unit=${windUnit}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Weather API Error: ${response.statusText}`);
    }
    const data = await response.json();

    // Map Current Weather
    const current: CurrentWeather = {
      dt: Math.floor(Date.now() / 1000),
      sunrise: new Date(data.daily.sunrise[0]).getTime() / 1000,
      sunset: new Date(data.daily.sunset[0]).getTime() / 1000,
      temp: data.current.temperature_2m,
      feels_like: data.current.apparent_temperature,
      pressure: data.current.pressure_msl,
      humidity: data.current.relative_humidity_2m,
      dew_point: data.current.temperature_2m - ((100 - data.current.relative_humidity_2m) / 5),
      uvi: data.hourly.uv_index[0] || 0,
      clouds: data.current.cloud_cover,
      visibility: 10000,
      wind_speed: data.current.wind_speed_10m,
      wind_deg: data.current.wind_direction_10m,
      weather: mapWMOCode(data.current.weather_code, data.current.is_day)
    };

    // Map Hourly Weather
    const hourly: HourlyWeather[] = data.hourly.time.map((t: string, i: number) => {
        const dt = new Date(t).getTime() / 1000;
        const hour = new Date(t).getHours();
        // Fallback isDay logic if not provided in hourly
        const isDay = hour > 6 && hour < 20 ? 1 : 0; 

        return {
            dt: dt,
            temp: data.hourly.temperature_2m[i],
            feels_like: data.hourly.temperature_2m[i],
            pressure: 1013,
            humidity: 80, 
            dew_point: 10,
            uvi: data.hourly.uv_index[i] || 0,
            clouds: 50,
            visibility: 10000,
            wind_speed: 10,
            wind_deg: 0,
            weather: mapWMOCode(data.hourly.weather_code[i], isDay),
            pop: 0
        };
    });

    // Map Daily Weather
    const daily: DailyWeather[] = data.daily.time.map((t: string, i: number) => ({
      dt: new Date(t).getTime() / 1000,
      sunrise: new Date(data.daily.sunrise[i]).getTime() / 1000,
      sunset: new Date(data.daily.sunset[i]).getTime() / 1000,
      moonrise: 0,
      moonset: 0,
      moon_phase: 0,
      temp: {
        day: data.daily.temperature_2m_max[i],
        min: data.daily.temperature_2m_min[i],
        max: data.daily.temperature_2m_max[i],
        night: data.daily.temperature_2m_min[i],
        eve: data.daily.temperature_2m_max[i],
        morn: data.daily.temperature_2m_min[i]
      },
      feels_like: {
        day: data.daily.temperature_2m_max[i],
        night: data.daily.temperature_2m_min[i],
        eve: data.daily.temperature_2m_max[i],
        morn: data.daily.temperature_2m_min[i]
      },
      pressure: 1013,
      humidity: 50,
      dew_point: 10,
      wind_speed: 10,
      wind_deg: 0,
      weather: mapWMOCode(data.daily.weather_code[i], 1),
      clouds: 50,
      pop: (data.daily.precipitation_probability_max?.[i] || 0) / 100,
      uvi: data.daily.uv_index_max[i]
    }));

    return {
      lat: lat,
      lon: lon,
      timezone: data.timezone,
      timezone_offset: data.utc_offset_seconds,
      current,
      hourly,
      daily
    };

  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    throw error;
  }
};

export const searchCity = async (query: string): Promise<CitySearchResult[]> => {
  try {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=en&format=json`);
    const data = await response.json();
    
    if (!data.results) return [];

    return data.results.map((item: any) => ({
        name: item.name,
        lat: item.latitude,
        lon: item.longitude,
        country: item.country,
        state: item.admin1
    }));
  } catch (error) {
    console.error("Failed to search city:", error);
    return [];
  }
};

export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await response.json();
        
        if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.hamlet;
            const country = data.address.country;
            return city ? `${city}, ${country}` : "Unknown Location";
        }
        return "Unknown Location";
    } catch (e) {
        return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    }
}