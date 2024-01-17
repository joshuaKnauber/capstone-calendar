"use client";

import { Session } from "@supabase/supabase-js";
import { useEvents } from "./hooks/useEvents";
import { Day } from "./Day";

export function Calendar({ session }: { session: Session }) {
  const { eventsByDay, data: events } = useEvents(
    session.provider_token!,
    30,
    30,
  );

  return (
    <div>
      {Object.keys(eventsByDay).map((day) => (
        <Day key={day} date={new Date(day)} events={eventsByDay[day]} />
      ))}
    </div>
  );

  // const maxOverlap = (events || []).reduce((acc, event) => {
  //   const start = new Date(event.start?.dateTime || event.start?.date || "");
  //   const end = new Date(event.end?.dateTime || event.end?.date || "");
  //   const overlap = (events || []).filter((e) => {
  //     const compareStart = new Date(e.start?.dateTime || e.start?.date || "");
  //     const compareEnd = new Date(e.end?.dateTime || e.end?.date || "");
  //     return (
  //       (compareStart >= start && compareStart <= end) ||
  //       (compareEnd >= start && compareEnd <= end)
  //     );
  //   }).length;
  //   return Math.max(acc, overlap);
  // }, 1);

  // return (
  //   <div
  //     className="grid gap-1"
  //     style={{ gridTemplateColumns: `repeat(3, 1fr)` }}
  //   >
  //     {(events || []).map((e) => (
  //       <div
  //         style={{ gridColumnStart: `1 / 3` }}
  //         key={e.id}
  //         className="bg-red-300 p-2"
  //       >
  //         <span>{e.summary}</span>
  //       </div>
  //     ))}
  //   </div>
  // );
}
