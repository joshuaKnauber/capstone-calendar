import { api } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { fitness_v1 } from "googleapis";

export function useSteps(access_token: string, daysPast: number) {
  const query = useQuery({
    queryKey: ["steps", daysPast],
    queryFn: async () => {
      const now = new Date();
      const fromDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - daysPast,
      );
      // const ressources = await api(
      //   "https://www.googleapis.com/fitness/v1/users/me/dataSources",
      //   {
      //     method: "GET",
      //     headers: {
      //       Authorization: `Bearer ${access_token}`,
      //     },
      //   },
      // );
      // const dataSources = await ressources.json();
      // const sources = dataSources.dataSource
      //   // .filter((d: any) => d.dataType.name.includes("bpm"))
      //   .map((d: any) => `${d.dataStreamId} - ${d.dataType.name}`);
      // console.log(sources);
      // fetch steps from google fit
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
                dataTypeName: "com.google.step_count.delta",
                dataSourceId:
                  "derived:com.google.step_count.delta:com.google.android.gms:merge_step_deltas",
              },
            ],
            bucketByTime: { durationMillis: 60 * 60 * 1000 },
            startTimeMillis: fromDate.getTime(),
            endTimeMillis: now.getTime(),
          }),
        },
      );
      const data =
        ((await res.json()) as fitness_v1.Schema$AggregateResponse).bucket ||
        [];
      return data;
    },
  });

  function daySteps(date: Date) {
    const dayStartMillis = date.getTime();
    const dayStepData = (query.data || []).filter((d) => {
      const stepStartMillis = parseInt(d.startTimeMillis || "0");
      return (
        stepStartMillis >= dayStartMillis &&
        stepStartMillis < dayStartMillis + 24 * 60 * 60 * 1000
      );
    });
    const daySteps = dayStepData.map(
      (d) =>
        (((d.dataset || [])[0]?.point || [])[0]?.value || [])[0]?.intVal || 0,
    );
    return daySteps;
  }

  return { ...query, daySteps };
}
