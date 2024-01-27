"use client";

import { calendar_v3 } from "googleapis";
import { Event } from "./Event";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { useReminders } from "./hooks/useReminders";

type DayProps = {
  date: Date;
  events: calendar_v3.Schema$Event[];
};

export function Day({ date, events }: DayProps) {
  const nextWeek = new Date(date);
  nextWeek.setDate(nextWeek.getDate() + 6);

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const isCurrentDay = date.toDateString() === new Date().toDateString();

  const [load, setLoad] = useState<boolean>(isCurrentDay);
  const { reminderEvents, isLoading } = useReminders({ date, events, load });

  const sortedEvents = [...events, ...reminderEvents].sort((a, b) => {
    // sort be start time, then by end time
    const aStart = new Date(a.start?.dateTime || a.start?.date || 0);
    const bStart = new Date(b.start?.dateTime || b.start?.date || 0);
    const aEnd = new Date(a.end?.dateTime || a.end?.date || 0);
    const bEnd = new Date(b.end?.dateTime || b.end?.date || 0);
    if (aStart.getTime() < bStart.getTime()) return -1;
    if (aStart.getTime() > bStart.getTime()) return 1;
    if (aEnd.getTime() < bEnd.getTime()) return -1;
    if (aEnd.getTime() > bEnd.getTime()) return 1;
    return 0;
  });

  return (
    <div className={`flex flex-col`} id={isCurrentDay ? "today" : ""}>
      <div className="mb-2 mt-2 flex flex-col gap-0.5">
        <div className="flex h-14 flex-row items-center justify-between bg-black px-4">
          <span className="font-semibold text-white">
            {date.toDateString()}
          </span>
          <button
            onClick={() => setLoad(true)}
            className="rounded-full p-1 text-white"
          >
            <ArrowPathIcon
              className={`w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
        <div className="flex h-1 flex-col justify-center bg-black px-8"></div>
      </div>
      <div className="flex flex-grow flex-col gap-1 px-2">
        {sortedEvents.map((event, i) => {
          return <Event event={event} load={load} key={i} />;
        })}
      </div>
    </div>
  );
}
