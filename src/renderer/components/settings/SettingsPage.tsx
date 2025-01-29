import React, { useEffect, useState } from "react";
import { useSettings } from "../../hooks/useSettings";
import { Container, Snackbar, Alert, Box, Tab, Tabs } from "@mui/material";
// import { useMovies } from "../../hooks/useMovies";
// import { useTvShows } from "../../hooks/useTvShows";
import { CustomFolderModel } from "../../../models/custom-folder";

// import useSelectFolder from "../../hooks/useSelectFolder";
import { useConfirmationDialog } from "../../hooks/useConfirmationDialog";
// import ConfirmationDialog from "../common/ConfirmationDialog";
import { SettingsModel } from "../../../models/settings.model";
import { CustomFoldersSettings } from "./CustomFoldersSettings";
import { GeneralSettings } from "./GeneralSettings";
import { a11yProps, CustomTabPanel } from "../common/TabPanel";
import useSelectFolder from "../../hooks/useSelectFolder";
import ConfirmationDialog from "../common/ConfirmationDialog";


export const SettingsPage: React.FC = () => {
  const { settings, setSetting } = useSettings();
//   const { getMovies } = useMovies();
//   const { getTvShows } = useTvShows();
  const [movieFolderPath, setMovieFolderPath] = useState("");
  const [tvShowsFolderPath, setTvShowsFolderPath] = useState("");
  const [continuousPlay, setContinuousPlay] = useState(false);
  const [appUrl, setAppUrl] = useState("");
  const [customFolders, setCustomFolders] = useState<CustomFolderModel[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [currentTabValue, setCurrentTabValue] = useState(0);
  const { selectFolder } = useSelectFolder();
  const { isOpen, openDialog, closeDialog, message, setMessage } =
    useConfirmationDialog();

  useEffect(() => {
    if (settings.movieFolderPath) {
      setMovieFolderPath(settings.movieFolderPath);
    }
    if (settings.tvShowsFolderPath) {
      setTvShowsFolderPath(settings.tvShowsFolderPath);
    }
    if (settings.appUrl) {
      setAppUrl(settings.appUrl);
    }
    if (settings.folders) {
      const folders = settings.folders as CustomFolderModel[];
      setCustomFolders(folders);
    }
    if (settings.continuousPlay) {
      setContinuousPlay(settings.continuousPlay);
    }
  }, [settings]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleFolderUpdate = async (
    onFolderPathSelected: (folderPath: string) => Promise<void>
  ) => {
    const folderPath = await selectFolder();
    if (folderPath) {
      await onFolderPathSelected(folderPath);
    }
  };

  const handleFolderSelection = async (settingName: keyof SettingsModel) => {
    await handleFolderUpdate(async (folderPath) => {
      await setSetting(settingName, folderPath);
      handleSnackbar("Setting updated successfully", "success");
      if (settingName === "movieFolderPath") {
        // getMovies();
      } else if (settingName === "tvShowsFolderPath") {
        // getTvShows();
      }
    });
  };

  const handleCustomFolderFolderSelection = async (
    customFolder: CustomFolderModel
  ) => {
    await handleFolderUpdate(async (folderPath) => {
      const updatedFolder = { ...customFolder, folderPath };
      const updatedFolders = customFolders.map((f) =>
        f.id === customFolder.id ? updatedFolder : f
      );
      await setSetting("folders", updatedFolders);
      handleSnackbar("Custom Folder Updated", "success");
    });
  };

  const handleUpdateSetting = async (settingName: keyof SettingsModel, value: any) => {
    try {
      await setSetting(settingName, value);
      handleSnackbar("Setting updated successfully", "success");
    } catch (error) {
      handleSnackbar("Failed to update setting", "error");
    }
  };

  const handleSaveFolderName = async (
    customFolder: CustomFolderModel,
    newName: string
  ) => {
    const updatedFolder = { ...customFolder, name: newName };
    const updatedFolders = customFolders.map((f) =>
      f.id === customFolder.id ? updatedFolder : f
    );
    await setSetting("folders", updatedFolders);
    handleSnackbar("Folder name updated successfully", "success");
  };

  const saveNewFolder = async (newFolder: CustomFolderModel) => {
    const updatedFolders = [...customFolders, newFolder];
    await setSetting("folders", updatedFolders);
    handleSnackbar("New folder added successfully", "success");
  };

  const handleDeleteFolder = async (folderId: string) => {
    setMessage("Are you sure you want to delete this folder?");
    const dialogDecision = await openDialog();
    if (dialogDecision === "Ok") {
      const updatedFolders = customFolders.filter(
        (folder) => folder.id !== folderId
      );
      await setSetting("folders", updatedFolders);
      handleSnackbar("Folder deleted successfully", "success");
    }
  };

  const onTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTabValue(newValue);
  };

  return (
    <>
      <Container>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={currentTabValue}
            onChange={onTabChange}
            aria-label="settings tabs"
          >
            <Tab
              label="General"
              {...a11yProps(0)}
              sx={{
                "&:not(.Mui-selected)": {
                  color: "gray", // Set the color for inactive tabs
                },
              }}
            />
            <Tab
              label="Custom Folders"
              {...a11yProps(1)}
              sx={{
                "&:not(.Mui-selected)": {
                  color: "gray", // Set the color for inactive tabs
                },
              }}
            />
          </Tabs>
        </Box>
        <CustomTabPanel value={currentTabValue} index={0}>
          <GeneralSettings
            continuousPlay={continuousPlay}
            movieFolderPath={movieFolderPath}
            tvShowsFolderPath={tvShowsFolderPath}
            appUrl={appUrl}
            handleFolderSelection={handleFolderSelection}
            handleUpdateSetting={handleUpdateSetting}
            handleContinuousPlayChange={(value) => { 
              setContinuousPlay(value);
              handleUpdateSetting("continuousPlay", value)} }
          />
        </CustomTabPanel>
        <CustomTabPanel value={currentTabValue} index={1}>
          <CustomFoldersSettings
            customFolders={customFolders}
            handleCustomFolderFolderSelection={
              handleCustomFolderFolderSelection
            }
            handleSaveFolderName={handleSaveFolderName}
            saveNewFolder={saveNewFolder}
            handleDeleteFolder={handleDeleteFolder}
          />
        </CustomTabPanel>
      </Container>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <ConfirmationDialog
        open={isOpen}
        message={message}
        handleClose={closeDialog}
      />
    </>
  );
};
