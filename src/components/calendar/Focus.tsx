import { calendar_v3 } from "googleapis";
import { usePrediction } from "../contextual/hooks/usePrediction";
import { useMemo, useState } from "react";
import { eventToString } from "../contextual/hooks/useContextData";
import {
  BellIcon,
  BellMinusIcon,
  BellOffIcon,
  BellRingIcon,
} from "lucide-react";
import { SparklesIcon } from "@heroicons/react/20/solid";
import { Dialog, DialogContent } from "../ui/dialog";
import { useFeedback } from "../contextual/hooks/useFeedback";
import { sha256 } from "js-sha256";

const FOCUS_MODES = {
  ALL: "All notifications are allowed. Choose this if the event doesn't require your full attention.",
  MOST: "Some irrelevant notifications are muted. Choose this if the event requires some attention.",
  IMPORTANT:
    "Only important notifications are allowed. Choose this if the event requires your full attention.",
  NONE: "All notifications are muted. Choose this if the event requires your full attention and it's essential that you don't get distracted.",
} as const;

const FOCUS_COLORS = {
  ALL: "bg-emerald-500",
  MOST: "bg-blue-500",
  IMPORTANT: "bg-purple-500",
  NONE: "bg-red-500",
} as const;

const FOCUS_ICONS = {
  ALL: <BellRingIcon className="w-5 text-white" />,
  MOST: <BellIcon className="w-5 text-white" />,
  IMPORTANT: <BellMinusIcon className="w-5 text-white" />,
  NONE: <BellOffIcon className="w-5 text-white" />,
} as const;

function useFocusMode(event: calendar_v3.Schema$Event) {
  const { feedback } = useFeedback("focus");
  const feedbackHash = sha256(JSON.stringify(feedback));

  const { data } = usePrediction({
    id: `focus-mode:${event.id || ""}${feedbackHash}`,
    active: true,
    systemPrompt: `
You are selecting a focus mode for the user. You will receive context information regarding a calendar event. Select the focus mode that is most appropriate for the event.
`.trim(),
    userPrompt: `
Event: ${eventToString(event)}

Preferences:
${feedback.map((e) => `- "${e}"`).join("\n") || "-"}

Focus Modes:
${Object.entries(FOCUS_MODES)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

Answer in the following format and only in this format:
Provide a single line of reasoning directed at the user.
FOCUS_MODE: NAME
`.trim(),
  });

  const focusMode = useMemo(() => {
    const lines = (data || "").split("\n");
    if (lines.length === 2) {
      const reasoning = lines[0].trim();
      const mode = lines[1].split(":")[1].trim();
      if (!Object.keys(FOCUS_MODES).includes(mode)) return null;
      return {
        reasoning: reasoning,
        focusMode: mode as keyof typeof FOCUS_MODES,
      };
    }
    return null;
  }, [data]);

  return { focusMode };
}

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
