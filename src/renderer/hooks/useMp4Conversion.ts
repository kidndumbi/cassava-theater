import { useSelector } from "react-redux";
import { useAppDispatch } from "../store";
import { useEffect } from "react";
import { selConvertToMp4Progress } from "../store/mp4Conversion/mp4Conversion.selectors";
import { mp4ConversionActions } from "../store/mp4Conversion/mp4Conversion.slice";
import { convertToMp4Api } from "../store/mp4Conversion/mp4ConversionApi";
export const useMp4Conversion = () => {
  const convertToMp4Progress = useSelector(selConvertToMp4Progress);
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log("useMp4Conversion effect triggered", convertToMp4Progress);
  }, [convertToMp4Progress]);

  const addToConversionQueue = (fromPath: string) => {
    dispatch(
      mp4ConversionActions.updateConvertToMp4Progress({
        fromPath,
        toPath: fromPath.replace(/\.[^/.]+$/, ".mp4"),
        percent: 0,
      }),
    );
  };

  const convertToMp4 = async (fromPath: string) => {
    const existingProgress = convertToMp4Progress.find(
      (progress) => progress.fromPath === fromPath,
    );

    if (!existingProgress) {
      const result = await convertToMp4Api(fromPath || "");
      console.log("MP4 complete conversion result:", result);
      dispatch(
        mp4ConversionActions.markMp4ConversionAsComplete(
          result?.fromPath || "",
        ),
      );
    }
  };

  const isConvertingToMp4 = (fromPath: string) => {
    return convertToMp4Progress.some(
      (progress) => progress.fromPath === fromPath,
    );
  };

  return {
    // convertToMp4,
    convertToMp4Progress,
    isConvertingToMp4,
    addToConversionQueue,
  };
};
