"use client";

import { calendar_v3 } from "googleapis";
import { Event } from "./Event";
import { dayAbbreviations } from "@/utils/constants";
import { getDrawEvents } from "@/utils/getDrawEvents";

type DayProps = {
  date: Date;
  events: calendar_v3.Schema$Event[];
};

export function Day({ date, events }: DayProps) {
  const day = dayAbbreviations[date.getDay()];
  const nextWeek = new Date(date);
  nextWeek.setDate(nextWeek.getDate() + 6);

  const now = new Date();
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const dayPercentage =
    ((now.getTime() - startOfDay.getTime()) / 24 / 60 / 60 / 1000) * 100;
  const isCurrentDay = date.toDateString() === new Date().toDateString();
  const isPast = date < new Date() && !isCurrentDay;

  const total = 24 * 60;
  const ySegmentSize = 10; // 10 minutes
  const amountYSegments = total / ySegmentSize;

  const amountXSegments = 12;

  const calendarItems = getDrawEvents({
    events,
    amountXSegments,
    amountYSegments,
    ySegmentSize,
  });

  return (
    <div className={`flex flex-col ${isPast ? "bg-black" : ""}`}>
      <span className="bg-emerald-300 px-4 py-6 font-medium text-black">
        {date.toDateString()}
      </span>
      <div
        className="relative grid flex-grow gap-1 pr-1"
        style={{
          gridTemplateRows: `repeat(${amountYSegments}, auto)`,
          gridTemplateColumns: `40px repeat(${amountXSegments}, 1fr)`,
        }}
      >
        {isCurrentDay && (
          <div
            className="absolute left-0 right-0 top-0 bg-black"
            style={{
              bottom: `${Math.round(100 - dayPercentage)}%`,
            }}
          ></div>
        )}
        {Array.from({ length: 24 }).map((_, i) => {
          const rowStart = (i * 60) / ySegmentSize + 1;
          const rowEnd = rowStart + 60 / ySegmentSize;
          const segmentAmount = 60 / ySegmentSize;
          return (
            <div
              key={i}
              className="z-10"
              style={{
                gridRow: `${rowStart} / ${rowEnd}`,
                height: segmentAmount * 10,
              }}
            >
              <span>{i}</span>
            </div>
          );
        })}
        {calendarItems.map(({ event, gridArea, ySegments }, i) => (
          <div
            key={event.id}
            className="z-10 flex items-start overflow-hidden rounded-lg bg-violet-500 p-2"
            style={{ gridArea: gridArea, height: ySegments * 10 }}
          >
            <span
              className={`overflow-hidden text-sm leading-none`}
              style={{
                WebkitLineClamp: ySegments / ySegmentSize,
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
              }}
            >
              {event.summary}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
