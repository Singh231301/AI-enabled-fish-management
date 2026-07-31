import axios from 'axios';
import { WeatherData } from '../types/dashboard.types';

const WEATHER_CODE_MAP: Record<number, { description: string; emoji: string }> = {
  0: { description: "Clear sky", emoji: "☀️" },
  1: { description: "Mainly clear", emoji: "🌤️" },
  2: { description: "Partly cloudy", emoji: "⛅" },
  3: { description: "Overcast", emoji: "☁️" },
  45: { description: "Foggy", emoji: "🌫️" },
  48: { description: "Icy fog", emoji: "🌫️" },
  51: { description: "Light drizzle", emoji: "🌦️" },
  53: { description: "Moderate drizzle", emoji: "🌦️" },
  55: { description: "Dense drizzle", emoji: "🌧️" },
  61: { description: "Slight rain", emoji: "🌧️" },
  63: { description: "Moderate rain", emoji: "🌧️" },
  65: { description: "Heavy rain", emoji: "🌧️" },
  71: { description: "Slight snow", emoji: "❄️" },
  73: { description: "Moderate snow", emoji: "❄️" },
  80: { description: "Rain showers", emoji: "🌦️" },
  95: { description: "Thunderstorm", emoji: "⛈️" },
  99: { description: "Thunderstorm + hail", emoji: "⛈️" }
};

const DEFAULT_WEATHER = { description: "Unknown", emoji: "🌡️" };

interface CacheEntry {
  data: WeatherData;
  timestamp: number;
}

export class WeatherService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

  private getFeelsLike(temp: number): string {
    if (temp >= 38) return "Very Hot";
    if (temp >= 32) return "Hot";
    if (temp >= 26) return "Warm";
    if (temp >= 20) return "Comfortable";
    if (temp >= 15) return "Cool";
    return "Cold";
  }

  private getPondImpact(weatherCode: number, precipitation: number, temp: number): string {
    if (weatherCode >= 95) {
      return "Thunderstorm expected. Fish may stress. Avoid feeding during storm. Check dissolved oxygen after rain.";
    }
    if (precipitation > 20) {
      return "Heavy rain forecasted. Monitor water level and pond bunds carefully. Overflow risk. Check inlet/outlet.";
    }
    if (precipitation > 5) {
      return "Moderate rain expected. Water may turn cloudy. Delay feeding if water is disturbed.";
    }
    if (temp > 38) {
      return "Very high temperature. Dissolved oxygen levels will drop significantly. Feed in early morning only. Watch for fish gasping.";
    }
    if (temp > 32) {
      return "High temperature day. Feed fish in early morning (before 8 AM) and evening (after 5 PM). Monitor for surface gasping.";
    }
    if (temp < 15) {
      return "Cold weather. Fish metabolism slows down. Reduce feed quantity by 30%. Fish may not feed actively.";
    }
    return "Weather conditions are suitable for normal fish farming activities.";
  }

  async getCurrentWeather(lat: number = 25.1337, lng: number = 82.5644): Promise<WeatherData | null> {
    const cacheKey = `${lat},${lng}`;
    const cached = this.cache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL_MS)) {
      return cached.data;
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation,cloud_cover&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=Asia/Kolkata&forecast_days=3`;
      
      const response = await axios.get(url);
      const data = response.data;

      const currentCode = data.current.weather_code;
      const currentMapping = WEATHER_CODE_MAP[currentCode] || DEFAULT_WEATHER;
      const temp = data.current.temperature_2m;
      const precip = data.current.precipitation;

      const weatherData: WeatherData = {
        current: {
          temperature: temp,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          weatherCode: currentCode,
          weatherDescription: currentMapping.description,
          weatherEmoji: currentMapping.emoji,
          precipitation: precip,
          cloudCover: data.current.cloud_cover,
          feelsLike: this.getFeelsLike(temp)
        },
        forecast: data.daily.time.map((timeStr: string, index: number) => {
          const code = data.daily.weather_code[index];
          const mapping = WEATHER_CODE_MAP[code] || DEFAULT_WEATHER;
          
          // Format date like "Mon, 25 Jul"
          const dateObj = new Date(timeStr);
          const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

          return {
            date: formattedDate,
            maxTemp: data.daily.temperature_2m_max[index],
            minTemp: data.daily.temperature_2m_min[index],
            precipitationSum: data.daily.precipitation_sum[index],
            weatherCode: code,
            weatherDescription: mapping.description,
            weatherEmoji: mapping.emoji
          };
        }),
        pondImpact: this.getPondImpact(currentCode, precip, temp)
      };

      this.cache.set(cacheKey, { data: weatherData, timestamp: Date.now() });
      return weatherData;
    } catch (error) {
      console.error('Weather fetch failed:', error);
      return null;
    }
  }
}
