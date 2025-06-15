import { useEffect } from "react";
import { useAppDispatch } from "./renderer/store";
import { useSnackbar } from "./renderer/contexts/SnackbarContext";
import { SettingsModel } from "./models/settings.model";
import { useGetAllSettings } from "./renderer/hooks/settings/useGetAllSettings";
import { mp4ConversionNewActions } from "./renderer/store/mp4ConversionNew.slice";
import {
  filterFailed,
  getConversionQueue,
} from "./renderer/util/mp4ConversionAPI-helpers";

export const Mp4ConversionEvents = () => {
  const dispatch = useAppDispatch();
  const { data: settings = {} as SettingsModel } = useGetAllSettings();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    getConversionQueue().then(async (queue) => {
      dispatch(mp4ConversionNewActions.setConversionProgress(queue));
    });
    window.mp4ConversionAPI.initializeConversionQueue();
  }, []);

  useEffect(() => {
    window.mainNotificationsAPI.mp4ConversionProgress(async (progress) => {
      dispatch(
        mp4ConversionNewActions.setConversionProgress(
          filterFailed(progress.queue),
        ),
      );
    });

    window.mainNotificationsAPI.mp4ConversionCompleted(async (progress) => {
      dispatch(
        mp4ConversionNewActions.setConversionProgress(
          filterFailed(progress.queue),
        ),
      );

      if (settings?.notifications?.mp4ConversionStatus) {
        showSnackbar(
          `Conversion completed: ${progress.queueItem.outputPath}`,
          "success",
        );
      }
    });
  }, []);

  return <></>;
};
