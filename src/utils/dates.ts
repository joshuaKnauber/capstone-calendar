import { areIntervalsOverlapping } from "date-fns";

export function dateRangesOverlapping(
  date1: [Date, Date],
  date2: [Date, Date],
) {
  return areIntervalsOverlapping(
    { start: date1[0], end: date1[1] },
    { start: date2[0], end: date2[1] },
    { inclusive: true },
  );

  if (date1[0].getDate() === 25) {
    console.log(date1, date2);
  }
  return (
    // first event inside second event
    (date1[0] >= date2[0] && date1[1] <= date2[1]) ||
    // second event inside first event
    (date2[0] >= date1[0] && date2[1] <= date1[1]) ||
    // ?
    (date2[0] >= date1[0] && date1[1] <= date2[1]) ||
    (date1[0] >= date2[0] && date2[1] <= date1[1])
    // ?
    // (date1[0] >= date2[0] && date1[0] <= date2[1]) ||
    // ?
    // (date2[0] >= date1[0] && date2[0] <= date1[1])
  );
}
