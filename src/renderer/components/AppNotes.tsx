import React, { useEffect, useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { NoteList } from "./noteList/NoteList";
import { Overview } from "./overview/Overview";
import theme from "../theme";
import { VideoDataModel } from "../../models/videoData.model";
import { a11yProps, CustomTabPanel } from "./common/TabPanel";
import { useNoteListLogic } from "../hooks/useNoteListLogic";

interface AppNotesProps {
  currentVideoTime: number;
  videoData: VideoDataModel | null;
  handleVideoSeek: (seekTime: number) => void;
}

const AppNotes: React.FC<AppNotesProps> = ({
  currentVideoTime,
  videoData,
  handleVideoSeek,
}) => {


  const [currentTabValue, setCurrentTabValue] = useState(1);
  const { getNotesAndOverview } = useNoteListLogic();

  const [videoDetails, setVideoDetails] = useState(videoData);

  useEffect(() => {
    if (videoData) {
      onUpdate();
    }
  }, [videoData]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTabValue(newValue);
  };

  const onUpdate = async () => {
    if (!videoData || !videoData.filePath) {
      return;
    }
    const notesAndOverview = await getNotesAndOverview(videoData.filePath);
    if (videoData) {
      setVideoDetails({ ...videoData, ...notesAndOverview });
    }
  };

  return (
    <Box
      sx={{ width: "100%", backgroundColor: theme.customVariables.appDarker }}
    >
      <Box>
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
            label="Overview"
            {...a11yProps(0)}
            sx={{
              color:
                currentTabValue === 0
                  ? "primary.main"
                  : theme.customVariables.appWhiteSmoke,
            }}
          />
          <Tab
            label="Notes"
            {...a11yProps(1)}
            sx={{
              color:
                currentTabValue === 1
                  ? "primary.main"
                  : theme.customVariables.appWhiteSmoke,
            }}
          />
        </Tabs>
      </Box>
      <CustomTabPanel value={currentTabValue} index={0}>
        <Box padding={2}>
          {videoDetails && (
            <Overview
              videoData={videoDetails}
              updateComplete={onUpdate}
            ></Overview>
          )}
        </Box>
      </CustomTabPanel>
      <CustomTabPanel value={currentTabValue} index={1}>
        <Box padding={2}>
          <NoteList
            handleVideoSeek={handleVideoSeek}
            noteUpdateComplete={onUpdate}
            noteCreationComplete={onUpdate}
            currentVideoTime={currentVideoTime}
            videoData={videoDetails}
          ></NoteList>
        </Box>
      </CustomTabPanel>
    </Box>
  );
};

export { AppNotes };
