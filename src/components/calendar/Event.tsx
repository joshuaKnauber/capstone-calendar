"use client";

import { MapPinIcon, SparklesIcon } from "@heroicons/react/20/solid";
import { format } from "date-fns";
import { calendar_v3 } from "googleapis";
import { useEffect, useRef, useState } from "react";
import { Focus } from "./Focus";

type EventProps = {
  event: calendar_v3.Schema$Event;
};

export function Event({ event }: EventProps) {
  const start = new Date(event.start?.dateTime || event.start?.date || 0);
  const end = new Date(event.end?.dateTime || event.end?.date || 0);
  const duration = end.getTime() - start.getTime();
  const isReminder = event.id?.startsWith("REMINDER");
  const isToday = new Date().toDateString() === start.toDateString();

  return (
    <div className="flex flex-row gap-1">
      {!isReminder && isToday && (
        <div className="w-6 shrink-0">
          <Focus event={event} />
        </div>
      )}
      <div
        key={event.id}
        className={`event z-10 flex flex-grow flex-col overflow-hidden p-2 ring-1 ring-inset ring-black`}
        style={{ paddingBottom: duration / 1000 / 100 }}
      >
        <span
          title={event.summary || ""}
          className={`overflow-hidden text-sm font-medium leading-tight`}
        >
          {isReminder && <SparklesIcon className="mr-1 inline-block w-3" />}
          {event.summary}
        </span>
        {!isReminder && (
          <>
            <span className="mt-1 text-sm leading-tight opacity-75">
              {format(start, "kk:mm")} - {format(end, "kk:mm")}
            </span>
            {event.location && (
              <span className="text-sm leading-tight opacity-75">
                <MapPinIcon className="-mt-1 mr-1 inline-block w-3" />
                {event.location}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
