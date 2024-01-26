import { Sun, SunDim } from "lucide-react";
import { useWeather } from "./hooks/useContextData";

export function WeatherAction() {
  const { weather } = useWeather();

  return (
    <>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{weather?.temperature}</span>
        <span className="text-xs">{weather?.weather}</span>
      </div>
    </>
  );
}

export function LightAction() {
  const { weather } = useWeather();

  return (
    <>
      <div className="flex h-full flex-row gap-2">
        <button className="flex flex-grow flex-row items-center justify-center gap-1 bg-black text-white">
          <Sun className="w-4 fill-white" />
          <span className="text-xs font-bold">ON</span>
        </button>
        <button className="flex flex-grow flex-row items-center justify-center gap-1 bg-black text-white">
          <SunDim className="w-4" />
          <span className="text-xs font-bold">OFF</span>
        </button>
      </div>
    </>
  );
}

export function CommuteAction() {
  return (
    <>
      <div className="flex flex-col">
        <span className="text-sm font-medium">Commute</span>
      </div>
    </>
  );
}
