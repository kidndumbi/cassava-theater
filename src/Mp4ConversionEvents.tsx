import { useEffect, useRef } from "react";
import { useAppDispatch } from "./renderer/store";
import {
  mp4ConversionActions,
  Mp4ConversionProgress,
} from "./renderer/store/mp4Conversion/mp4Conversion.slice";
import { useMp4Conversion } from "./renderer/hooks/useMp4Conversion";
import { useSnackbar } from "./renderer/contexts/SnackbarContext";

export const Mp4ConversionEvents = () => {
  const dispatch = useAppDispatch();
  const {
    currentlyProcessingItem,
    initConverversionQueueFromStore,
    getConversionQueue,
  } = useMp4Conversion();
  const currentlyProcessingItemRef = useRef(currentlyProcessingItem);
  const { showSnackbar } = useSnackbar();

  const lastExecutionRef = useRef<number>(0);
  const pendingProgressRef = useRef<{
    file: string;
    percent: number;
  }>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initQueue = async () => {
      const conversionQueue = await getConversionQueue();
      initConverversionQueueFromStore(conversionQueue);
    };
    initQueue();
  }, []);

  useEffect(() => {
    currentlyProcessingItemRef.current = currentlyProcessingItem;
  }, [currentlyProcessingItem]);

  useEffect(() => {
    // Throttle mp4ConversionProgress handler to fire at most once every 10 seconds
    window.mainNotificationsAPI.mp4ConversionProgress((progress) => {
      pendingProgressRef.current = progress;
      const now = Date.now();
      const elapsed = now - lastExecutionRef.current;

      const execute = () => {
        const progress = pendingProgressRef.current;
        pendingProgressRef.current = null;
        lastExecutionRef.current = Date.now();

        const [fromPath, toPath] = progress.file.split(":::") || [];
        const progressItem: Mp4ConversionProgress = {
          fromPath,
          toPath,
          percent: progress.percent,
          paused: false,
          complete: false,
        };

        dispatch(mp4ConversionActions.updateConvertToMp4Progress(progressItem));

        if (
          progressItem.fromPath !== currentlyProcessingItemRef.current?.fromPath
        ) {
          dispatch(
            mp4ConversionActions.setCurrentlyProcessingItem(progressItem),
          );
        }
      };

      if (elapsed >= 10000) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        execute();
      } else if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          execute();
        }, 10000 - elapsed);
      }
    });

    window.mainNotificationsAPI.mp4ConversionCompleted((progress) => {
      const [fromPath, toPath] = progress.file.split(":::") || [];
      const { percent } = progress;
      const progressItem: Mp4ConversionProgress = {
        fromPath,
        toPath,
        percent,
        paused: false,
        complete: true,
      };

      dispatch(mp4ConversionActions.updateConvertToMp4Progress(progressItem));
      showSnackbar(`Conversion completed: ${toPath}`, "success");
    });
  }, []);

  return <></>;
};
