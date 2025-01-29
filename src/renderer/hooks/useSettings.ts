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

//   const updateSetting = async (settingsName: string, value: any) => {
//     try {
//       await dispatch(settingsActions.setSetting({ settingsName, value }));
//     } catch (error) {
//       console.error("Failed to update setting:", error);
//       throw error;
//     }
//   };

  return {
    settings,
    fetchAllSettings,
    // updateSetting,
  };
};
