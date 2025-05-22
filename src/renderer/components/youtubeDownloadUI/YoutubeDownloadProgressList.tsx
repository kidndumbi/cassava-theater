import { useMutation } from "@tanstack/react-query";
import { useAppDispatch } from "../../store";
import { youtubeDownloadActions } from "../../store/youtubeDownload.slice";
import { YoutubeDownloadQueueItem } from "../../../main/services/youtube.service";
import {
  DragProgressItem,
  YoutubeDownloadProgressListItem,
} from "./YoutubeDownloadProgressListItem";
import { useState } from "react";
import { AppDrop } from "../common/AppDrop";
import theme from "../../theme";

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
          dragging={(isDragging, dragIdx) => {
            if (isDragging) {
              setDraggingIdx(dragIdx);
            } else {
              setDraggingIdx((current) =>
                current === dragIdx ? null : current,
              );
            }
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
        <AppDrop
          conatinerStyle={{
            top: "6px",
          }}
          buttonText="Cancel"
          itemDroped={(item: DragProgressItem) => {
            handleCancel(item.progressData);
          }}
          accept={["YOUTUBE_DOWNLOAD"]}
          backgroundColor={theme.palette.primary.main}
        />
      )}
    </>
  );
};
