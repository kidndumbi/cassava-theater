import React from "react";
import { Box } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import LoadingIndicator from "../common/LoadingIndicator";
import { PosterList } from "./PosterList";
import ResumeMovie from "./ResumeMovie";

interface ResumeMovieListProps {
  sortedMovies: VideoDataModel[];
  handlePosterClick: (videoType: string, video: VideoDataModel) => void;
  loadingMovies: boolean;
    handleResetTime: (video: VideoDataModel) => void;
}

const ResumeMovieList: React.FC<ResumeMovieListProps> = ({
  sortedMovies,
  handlePosterClick,
  loadingMovies,
  handleResetTime,
}) => {
  const renderMovies = () => {
    if (loadingMovies) {
      return <LoadingIndicator message="Loading movies..." />;
    }
    if (!sortedMovies || sortedMovies?.length === 0) {
      return (
        <Box display="flex" justifyContent="center" paddingY="2rem">
          <Box fontSize="2rem">No Movies to display</Box>
        </Box>
      );
    }
    return sortedMovies?.map((movie: VideoDataModel) => (
      <ResumeMovie
        key={movie.filePath}
        movie={movie}
        handlePosterClick={handlePosterClick}
        handleResetTime={() =>
          handleResetTime(movie)
        }
      />
    ));
  };

  return <PosterList>{renderMovies()}</PosterList>;
};

export default ResumeMovieList;
