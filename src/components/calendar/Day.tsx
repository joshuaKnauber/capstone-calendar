"use client";

import { calendar_v3 } from "googleapis";
import { Event } from "./Event";
import { dayAbbreviations } from "@/utils/constants";
import { getDrawEvents } from "@/utils/getDrawEvents";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import {
  eventToString,
  useLocation,
  useWeather,
} from "../contextual/hooks/useContextData";
import { usePrediction } from "../contextual/hooks/usePrediction";
import { useMemo, useState } from "react";
import { useFeedback } from "../contextual/hooks/useFeedback";

type DayProps = {
  date: Date;
  events: calendar_v3.Schema$Event[];
};

function useReminders({
  date,
  events,
  load,
}: {
  date: Date;
  events: calendar_v3.Schema$Event[];
  load: boolean;
}) {
  const { adress } = useLocation();
  const { weather } = useWeather();
  const { feedback } = useFeedback("reminders");

  const eventContext = events.map((e) => eventToString(e));

  const key = `reminder:${new Date().toDateString()}:${new Date().getHours()}:${Math.round(
    new Date().getMinutes() / 10,
  )}`;

  const { data, isLoading, isRefetching } = usePrediction({
    id: date.toDateString(),
    active: load,
    storageKey: key,
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
      id: `${i}REMINDER:${r.text}`,
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

  return {
    reminders,
    reminderEvents,
    isLoading: isLoading || isRefetching,
  };
}

export function Day({ date, events }: DayProps) {
  const nextWeek = new Date(date);
  nextWeek.setDate(nextWeek.getDate() + 6);

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const isCurrentDay = date.toDateString() === new Date().toDateString();

  const [load, setLoad] = useState<boolean>(isCurrentDay);
  const { reminderEvents, isLoading } = useReminders({ date, events, load });

  function reload() {
    setLoad(true);
  }

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
          <button onClick={reload} className="rounded-full p-1 text-white">
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
