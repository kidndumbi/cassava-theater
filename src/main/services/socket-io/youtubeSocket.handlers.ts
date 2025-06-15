import { Socket } from "socket.io";
import ytdl from "@distube/ytdl-core";
import { AppSocketEvents } from "../../../enums/app-socket-events.enum";
import {
  getYoutubeVideoInfo,
  downloadYoutubeVideo,
  getYoutubeDownloadQueueInstance,
  YoutubeDownloadQueueItem,
} from "../youtube.service";

export function registerYoutubeHandlers(socket: Socket) {
  socket.on(
    AppSocketEvents.YT_GET_VIDEO_INFO,
    async (
      requestData: { data: { url: string } },
      callback: (response: {
        success: boolean;
        data?: ytdl.videoInfo;
        error?: string;
      }) => void,
    ) => {
      try {
        const { url } = requestData.data;
        const data = await getYoutubeVideoInfo(url);
        callback({ success: true, data });
      } catch (error) {
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  socket.on(
    AppSocketEvents.YT_DOWNLOAD_VIDEO,
    async (
      requestData: { data: { url: string; destinationPath: string } },
      callback: (response: { success: boolean; error?: string }) => void,
    ) => {
      try {
        await downloadYoutubeVideo(
          requestData.data.url,
          requestData.data.destinationPath,
        );
        callback({ success: true });
      } catch (error) {
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  socket.on(
    AppSocketEvents.YT_ADD_TO_DOWNLOAD_QUEUE,
    async (
      requestData: {
        data: {
          title: string;
          url: string;
          destinationPath: string;
          poster: string;
          backdrop: string;
        };
      },
      callback: (response: { success: boolean; error?: string }) => void,
    ) => {
      try {
        getYoutubeDownloadQueueInstance().addToQueue(requestData.data);
        callback({ success: true });
      } catch (error) {
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  socket.on(
    AppSocketEvents.YT_REMOVE_FROM_QUEUE,
    async (
      requestData: { data: { id: string } },
      callback: (response: { success: boolean; error?: string }) => void,
    ) => {
      try {
        getYoutubeDownloadQueueInstance().removeFromQueue(requestData.data.id);
        callback({ success: true });
      } catch (error) {
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  socket.on(
    AppSocketEvents.YT_IS_PROCESSING_QUEUE,
    async (
      _requestData: unknown,
      callback: (response: {
        success: boolean;
        data?: boolean;
        error?: string;
      }) => void,
    ) => {
      try {
        const data = getYoutubeDownloadQueueInstance().isProcessingQueue();
        callback({ success: true, data });
      } catch (error) {
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  socket.on(
    AppSocketEvents.YT_CLEAR_QUEUE,
    async (
      _requestData: unknown,
      callback: (response: { success: boolean; error?: string }) => void,
    ) => {
      try {
        getYoutubeDownloadQueueInstance().clearQueue();
        callback({ success: true });
      } catch (error) {
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  socket.on(
    AppSocketEvents.YT_GET_QUEUE,
    async (
      _requestData: unknown,
      callback: (response: {
        success: boolean;
        data?: YoutubeDownloadQueueItem[];
        error?: string;
      }) => void,
    ) => {
      try {
        const data = getYoutubeDownloadQueueInstance().getQueue();
        callback({ success: true, data });
      } catch (error) {
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  socket.on(
    AppSocketEvents.YT_SWAP_QUEUE_ITEMS,
    async (
      requestData: { data: { id1: string; id2: string } },
      callback: (response: { success: boolean; error?: string }) => void,
    ) => {
      try {
        getYoutubeDownloadQueueInstance().swapQueueItems(
          requestData.data.id1,
          requestData.data.id2,
        );
        callback({ success: true });
      } catch (error) {
        callback({ success: false, error: (error as Error).message });
      }
    },
  );
}
