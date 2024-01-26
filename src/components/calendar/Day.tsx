"use client";

import { calendar_v3 } from "googleapis";
import { Event } from "./Event";
import { dayAbbreviations } from "@/utils/constants";
import { getDrawEvents } from "@/utils/getDrawEvents";
import {
  ArrowPathIcon,
  MapPinIcon,
  SparklesIcon,
} from "@heroicons/react/20/solid";
import {
  eventToString,
  useLocation,
  useWeather,
} from "../contextual/hooks/useContextData";
import { usePrediction } from "../contextual/hooks/usePrediction";
import { useMemo, useState } from "react";
import { useFeedback } from "../contextual/hooks/useFeedback";
import { MapPin, SparkleIcon } from "lucide-react";
import { format } from "date-fns";

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
      <div className="relative flex flex-grow flex-col gap-1 px-2">
        {sortedEvents.map((event, i) => {
          const start = new Date(
            event.start?.dateTime || event.start?.date || 0,
          );
          const end = new Date(event.end?.dateTime || event.end?.date || 0);
          const duration = end.getTime() - start.getTime();
          const isReminder = event.id?.startsWith("REMINDER");
          return (
            <div
              key={event.id}
              className={`event z-10 flex flex-col overflow-hidden p-2 ring-1 ring-inset ring-black`}
              style={{ paddingBottom: duration / 1000 / 100 }}
            >
              <span
                title={event.summary || ""}
                className={`overflow-hidden text-sm font-medium leading-tight`}
              >
                {isReminder && (
                  <SparklesIcon className="mr-1 inline-block w-3" />
                )}
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
          );
        })}
      </div>
    </div>
  );
}
