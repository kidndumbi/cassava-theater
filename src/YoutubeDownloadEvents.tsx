import { useEffect, useRef } from "react";
import { useAppDispatch } from "./renderer/store";
import { youtubeDownloadActions } from "./renderer/store/youtubeDownload.slice";
import { useSaveJsonData } from "./renderer/hooks/useSaveJsonData";
import { useSnackbar } from "./renderer/contexts/SnackbarContext";
import { useGetAllSettings } from "./renderer/hooks/settings/useGetAllSettings";
import { SettingsModel } from "./models/settings.model";
import { YoutubeDownloadQueueItem } from "./main/services/youtube.service";

export const YoutubeDownloadEvents = () => {
  const dispatch = useAppDispatch();
  const { showSnackbar } = useSnackbar();
  const { data: settings = {} as SettingsModel } = useGetAllSettings();
  const { mutate: saveJsonData } = useSaveJsonData();

  const youtubeDownloadStatus = useRef(
    settings?.notifications?.youtubeDownloadStatus,
  );

  useEffect(() => {
    youtubeDownloadStatus.current =
      settings?.notifications?.youtubeDownloadStatus;
  }, [settings?.notifications?.youtubeDownloadStatus]);

  useEffect(() => {
    window.youtubeAPI.getQueue().then(async (queue) => {
      dispatch(youtubeDownloadActions.setDownloadProgress(queue));
    });
    +window.mainNotificationsAPI.youtubeDownloadCompleted((data) => {
      saveJsonData({
        currentVideo: {
          filePath: data.completedItem.destinationPath,
        },
        newVideoJsonData: {
          poster: data.completedItem.poster,
          backdrop: data.completedItem.backdrop,
        },
      });
      dispatch(youtubeDownloadActions.setDownloadProgress(data.queue));
      if (youtubeDownloadStatus.current) {
        showSnackbar(
          `Conversion completed: ${data.completedItem.title}`,
          "success",
        );
      }
    });

    window.mainNotificationsAPI.youtubeDownloadStarted((queue) => {
      dispatch(youtubeDownloadActions.setDownloadProgress(queue));
    });

    window.mainNotificationsAPI.youtubeDownloadProgress(
      async (progress: { item: YoutubeDownloadQueueItem; percent: number }) => {
        const queue: YoutubeDownloadQueueItem[] =
          await window.youtubeAPI.getQueue();
        const updatedQueue = queue.map((item) => {
          if (item.id === progress.item.id) {
            return {
              ...item,
              percent: progress.percent,
            };
          }
          return item;
        });

        dispatch(youtubeDownloadActions.setDownloadProgress(updatedQueue));
      },
    );
  }, []);

  return <> </>;
};
