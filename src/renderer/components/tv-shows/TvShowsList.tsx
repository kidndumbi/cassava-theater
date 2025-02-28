import React from "react";
import { Alert, Box } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { getUrl, trimFileName } from "../../util/helperFunctions";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { PosterCard } from "../common/PosterCard";
import { useSettings } from "../../hooks/useSettings";
import { styled } from "@mui/system";
import { AppMore } from "../common/AppMore";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useTvShows } from "../../hooks/useTvShows";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import WarningIcon from "@mui/icons-material/Warning";

interface TvShowsListProps {
  shows: VideoDataModel[];
  handlePosterClick: (videoPath: string) => void;
}

const HoverBox = styled(Box)({
  position: "relative",
  "&:hover .hover-content": {
    display: "block",
  },
});

const HoverContent = styled(Box)({
  position: "absolute",
  top: 9,
  right: 9,
  display: "none",
});

export const TvShowsList: React.FC<TvShowsListProps> = ({
  shows,
  handlePosterClick,
}) => {
  const { getTmdbImageUrl } = useTmdbImageUrl();
  const { settings } = useSettings();
  const { showSnackbar } = useSnackbar();
  const { removeTvShow } = useTvShows();
  const { openDialog, setMessage } = useConfirmation();

  const getImageUlr = (show: VideoDataModel) => {
    if (show.poster) {
      return getUrl("file", show.poster, null, settings?.port);
    }
    if (show?.tv_show_details?.poster_path) {
      return getTmdbImageUrl(show.tv_show_details.poster_path);
    }
  };

  const handleDelete = async (filePath: string) => {
    // Updated warning message with additional recovery information
    setMessage(
      <Alert icon={<WarningIcon fontSize="inherit" />} severity="error">
        Deleting this TV show folder will permanently remove all its contents, and it won't be able to be recovered from the recycle bin.
        Make sure it doesn't contain any important information.
      </Alert>,
    );
    const dialogDecision = await openDialog("Delete");

    if (dialogDecision === "Ok") {
      try {
        const del = await window.fileManagerAPI.deleteFile(filePath);
        if (del.success) {
          removeTvShow(filePath);
          showSnackbar("Tv Show deleted successfully", "success");
        } else {
          showSnackbar("Failed to delete Tv Show: " + del.message, "error");
        }
      } catch (error) {
        showSnackbar("Error deleting Tv Show: " + error, "error");
      }
    }
  };

  return (
    <>
      <Box display="flex" flexWrap="wrap" gap="4px">
        {shows.map((show: VideoDataModel, index: number) => (
          <HoverBox key={show.filePath}>
            <PosterCard
              key={index}
              imageUrl={getImageUlr(show)}
              altText={show.fileName || ""}
              onClick={() => show.filePath && handlePosterClick(show.filePath)}
              footer={trimFileName(show.fileName ?? "")}
            />
            <HoverContent className="hover-content">
              <AppMore handleDelete={handleDelete.bind(null, show.filePath)} />
            </HoverContent>
          </HoverBox>
        ))}
      </Box>
    </>
  );
};
