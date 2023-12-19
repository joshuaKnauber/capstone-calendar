"use client";

import { Time } from "./components/Time";
import { Contextual } from "./components/contextual/Contextual";

export default function Home() {
  const date = new Date();

  return (
    <main className="mx-auto flex min-h-screen flex-col items-center justify-center bg-neutral-200">
      <div className="-mb-4 h-[150px] w-[100px] bg-gradient-to-t from-neutral-900 to-transparent"></div>
      <div className="z-10 flex h-[250px] w-[250px] flex-row items-center justify-center gap-5 rounded-full bg-black shadow-lg">
        <Time />
        <div className="flex w-1/4 flex-col gap-3">
          <Contextual
            options={{
              breathing_exercises: {
                element: <span>Meditate</span>,
                description: "Shows a button to start a meditation session.",
              },
              commute: {
                element: <span>Commute</span>,
                description:
                  "Shows a list of options for starting a commute. This should be shown when the user has an appointment coming up, is not at the location yet and should leave soon to get their in time.",
              },
              toggle_lights: {
                element: <span className="text-xs">Lights</span>,
                description:
                  "Should be shown in situations where the user is likely to turn on or off the smart lights in their rooms at home.",
              },
              upcoming_appointment: {
                element: <span>Upcoming Appointment</span>,
                description:
                  "Displays calendar information on the next upcoming appointment.",
              },
              alarm_details: {
                element: <span>Alarm Details</span>,
                description: "Displays the time for an upcoming alarm.",
              },
            }}
            results={{
              primary_button: {
                description: "A primary button action shown to the user",
              },
              secondary_button: {
                description: "A secondary button action shown to the user",
              },
            }}
            goal="Display the most useful options possible to the user which they may want to use at a glance when looking on their smartwatch"
            context={{
              "General Context": [
                `${date.toLocaleTimeString()}, ${date.toDateString()}`,
                `Current Location: ${"Home"}; ${0}, ${0}`,
                `Weather: light rain, 13 degrees celsius`,
              ],
              "Health Context": [
                "Not physically active in the last 13 minutes",
                "2340 steps today",
                "Heart rate 74",
              ],
              "General Data": [
                "Work location: 'Tesla Straße 1, Grünheide (Mark)'",
                "Home location: 'Köpenick, Berlin'",
                "School location: 'Lohmühlenstraße, Berlin'",
                "Next calendar appointment: 'Design Sync' at location 'Work' on 19.12.2023 at 18:00 (leave at 17:13 latest)",
                "Next alarm tomorrow at 7:00",
              ],
              "User Preferences": ["Always working from home right now"],
            }}
          >
            {({ results, isLoaded, reload }) => (
              <div className="flex flex-col gap-2 text-white">
                <button onClick={reload}>reload</button>
                {isLoaded ? (
                  <>
                    <div title={results.primary_button?.reasoning}>
                      {results.primary_button?.element}
                    </div>
                    <div title={results.secondary_button?.reasoning}>
                      {results.secondary_button?.element}
                    </div>
                  </>
                ) : (
                  <span>not loaded</span>
                )}
              </div>
            )}
          </Contextual>
        </div>
      </div>
      <div className="-mt-4 h-[150px] w-[100px] bg-gradient-to-b from-neutral-900 to-transparent"></div>
    </main>
  );
}
