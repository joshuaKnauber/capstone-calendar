import { calendar_v3 } from "googleapis";
import { dateRangesOverlapping } from "./dates";

function getOverlappingEvents(
  event: calendar_v3.Schema$Event,
  events: calendar_v3.Schema$Event[],
  exceptEvent?: calendar_v3.Schema$Event,
) {
  const eventIdx = events.findIndex((e) => e.id === event.id);
  const dateStart = new Date(event.start?.date || event.start?.dateTime || "");
  const dateEnd = new Date(event.end?.date || event.end?.dateTime || "");

  let overlappingPosition = 0;
  let overlappingEvents: calendar_v3.Schema$Event[] = [];
  events.forEach((e, eIdx) => {
    const dateStart2 = new Date(e.start?.date || e.start?.dateTime || "");
    const dateEnd2 = new Date(e.end?.date || e.end?.dateTime || "");

    if (
      dateRangesOverlapping([dateStart, dateEnd], [dateStart2, dateEnd2]) &&
      exceptEvent?.id !== e.id &&
      event.id !== e.id
    ) {
      overlappingEvents.push(e);

      if (eIdx < eventIdx) {
        overlappingPosition++;
      }
    }
  });

  return { overlappingEvents, overlappingPosition };
}

export function getOverlaps(
  event: calendar_v3.Schema$Event,
  events: calendar_v3.Schema$Event[],
  exceptEvent?: calendar_v3.Schema$Event,
) {
  const { overlappingEvents, overlappingPosition } = getOverlappingEvents(
    event,
    events,
    exceptEvent,
  );

  let overlappingCount = 1;
  for (let overlapping of overlappingEvents) {
    // get ones that other one is overlapping with
    const { overlappingEvents: otherOverlapping } = getOverlappingEvents(
      overlapping,
      events,
      event,
    );
    // add one for all that this one is not overlapping with
    const differentOverlaps = otherOverlapping.filter(
      (e) => !overlappingEvents.includes(e),
    );
    overlappingCount += Math.max(1, differentOverlaps.length);
  }
  return {
    overlappingCount,
    overlappingPosition,
    overlappingEvents,
  };
}
