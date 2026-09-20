const { ExternalServiceError } =require( '../errors/errors')

class WeatherService {
  async getForecast(location) {
    const url = new URL(process.env.WEATHER_API_URL);
    url.searchParams.set('lat', location.lat);
    url.searchParams.set('lon', location.lon);

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      Number(process.env.REQUEST_TIMEOUT_MS) || 5000
    );

    let data;
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`Weather API ${response.status}`);
      data = await response.json();
    } catch {
      throw new ExternalServiceError('Погодный сервис недоступен');
    } finally {
      clearTimeout(timeout);
    }

    const maxWind = Number(process.env.WEATHER_MAX_WIND_SPEED) || 10;
    const maxPrecip = Number(process.env.WEATHER_MAX_PRECIPITATION) || 0;
    const wind = data.windSpeed ?? 0;
    const precipitation = data.precipitation ?? 0;

    return {
      forecast: data,
      suitable: wind < maxWind && precipitation <= maxPrecip,
    };
  }
}

module.exports = new WeatherService();