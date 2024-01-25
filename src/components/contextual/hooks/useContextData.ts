import { useEffect, useState } from "react";
import { getLocation } from "./getLocation";
import { WeatherInfo, getWeather } from "./getWeather";
import { useEvents } from "@/components/calendar/hooks/useEvents";
import { calendar_v3 } from "googleapis";

export function useLocation() {
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(
    null,
  );
  const [adress, setAdress] = useState<string | null>(null);

  const updateAdress = async (coords: GeolocationCoordinates) => {
    const newAdress = await getLocation(coords.latitude, coords.longitude);
    setAdress(newAdress);
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setCoordinates(position.coords);
      updateAdress(position.coords);
    });
  }, []);

  return {
    coordinates,
    adress,
  };
}

export function useWeather() {
  const { coordinates } = useLocation();
  const [weather, setWeather] = useState<WeatherInfo | null>(null);

  const updateWeather = async (coords: GeolocationCoordinates) => {
    const newWeather = await getWeather(coords.latitude, coords.longitude);
    setWeather(newWeather);
  };

  useEffect(() => {
    if (coordinates) {
      updateWeather(coordinates);
    }
  }, [coordinates]);

  return {
    weather,
  };
}

export const eventToString = (event: calendar_v3.Schema$Event) => {
  const start = new Date(event.start?.dateTime || event.start?.date || 0);
  const startString = `${start.toLocaleTimeString()}`;
  const end = new Date(event.end?.dateTime || event.end?.date || 0);
  const endString = `${end.toLocaleTimeString()}`;
  return `${
    event.summary
  }: ${start.toDateString()}, ${startString} - ${endString}, ${
    event.location || "Unkown Location"
  }`;
};

export function useNextEvents(access_token: string) {
  const { data: events } = useEvents(access_token, 2, 0);
  const [nextEvent, setNextEvent] = useState<string | null>(null);
  const [currentEvent, setCurrentEvent] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    for (let e of events || []) {
      const start = new Date(e.start?.dateTime || e.start?.date || 0);
      const end = new Date(e.end?.dateTime || e.end?.date || 0);
      if (start <= now && end >= now) {
        setCurrentEvent(eventToString(e));
      }
      if (start > now) {
        setNextEvent(eventToString(e));
        break;
      }
    }
  }, [events]);

  return {
    currentEvent,
    nextEvent,
  };
}
