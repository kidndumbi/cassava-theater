import React from "react";
import {
  Button,
  useTheme,
  Box,
  CardContent,
  Card,
  Checkbox,
  FormControlLabel,
  SelectChangeEvent,
} from "@mui/material";
import { Folder as FolderIcon, Save } from "@mui/icons-material";
import { AppTextField } from "../common/AppTextField";
import { SettingsModel } from "../../../models/settings.model";
import { useOllamaModels } from "../../hooks/useOllamaModels";
import RenderSelect from "../tv-shows/RenderSelect";
import { OllamaModel } from "../../../models/ollamaModel.model";

interface GeneralSettingsProps {
  settings: SettingsModel;
  handleFolderSelection: (settingName: string) => Promise<void>;
  handleUpdateSetting: (
    settingName: string,
    value: SettingsModel[keyof SettingsModel],
    confirmationtext?: string,
  ) => Promise<void>;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  settings,
  handleFolderSelection,
  handleUpdateSetting,
}) => {
  const theme = useTheme();
  const {
    playNonMp4Videos,
    movieFolderPath,
    tvShowsFolderPath,
    port,
    theMovieDbApiKey,
    continuousPlay,
    showVideoType,
    notifications = { mp4ConversionStatus: false, userConnectionStatus: false },
    ollamaModel,
  } = settings;

  const { data: ollamaModels } = useOllamaModels();

  const handleOllamaModelChange = (event: SelectChangeEvent<string>) => {
    handleUpdateSetting("ollamaModel", event.target.value);
  };

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
              value={port}
              onChange={(e) => handleUpdateSetting("port", e.target.value)}
              theme={theme}
            />
            <Button
              sx={{ marginLeft: "8px" }}
              variant="contained"
              color="primary"
              onClick={() => handleUpdateSetting("port", port)}
            >
              <Save />
            </Button>
          </Box>
          <Box style={{ display: "flex", alignItems: "center" }}>
            <AppTextField
              label="themoviedb API Key"
              value={theMovieDbApiKey}
              onChange={(e) =>
                handleUpdateSetting("theMovieDbApiKey", e.target.value)
              }
              theme={theme}
            />
            <Button
              sx={{ marginLeft: "8px" }}
              variant="contained"
              color="primary"
              onClick={() =>
                handleUpdateSetting("theMovieDbApiKey", theMovieDbApiKey)
              }
            >
              <Save />
            </Button>
          </Box>
          <Box style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <Box style={{ flex: 1 }}>
              <RenderSelect<OllamaModel>
                value={
                  ollamaModel &&
                  ollamaModels?.some((model) => model.model === ollamaModel)
                    ? ollamaModel
                    : "Select a default model"
                }
                onChange={handleOllamaModelChange}
                items={[
                  ...(!ollamaModel
                    ? [
                        {
                          model: "Select a default model",
                          name: "Select a default model",
                        } as OllamaModel
                      ]
                    : []),
                  ...(ollamaModels || []),
                ]}
                getItemValue={(model) => model.model}
                getItemLabel={(model) => model.model || model.name}
              />
            </Box>
          </Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={continuousPlay}
                onChange={(e) =>
                  handleUpdateSetting("continuousPlay", e.target.checked)
                }
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
                onChange={(e) =>
                  handleUpdateSetting("showVideoType", e.target.checked)
                }
                color="primary"
              />
            }
            label={
              <span style={{ color: theme.customVariables.appWhiteSmoke }}>
                Show Video Type
              </span>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={playNonMp4Videos}
                onChange={(e) =>
                  handleUpdateSetting(
                    "playNonMp4Videos",
                    e.target.checked,
                    e.target.checked
                      ? "Enabling playback of non-MP4 videos may cause compatibility issues. Do you want to continue?"
                      : undefined,
                  )
                }
                color="primary"
              />
            }
            label={
              <span style={{ color: theme.customVariables.appWhiteSmoke }}>
                Play Non MP4 Videos
              </span>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={notifications.mp4ConversionStatus}
                onChange={(e) =>
                  handleUpdateSetting("notifications", {
                    ...notifications,
                    mp4ConversionStatus: e.target.checked,
                  })
                }
                color="primary"
              />
            }
            label={
              <span style={{ color: theme.customVariables.appWhiteSmoke }}>
                Notify on MP4 Conversion Status
              </span>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={notifications.userConnectionStatus}
                onChange={(e) =>
                  handleUpdateSetting("notifications", {
                    ...notifications,
                    userConnectionStatus: e.target.checked,
                  })
                }
                color="primary"
              />
            }
            label={
              <span style={{ color: theme.customVariables.appWhiteSmoke }}>
                Notify on User Connection Status
              </span>
            }
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={!!notifications.youtubeDownloadStatus}
                onChange={(e) =>
                  handleUpdateSetting("notifications", {
                    ...notifications,
                    youtubeDownloadStatus: e.target.checked,
                  })
                }
                color="primary"
              />
            }
            label={
              <span style={{ color: theme.customVariables.appWhiteSmoke }}>
                Notify on YouTube Download Status
              </span>
            }
          />
        </Box>
      </CardContent>
    </Card>
  );
};
