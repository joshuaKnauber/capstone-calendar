"use client";

import { calendar_v3 } from "googleapis";
import { Event } from "./Event";

type DayProps = {
  date: Date;
  events: calendar_v3.Schema$Event[];
};

export function Day({ date, events }: DayProps) {
  return (
    <div className="flex flex-col gap-4">
      <span className="font-bold">{date.toDateString()}</span>
      <div className="flex flex-col gap-2">
        {events.map((event) => (
          <Event key={event.id} event={event} />
        ))}
        {events.length === 0 && <span>no events</span>}
      </div>
    </div>
  );
}
