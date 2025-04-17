import { useSelector } from "react-redux";
import { useAppDispatch } from "../store";
import { useEffect } from "react";
import { selConvertToMp4Progress } from "../store/mp4Conversion/mp4Conversion.selectors";
import { mp4ConversionActions } from "../store/mp4Conversion/mp4Conversion.slice";
import { addToConversionQueueApi } from "../store/mp4Conversion/mp4ConversionApi";
export const useMp4Conversion = () => {
  const convertToMp4Progress = useSelector(selConvertToMp4Progress);
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log("useMp4Conversion effect triggered", convertToMp4Progress);
  }, [convertToMp4Progress]);

  const addToConversionQueue = async (fromPath: string) => {
    const existingProgress = convertToMp4Progress.find(
      (progress) => progress.fromPath === fromPath,
    );

    if (!existingProgress) {
      dispatch(
        mp4ConversionActions.updateConvertToMp4Progress({
          fromPath,
          toPath: fromPath.replace(/\.[^/.]+$/, ".mp4"),
          percent: 0,
        }),
      );
      const result = await addToConversionQueueApi(fromPath || "");
      console.log("added to conversion queue:", result);
    }
  };

  const isConvertingToMp4 = (fromPath: string) => {
    return convertToMp4Progress.some(
      (progress) => progress.fromPath === fromPath,
    );
  };

  return {
    convertToMp4Progress,
    isConvertingToMp4,
    addToConversionQueue,
  };
};
