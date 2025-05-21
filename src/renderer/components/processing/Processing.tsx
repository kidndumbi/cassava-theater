import { Mp4ConversionProgress } from "../../store/mp4Conversion/mp4Conversion.slice";
import { Mp4ProgressList } from "../mp4ConversionUI/Mp4ProgressList";
import { YoutubeDownloadProgressList } from "../youtubeDownloadUI/YoutubeDownloadProgressList";

export const Processing = ({
  progressList,
}: {
  progressList: Mp4ConversionProgress[];
}) => {
  return (
    <>
      <Mp4ProgressList progressList={progressList} />
      <YoutubeDownloadProgressList />
    </>
  );
};
