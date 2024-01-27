import { eventToString } from "@/components/contextual/hooks/useContextData";
import { useFeedback } from "@/components/contextual/hooks/useFeedback";
import { usePrediction } from "@/components/contextual/hooks/usePrediction";
import { calendar_v3 } from "googleapis";
import { sha256 } from "js-sha256";
import {
  BellIcon,
  BellMinusIcon,
  BellOffIcon,
  BellRingIcon,
} from "lucide-react";
import { useMemo } from "react";

export const FOCUS_MODES = {
  ALL: "All notifications are allowed. Choose this if the event doesn't require your full attention.",
  MOST: "Some irrelevant notifications are muted. Choose this if the event requires some attention.",
  IMPORTANT:
    "Only important notifications are allowed. Choose this if the event requires your full attention.",
  NONE: "All notifications are muted. Choose this if the event requires your full attention and it's essential that you don't get distracted.",
} as const;

export const FOCUS_COLORS = {
  ALL: "bg-emerald-500",
  MOST: "bg-blue-500",
  IMPORTANT: "bg-purple-500",
  NONE: "bg-red-500",
} as const;

export const FOCUS_ICONS = {
  ALL: <BellRingIcon className="w-5 text-white" />,
  MOST: <BellIcon className="w-5 text-white" />,
  IMPORTANT: <BellMinusIcon className="w-5 text-white" />,
  NONE: <BellOffIcon className="w-5 text-white" />,
} as const;

export function useFocusMode(event: calendar_v3.Schema$Event) {
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
