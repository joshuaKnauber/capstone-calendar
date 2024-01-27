import { calendar_v3 } from "googleapis";
import { getOverlaps } from "./getOverlappingEvents";

export function getDrawEvents({
  events,
  amountXSegments,
  amountYSegments,
  ySegmentSize,
}: {
  events: calendar_v3.Schema$Event[];
  amountXSegments: number;
  amountYSegments: number;
  ySegmentSize: number;
}) {
  return events.map((event, eventIdx) => {
    const dateStart = new Date(
      event.start?.date || event.start?.dateTime || "",
    );
    const dateEnd = new Date(event.end?.date || event.end?.dateTime || "");

    const startSegment = Math.floor(
      (dateStart.getHours() * 60 + dateStart.getMinutes()) / ySegmentSize,
    );
    const segmentAmount = Math.min(
      amountYSegments,
      Math.floor(
        (dateEnd.getTime() - dateStart.getTime()) / 1000 / 60 / ySegmentSize,
      ),
    );
    const { overlappingCount, overlappingPosition } = getOverlaps(
      event,
      events,
      event,
    );
    const xSegments = Math.floor(amountXSegments / overlappingCount);

    return {
      event,
      gridArea: `${startSegment + 1} / ${
        2 + xSegments * overlappingPosition
      } / ${Math.min(amountYSegments, startSegment + segmentAmount + 1)} / ${
        2 + xSegments * (overlappingPosition + 1)
      }`,
      ySegments: segmentAmount,
    };
  });
}
