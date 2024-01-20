"use client";

import { useEffect, useState } from "react";
import { Drawer } from "vaul";

export function CalendarDrawer() {
  const [feedback, setFeedback] = useState<string>("");

  const [snap, setSnap] = useState<number | string | null>("110px");

  useEffect(() => {
    if (snap === "0px") {
      setSnap("110px");
    }
  }, [snap]);

  function onSubmitFeedback(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback("");
  }

  return (
    <Drawer.Root
      snapPoints={["110px", "300px"]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      modal={false}
      open={true}
      dismissible={false}
    >
      <Drawer.Portal>
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex h-full flex-col rounded-t-xl bg-white text-black outline-none">
          <div className="flex h-[300px] flex-col gap-6 p-4">
            <div className="mx-auto h-1 w-6 rounded-full bg-neutral-300"></div>
            <div className="flex flex-row items-center justify-between">
              <div className="aspect-square h-[50px] rounded-md bg-neutral-300"></div>
              <div className="aspect-square h-[50px] rounded-md bg-neutral-300"></div>
              <div className="aspect-square h-[50px] rounded-md bg-neutral-300"></div>
              <div className="aspect-square h-[50px] rounded-md bg-neutral-300"></div>
            </div>
            <form
              className="flex flex-grow flex-col gap-2"
              onSubmit={onSubmitFeedback}
            >
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                id="feedback"
                placeholder="Give feedback or ask for new behavior..."
                className="flex-grow resize-none rounded-md bg-neutral-300 p-3 text-sm focus:outline-none"
              />
              <button
                className="h-8 rounded-md bg-black text-sm font-medium text-white disabled:opacity-50"
                disabled={!feedback}
              >
                Submit
              </button>
            </form>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
