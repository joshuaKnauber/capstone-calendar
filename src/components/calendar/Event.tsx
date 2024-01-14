"use client";

import { useScroll, useTransform, motion } from "framer-motion";
import { calendar_v3 } from "googleapis";
import { useEffect, useRef, useState } from "react";

type EventProps = {
  event: calendar_v3.Schema$Event;
};

export function Event({ event }: EventProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [yPercentage, setYPercentage] = useState<number>(0);

  const updateYPercentage = () => {
    if (!ref.current) return;
    const { top } = ref.current.getBoundingClientRect();
    const percentage = (top / window.innerHeight) * 100;
    setYPercentage(percentage);
  };

  useEffect(() => {
    updateYPercentage();
    window.addEventListener("resize", updateYPercentage);
    window.addEventListener("scroll", updateYPercentage);

    return () => {
      window.removeEventListener("resize", updateYPercentage);
      window.removeEventListener("scroll", updateYPercentage);
    };
  }, []);

  const isScaled = yPercentage > 20 && yPercentage < 80;

  return (
    <div ref={ref} className="flex flex-col gap-1 bg-red-200">
      <span>{event.summary}</span>
      <div
        className={`grid transition-all ${
          isScaled ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <span>{event.start?.date || event.start?.dateTime}</span>
        </div>
      </div>
    </div>
  );
}
