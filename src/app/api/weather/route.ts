// Weather cache implementation
const weatherCache = new Map<string, { data: any; timestamp: number }>();
const WEATHER_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes (weather changes less frequently)
const MAX_WEATHER_CACHE_SIZE = 100; // Support multiple locations

// Helper function to clean expired cache entries
const cleanWeatherCache = () => {
  const now = Date.now();
  for (const [key, value] of weatherCache.entries()) {
    if (now - value.timestamp > WEATHER_CACHE_DURATION) {
      weatherCache.delete(key);
    }
  }

  // Enforce size limit
  if (weatherCache.size > MAX_WEATHER_CACHE_SIZE) {
    const entries = Array.from(weatherCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp); // Sort by oldest first
    const toDelete = entries.slice(0, entries.length - MAX_WEATHER_CACHE_SIZE);
    toDelete.forEach(([key]) => weatherCache.delete(key));
  }
};

export const POST = async (req: Request) => {
  try {
    const body: {
      lat: number;
      lng: number;
      measureUnit: 'Imperial' | 'Metric';
      language?: string;
    } = await req.json();

    if (!body.lat || !body.lng) {
      return Response.json(
        {
          message: 'Invalid request.',
        },
        { status: 400 },
      );
    }

    // Create cache key based on location, unit, and language
    const cacheKey = `${body.lat.toFixed(2)}_${body.lng.toFixed(2)}_${body.measureUnit}_${body.language || 'en'}`;

    // Check cache first
    const cached = weatherCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < WEATHER_CACHE_DURATION) {
      // Return cached data
      return Response.json(cached.data);
    }

    // Clean expired entries periodically
    if (Math.random() < 0.1) {
      // 10% chance to clean cache
      cleanWeatherCache();
    }

    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${body.lat}&longitude=${body.lng}&current=weather_code,temperature_2m,is_day,relative_humidity_2m,wind_speed_10m&timezone=auto${
        body.measureUnit === 'Metric' ? '' : '&temperature_unit=fahrenheit'
      }${body.measureUnit === 'Metric' ? '' : '&wind_speed_unit=mph'}`,
    );

    const data = await res.json();

    if (data.error) {
      console.error(`Error fetching weather data: ${data.reason}`);
      return Response.json(
        {
          message: 'An error has occurred.',
        },
        { status: 500 },
      );
    }

    const weather: {
      temperature: number;
      condition: string;
      humidity: number;
      windSpeed: number;
      icon: string;
      temperatureUnit: 'C' | 'F';
      windSpeedUnit: 'm/s' | 'mph';
    } = {
      temperature: data.current.temperature_2m,
      condition: '',
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      icon: '',
      temperatureUnit: body.measureUnit === 'Metric' ? 'C' : 'F',
      windSpeedUnit: body.measureUnit === 'Metric' ? 'm/s' : 'mph',
    };

    const code = data.current.weather_code;
    const isDay = data.current.is_day === 1;
    const dayOrNight = isDay ? 'day' : 'night';
    const isGerman = body.language === 'de';

    const weatherConditions = {
      en: {
        clear: 'Clear',
        mainlyClear: 'Mainly Clear',
        partlyCloudy: 'Partly Cloudy',
        cloudy: 'Cloudy',
        fog: 'Fog',
        lightDrizzle: 'Light Drizzle',
        moderateDrizzle: 'Moderate Drizzle',
        denseDrizzle: 'Dense Drizzle',
        lightFreezingDrizzle: 'Light Freezing Drizzle',
        denseFreezingDrizzle: 'Dense Freezing Drizzle',
        slightRain: 'Slight Rain',
        moderateRain: 'Moderate Rain',
        heavyRain: 'Heavy Rain',
        lightFreezingRain: 'Light Freezing Rain',
        heavyFreezingRain: 'Heavy Freezing Rain',
        slightSnowFall: 'Slight Snow Fall',
        moderateSnowFall: 'Moderate Snow Fall',
        heavySnowFall: 'Heavy Snow Fall',
        snow: 'Snow',
        slightRainShowers: 'Slight Rain Showers',
        moderateRainShowers: 'Moderate Rain Showers',
        heavyRainShowers: 'Heavy Rain Showers',
        slightSnowShowers: 'Slight Snow Showers',
        moderateSnowShowers: 'Moderate Snow Showers',
        heavySnowShowers: 'Heavy Snow Showers',
        thunderstorm: 'Thunderstorm',
        thunderstormSlightHail: 'Thunderstorm with Slight Hail',
        thunderstormHeavyHail: 'Thunderstorm with Heavy Hail',
      },
      de: {
        clear: 'Klar',
        mainlyClear: 'Überwiegend klar',
        partlyCloudy: 'Teilweise bewölkt',
        cloudy: 'Bewölkt',
        fog: 'Nebel',
        lightDrizzle: 'Leichter Sprühregen',
        moderateDrizzle: 'Mäßiger Sprühregen',
        denseDrizzle: 'Dichter Sprühregen',
        lightFreezingDrizzle: 'Leichter Eisregen',
        denseFreezingDrizzle: 'Dichter Eisregen',
        slightRain: 'Leichter Regen',
        moderateRain: 'Mäßiger Regen',
        heavyRain: 'Starker Regen',
        lightFreezingRain: 'Leichter Eisregen',
        heavyFreezingRain: 'Starker Eisregen',
        slightSnowFall: 'Leichter Schneefall',
        moderateSnowFall: 'Mäßiger Schneefall',
        heavySnowFall: 'Starker Schneefall',
        snow: 'Schnee',
        slightRainShowers: 'Leichte Regenschauer',
        moderateRainShowers: 'Mäßige Regenschauer',
        heavyRainShowers: 'Starke Regenschauer',
        slightSnowShowers: 'Leichte Schneeschauer',
        moderateSnowShowers: 'Mäßige Schneeschauer',
        heavySnowShowers: 'Starke Schneeschauer',
        thunderstorm: 'Gewitter',
        thunderstormSlightHail: 'Gewitter mit leichtem Hagel',
        thunderstormHeavyHail: 'Gewitter mit starkem Hagel',
      },
    };

    const conditions = isGerman ? weatherConditions.de : weatherConditions.en;

    switch (code) {
      case 0:
        weather.icon = `clear-${dayOrNight}`;
        weather.condition = conditions.clear;
        break;

      case 1:
        weather.icon = `cloudy-1-${dayOrNight}`;
        weather.condition = conditions.mainlyClear;
        break;
      case 2:
        weather.icon = `cloudy-1-${dayOrNight}`;
        weather.condition = conditions.partlyCloudy;
        break;
      case 3:
        weather.icon = `cloudy-1-${dayOrNight}`;
        weather.condition = conditions.cloudy;
        break;

      case 45:
      case 48:
        weather.icon = `fog-${dayOrNight}`;
        weather.condition = conditions.fog;
        break;

      case 51:
        weather.icon = `rainy-1-${dayOrNight}`;
        weather.condition = conditions.lightDrizzle;
        break;
      case 53:
        weather.icon = `rainy-1-${dayOrNight}`;
        weather.condition = conditions.moderateDrizzle;
        break;
      case 55:
        weather.icon = `rainy-1-${dayOrNight}`;
        weather.condition = conditions.denseDrizzle;
        break;

      case 56:
        weather.icon = `frost-${dayOrNight}`;
        weather.condition = conditions.lightFreezingDrizzle;
        break;
      case 57:
        weather.icon = `frost-${dayOrNight}`;
        weather.condition = conditions.denseFreezingDrizzle;
        break;

      case 61:
        weather.icon = `rainy-2-${dayOrNight}`;
        weather.condition = conditions.slightRain;
        break;
      case 63:
        weather.icon = `rainy-2-${dayOrNight}`;
        weather.condition = conditions.moderateRain;
        break;
      case 65:
        weather.icon = `rainy-2-${dayOrNight}`;
        weather.condition = conditions.heavyRain;
        break;

      case 66:
        weather.icon = 'rain-and-sleet-mix';
        weather.condition = conditions.lightFreezingRain;
        break;
      case 67:
        weather.icon = 'rain-and-sleet-mix';
        weather.condition = conditions.heavyFreezingRain;
        break;

      case 71:
        weather.icon = `snowy-2-${dayOrNight}`;
        weather.condition = conditions.slightSnowFall;
        break;
      case 73:
        weather.icon = `snowy-2-${dayOrNight}`;
        weather.condition = conditions.moderateSnowFall;
        break;
      case 75:
        weather.icon = `snowy-2-${dayOrNight}`;
        weather.condition = conditions.heavySnowFall;
        break;

      case 77:
        weather.icon = `snowy-1-${dayOrNight}`;
        weather.condition = conditions.snow;
        break;

      case 80:
        weather.icon = `rainy-3-${dayOrNight}`;
        weather.condition = conditions.slightRainShowers;
        break;
      case 81:
        weather.icon = `rainy-3-${dayOrNight}`;
        weather.condition = conditions.moderateRainShowers;
        break;
      case 82:
        weather.icon = `rainy-3-${dayOrNight}`;
        weather.condition = conditions.heavyRainShowers;
        break;

      case 85:
        weather.icon = `snowy-3-${dayOrNight}`;
        weather.condition = conditions.slightSnowShowers;
        break;
      case 86:
        weather.icon = `snowy-3-${dayOrNight}`;
        weather.condition = conditions.moderateSnowShowers;
        break;
      case 87:
        weather.icon = `snowy-3-${dayOrNight}`;
        weather.condition = conditions.heavySnowShowers;
        break;

      case 95:
        weather.icon = `scattered-thunderstorms-${dayOrNight}`;
        weather.condition = conditions.thunderstorm;
        break;

      case 96:
        weather.icon = 'severe-thunderstorm';
        weather.condition = conditions.thunderstormSlightHail;
        break;
      case 99:
        weather.icon = 'severe-thunderstorm';
        weather.condition = conditions.thunderstormHeavyHail;
        break;

      default:
        weather.icon = `clear-${dayOrNight}`;
        weather.condition = conditions.clear;
        break;
    }

    // Store in cache for future requests
    weatherCache.set(cacheKey, { data: weather, timestamp: now });

    return Response.json(weather);
  } catch (err) {
    console.error('An error occurred while getting home widgets', err);
    return Response.json(
      {
        message: 'An error has occurred.',
      },
      {
        status: 500,
      },
    );
  }
};
