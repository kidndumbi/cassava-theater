import React from "react";
import { VideoDataModel } from "../../models/videoData.model";

const useSortedVideos = (movies: VideoDataModel[], tvShows: VideoDataModel[]) => {
  const getSortedMovies = React.useCallback(() => {
    const filtered = movies.filter(
      (m) => m.lastVideoPlayedDate && (m.currentTime || 0) > 1
    );
    return filtered
      .sort(
        (a, b) =>
          new Date(b.lastVideoPlayedDate!).getTime() -
          new Date(a.lastVideoPlayedDate!).getTime()
      )
      .slice(0, 20);
  }, [movies]);

  const getSortedTvShows = React.useCallback(() => {
    const filtered = tvShows.filter(
      (m) => m.lastVideoPlayed && m.lastVideoPlayedDate
    );
    return filtered
      .sort(
        (a, b) =>
          new Date(b.lastVideoPlayedDate!).getTime() -
          new Date(a.lastVideoPlayedDate!).getTime()
      )
      .slice(0, 20);
  }, [tvShows]);

  const sortedMovies = React.useMemo(() => getSortedMovies(), [getSortedMovies]);
  const sortedTvShows = React.useMemo(() => getSortedTvShows(), [getSortedTvShows]);

  return { sortedMovies, sortedTvShows };
};

export default useSortedVideos;
