import { useEffect, useState } from "react";
import { getLocation } from "./getLocation";
import { WeatherInfo, getWeather } from "./getWeather";
import { useEvents } from "@/components/calendar/hooks/useEvents";
import { calendar_v3 } from "googleapis";
import { useQuery } from "@tanstack/react-query";

export function useLocation() {
  const { data } = useQuery({
    queryKey: ["location"],
    queryFn: async () => {
      const coordinates = await new Promise<GeolocationCoordinates>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve(position.coords),
            (error) => reject(error),
          );
        },
      );
      if (coordinates) {
        const adress = await getLocation(
          coordinates.latitude,
          coordinates.longitude,
        );
        return { coordinates, adress };
      }
      return { coordinates: null, adress: null };
    },
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  return {
    coordinates: data?.coordinates || null,
    adress: data?.adress || null,
  };
}

export function useWeather() {
  const { coordinates } = useLocation();

  const { data } = useQuery({
    queryKey: ["weather", coordinates?.latitude, coordinates?.longitude],
    queryFn: async () => {
      if (coordinates) {
        return await getWeather(coordinates.latitude, coordinates.longitude);
      }
      return null;
    },
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  return {
    weather: data || null,
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
