"use client";

import { calendar_v3 } from "googleapis";
import { Event } from "./Event";
import { useSteps } from "./hooks/useSteps";
import { heatmapColor } from "@/utils/heatmap";
import { dayAbbreviations, months } from "@/utils/constants";
import { useSleep } from "./hooks/useSleep";

type DayProps = {
  date: Date;
  events: calendar_v3.Schema$Event[];
};

export function Day({ date, events }: DayProps) {
  const day = dayAbbreviations[date.getDay()];
  const nextWeek = new Date(date);
  nextWeek.setDate(nextWeek.getDate() + 6);

  const isCurrentDay = date.toDateString() === new Date().toDateString();
  const isPast = date < new Date() && !isCurrentDay;

  return (
    <div className={`flex flex-col gap-2 ${isPast ? "bg-neutral-950" : ""}`}>
      {date.getDay() === 1 && (
        <span className="mx-4 text-xs font-semibold opacity-25">
          {date.getDate().toString().padStart(2, "0")}
          {nextWeek.getMonth() !== date.getMonth()
            ? ` ${months[date.getMonth()]}`
            : ""}{" "}
          - {nextWeek.getDate().toString().padStart(2, "0")}{" "}
          {months[nextWeek.getMonth()]}
        </span>
      )}
      <div className="ml-2 flex flex-1 flex-row py-4">
        <div
          className={`sticky top-2 flex aspect-square h-10 w-10 flex-col items-center justify-center gap-0.5 rounded-full ${
            isCurrentDay ? "bg-neutral-300 text-black" : ""
          }`}
        >
          <span
            className={`text-xs leading-none ${
              isCurrentDay ? "opacity-100" : "opacity-40"
            }`}
          >
            {day}
          </span>
          <span className="text-xs font-semibold leading-none">
            {`${date.getDate().toString().padStart(2, "0")}`}
          </span>
        </div>
        {/* <span className="rounded-md bg-neutral-800 bg-opacity-50 p-2 text-xs">
            something
          </span> */}
        {events.length > 0 && (
          <div className="mx-2 flex w-full flex-col gap-2 overflow-hidden">
            {events.map((event) => (
              <Event key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
