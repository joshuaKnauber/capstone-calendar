import { useQuery } from "@tanstack/react-query";
import { predict } from "./serverPrediction";

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
      const text = await predict({ systemPrompt, userPrompt });
      return text;
    },
    enabled: active,
    refetchOnWindowFocus: false,
  });

  return { ...query };
}
