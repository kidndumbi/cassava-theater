import { useSelector } from "react-redux";
import { useAppDispatch } from "../store";
import { useEffect } from "react";
import {
  selConvertToMp4Progress,
  selCurrentlyProcessingItem,
} from "../store/mp4Conversion/mp4Conversion.selectors";
import {
  mp4ConversionActions,
  Mp4ConversionProgress,
} from "../store/mp4Conversion/mp4Conversion.slice";
import * as mp4Api from "../store/mp4Conversion/mp4ConversionApi";
import { ConversionQueueItem } from "../../models/conversion-queue-item.model";

export const useMp4Conversion = () => {
  const convertToMp4Progress = useSelector(selConvertToMp4Progress);
  const currentlyProcessingItem = useSelector(selCurrentlyProcessingItem);
  const dispatch = useAppDispatch();

  const initConverversionQueueFromStore = (queue: ConversionQueueItem[]) => {
    const pendingItems = queue.filter((p) => p.status !== "completed");

    if (pendingItems.length === 0) {
      console.log("No pending items in conversion queue.");
      return;
    }

    pendingItems.forEach((item) => {
      addOrUpdateProgressItem({
        fromPath: item.inputPath,
        toPath: item.inputPath.replace(/\.[^/.]+$/, ".mp4"),
        percent: 0,
        paused: item.status === "paused" ? true : false,
      });
    });

    initializeConversionQueue();
  };

  useEffect(() => {
    //console.log("useMp4Conversion effect triggered", convertToMp4Progress);
  }, [convertToMp4Progress]);

  const addOrUpdateProgressItem = (progressItem: Mp4ConversionProgress) => {
    dispatch(mp4ConversionActions.updateConvertToMp4Progress(progressItem));
  };

  const addToConversionQueue = async (fromPath: string) => {
    if (
      !convertToMp4Progress.some((progress) => progress.fromPath === fromPath)
    ) {
      const result = await mp4Api.addToConversionQueueApi(fromPath);
      if (!result) {
        console.error(`Failed to add ${fromPath} to conversion queue.`);
        return;
      }
      addOrUpdateProgressItem({
        fromPath,
        toPath: fromPath.replace(/\.[^/.]+$/, ".mp4"),
        percent: 0,
        paused: false,
      });
    }
  };

  const isConvertingToMp4 = (fromPath: string) =>
    convertToMp4Progress.some((progress) => progress.fromPath === fromPath);

  const pauseConversionItem = async (path: string) => {
    const paused = await mp4Api.pauseConversionItemApi(path);
    const progressItem = convertToMp4Progress.find(
      (progress) => progress.fromPath === path,
    );

    addOrUpdateProgressItem({
      ...progressItem,
      paused,
    });

    return paused;
  };
  const unpauseConversionItem = async (path: string) => {
    const paused = await mp4Api.unpauseConversionItemApi(path);
    const progressItem = convertToMp4Progress.find(
      (progress) => progress.fromPath === path,
    );

    addOrUpdateProgressItem({
      ...progressItem,
      paused: !paused,
    });
    return paused;
  };

  const isItemPaused = async (path: string) => mp4Api.isItemPausedApi(path);
  const getCurrentProcessingItem = async () =>
    mp4Api.getCurrentProcessingItemApi();
  const getConversionQueue = async () => mp4Api.getConversionQueueApi();
  const removeFromConversionQueue = async (path: string) => {
    const result = await mp4Api.removeFromConversionQueueApi(path);
    if (!result) {
      console.error(`Failed to remove ${path} from conversion queue.`);
      return false;
    }
    dispatch(mp4ConversionActions.removeFromConversionQueue(path));
    return result;
  };

  const clearCompletedConversions = () => {
    dispatch(mp4ConversionActions.clearCompleteConversions());
  };

  const initializeConversionQueue = async () => {
    await mp4Api.initializeConversionQueueApi();
  };

  return {
    convertToMp4Progress,
    currentlyProcessingItem,
    isConvertingToMp4,
    addToConversionQueue,
    pauseConversionItem,
    unpauseConversionItem,
    isItemPaused,
    getCurrentProcessingItem,
    getConversionQueue,
    clearCompletedConversions,
    addOrUpdateProgressItem,
    removeFromConversionQueue,
    initConverversionQueueFromStore,
  };
};
