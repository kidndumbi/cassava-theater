import { useSelector } from "react-redux";
import { useAppDispatch } from "../store";
import { useEffect } from "react";
import {
  selConvertToMp4Progress,
  selCurrentlyProcessingItem,
} from "../store/mp4Conversion/mp4Conversion.selectors";
import { mp4ConversionActions } from "../store/mp4Conversion/mp4Conversion.slice";
import * as mp4Api from "../store/mp4Conversion/mp4ConversionApi";

export const useMp4Conversion = () => {
  const convertToMp4Progress = useSelector(selConvertToMp4Progress);
  const currentlyProcessingItem = useSelector(selCurrentlyProcessingItem);
  const dispatch = useAppDispatch();

  useEffect(() => {
    // console.log("useMp4Conversion effect triggered", convertToMp4Progress);
  }, [convertToMp4Progress]);

  const addToConversionQueue = async (fromPath: string) => {
    if (
      !convertToMp4Progress.some((progress) => progress.fromPath === fromPath)
    ) {
      dispatch(
        mp4ConversionActions.updateConvertToMp4Progress({
          fromPath,
          toPath: fromPath.replace(/\.[^/.]+$/, ".mp4"),
          percent: 0,
          paused: false,
        }),
      );
      const result = await mp4Api.addToConversionQueueApi(fromPath);
      console.log("added to conversion queue:", result);
    }
  };

  const isConvertingToMp4 = (fromPath: string) =>
    convertToMp4Progress.some((progress) => progress.fromPath === fromPath);

  const pauseConversionItem = async (path: string) => {
    const paused = await mp4Api.pauseConversionItemApi(path);
    const progressItem = convertToMp4Progress.find(
      (progress) => progress.fromPath === path,
    );
    dispatch(
      mp4ConversionActions.updateConvertToMp4Progress({
        ...progressItem,
        paused,
      }),
    );

    return paused;
  };
  const unpauseConversionItem = async (path: string) => {
    const paused = await mp4Api.unpauseConversionItemApi(path);
    const progressItem = convertToMp4Progress.find(
      (progress) => progress.fromPath === path,
    );
    dispatch(
      mp4ConversionActions.updateConvertToMp4Progress({
        ...progressItem,
        paused: !paused,
      }),
    );
    return paused;
  };

  const isItemPaused = async (path: string) => mp4Api.isItemPausedApi(path);
  const getCurrentProcessingItem = async () =>
    mp4Api.getCurrentProcessingItemApi();
  const getConversionQueue = async () => mp4Api.getConversionQueueApi();

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
  };
};
