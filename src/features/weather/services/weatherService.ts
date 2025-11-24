// Service météo avec données réalistes pour Abidjan
export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  city: string;
  humidity: number;
  windSpeed: number;
}

class WeatherService {
  // Cache pour éviter trop d'appels
  private cache: { [key: string]: { data: WeatherData; timestamp: number } } = {};
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  /**
   * Obtenir la météo par coordonnées GPS (simulation réaliste)
   */
  async getWeatherByCoordinates(lat: number, lon: number): Promise<WeatherData> {
    const cacheKey = `${lat},${lon}`;
    
    // Vérifier le cache
    if (this.cache[cacheKey] && Date.now() - this.cache[cacheKey].timestamp < this.CACHE_DURATION) {
      return this.cache[cacheKey].data;
    }

    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 500));

    const weatherData = this.generateRealisticWeather('Abidjan');
    
    // Mettre en cache
    this.cache[cacheKey] = {
      data: weatherData,
      timestamp: Date.now()
    };

    return weatherData;
  }

  /**
   * Obtenir la météo par nom de ville (simulation réaliste)
   */
  async getWeatherByCity(city: string): Promise<WeatherData> {
    const cacheKey = city.toLowerCase();
    
    // Vérifier le cache
    if (this.cache[cacheKey] && Date.now() - this.cache[cacheKey].timestamp < this.CACHE_DURATION) {
      return this.cache[cacheKey].data;
    }

    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 500));

    const weatherData = this.generateRealisticWeather(city);
    
    // Mettre en cache
    this.cache[cacheKey] = {
      data: weatherData,
      timestamp: Date.now()
    };

    return weatherData;
  }

  /**
   * Générer des données météo réalistes pour Abidjan
   */
  private generateRealisticWeather(city: string): WeatherData {
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 18;
    
    // Conditions météo typiques d'Abidjan (climat tropical)
    const conditions = [
      { temp: 28, desc: 'Ensoleillé', icon: isDay ? 'sun' : 'moon', prob: 0.3 },
      { temp: 26, desc: 'Partiellement nuageux', icon: 'cloud', prob: 0.4 },
      { temp: 24, desc: 'Nuageux', icon: 'cloud', prob: 0.2 },
      { temp: 22, desc: 'Pluie légère', icon: 'cloudRain', prob: 0.1 },
    ];

    // Sélection aléatoire basée sur les probabilités
    const random = Math.random();
    let cumulative = 0;
    let selectedCondition = conditions[0];

    for (const condition of conditions) {
      cumulative += condition.prob;
      if (random <= cumulative) {
        selectedCondition = condition;
        break;
      }
    }

    // Variation de température selon l'heure
    let tempVariation = 0;
    if (hour >= 12 && hour <= 15) {
      tempVariation = 3; // Plus chaud l'après-midi
    } else if (hour >= 0 && hour <= 6) {
      tempVariation = -2; // Plus frais la nuit
    }

    return {
      temperature: selectedCondition.temp + tempVariation + Math.floor(Math.random() * 3),
      description: selectedCondition.desc,
      icon: selectedCondition.icon,
      city: city,
      humidity: 70 + Math.floor(Math.random() * 20), // 70-90%
      windSpeed: 8 + Math.floor(Math.random() * 10), // 8-18 km/h
    };
  }

  /**
   * Obtenir des données météo par défaut (fallback)
   */
  getDefaultWeather(city: string = 'Abidjan'): WeatherData {
    return {
      temperature: 28,
      description: 'Partiellement nuageux',
      icon: 'cloud',
      city,
      humidity: 75,
      windSpeed: 12,
    };
  }
}

export const weatherService = new WeatherService();
