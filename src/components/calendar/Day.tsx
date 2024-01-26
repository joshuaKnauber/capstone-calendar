"use client";

import { calendar_v3 } from "googleapis";
import { Event } from "./Event";
import { dayAbbreviations } from "@/utils/constants";
import { getDrawEvents } from "@/utils/getDrawEvents";
import { ArrowPathIcon, SparklesIcon } from "@heroicons/react/20/solid";
import {
  eventToString,
  useLocation,
  useWeather,
} from "../contextual/hooks/useContextData";
import { usePrediction } from "../contextual/hooks/usePrediction";
import { useMemo, useState } from "react";
import { useFeedback } from "../contextual/hooks/useFeedback";
import { SparkleIcon } from "lucide-react";

type DayProps = {
  date: Date;
  events: calendar_v3.Schema$Event[];
};

function useReminders({
  date,
  events,
}: {
  date: Date;
  events: calendar_v3.Schema$Event[];
}) {
  const [initialLoad, setInitialLoad] = useState<boolean>(false);

  const { adress } = useLocation();
  const { weather } = useWeather();
  const { feedback } = useFeedback("reminders");

  const eventContext = events.map((e) => eventToString(e));
  const { data, refetch, isLoading, isRefetching } = usePrediction({
    id: date.toDateString(),
    active: initialLoad,
    systemPrompt: `
You are picking reminders for the user. You will receive context information including the upcoming calendar events. Do not remind the user of upcoming events, consider useful, non-obvious tips they will need over the day.
`.trim(),
    userPrompt: `
Current Information:
- Date: ${new Date().toLocaleDateString()}
- Time: ${new Date().toTimeString().slice(0, 5)}
- Location: ${adress || "-"}

Events Today:
${eventContext.map((e) => `- ${e}`).join("\n") || "-"}

Preferences:
${feedback.map((e) => `- "${e}"`).join("\n") || "-"}

Weather:
- ${weather?.weather || "-"}
- Sunrise at ${weather?.sunrise || "-"}
- Sunset at ${weather?.sunset || "-"}

Answer in the following format and only in this format. You can have multiple reminders on individual lines, you can also have no reminders.
HH:MM Title of the reminder
`.trim(),
  });

  const reminders = useMemo(() => {
    const lines = (data || "").split("\n");
    const reminders: Array<{ hour: number; minute: number; text: string }> = [];
    for (let line of lines) {
      if (!line.includes(":")) continue;
      try {
        const time = line.split(" ")[0];
        const hours = parseInt(time.split(":")[0]);
        const minutes = parseInt(time.split(":")[1]);
        if (isNaN(hours) || isNaN(minutes)) {
          continue;
        }
        reminders.push({ hour: hours, minute: minutes, text: line.slice(6) });
      } catch {}
    }
    return reminders;
  }, [data]);

  const reminderEvents = useMemo(() => {
    const events: calendar_v3.Schema$Event[] = reminders.map((r, i) => ({
      summary: r.text,
      id: `REMINDER:${r.hour}-${r.minute}${r.text}${i}`,
      start: {
        dateTime: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          r.hour,
          r.minute,
        ).toISOString(),
      },
      end: {
        dateTime: new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          r.hour,
          r.minute + 10,
        ).toISOString(),
      },
    }));
    return events;
  }, [reminders]);

  function reload() {
    if (initialLoad) {
      setInitialLoad(true);
    }
    refetch();
  }

  return {
    reminders,
    reminderEvents,
    reload,
    isLoading: isLoading || isRefetching,
  };
}

export function Day({ date, events }: DayProps) {
  const day = dayAbbreviations[date.getDay()];
  const nextWeek = new Date(date);
  nextWeek.setDate(nextWeek.getDate() + 6);

  const { reminderEvents, reload, isLoading } = useReminders({ date, events });

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

  let calendarItems = getDrawEvents({
    events: [...events, ...reminderEvents],
    amountXSegments,
    amountYSegments,
    ySegmentSize,
  });

  return (
    <div className={`flex flex-col`} id={isCurrentDay ? "today" : ""}>
      <div className="mb-2 mt-4 flex flex-col gap-0.5">
        <div className="flex h-16 flex-row items-center justify-between bg-black px-8">
          <span className="font-bold text-white">{date.toDateString()}</span>
          <button onClick={reload} className="rounded-full p-1 text-white">
            <ArrowPathIcon
              className={`w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
        <div className="flex h-2 flex-col justify-center bg-black px-8"></div>
        <div className="flex h-1.5 flex-col justify-center bg-black px-8"></div>
        <div className="flex h-1 flex-col justify-center bg-black px-8"></div>
      </div>
      <div
        className="relative grid flex-grow gap-1 pr-1"
        style={{
          gridTemplateRows: `repeat(${amountYSegments}, auto)`,
          gridTemplateColumns: `40px repeat(${amountXSegments}, 1fr)`,
        }}
      >
        {isCurrentDay && (
          <div
            className="absolute left-0 right-0 z-20 h-0.5 bg-black"
            style={{
              top: `${Math.round(dayPercentage)}%`,
            }}
          >
            <div className="absolute -top-[0.475rem] left-0 h-4 w-1 bg-black"></div>
          </div>
        )}
        {Array.from({ length: 24 }).map((_, i) => {
          const rowStart = (i * 60) / ySegmentSize + 1;
          const rowEnd = rowStart + 60 / ySegmentSize;
          const segmentAmount = 60 / ySegmentSize;
          const hasEvents = calendarItems.some(({ event }) => {
            const startDate = new Date(
              event.start?.dateTime || event.start?.date || 0,
            );
            const endDate = new Date(
              event.end?.dateTime || event.end?.date || 0,
            );
            return startDate.getHours() <= i && endDate.getHours() > i;
          });
          return (
            <div
              key={i}
              className={`z-10 flex items-center justify-center`}
              style={{
                gridRow: `${rowStart} / ${rowEnd}`,
                height: hasEvents ? segmentAmount * 10 : 10,
              }}
            >
              <span className="text-start font-mono text-sm font-semibold leading-none">
                {i.toString().padStart(2, "0")}
              </span>
            </div>
          );
        })}
        {calendarItems.map(({ event, gridArea, ySegments }, i) => (
          <div
            key={event.id}
            className={`event z-10 flex overflow-hidden p-2 ring-1 ring-inset ring-black ${
              ySegments === 1 ? "items-center" : "items-start"
            }`}
            style={{ gridArea: gridArea, minHeight: ySegments * 10 }}
          >
            <span
              title={event.summary || ""}
              className={`overflow-hidden text-sm leading-none`}
              style={{
                WebkitLineClamp: ySegments / ySegmentSize,
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
              }}
            >
              {event.id?.startsWith("REMINDER") && (
                <SparklesIcon className="mr-1 inline-block w-3" />
              )}
              {event.summary}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
