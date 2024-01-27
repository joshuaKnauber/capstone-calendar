import { calendar_v3 } from "googleapis";
import {
  eventToString,
  useLocation,
  useWeather,
} from "@/components/contextual/hooks/useContextData";
import { useFeedback } from "@/components/contextual/hooks/useFeedback";
import { usePrediction } from "@/components/contextual/hooks/usePrediction";
import { useMemo } from "react";

export function useReminders({
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

  const key = `reminder:${date.toDateString()}:${new Date().getHours()}:${Math.round(
    new Date().getMinutes() / 10,
  )}`;

  const contextReady = ![adress, weather].includes(null);

  const { data, isLoading, isRefetching } = usePrediction({
    id: date.toDateString(),
    active: load && contextReady,
    storageKey: key,
    systemPrompt: `
You are picking reminders for the user. You will receive context information including the upcoming calendar events. Do not remind the user of upcoming events, consider useful, non-obvious tips they will need over the day.
Make sure to not tell the user obvious information. A useful example would be "Don't forget to bring an umbrella, it will rain today.", a bad example would be "You have a meeting at 2pm today." or "It will get dark soon".
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
