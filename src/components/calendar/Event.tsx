"use client";

import { MapPinIcon, SparklesIcon } from "@heroicons/react/20/solid";
import { format } from "date-fns";
import { calendar_v3 } from "googleapis";
import { useEffect, useRef, useState } from "react";
import { Focus } from "./Focus";
import { Dialog, DialogContent } from "../ui/dialog";
import { useFeedback } from "../contextual/hooks/useFeedback";

type EventProps = {
  event: calendar_v3.Schema$Event;
  load: boolean;
};

export function Event({ event, load }: EventProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [lastReasoning, setLastReasoning] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const { addFeedback } = useFeedback("reminders");

  const onSubmitFeedback = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!feedback) return;
    addFeedback(feedback, "reminders");
    setFeedback("");
  };

  const start = new Date(event.start?.dateTime || event.start?.date || 0);
  const end = new Date(event.end?.dateTime || event.end?.date || 0);
  const duration = end.getTime() - start.getTime();
  const isReminder = event.id?.includes("REMINDER");
  const isToday = new Date().toDateString() === start.toDateString();

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
        <DialogContent className="max-w-[95%]">
          <span className="text-sm leading-tight">{lastReasoning}</span>
          <form onSubmit={onSubmitFeedback} className="flex flex-col gap-2">
            <textarea
              onChange={(e) => setFeedback(e.target.value)}
              value={feedback}
              autoFocus
              className="h-24 resize-none bg-neutral-100 p-2 text-sm focus:outline-black"
              placeholder="Provide feedback or new behavior..."
            />
            <button
              className="h-8 bg-black text-sm text-white"
              disabled={!feedback}
            >
              Submit
            </button>
          </form>
        </DialogContent>
      </Dialog>
      <div className="flex flex-row gap-1">
        {!isReminder && (isToday || load) && (
          <div className="w-6 shrink-0">
            <Focus event={event} />
          </div>
        )}
        <div
          key={event.id}
          className={`event z-10 flex flex-grow flex-col overflow-hidden p-2 ring-1 ring-inset ring-black`}
          style={{ paddingBottom: duration / 1000 / 100 }}
        >
          <span
            title={event.summary || ""}
            className={`overflow-hidden text-sm font-medium leading-tight`}
          >
            {isReminder && (
              <button
                className="z-10"
                onClick={() => {
                  setLastReasoning(event.summary || "");
                  setOpen(true);
                }}
              >
                <SparklesIcon className="-mt-1 mr-2 inline-block w-3" />
              </button>
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
      </div>
    </>
  );
}
