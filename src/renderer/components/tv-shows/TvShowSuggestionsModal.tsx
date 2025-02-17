import React, { useEffect, useState } from "react";
import { Modal, Paper, Tabs, Tab } from "@mui/material";
import theme from "../../theme";
import { useTvShows } from "../../hooks/useTvShows";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { TvShowDetails } from "../../../models/tv-show-details.model";
import { getFilename } from "../../util/helperFunctions";
import { a11yProps, CustomTabPanel } from "../common/TabPanel";
import TvShowSuggestions from "./TvShowSuggestions";
import { TvShowCustomize } from "./TvShowCustomize";

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
  const { tvShowSuggestions, getTvShowSuggestions, resetTvShowSuggestions } =
    useTvShows();

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
          <TvShowSuggestions
            fileName={fileName}
            tvShowSuggestions={tvShowSuggestions}
            id={id}
            handleSelectTvShow={handleSelectTvShow}
            getTmdbImageUrl={getTmdbImageUrl}
            theme={theme}
          />
        </CustomTabPanel>
        <CustomTabPanel value={currentTabValue} index={1}>
          <TvShowCustomize></TvShowCustomize>
        </CustomTabPanel>
      </Paper>
    </Modal>
  );
};

export { TvShowSuggestionsModal };
