import { useEffect } from "react";
import { useAppDispatch } from "./renderer/store";
import { useSnackbar } from "./renderer/contexts/SnackbarContext";
import { SettingsModel } from "./models/settings.model";
import { useGetAllSettings } from "./renderer/hooks/settings/useGetAllSettings";
import { mp4ConversionNewActions } from "./renderer/store/mp4ConversionNew.slice";

export const Mp4ConversionEvents = () => {
  const dispatch = useAppDispatch();
  const { data: settings = {} as SettingsModel } = useGetAllSettings();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    window.mp4ConversionAPI.getConversionQueue().then(async (queue) => {
      dispatch(

        mp4ConversionNewActions.setConversionProgress(
          queue.filter((q) => q.status !== "failed"),
        ),
      );
    });
    window.mp4ConversionAPI.initializeConversionQueue();
  }, []); 

  useEffect(() => {
    window.mainNotificationsAPI.mp4ConversionProgress(async (progress) => {
      const queue = (await window.mp4ConversionAPI.getConversionQueue()).filter(
        (q) => q.status !== "failed",
      );
      const updatedQueue = queue.map((item) => {
        if (item.inputPath === progress.item.inputPath) {
          return {
            ...progress.item,
          };
        }
        return item;
      });
      dispatch(mp4ConversionNewActions.setConversionProgress(updatedQueue));
    });

    window.mainNotificationsAPI.mp4ConversionCompleted(async (progress) => {
      const [fromPath, toPath] = progress.file.split(":::") || [];
      const updatedQueue = (await window.mp4ConversionAPI.getConversionQueue())
        .filter((q) => q.status !== "failed")
        .filter((q) => q.inputPath !== fromPath);
      dispatch(mp4ConversionNewActions.setConversionProgress(updatedQueue));

      if (settings?.notifications?.mp4ConversionStatus) {
        showSnackbar(`Conversion completed: ${toPath}`, "success");
      }
    });
  }, []);

  return <></>;
};
