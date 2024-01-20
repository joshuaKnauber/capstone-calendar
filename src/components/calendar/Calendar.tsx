"use client";

import { Session } from "@supabase/supabase-js";
import { useEvents } from "./hooks/useEvents";
import { Day } from "./Day";

export function Calendar({ session }: { session: Session }) {
  const { eventsByDay, data: events } = useEvents(
    session.provider_token!,
    14,
    7,
  );

  return (
    <div>
      {Object.keys(eventsByDay).map((day) => (
        <Day key={day} date={new Date(day)} events={eventsByDay[day]} />
      ))}
    </div>
  );
}
