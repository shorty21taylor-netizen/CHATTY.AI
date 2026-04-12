import type { SignalAdapter, AdapterConfig, NormalizedEvent } from "../adapter";

/**
 * Weather Adapter
 * Fetches local weather data that impacts contractor operations.
 * Roofing, exterior, solar work depends heavily on weather.
 */
export class WeatherAdapter implements SignalAdapter {
  readonly sourceType = "weather";

  async fetchNewEvents(config: AdapterConfig): Promise<NormalizedEvent[]> {
    const { zip_code, lat, lon } = config.config;

    // Use Open-Meteo (free, no API key needed)
    const latitude = lat || 39.7392; // Denver default
    const longitude = lon || -104.9903;

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&timezone=America/Denver&forecast_days=3`
      );

      if (!response.ok) {
        throw new Error(`Weather API failed: ${response.status}`);
      }

      const data = await response.json();
      const daily = data.daily;

      const events: NormalizedEvent[] = [];

      for (let i = 0; i < daily.time.length; i++) {
        const weatherCode = daily.weathercode[i];
        const isWorkable = weatherCode < 61 && daily.windspeed_10m_max[i] < 30;

        events.push({
          event_type: "weather_forecast",
          entity_type: "weather",
          entity_id: `weather_${daily.time[i]}`,
          data: {
            date: daily.time[i],
            temp_high: daily.temperature_2m_max[i],
            temp_low: daily.temperature_2m_min[i],
            precipitation_mm: daily.precipitation_sum[i],
            wind_max_mph: daily.windspeed_10m_max[i],
            weather_code: weatherCode,
            is_workable_day: isWorkable,
            impact: isWorkable ? "none" : "operations_impacted",
            location: { latitude, longitude, zip_code },
          },
          source_id: `weather_${daily.time[i]}`,
          timestamp: new Date().toISOString(),
        });
      }

      return events;
    } catch (error) {
      console.error("[Weather Adapter] Error fetching weather:", error);
      return [];
    }
  }

  async testConnection(credentials: Record<string, any>): Promise<{ ok: boolean; error?: string }> {
    try {
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=39.74&longitude=-104.99&daily=temperature_2m_max&timezone=auto&forecast_days=1"
      );
      return { ok: response.ok };
    } catch (error: any) {
      return { ok: false, error: error.message };
    }
  }
}
