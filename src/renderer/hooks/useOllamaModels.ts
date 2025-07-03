import { OllamaModel } from "./../../models/ollamaModel.model";
import { useQuery } from "@tanstack/react-query";

export function useOllamaModels() {
  return useQuery<OllamaModel[]>({
    queryKey: ["ollamaModels"],
    queryFn: () => window.llmAPI.getAvailableModels(),
    networkMode: "always",
  });
}
