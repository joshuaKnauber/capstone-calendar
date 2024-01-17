"use client";

import { calendar_v3 } from "googleapis";
import { useEffect, useRef, useState } from "react";

type EventProps = {
  event: calendar_v3.Schema$Event;
};

export function Event({ event }: EventProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [yPercentage, setYPercentage] = useState<number>(0);

  const updateYPercentage = () => {
    if (!ref.current) return;
    const { top } = ref.current.getBoundingClientRect();
    const percentage = (top / window.innerHeight) * 100;
    setYPercentage(percentage);
  };

  useEffect(() => {
    updateYPercentage();
    window.addEventListener("resize", updateYPercentage);
    window.addEventListener("scroll", updateYPercentage);

    return () => {
      window.removeEventListener("resize", updateYPercentage);
      window.removeEventListener("scroll", updateYPercentage);
    };
  }, []);

  // const isScaled = yPercentage > 20 && yPercentage < 80;
  const isScaled = true;
  const dateStart = new Date(event.start?.date || event.start?.dateTime || "");
  const dateEnd = new Date(event.end?.date || event.end?.dateTime || "");
  const duration = dateEnd.getTime() - dateStart.getTime();
  const height = Math.max(30, duration / 1000 / 60 / 2);

  const timeString = `${dateStart
    .getHours()
    .toString()
    .padStart(2, "0")}:${dateStart
    .getMinutes()
    .toString()
    .padStart(2, "0")} - ${dateEnd
    .getHours()
    .toString()
    .padStart(2, "0")}:${dateEnd.getMinutes().toString().padStart(2, "0")}`;

  return (
    <div
      ref={ref}
      style={{ height: `${height}px` }}
      className="flex w-full flex-col gap-1.5 overflow-hidden rounded-xl bg-amber-900 p-2.5"
    >
      {height < 60 ? (
        <div className="flex min-w-0 flex-row items-center justify-between">
          <span className="mr-2 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium leading-none">
            {event.summary}
          </span>
          <span className="whitespace-nowrap text-xs font-light leading-none opacity-50">
            {timeString}
          </span>
        </div>
      ) : (
        <>
          <span className="text-xs font-medium leading-none">
            {event.summary}
          </span>
          <span className="text-xs font-light leading-none opacity-50">
            {timeString}
          </span>
        </>
      )}
      {/* <div
        className={`grid transition-all ${
          isScaled ? "grid-rows-[1fr] pt-1" : "grid-rows-[0fr] pt-0"
        }`}
      >
        <div className="overflow-hidden">
        </div>
      </div> */}
    </div>
  );
}
