import React from "react";
import { Box } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import LoadingIndicator from "../common/LoadingIndicator";
import { PosterList } from "./PosterList";
import ResumeTvShow from "./ResumeTvShow";

interface ResumeTvShowListsProps {
  sortedTvShows: VideoDataModel[];
  handlePosterClick: (
    videoType: string,
    video: VideoDataModel,
    startFromBeginning: boolean
  ) => void;
  loadingItems: { [key: string]: boolean };
  loadingTvShows: boolean;
}

const ResumeTvShowLists: React.FC<ResumeTvShowListsProps> = ({
  sortedTvShows,
  handlePosterClick,
  loadingItems,
  loadingTvShows,
}) => {
  const { getTmdbImageUrl } = useTmdbImageUrl();

  const renderTvShow = (tvShow: VideoDataModel) => (
    <ResumeTvShow
      key={tvShow.filePath}
      tvShow={tvShow}
      getTmdbImageUrl={getTmdbImageUrl}
      handlePosterClick={handlePosterClick}
      loadingItems={loadingItems}
    />
  );

  return (
    <Box>
      <PosterList>
        {loadingTvShows ? (
          <LoadingIndicator message="Loading TV shows..." />
        ) : sortedTvShows.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            paddingTop="2rem"
            paddingBottom="2rem"
          >
            <Box fontSize="2rem">No TV Shows to display</Box>
          </Box>
        ) : (
          sortedTvShows.map(renderTvShow)
        )}
      </PosterList>
    </Box>
  );
};

export default ResumeTvShowLists;
