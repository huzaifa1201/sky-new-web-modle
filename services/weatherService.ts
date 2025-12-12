import { WeatherData, CitySearchResult, CurrentWeather, HourlyWeather, DailyWeather } from '../types';

const API_KEY = '369eabe5d3136a6af663ff17de6fec2f';
const ONECALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0/direct';

export const fetchWeather = async (lat: number, lon: number, units: string = 'metric'): Promise<WeatherData> => {
  try {
    // 1. Try One Call 3.0 first (Requested endpoint)
    const response = await fetch(`${ONECALL_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}&exclude=minutely,alerts`);
    
    if (response.ok) {
      return await response.json();
    }
    
    // 2. If One Call fails (likely 401 Unauthorized due to free tier), fallback to Standard APIs
    console.warn(`OneCall API failed (Status: ${response.status}). Falling back to Standard API.`);
    return await fetchStandardWeather(lat, lon, units);
    
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    throw error;
  }
};

// Fallback function using Standard Free APIs
const fetchStandardWeather = async (lat: number, lon: number, units: string): Promise<WeatherData> => {
    try {
        const [currentRes, forecastRes] = await Promise.all([
            fetch(`${WEATHER_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`),
            fetch(`${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`)
        ]);

        if (!currentRes.ok || !forecastRes.ok) {
            throw new Error(`Standard API failed: Weather ${currentRes.status}, Forecast ${forecastRes.status}`);
        }

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        return transformStandardData(currentData, forecastData);
    } catch (e) {
        console.error("Fallback logic failed:", e);
        throw e;
    }
}

// Transformer to shape Standard API data into OneCall format
const transformStandardData = (current: any, forecast: any): WeatherData => {
    // 1. Transform Current Weather
    const currentObj: CurrentWeather = {
        dt: current.dt,
        sunrise: current.sys.sunrise,
        sunset: current.sys.sunset,
        temp: current.main.temp,
        feels_like: current.main.feels_like,
        pressure: current.main.pressure,
        humidity: current.main.humidity,
        dew_point: current.main.temp, // Approximation
        uvi: 0, // Not available in standard
        clouds: current.clouds.all,
        visibility: current.visibility,
        wind_speed: current.wind.speed,
        wind_deg: current.wind.deg,
        weather: current.weather
    };

    // 2. Transform Forecast list to Hourly (Standard is 3-hour steps)
    const hourly: HourlyWeather[] = forecast.list.map((item: any) => ({
        dt: item.dt,
        temp: item.main.temp,
        feels_like: item.main.feels_like,
        pressure: item.main.pressure,
        humidity: item.main.humidity,
        dew_point: item.main.temp,
        uvi: 0,
        clouds: item.clouds.all,
        visibility: item.visibility,
        wind_speed: item.wind.speed,
        wind_deg: item.wind.deg,
        weather: item.weather,
        pop: item.pop || 0
    }));

    // 3. Transform Forecast list to Daily (Aggregate 3-hour chunks by day)
    const dailyMap = new Map<string, any>();
    
    forecast.list.forEach((item: any) => {
        // Simple date grouping
        const date = new Date(item.dt * 1000).toDateString();
        
        if (!dailyMap.has(date)) {
            dailyMap.set(date, {
                dt: item.dt,
                min: item.main.temp_min,
                max: item.main.temp_max,
                weather: item.weather,
                clouds: item.clouds.all,
                pop: item.pop || 0,
                pressure: item.main.pressure,
                humidity: item.main.humidity,
                wind_speed: item.wind.speed,
                wind_deg: item.wind.deg
            });
        } else {
            const day = dailyMap.get(date);
            day.min = Math.min(day.min, item.main.temp_min);
            day.max = Math.max(day.max, item.main.temp_max);
            // Optionally update weather icon priority here
        }
    });

    const daily: DailyWeather[] = Array.from(dailyMap.values()).map(d => ({
        dt: d.dt,
        sunrise: current.sys.sunrise, // Approximation from current
        sunset: current.sys.sunset,   // Approximation from current
        moonrise: 0,
        moonset: 0,
        moon_phase: 0,
        temp: {
            day: (d.min + d.max) / 2,
            min: d.min,
            max: d.max,
            night: d.min,
            eve: d.max,
            morn: d.min
        },
        feels_like: {
            day: d.max,
            night: d.min,
            eve: d.max,
            morn: d.min
        },
        pressure: d.pressure,
        humidity: d.humidity,
        dew_point: 0,
        wind_speed: d.wind_speed,
        wind_deg: d.wind_deg,
        weather: d.weather,
        clouds: d.clouds,
        pop: d.pop,
        uvi: 0
    }));

    return {
        lat: current.coord.lat,
        lon: current.coord.lon,
        timezone: "UTC",
        timezone_offset: current.timezone,
        current: currentObj,
        hourly: hourly,
        daily: daily
    };
}

export const searchCity = async (query: string): Promise<CitySearchResult[]> => {
  try {
    const response = await fetch(`${GEO_URL}?q=${query}&limit=5&appid=${API_KEY}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to search city:", error);
    throw error;
  }
};

export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`);
        if(!response.ok) throw new Error("Reverse geocode failed");
        const data = await response.json();
        if(data && data.length > 0) {
            return `${data[0].name}, ${data[0].country}`;
        }
        return "Unknown Location";
    } catch (e) {
        return "Unknown Location";
    }
}