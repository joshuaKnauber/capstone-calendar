"use client";

import { useState } from "react";
import { Predictive } from "../contextual/Predictive";
import {
  useLocation,
  useNextEvents,
  useWeather,
} from "../contextual/hooks/useContextData";
import { ArrowPathIcon, SparklesIcon } from "@heroicons/react/20/solid";
import { Dialog, DialogContent } from "./dialog";
import { useFeedback } from "../contextual/hooks/useFeedback";
import {
  CommuteAction,
  LightAction,
  WeatherAction,
} from "../contextual/actions";

export function CalendarDrawer({ access_token }: { access_token: string }) {
  const [open, setOpen] = useState<boolean>(false);
  const [lastReasoning, setLastReasoning] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  const { adress } = useLocation();
  const { weather } = useWeather();
  const { currentEvent, nextEvent } = useNextEvents(access_token);
  const { feedback: feedbackList, addFeedback } = useFeedback("actions");

  function onSubmitFeedback(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!feedback) return;
    addFeedback(feedback, "actions");
    setFeedback("");
  }

  const storageKey = `actions:${new Date().toDateString()}:${new Date().getHours()}:${Math.round(
    new Date().getMinutes() / 10,
  )}`;
  const contextReady = ![adress, weather, currentEvent, nextEvent].includes(
    null,
  );

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
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-min flex-col border-t border-black bg-white text-black outline-none">
        <div className="flex flex-col gap-6 p-4">
          <div className="flex flex-row items-center justify-between">
            <Predictive
              model="gpt-4"
              storageKey={storageKey}
              contextReady={contextReady}
              context={{
                Context: [
                  `Current Datetime: ${new Date().toDateString()}, ${new Date().toLocaleTimeString()}`,
                  `Current Location: ${adress || "-"}`,
                  `Weather: ${weather?.weather || "-"}`,
                  `Temperature: ${weather?.temperature || "-"}`,
                  `Sunrise: ${weather?.sunrise || "-"}`,
                  `Sunset: ${weather?.sunset || "-"}`,
                ],
                "Calender Context": [
                  `Current event: ${currentEvent || "-"}`,
                  `Next event: ${nextEvent || "-"}`,
                ],
                Notes: ["Do not set reminders for current or upcoming events"],
                Preferences: feedbackList,
              }}
              options={{
                REMINDER: {
                  description:
                    "Shows a text box with the given text. This can only show a few words. Only show this if there is something the user needs to be reminded about",
                  element: <span>Reminder</span>,
                },
                COMMUTE: {
                  description:
                    "Shows a commute button that starts a navigation to the given location. Only show this if you know there's a commute coming up",
                  element: <CommuteAction />,
                },
                LIGHTS: {
                  description:
                    "Shows a button to set the lights to the given state. State can be on, off or toggle. Only show this if there is a good reason to change the lighting",
                  element: <LightAction />,
                },
                DO_NOT_DISTURB: {
                  description:
                    "Activates a do-not-disturb mode. Only show this if the event is something where the user needs to focus",
                  element: <span>Do Not Disturb</span>,
                },
                WEATHER: {
                  description:
                    "Displays current weather conditions and temperature for the user's location. Only show this if it's relevant for the user to know the weather",
                  element: <WeatherAction />,
                },
                NEARBY_RESTAURANTS: {
                  description:
                    "Shows a list of nearby restaurants. Only show this if the user is likely to be hungry and they are not at home",
                  element: <span>Nearby Restaurants</span>,
                },
                NEARBY_PLACES: {
                  description:
                    "Shows a list of interesting places nearby. Only show this if the user is in a new place and is likely to be interested in exploring it",
                  element: <span>Nearby Places</span>,
                },
                NEWS: {
                  description:
                    "Shows a button to get the latest news. Only show this if the user is in a situation where they are likely to be interested in the news",
                  element: <span>News</span>,
                },
                MUSIC: {
                  description:
                    "Start playing music. Only show this if the user is in a situation where they are likely to want to listen to music",
                  element: <span>Music</span>,
                },
              }}
              results={{
                "BUTTON 1": { description: "First action button in a row" },
                "BUTTON 2": { description: "Second action button in a row" },
                "BUTTON 3": { description: "Third action button in a row" },
              }}
            >
              {({ isLoaded, results, reload, loading }) => (
                <>
                  <button
                    onClick={() => {
                      if (!loading) reload();
                    }}
                    className={`absolute -top-10 right-2 flex items-center justify-center rounded-full bg-white p-1.5 ring-1 ring-inset ring-black`}
                  >
                    <ArrowPathIcon
                      className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                  </button>
                  <div className="flex flex-1 flex-row gap-4">
                    {Object.entries(results).map(([element, res], i) => (
                      <div
                        key={i}
                        className="relative aspect-square h-[60px] flex-grow bg-neutral-100 p-2 text-sm"
                      >
                        {res?.element}
                        <button
                          onClick={() => {
                            setLastReasoning(res?.reasoning || "");
                            setOpen(true);
                          }}
                          className="absolute -right-2 -top-2"
                        >
                          <SparklesIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Predictive>
          </div>
        </div>
      </div>
    </>
  );
}
