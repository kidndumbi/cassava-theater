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

interface GeneralSettingsProps {
  movieFolderPath: string;
  tvShowsFolderPath: string;
  continuousPlay: boolean;
  appUrl: string;
  handleFolderSelection: (settingName: string) => Promise<void>;
  handleUpdateSetting: (settingName: string, value: any) => Promise<void>;
  handleContinuousPlayChange: (value: boolean) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  movieFolderPath,
  tvShowsFolderPath,
  appUrl,
  handleFolderSelection,
  handleUpdateSetting,
  continuousPlay,
  handleContinuousPlayChange,
}) => {
  const theme = useTheme();

  const [componentAppUrl, setComponentAppUrl] = useState(appUrl);

  useEffect(() => {
    setComponentAppUrl(appUrl);
  }, [appUrl]);

  const renderFolderSetting = (
    label: string,
    value: string,
    settingName: string
  ) => (
    <div style={{ display: "flex", alignItems: "center" }}>
      {renderTextField(label, value, () => {}, theme)}
      <Button
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
              "WebSocket URL",
              componentAppUrl,
              (e) => setComponentAppUrl(e.target.value),
              theme
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleUpdateSetting("appUrl", componentAppUrl)}
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
