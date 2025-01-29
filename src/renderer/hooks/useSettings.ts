// import { useAppDispatch } from "../../store";
// import { settingsActions, selSettings } from "../../store/settingsSlice";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../store";
import { selSettings, settingsActions } from "../store/settingsSlice";

export const useSettings = () => {
  const dispatch = useAppDispatch();
  const settings = useSelector(selSettings);

  const fetchAllSettings = async () => {
    try {
      await dispatch(settingsActions.getAllSettings());
    } catch (error) {
      console.error("Failed to fetch setting:", error);
    }
  };

  const getSetting = async (key: keyof typeof settings) => {
    try {
      const setting = await dispatch(settingsActions.getSetting(key));
      return setting.payload;
    } catch (error) {
      console.error("Failed to fetch setting:", error);
    }
  };

  const setSetting = async (key: keyof typeof settings, value: any) => {
    try {
      const setting = await dispatch(
        settingsActions.setSetting({ key, value })
      );
      return setting.payload;
    } catch (error) {
      console.error("Failed to fetch setting:", error);
    }
  };

  return {
    settings,
    fetchAllSettings,
    getSetting,
    setSetting,
  };
};
