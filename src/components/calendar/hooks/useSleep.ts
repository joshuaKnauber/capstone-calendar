import { api } from "@/utils/api";
import { mode } from "@/utils/mode";
import { useQuery } from "@tanstack/react-query";
import { fitness_v1 } from "googleapis";

export function useSleep(access_token: string, daysPast: number) {
  const query = useQuery({
    queryKey: ["sleep", daysPast],
    queryFn: async () => {
      const now = new Date();
      const fromDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 20,
      );
      // fetch sleep from google fit
      const res = await api(
        "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify({
            aggregateBy: [
              {
                dataTypeName: "com.google.sleep.segment",
              },
            ],
            // bucketBySession: { minDurationMillis: 1000 },
            // bucketByTime: { durationMillis: 100 },
            startTimeMillis: fromDate.getTime(),
            endTimeMillis: now.getTime(),
          }),
        },
      );
      const data =
        ((await res.json()) as fitness_v1.Schema$AggregateResponse).bucket ||
        [];
      console.log(data);
      return data;
    },
  });

  function daySleep(date: Date) {
    const dayStartMillis = date.getTime();
    const segmentLength = 60 * 60 * 1000;
    const segments: number[][] = Array(
      Math.ceil((24 * 60 * 60 * 1000) / segmentLength),
    ).fill([]);
    (((query.data || [])[0]?.dataset || [])[0]?.point || []).forEach((p) => {
      const stepStartMillis = parseInt(p.startTimeNanos || "0") / 1000000;
      // console.log(stepStartMillis - dayStartMillis);
      const segment = Math.floor(
        (stepStartMillis - dayStartMillis) / segmentLength,
      );
      // console.log(segment, segments.length);
      const value = p.value?.[0]?.intVal;
      if (value && segment > 0 && segment < segments.length) {
        // console.log(value);
        segments[segment] = [...segments[segment], value];
      }
    });
    const sleepValues = segments.map((s) => mode(s) || 0);
    console.log(segments);
    return sleepValues;
  }

  return { ...query, daySleep };
}
