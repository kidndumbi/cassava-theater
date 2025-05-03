import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SettingsModel } from "../../../models/settings.model";

export function useGetAllSettings() {
  return useQuery<SettingsModel>({
    queryKey: ["settings"],
    queryFn: () => window.settingsAPI.getALLSettings(),
    networkMode: "always",
  });
}


