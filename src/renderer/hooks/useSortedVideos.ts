import  { useCallback, useMemo } from "react";
import { VideoDataModel } from "../../models/videoData.model";

const useSortedVideos = (movies: VideoDataModel[], tvShows: VideoDataModel[]) => {
  const getSortedMovies = useCallback(() => {
    const filtered = movies.filter(
      (m) => m.lastVideoPlayedDate && (m.currentTime || 0) > 1
    );
    return filtered
      .sort(
        (a, b) =>
          new Date(b.lastVideoPlayedDate ? b.lastVideoPlayedDate : 0).getTime() -
          new Date(a.lastVideoPlayedDate ?? 0).getTime()
      )
      .slice(0, 20);
  }, [movies]);

  const getSortedTvShows = useCallback(() => {
    const filtered = tvShows.filter(
      (m) => m.lastVideoPlayed && m.lastVideoPlayedDate
    );
    return filtered
      .sort(
        (a, b) =>
          new Date(b.lastVideoPlayedDate ?? 0).getTime() -
          new Date(a.lastVideoPlayedDate ?? 0).getTime()
      )
      .slice(0, 20);
  }, [tvShows]);

  const sortedMovies = useMemo(() => getSortedMovies(), [getSortedMovies]);
  const sortedTvShows = useMemo(() => getSortedTvShows(), [getSortedTvShows]);

  return { sortedMovies, sortedTvShows };
};

export default useSortedVideos;
