import { useSelector } from "react-redux";
import { selConvertToMp4Progress } from "../store/videoInfo/folderVideosInfoSelectors";
import { useAppDispatch } from "../store";
import { videosInfoActions } from "../store/videoInfo/folderVideosInfo.slice";
import { convertToMp4Api } from "../store/videoInfo/folderVideosInfoApi";
export const useMp4Conversion = () => {
  const convertToMp4Progress = useSelector(selConvertToMp4Progress);
  const dispatch = useAppDispatch();

  const convertToMp4 = (fromPaths: string[]) => {
    fromPaths.forEach((fromPath) => {
      dispatch(
        videosInfoActions.updateConvertToMp4Progress({
          fromPath,
          toPath: fromPath.replace(/\.[^/.]+$/, ".mp4"),
          percent: 0,
        }),
      );

      const existingProgress = convertToMp4Progress.find(
        (progress) => progress.fromPath === fromPath,
      );

      if (!existingProgress) {
        convertToMp4Api(fromPath || "");
      }
    });
  };

  const isConvertingToMp4 = (fromPath: string) => { 
    return convertToMp4Progress.some(
      (progress) => progress.fromPath === fromPath
    );
  };

  return { convertToMp4, convertToMp4Progress, isConvertingToMp4 };
};
