import { useMutation } from "@tanstack/react-query";
import { useAppDispatch } from "../../store";
import { youtubeDownloadActions } from "../../store/youtubeDownload.slice";
import { YoutubeDownloadQueueItem } from "../../../main/services/youtube.service";
import {
  DragProgressItem,
  YoutubeDownloadProgressListItem,
} from "./YoutubeDownloadProgressListItem";
import { AppDrop } from "../common/AppDrop";
import theme from "../../theme";
import { useDragState } from "../../hooks/useDragState";

export const YoutubeDownloadProgressList = ({
  progressList,
}: {
  progressList?: YoutubeDownloadQueueItem[];
}) => {
  const dispatch = useAppDispatch();
  const { isAnyDragging, setDragging } = useDragState();

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
          dragging={setDragging}
          onSwap={async (id1, id2) => {
            const result = await swapQueueItems({ id1, id2 });

            if (result.success) {
              const queue = await window.youtubeAPI.getQueue();
              dispatch(youtubeDownloadActions.setDownloadProgress(queue));
            }
          }}
        />
      ))}
      {isAnyDragging && (
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
