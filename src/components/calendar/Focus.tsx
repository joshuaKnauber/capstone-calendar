import { calendar_v3 } from "googleapis";
import { useState } from "react";
import { SparklesIcon } from "@heroicons/react/20/solid";
import { Dialog, DialogContent } from "../ui/dialog";
import { useFeedback } from "../contextual/hooks/useFeedback";
import { FOCUS_COLORS, FOCUS_ICONS, useFocusMode } from "./hooks/useFocusMode";

export function Focus({ event }: { event: calendar_v3.Schema$Event }) {
  const { focusMode } = useFocusMode(event);
  const [open, setOpen] = useState<boolean>(false);
  const [lastReasoning, setLastReasoning] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const { addFeedback } = useFeedback("focus");

  const onSubmitFeedback = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!feedback) return;
    addFeedback(feedback, "focus");
    setFeedback("");
  };

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
      <div
        className={`relative flex h-full w-full flex-col items-center justify-between py-1 ring-1 ring-inset ring-black/50 ${
          focusMode ? FOCUS_COLORS[focusMode.focusMode] : "bg-neutral-100"
        }`}
      >
        <div className="focus absolute h-full w-full"></div>
        {focusMode ? FOCUS_ICONS[focusMode.focusMode] : null}
        <button
          onClick={() => {
            setLastReasoning(focusMode?.reasoning || "");
            setOpen(true);
          }}
          className="z-10"
        >
          <SparklesIcon className="pointer-events-none w-4 text-white" />
        </button>
      </div>
    </>
  );
}
