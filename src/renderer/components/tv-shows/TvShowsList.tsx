import React, { useState } from "react";
import { Alert, Box, Snackbar, Button } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { getUrl, trimFileName } from "../../util/helperFunctions";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { PosterCard } from "../common/PosterCard";
import { styled } from "@mui/system";
import { AppMore } from "../common/AppMore";
import { useTvShows } from "../../hooks/useTvShows";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import WarningIcon from "@mui/icons-material/Warning";
import { TvShowSuggestionsModal } from "./TvShowSuggestionsModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TvShowDetails } from "../../../models/tv-show-details.model";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { useDeleteFile } from "../../hooks/useDeleteFile";

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

export const TvShowsList = React.memo(function TvShowsList(
  props: TvShowsListProps,
) {
  const { shows, handlePosterClick } = props;
  const { getTmdbImageUrl } = useTmdbImageUrl();
  const { data: settings } = useGetAllSettings();
  const { openDialog, setMessage } = useConfirmation();
  const [selectedTvShow, setSelectedTvShow] = useState<VideoDataModel | null>(
    null,
  );
  const [openTvShowSuggestionsModal, setOpenTvShowSuggestionsModal] =
    useState(false);
  const { updateTvShowTMDBId, updateTvShowDbData } = useTvShows();
  const queryClient = useQueryClient();

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
    actionText?: string;
    onAction?: () => void;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (
    message: string,
    severity: "success" | "error",
    actionText?: string,
    onAction?: () => void,
  ) => {
    setSnackbar({ open: true, message, severity, actionText, onAction });
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const { mutate: deleteFolder } = useDeleteFile(
    (data, filePathDeleted) => {
      showSnackbar("Tv Show deleted successfully", "success");
      queryClient.setQueryData(
        ["videoData", settings?.tvShowsFolderPath, false, "tvShows"],
        (oldData: VideoDataModel[] = []) =>
          oldData.filter((m) => m.filePath !== filePathDeleted),
      );
    },
    (error) => {
      showSnackbar("Error deleting Tv Show: " + error, "error");
    },
  );

  const { mutate: linkTvShowMutation } = useMutation({
    mutationFn: async ({
      filePath,
      tv_show_details,
    }: {
      filePath: string;
      tv_show_details: TvShowDetails;
    }) => {
      return updateTvShowTMDBId(filePath, tv_show_details);
    },
    onSuccess: (tv_show_details, { filePath }) => {
      showSnackbar("Tv Show linked to TMDB successfully", "success");
      queryClient.setQueryData(
        ["videoData", settings?.tvShowsFolderPath, false, "tvShows"],
        (oldData: VideoDataModel[] = []) =>
          oldData.map((m) => {
            if (m.filePath === filePath) {
              return { ...m, tv_show_details };
            }
            return m;
          }),
      );
      setOpenTvShowSuggestionsModal(false);
    },
    onError: () => {
      showSnackbar("Failed to link Tv Show to TMDB", "error");
    },
  });

  const { mutate: updateImageMutation } = useMutation({
    mutationFn: async ({
      data,
      filePath,
    }: {
      data: VideoDataModel;
      filePath: string;
    }) => {
      return updateTvShowDbData(filePath, data);
    },
    onSuccess: (_data, variables) => {
      showSnackbar("Custom image updated successfully", "success");
      queryClient.setQueryData(
        ["videoData", settings?.tvShowsFolderPath, false, "tvShows"],
        (oldData: VideoDataModel[] = []) =>
          oldData.map((m) => {
            if (m.filePath === variables.filePath) {
              return { ...m, ...variables.data };
            }
            return m;
          }),
      );
    },
    onError: () => {
      showSnackbar("Failed to update custom image", "error");
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

  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    show: VideoDataModel | null;
  } | null>(null);

  return (
    <>
      <Box display="flex" flexWrap="wrap" gap="4px">
        {shows?.map((show: VideoDataModel, index: number) => (
          <div
            key={show.filePath}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({
                mouseX: e.clientX + 2,
                mouseY: e.clientY - 6,
                show,
              });
            }}
          >
            <HoverBox>
              <PosterCard
                key={index}
                imageUrl={getImageUlr(show)}
                altText={show.fileName || ""}
                onClick={() => show.filePath && handlePosterClick(show.filePath)}
                footer={trimFileName(show.fileName ?? "")}
              />
              <HoverContent className="hover-content" />
            </HoverBox>
          </div>
        ))}
      </Box>
      <AppMore
        open={!!contextMenu}
        anchorPosition={
          contextMenu
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : null
        }
        onClose={() => setContextMenu(null)}
        isMovie={false}
        handleDelete={() => {
          if (contextMenu?.show?.filePath) handleDelete(contextMenu.show.filePath);
        }}
        linkTheMovieDb={() => {
          if (contextMenu?.show) {
            setSelectedTvShow(contextMenu.show);
            setOpenTvShowSuggestionsModal(true);
          }
        }}
        videoData={contextMenu?.show || {}}
      />

      <TvShowSuggestionsModal
        id={selectedTvShow?.tv_show_details?.id.toString() || ""}
        open={openTvShowSuggestionsModal}
        handleClose={() => {
          setOpenTvShowSuggestionsModal(false);
          setSelectedTvShow(null);
        }}
        fileName={selectedTvShow?.filePath?.split("/").pop() || ""}
        filePath={selectedTvShow?.filePath || ""}
        handleSelectTvShow={(tv_show_details) => {
          if (tv_show_details.id) {
            linkTvShowMutation({
              filePath: selectedTvShow.filePath || "",
              tv_show_details,
            });
          }
        }}
        handleImageUpdate={(data: VideoDataModel, filePath: string) => {
          updateImageMutation({ data, filePath });
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          action={
            snackbar.actionText ? (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  if (snackbar.onAction) snackbar.onAction();
                  handleSnackbarClose();
                }}
              >
                {snackbar.actionText}
              </Button>
            ) : null
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
});
export default React.memo(TvShowsList);
