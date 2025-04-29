import React, { useState } from "react";
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
import { TvShowSuggestionsModal } from "./TvShowSuggestionsModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface TvShowsListProps {
  shows: VideoDataModel[];
  handlePosterClick: (videoPath: string) => void;
  refetchTvShows: () => void;
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
  refetchTvShows,
}) => {
  const { getTmdbImageUrl } = useTmdbImageUrl();
  const { settings } = useSettings();
  const { showSnackbar } = useSnackbar();
  const { openDialog, setMessage } = useConfirmation();
  const [selectedTvShow, setSelectedTvShow] = useState<VideoDataModel | null>(
    null,
  );
  const [openTvShowSuggestionsModal, setOpenTvShowSuggestionsModal] =
    useState(false);
  const { updateTvShowTMDBId } = useTvShows();
  const queryClient = useQueryClient();

  const { mutate: deleteFolder } = useMutation({
    mutationFn: async (filePath: string) => {
      return window.fileManagerAPI.deleteFile(filePath);
    },
    onSuccess: (data, filePathDeleted) => {
      if (data.success) {
        showSnackbar("Tv Show deleted successfully", "success");
        queryClient.setQueryData(
          ["videoData", settings?.tvShowsFolderPath, false, "tvShows"],
          (oldData: VideoDataModel[] = []) => oldData.filter(m => m.filePath !== filePathDeleted)
        );
      } else {
        showSnackbar("Failed to delete Tv Show: " + data.message, "error");
      }
    },
    onError: (error) => {
      showSnackbar("Error deleting Tv Show: " + error, "error");
    },
  });

  const getImageUlr = (show: VideoDataModel) => {
    if (show.poster) {
      return getUrl("file", show.poster, null, settings?.port);
    }
    if (show?.tv_show_details?.poster_path) {
      return getTmdbImageUrl(show.tv_show_details.poster_path);
    }
  };

  const handleDelete = async (filePath: string) => {
    setMessage(
      <Alert icon={<WarningIcon fontSize="inherit" />} severity="error">
        Deleting this TV show folder will permanently remove all its contents,
        and it won't be able to be recovered from the recycle bin. Make sure it
        doesn't contain any important information.
      </Alert>,
    );
    const dialogDecision = await openDialog("Delete");

    if (dialogDecision === "Ok") {
      deleteFolder(filePath);
    }
  };

  return (
    <>
      <Box display="flex" flexWrap="wrap" gap="4px">
        {shows?.map((show: VideoDataModel, index: number) => (
          <HoverBox key={show.filePath}>
            <PosterCard
              key={index}
              imageUrl={getImageUlr(show)}
              altText={show.fileName || ""}
              onClick={() => show.filePath && handlePosterClick(show.filePath)}
              footer={trimFileName(show.fileName ?? "")}
            />
            <HoverContent className="hover-content">
              <AppMore
                isMovie={false}
                handleDelete={handleDelete.bind(null, show.filePath)}
                linkTheMovieDb={() => {
                  setSelectedTvShow(show);
                  setOpenTvShowSuggestionsModal(true);
                }}
              />
            </HoverContent>
          </HoverBox>
        ))}
      </Box>

      <TvShowSuggestionsModal
        id={selectedTvShow?.tv_show_details?.id.toString() || ""}
        open={openTvShowSuggestionsModal}
        handleClose={() => {
          setOpenTvShowSuggestionsModal(false);
          setSelectedTvShow(null);
        }}
        fileName={selectedTvShow?.filePath?.split("/").pop() || ""}
        filePath={selectedTvShow?.filePath || ""}
        handleSelectTvShow={async (tv_show_details) => {
          if (tv_show_details.id) {
            await updateTvShowTMDBId(
              selectedTvShow.filePath || "",
              tv_show_details,
            );
            showSnackbar("Tv Show linked to TMDB successfully", "success");
            refetchTvShows();
            setOpenTvShowSuggestionsModal(false);
          }
        }}
      />
    </>
  );
};
