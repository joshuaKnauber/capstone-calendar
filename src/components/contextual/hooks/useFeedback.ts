import { useEffect, useState } from "react";

export type FeedbackCategory = "actions" | "reminders" | "focus";

export function useFeedback(category: FeedbackCategory) {
  const [feedback, setFeedback] = useState<string[]>([]);

  function updateFeedback(cat: FeedbackCategory) {
    const feedback = localStorage.getItem(`feedback-${cat}`);
    if (feedback) {
      setFeedback(JSON.parse(feedback));
    }
  }

  function addFeedback(newFeedback: string, cat: FeedbackCategory) {
    const current = localStorage.getItem(`feedback-${cat}`) || "[]";
    const feedbackCurrent = JSON.parse(current);
    localStorage.setItem(
      `feedback-${cat}`,
      JSON.stringify([...feedbackCurrent, newFeedback]),
    );
    window.dispatchEvent(new Event("storage"));
  }

  function deleteFeedback(index: number, cat: FeedbackCategory) {
    const current = localStorage.getItem(`feedback-${cat}`) || "[]";
    const feedbackCurrent = JSON.parse(current);
    const newFeedback = [...feedbackCurrent];
    newFeedback.splice(index, 1);
    localStorage.setItem(`feedback-${cat}`, JSON.stringify(newFeedback));
    window.dispatchEvent(new Event("storage"));
  }

  useEffect(() => {
    const update = () => updateFeedback(category);
    update();
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("storage", update);
    };
  }, [category]);

  return {
    feedback,
    addFeedback,
    deleteFeedback,
  };
}
