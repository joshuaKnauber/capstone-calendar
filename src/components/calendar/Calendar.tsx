"use client";

import { Session } from "@supabase/supabase-js";
import { useEvents } from "./hooks/useEvents";
import { Day } from "./Day";

export function Calendar({ session }: { session: Session }) {
  const { eventsByDay } = useEvents(session.provider_token!, 50);

  return (
    <div className="flex flex-col gap-8 px-4">
      {Object.keys(eventsByDay).map((day) => (
        <Day key={day} date={new Date(day)} events={eventsByDay[day]} />
      ))}
    </div>
  );
}
