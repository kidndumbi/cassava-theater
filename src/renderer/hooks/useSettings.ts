import { rendererLoggingService as log } from "../util/renderer-logging.service";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../store";
import { selSettings, settingsActions } from "../store/settingsSlice";

export const useSettings = () => {
  const dispatch = useAppDispatch();
  const settings = useSelector(selSettings);

  const dispatchAsync = async (action: any, errorMessage: string) => {
    try {
      const result = await dispatch(action);
      return result.payload;
    } catch (error) {
      log.error(errorMessage, error);
    }
  };

  const fetchAllSettings = async () => {
    return dispatchAsync(
      settingsActions.getAllSettings(),
      "Failed to fetch settings"
    );
  };

  const getSetting = async (key: keyof typeof settings) => {
    return dispatchAsync(
      settingsActions.getSetting(key),
      "Failed to fetch setting"
    );
  };

  const setSetting = async (key: keyof typeof settings, value: any) => {
    return dispatchAsync(
      settingsActions.setSetting({ key, value }),
      "Failed to set setting"
    );
  };

  return {
    settings,
    fetchAllSettings,
    getSetting,
    setSetting,
  };
};
