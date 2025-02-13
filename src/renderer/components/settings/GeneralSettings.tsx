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
import { renderTextField } from "../../components/common/RenderTextField";
import { SettingsModel } from "../../../models/settings.model";

interface GeneralSettingsProps {
  movieFolderPath: string;
  tvShowsFolderPath: string;
  continuousPlay: boolean;
  port: string;
  theMovieDbApiKey: string;
  handleFolderSelection: (settingName: string) => Promise<void>;
  handleUpdateSetting: (
    settingName: string,
    value: SettingsModel[keyof SettingsModel]
  ) => Promise<void>;
  handleContinuousPlayChange: (value: boolean) => void;
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
    settingName: string
  ) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      {renderTextField(label, value, null, theme)}
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
        <Box>
          {renderFolderSetting(
            "Movie Folder Path",
            movieFolderPath,
            "movieFolderPath"
          )}
          {renderFolderSetting(
            "TV Shows Folder Path",
            tvShowsFolderPath,
            "tvShowsFolderPath"
          )}
          <Box style={{ display: "flex", alignItems: "center" }}>
            {renderTextField(
              "Port",
              componentPort,
              (e) => setComponentPort(e.target.value),
              theme
            )}
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
            {renderTextField(
              "themoviedb API Key",
              localApiKey,
              (e) => setLocalApiKey(e.target.value),
              theme
            )}
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
        </Box>
      </CardContent>
    </Card>
  );
};
