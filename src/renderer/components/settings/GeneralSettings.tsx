import React, { useEffect, useState } from "react";
import {
  Button,
  useTheme,
  Box,
  CardContent,
  Card,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Folder as FolderIcon, Save } from "@mui/icons-material";
import { AppTextField } from "../common/AppTextField";
import { SettingsModel } from "../../../models/settings.model";

interface GeneralSettingsProps {
  movieFolderPath: string;
  tvShowsFolderPath: string;
  continuousPlay: boolean;
  port: string;
  theMovieDbApiKey: string;
  showVideoType: boolean;
  handleFolderSelection: (settingName: string) => Promise<void>;
  handleUpdateSetting: (
    settingName: string,
    value: SettingsModel[keyof SettingsModel],
  ) => Promise<void>;
  handleContinuousPlayChange: (value: boolean) => void;
  handleShowVideoTypeChange: (value: boolean) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  movieFolderPath,
  tvShowsFolderPath,
  port,
  theMovieDbApiKey,
  handleFolderSelection,
  handleUpdateSetting,
  continuousPlay,
  handleContinuousPlayChange,
  showVideoType,
  handleShowVideoTypeChange,
}) => {
  const theme = useTheme();

  const [componentPort, setComponentPort] = useState(port);
  const [localApiKey, setLocalApiKey] = useState(theMovieDbApiKey);

  useEffect(() => {
    setComponentPort(port);
  }, [port]);

  useEffect(() => {
    setLocalApiKey(theMovieDbApiKey);
  }, [theMovieDbApiKey]);

  const renderFolderSetting = (
    label: string,
    value: string,
    settingName: string,
  ) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <AppTextField label={label} value={value} theme={theme} />
      <Button
        sx={{ marginLeft: "8px" }}
        variant="contained"
        color="primary"
        style={{ marginRight: "8px" }}
        onClick={() => handleFolderSelection(settingName)}
      >
        <FolderIcon />
      </Button>
    </div>
  );

  return (
    <Card
      style={{
        marginTop: "20px",
        backgroundColor: theme.customVariables.appDark,
      }}
    >
      <CardContent>
        <Box className="flex flex-col gap-2">
          {renderFolderSetting(
            "Movie Folder Path",
            movieFolderPath,
            "movieFolderPath",
          )}
          {renderFolderSetting(
            "TV Shows Folder Path",
            tvShowsFolderPath,
            "tvShowsFolderPath",
          )}
          <Box style={{ display: "flex", alignItems: "center" }}>
            <AppTextField
              label="Port"
              value={componentPort}
              onChange={(e) => setComponentPort(e.target.value)}
              theme={theme}
            />
            <Button
              sx={{ marginLeft: "8px" }}
              variant="contained"
              color="primary"
              onClick={() => handleUpdateSetting("port", componentPort)}
              disabled={port === componentPort ? true : false}
            >
              <Save />
            </Button>
          </Box>
          <Box style={{ display: "flex", alignItems: "center" }}>
            <AppTextField
              label="themoviedb API Key"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              theme={theme}
            />
            <Button
              sx={{ marginLeft: "8px" }}
              variant="contained"
              color="primary"
              onClick={() =>
                handleUpdateSetting("theMovieDbApiKey", localApiKey)
              }
            >
              <Save />
            </Button>
          </Box>
      
            <FormControlLabel
              control={
                <Checkbox
                  checked={continuousPlay}
                  onChange={(e) => handleContinuousPlayChange(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <span style={{ color: theme.customVariables.appWhiteSmoke }}>
                  Continuous Play
                </span>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showVideoType}
                  onChange={(e) => handleShowVideoTypeChange(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <span style={{ color: theme.customVariables.appWhiteSmoke }}>
                  Show Video Type
                </span>
              }
            />
        
        </Box>
      </CardContent>
    </Card>
  );
};
