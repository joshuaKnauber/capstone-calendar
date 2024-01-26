import { useQuery } from "@tanstack/react-query";
import { predict } from "./serverPrediction";
import { sha256 } from "js-sha256";
import { redisGet, redisSet } from "@/utils/redis";

type PredictionProps = {
  id: string;
  systemPrompt: string;
  userPrompt: string;
  active: boolean;
};

export function usePrediction({
  id,
  systemPrompt,
  userPrompt,
  active,
}: PredictionProps) {
  const query = useQuery({
    queryKey: ["prediction", id],
    queryFn: async () => {
      const key = sha256(
        `systemPrompt:${systemPrompt}:userPrompt:${userPrompt}`,
      );
      const cached = await redisGet(key);
      if (cached) return cached;
      console.log("fetched new prediction");
      const text = await predict({ systemPrompt, userPrompt });
      await redisSet(key, text);
      return text;
    },
    enabled: active,
    refetchOnWindowFocus: false,
  });

  return { ...query };
}
