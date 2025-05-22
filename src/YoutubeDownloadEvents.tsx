import { useEffect } from "react";
import { useAppDispatch } from "./renderer/store";
import { youtubeDownloadActions } from "./renderer/store/youtubeDownload.slice";
import { useSaveJsonData } from "./renderer/hooks/useSaveJsonData";

export const YoutubeDownloadEvents = () => {
  const dispatch = useAppDispatch();
  const { mutate: saveJsonData } = useSaveJsonData();

  useEffect(() => {
    window.mainNotificationsAPI.youtubeDownloadCompleted((data) => {
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
    });

    window.mainNotificationsAPI.youtubeDownloadStarted((queue) => {
      console.log("Youtube download started:", queue);
      dispatch(youtubeDownloadActions.setDownloadProgress(queue));
    });
  }, []);

  return <> </>;
};
