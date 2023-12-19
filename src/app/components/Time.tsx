"use client";

import { useEffect, useState } from "react";

export function Time() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-0">
      <span className="font-mono text-7xl font-bold leading-none text-amber-300">
        {time.getHours().toString().padStart(2, "0")}
      </span>
      <span className="-mt-2 font-mono text-7xl font-bold leading-none text-amber-300">
        {time.getMinutes().toString().padStart(2, "0")}
      </span>
    </div>
  );
}
