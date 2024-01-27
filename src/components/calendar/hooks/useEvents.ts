import { api } from "@/lib/utils/api";
import { useQuery } from "@tanstack/react-query";
import { calendar_v3 } from "googleapis";

export function useEvents(
  access_token: string,
  daysFuture: number,
  daysPast: number,
) {
  const query = useQuery({
    queryKey: ["events", daysFuture, daysPast],
    queryFn: async () => {
      const now = new Date();
      const fromDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - daysPast,
      );
      const toDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + daysFuture,
      );
      const res = await api(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=" +
          fromDate.toISOString() +
          "&timeMax=" +
          toDate.toISOString() +
          "&orderBy=startTime&singleEvents=true",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );
      let data = (await res.json()) as calendar_v3.Schema$Events;
      const events = data.items || [];
      return events;
    },
  });

  const eventsByDay: Record<string, calendar_v3.Schema$Event[]> = {};
  for (let i = 0; i < daysPast + daysFuture; i++) {
    const day = new Date();
    day.setDate(day.getDate() - daysPast + i);
    eventsByDay[day.toDateString()] = (query.data || []).filter((e) => {
      if (e.start?.date === day.toISOString().split("T")[0]) {
        return true;
      } else if (
        e.start?.dateTime?.split("T")[0] === day.toISOString().split("T")[0]
      ) {
        return true;
      }
      return false;
    });
  }

  return { ...query, eventsByDay };
}
