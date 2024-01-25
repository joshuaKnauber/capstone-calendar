"use client";

import {
  FeedbackCategory,
  useFeedback,
} from "@/components/contextual/hooks/useFeedback";
import { ChevronLeft, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Preferences() {
  const [feedback, setFeedback] = useState<string>("");
  const [feedbackCategory, setFeedbackCategory] =
    useState<FeedbackCategory>("actions");
  const {
    feedback: feedbackActions,
    addFeedback,
    deleteFeedback,
  } = useFeedback("actions");
  const { feedback: feedbackReminders } = useFeedback("reminders");

  function onSubmitFeedback(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!feedback) return;
    addFeedback(feedback.trim(), feedbackCategory);
    setFeedback("");
  }

  const categories: Record<FeedbackCategory, string[]> = {
    actions: feedbackActions,
    reminders: feedbackReminders,
  } as const;

  const names: Record<FeedbackCategory, string> = {
    actions: "Quick Action Feedback",
    reminders: "Reminder Feedback",
  } as const;

  return (
    <main className="flex flex-col gap-4">
      <div className="flex h-14 flex-row items-center gap-2 px-4">
        <Link href={"/"}>
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <span className="font-medium">Preferences</span>
      </div>
      <div className="flex flex-col gap-8 px-4">
        {Object.entries(categories).map(([category, feedbackList]) => (
          <div key={category} className="flex flex-col gap-2">
            <span className="font-medium">
              {names[category as FeedbackCategory]}:
            </span>
            <ul className="flex list-disc flex-col gap-2">
              {feedbackList.map((f, i) => (
                <li className="ml-4 text-sm leading-tight" key={i}>
                  {f}
                  <button
                    className="ml-2 inline-block rounded-full bg-neutral-200 p-0.5"
                    onClick={() =>
                      deleteFeedback(i, category as FeedbackCategory)
                    }
                  >
                    <X className="h-3 w-3" />
                  </button>
                </li>
              ))}
              {feedbackList.length === 0 && (
                <span className="text-sm italic opacity-75">No feedback</span>
              )}
            </ul>
          </div>
        ))}
        <form onSubmit={onSubmitFeedback} className="flex flex-col gap-2">
          <select
            className="border-2 border-black px-2 py-1 text-sm"
            onChange={(e) =>
              setFeedbackCategory(e.target.value as FeedbackCategory)
            }
            value={feedbackCategory}
          >
            <option value="actions">Quick Action Feedback</option>
            <option value="reminders">Reminder Feedback</option>
          </select>
          <textarea
            onChange={(e) => setFeedback(e.target.value)}
            value={feedback}
            autoFocus
            className="h-24 resize-none border-2 border-black bg-neutral-100 p-2 text-sm focus:outline-black"
            placeholder="Provide feedback or new behavior..."
          />
          <button
            className="h-8 bg-black text-sm text-white"
            disabled={!feedback}
          >
            Submit
          </button>
        </form>
      </div>
    </main>
  );
}
