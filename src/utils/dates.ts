export function dateRangesOverlapping(
  date1: [Date, Date],
  date2: [Date, Date],
) {
  return (
    // first even inside second event
    (date1[0] >= date2[0] && date1[1] <= date2[1]) ||
    // second event inside first event
    (date2[0] >= date1[0] && date2[1] <= date1[1]) ||
    // first event starts and ends after second event
    (date1[0] >= date2[0] && date1[1] >= date2[1]) ||
    // second event starts and ends after first event
    (date2[0] >= date1[0] && date2[1] >= date1[1])
  );
}
