import { useQuery } from "@tanstack/react-query";
import { calendar_v3 } from "googleapis";

export function useEvents(access_token: string, days: number) {
  const query = useQuery({
    queryKey: ["events", days],
    queryFn: async () => {
      const now = new Date();
      const nextWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + days,
      );
      const nowString = now.toISOString();
      const nextWeekString = nextWeek.toISOString();
      const res = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=" +
          nowString +
          "&timeMax=" +
          nextWeekString +
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
  for (let i = 0; i < days; i++) {
    const day = new Date();
    day.setDate(day.getDate() + i);
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

  return { query, eventsByDay };
}
