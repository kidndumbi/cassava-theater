import React, { useEffect, useState } from "react";
import { Modal, Paper, Tabs, Tab, Box } from "@mui/material";
import theme from "../../theme";
import { useTvShows } from "../../hooks/useTvShows";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { TvShowDetails } from "../../../models/tv-show-details.model";
import { getFilename } from "../../util/helperFunctions";
import { a11yProps, CustomTabPanel } from "../common/TabPanel";
import TvShowSuggestions from "./TvShowSuggestions";
import { CustomImages } from "./CustomImages";
import { VideoDataModel } from "../../../models/videoData.model";
import { useSnackbar } from "../../contexts/SnackbarContext";
import LoadingIndicator from "../common/LoadingIndicator";

interface TvShowSuggestionsModalProps {
  open: boolean;
  handleClose: () => void;
  fileName: string;
  id?: string;
  handleSelectTvShow: (tv_show_details: TvShowDetails) => void;
}

const TvShowSuggestionsModal: React.FC<TvShowSuggestionsModalProps> = ({
  open,
  handleClose,
  fileName,
  id,
  handleSelectTvShow,
}) => {
  const {
    tvShowSuggestions,
    getTvShowSuggestions,
    resetTvShowSuggestions,
    tvShowDetails,
    updateTvShowDbData,
    tvShowSuggestionsLoading,
  } = useTvShows();

  const { showSnackbar } = useSnackbar();

  const { getTmdbImageUrl } = useTmdbImageUrl();
  const [currentTabValue, setCurrentTabValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTabValue(newValue);
  };

  useEffect(() => {
    if (fileName && open) {
      resetTvShowSuggestions();
      getTvShowSuggestions(getFilename(fileName));
    }
  }, [fileName, open, id]);

  return (
    <Modal open={open} onClose={handleClose}>
      <Paper
        className="custom-scrollbar"
        sx={{
          height: "80%",
          overflowY: "auto",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          bgcolor: theme.customVariables.appDark,
          color: theme.customVariables.appWhiteSmoke,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Tabs
          value={currentTabValue}
          onChange={handleChange}
          aria-label="basic tabs example"
          TabIndicatorProps={{
            style: {
              backgroundColor: "primary",
            },
          }}
        >
          <Tab
            label="TheMovieDb"
            {...a11yProps(0)}
            sx={{
              color:
                currentTabValue === 0
                  ? "primary.main"
                  : theme.customVariables.appWhiteSmoke,
            }}
          />
          <Tab
            label="Customize"
            {...a11yProps(1)}
            sx={{
              color:
                currentTabValue === 1
                  ? "primary.main"
                  : theme.customVariables.appWhiteSmoke,
            }}
          />
        </Tabs>
        <CustomTabPanel value={currentTabValue} index={0}>
          {tvShowSuggestionsLoading ? (
            <Box className="mt-[15%]"><LoadingIndicator /></Box>
          ) : (
            <TvShowSuggestions
              fileName={fileName}
              tvShowSuggestions={tvShowSuggestions}
              id={id}
              handleSelectTvShow={handleSelectTvShow}
              getTmdbImageUrl={getTmdbImageUrl}
              theme={theme}
            />
          )}
        </CustomTabPanel>
        <CustomTabPanel value={currentTabValue} index={1}>
          <CustomImages
            posterUrl={tvShowDetails?.poster}
            backdropUrl={tvShowDetails?.backdrop}
            updateImage={async (data: VideoDataModel) => {
              await updateTvShowDbData(tvShowDetails.filePath, data);
              showSnackbar("Custom image updated successfully", "success");
            }}
          ></CustomImages>
        </CustomTabPanel>
      </Paper>
    </Modal>
  );
};

export { TvShowSuggestionsModal };
