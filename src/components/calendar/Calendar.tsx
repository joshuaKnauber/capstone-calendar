"use client";

import { Session } from "@supabase/supabase-js";
import { useEvents } from "./hooks/useEvents";
import { Day } from "./Day";
import { useEffect, useLayoutEffect, useState } from "react";

export function Calendar({ session }: { session: Session }) {
  const { eventsByDay } = useEvents(session.provider_token!, 14, 7);

  const [hasScrolled, setHasScrolled] = useState<boolean>(false);

  useLayoutEffect(() => {
    const el = document.getElementById("today");
    if (el && !hasScrolled) {
      el.scrollIntoView({
        behavior: "instant",
      });
    }
  }, [eventsByDay]);

  useEffect(() => {
    function onScroll() {
      setHasScrolled(true);
    }
    if (hasScrolled) return;
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasScrolled]);

  return (
    <div className="pb-28">
      {Object.keys(eventsByDay).map((day) => (
        <Day key={day} date={new Date(day)} events={eventsByDay[day]} />
      ))}
    </div>
  );
}
