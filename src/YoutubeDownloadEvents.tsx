import { useEffect } from "react";
import { useAppDispatch } from "./renderer/store";
import { youtubeDownloadActions } from "./renderer/store/youtubeDownload.slice";

export const YoutubeDownloadEvents = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    window.mainNotificationsAPI.youtubeDownloadCompleted((queue) => {
      console.log("Youtube download completed:", queue);
      dispatch(youtubeDownloadActions.setDownloadProgress(queue));
    });

    window.mainNotificationsAPI.youtubeDownloadStarted((queue) => {
      console.log("Youtube download started:", queue);
      dispatch(youtubeDownloadActions.setDownloadProgress(queue));
    });
  }, []);

  return <> </>;
};
