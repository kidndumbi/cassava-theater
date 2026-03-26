import { useEffect } from "react";
import { useAppDispatch } from "./renderer/store";
import { useSnackbar } from "./renderer/contexts/SnackbarContext";
import { SettingsModel } from "./models/settings.model";
import { useGetAllSettings } from "./renderer/hooks/settings/useGetAllSettings";
import { subtitleSyncActions } from "./renderer/store/subtitleSync.slice";
import {
  getSubtitleSyncQueue,
} from "./renderer/util/subtitleSyncAPI-helpers";

export const SubtitleSyncEvents = () => {
  const dispatch = useAppDispatch();
  const { data: settings = {} as SettingsModel } = useGetAllSettings();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    getSubtitleSyncQueue().then(async (queue) => {
      dispatch(subtitleSyncActions.setSyncProgress(queue));
    });
    window.subtitleSyncAPI.initializeSyncQueue();
  }, []);

  useEffect(() => {
    window.mainNotificationsAPI.subtitleSyncProgress(async (progress) => {
      dispatch(
        subtitleSyncActions.setSyncProgress(
          progress.queue,
        ),
      );
    });

    window.mainNotificationsAPI.subtitleSyncUpdatedFromBackend(
      async (progress) => {
        dispatch(
          subtitleSyncActions.setSyncProgress(
            progress.queue,
          ),
        );
      },
    );

    window.mainNotificationsAPI.subtitleSyncCompleted(async (progress) => {
      dispatch(
        subtitleSyncActions.setSyncProgress(
          progress.queue,
        ),
      );

      if (settings?.notifications?.subtitleSyncStatus) {
        showSnackbar(
          `Subtitle sync completed: ${progress.queueItem.fileName}`,
          "success",
        );
      }
    });
  }, []);

  return <></>;
};