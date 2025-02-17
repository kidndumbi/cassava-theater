import React from "react";
import { Box } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { getUrl, trimFileName } from "../../util/helperFunctions";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { PosterCard } from "../common/PosterCard";
import { useSettings } from "../../hooks/useSettings";

interface TvShowsListProps {
  shows: VideoDataModel[];
  handlePosterClick: (videoPath: string) => void;
}

export const TvShowsList: React.FC<TvShowsListProps> = ({
  shows,
  handlePosterClick,
}) => {
  const { getTmdbImageUrl } = useTmdbImageUrl();
  const { settings } = useSettings();

  const getImageUlr = (show: VideoDataModel) => {
    if (show.poster) {
      return getUrl("file", show.poster, null, settings?.port);
    }
    if (show?.tv_show_details?.poster_path) {
      return getTmdbImageUrl(show.tv_show_details.poster_path);
    }
  };

  return (
    <>
      <Box display="flex" flexWrap="wrap" gap="4px">
        {shows.map((show: VideoDataModel, index: number) => (
          <PosterCard
            key={index}
            imageUrl={getImageUlr(show)}
            altText={show.fileName || ""}
            onClick={() => show.filePath && handlePosterClick(show.filePath)}
            footer={trimFileName(show.fileName ?? "")}
          />
        ))}
      </Box>
    </>
  );
};
