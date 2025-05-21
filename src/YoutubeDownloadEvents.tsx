import { useEffect } from "react";

export const YoutubeDownloadEvents = () => {
  useEffect(() => {
    window.mainNotificationsAPI.youtubeDownloadCompleted((queue) => {
      console.log("Youtube download completed:", queue);
    });

    window.mainNotificationsAPI.youtubeDownloadStarted((queue) => {
      console.log("Youtube download started:", queue);
    });
    // Handle the completion of the download here
  }, []);

  return <> </>;
};
