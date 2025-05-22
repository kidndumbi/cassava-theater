import { useMutation } from "@tanstack/react-query";
import { useAppDispatch } from "../../store";
import { youtubeDownloadActions } from "../../store/youtubeDownload.slice";
import { YoutubeDownloadQueueItem } from "../../../main/services/youtube.service";
import {
  DragProgressItem,
  YoutubeDownloadProgressListItem,
} from "./YoutubeDownloadProgressListItem";
import { useState } from "react";
import { AppDelete } from "../common/AppDelete";

export const YoutubeDownloadProgressList = ({
  progressList,
}: {
  progressList?: YoutubeDownloadQueueItem[];
}) => {
  const dispatch = useAppDispatch();
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const { mutateAsync: removeFromQueue, isPending: isRemoving } = useMutation({
    mutationFn: (id: string) => window.youtubeAPI.removeFromQueue(id),
    onError: (error) => {
      console.error("Error removing from queue:", error);
    },
  });

  const { mutateAsync: swapQueueItems } = useMutation({
    mutationFn: ({ id1, id2 }: { id1: string; id2: string }) =>
      window.youtubeAPI.swapQueueItems(id1, id2),
    onSuccess: (data) => {
      if (!data.success)
        console.error("Error swapping queue items:", data.error);
    },
    onError: (error) => {
      console.error("Error swapping queue items:", error);
    },
  });

  const handleCancel = async (item: YoutubeDownloadQueueItem) => {
    await removeFromQueue(item.id);
    const queue = await window.youtubeAPI.getQueue();
    dispatch(youtubeDownloadActions.setDownloadProgress(queue));
  };

  // // Test data for 5 items if progressList is not provided
  // const testData: YoutubeDownloadQueueItem[] = [
  //   {
  //     id: "1",
  //     title: "Test Video 1",
  //     url: "https://youtube.com/watch?v=1",
  //     destinationPath: "/downloads/video1.mp4",
  //     status: "downloading",
  //     poster: "",
  //     backdrop: "",
  //   },
  //   {
  //     id: "2",
  //     title: "Test Video 2",
  //     url: "https://youtube.com/watch?v=2",
  //     destinationPath: "/downloads/video2.mp4",
  //     status: "pending",
  //     poster: "",
  //     backdrop: "",
  //   },
  //   {
  //     id: "3",
  //     title: "Test Video 3",
  //     url: "https://youtube.com/watch?v=3",
  //     destinationPath: "/downloads/video3.mp4",
  //     status: "completed",
  //     poster: "",
  //     backdrop: "",
  //   },
  //   {
  //     id: "4",
  //     title: "Test Video 4",
  //     url: "https://youtube.com/watch?v=4",
  //     destinationPath: "/downloads/video4.mp4",
  //     status: "error",
  //     poster: "",
  //     backdrop: "",
  //   },
  //   {
  //     id: "5",
  //     title: "Test Video 5",
  //     url: "https://youtube.com/watch?v=5",
  //     destinationPath: "/downloads/video5.mp4",
  //     status: "pending",
  //     poster: "",
  //     backdrop: "",
  //   },
  // ];

  const items = progressList;

  return (
    <>
      {items.map((item, index) => (
        <YoutubeDownloadProgressListItem
          idx={index}
          key={item.id}
          progressItem={item}
          isRemoving={isRemoving}
          onCancel={handleCancel}
          dragging={(isDragging, idx) => {
            setDraggingIdx(isDragging ? idx : null);
          }}
          onSwap={async (id1, id2) => {
            const result = await swapQueueItems({ id1, id2 });

            if (result.success) {
              const queue = await window.youtubeAPI.getQueue();
              dispatch(youtubeDownloadActions.setDownloadProgress(queue));
            }
          }}
        />
      ))}
      {draggingIdx !== null && (
        <AppDelete
          buttonText="Cancel"
          itemDroped={(item: DragProgressItem) => {
            console.log("Item dropped big button:", item);
            //handleRemove(item.index);
          }}
          accept={["YOUTUBE_DOWNLOAD"]}
        />
      )}
    </>
  );
};
