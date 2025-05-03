import {  useMutation, useQueryClient } from "@tanstack/react-query";
import { SettingsModel } from "../../../models/settings.model";

export function useSetSetting() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({
        key,
        value,
      }: {
        key: keyof SettingsModel;
        value: SettingsModel[keyof SettingsModel];
      }) => window.settingsAPI.setSetting(key, value),
      onSuccess: (data, variables) => {
        queryClient.setQueryData<SettingsModel>(["settings"], (old) => ({
          ...old,
          [variables.key]: variables.value,
        }));
      },
    });
  }