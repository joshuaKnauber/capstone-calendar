"use server";

export type WeatherInfo = {
  weather: string;
  temperature: string;
  sunrise: string;
  sunset: string;
};

export async function getWeather(latitude: number, longitude: number) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${process.env.OPENWEATHER_KEY}`,
    );
    const data = await res.json();
    const weather = `${data.weather[0].main}, ${data.weather[0].description}`;
    const temperature = `${data.main.temp.toFixed(
      0,
    )}°C, Feels like ${data.main.feels_like.toFixed(0)}°C`;
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);
    const weatherInfo: WeatherInfo = {
      weather,
      temperature,
      sunrise: `${sunrise.getHours().toString().padStart(2, "0")}:${sunrise
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
      sunset: `${sunset.getHours().toString().padStart(2, "0")}:${sunset
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
    };
    return weatherInfo;
  } catch (error) {
    console.error(error);
    const weatherInfo: WeatherInfo = {
      weather: "",
      temperature: "",
      sunrise: "",
      sunset: "",
    };
    return weatherInfo;
  }
}
