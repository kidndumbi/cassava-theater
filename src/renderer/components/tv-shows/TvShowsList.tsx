import React from "react";
import { Box } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { trimFileName } from "../../util/helperFunctions";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { PosterCard } from "../common/PosterCard";

interface TvShowsListProps {
  shows: VideoDataModel[];
  handlePosterClick: (videoPath: string) => void;
}

export const TvShowsList: React.FC<TvShowsListProps> = ({
  shows,
  handlePosterClick,
}) => {
  const { getTmdbImageUrl, defaultImageUrl } = useTmdbImageUrl();

  return (
    <>
      <Box display="flex" flexWrap="wrap" gap="4px">
        {shows.map((show: VideoDataModel, index: number) => (
          <PosterCard
            key={index}
            imageUrl={
              show.tv_show_details?.poster_path
                ? getTmdbImageUrl(show.tv_show_details.poster_path)
                : defaultImageUrl
            }
            altText={show.fileName || ""}
            onClick={() => show.filePath && handlePosterClick(show.filePath)}
            footer={trimFileName(show.fileName ?? "")}
          />
        ))}
      </Box>
    </>
  );
};
