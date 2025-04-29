import React, { useEffect, useState } from "react";
import { Modal, Paper, Tabs, Tab, Box } from "@mui/material";
import theme from "../../theme";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { TvShowDetails } from "../../../models/tv-show-details.model";
import { getFilename } from "../../util/helperFunctions";
import { a11yProps, CustomTabPanel } from "../common/TabPanel";
import TvShowSuggestions from "./TvShowSuggestions";
import { CustomImages } from "./CustomImages";
import { VideoDataModel } from "../../../models/videoData.model";
import LoadingIndicator from "../common/LoadingIndicator";
import { useTvShowSuggestions } from "../../hooks/useTvShowSuggestions";
import { useVideoDetailsQuery } from "../../hooks/useVideoData.query";

interface TvShowSuggestionsModalProps {
  open: boolean;
  handleClose: () => void;
  fileName: string;
  id?: string;
  handleSelectTvShow: (tv_show_details: TvShowDetails) => void;
    handleImageUpdate: (data: VideoDataModel, filePath: string) => void;
  filePath: string;
}

export const TvShowSuggestionsModal: React.FC<TvShowSuggestionsModalProps> = ({
  open,
  handleClose,
  fileName,
  id,
  handleSelectTvShow,
  filePath,
  handleImageUpdate
}) => {
  const [currentTabValue, setCurrentTabValue] = useState(0);

  const { getTmdbImageUrl } = useTmdbImageUrl();
  const [searchQuery, setSearchQuery] = useState(fileName);

  

  const { data: tvShowDetails } = useVideoDetailsQuery({
    path: filePath,
    category: "tvShows",
  });

  const { data: tvShowSuggestions, isLoading: tvShowSuggestionsLoading } =
    useTvShowSuggestions(getFilename(searchQuery));

  useEffect(() => {
    if (fileName && open) {
      setSearchQuery(fileName);
    }
  }, [fileName, open, id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTabValue(newValue);
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Paper
        sx={{
          bgcolor: theme.customVariables.appDark,
          color: theme.customVariables.appWhiteSmoke,
        }}
        className="custom-scrollbar absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 transform overflow-y-auto p-4 shadow-lg"
      >
        <Tabs
          value={currentTabValue}
          onChange={handleTabChange}
          aria-label="basic tabs example"
          TabIndicatorProps={{ style: { backgroundColor: "primary" } }}
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
            <Box className="mt-[15%]">
              <LoadingIndicator />
            </Box>
          ) : (
            <TvShowSuggestions
              fileName={fileName}
              tvShowSuggestions={tvShowSuggestions}
              id={id}
              handleSelectTvShow={(tvShowDetails) => {
                handleSelectTvShow(tvShowDetails);
                handleClose();
              }}
              getTmdbImageUrl={getTmdbImageUrl}
              theme={theme}
              triggererSuggestionsUpdate={(searchValue) => {
                setSearchQuery(searchValue);
              }}
            />
          )}
        </CustomTabPanel>

        <CustomTabPanel value={currentTabValue} index={1}>
          <CustomImages
            posterUrl={tvShowDetails?.poster}
            backdropUrl={tvShowDetails?.backdrop}
            updateImage={(data) => { handleImageUpdate(data, tvShowDetails?.filePath) }}
          />
        </CustomTabPanel>
      </Paper>
    </Modal>
  );
};
