import React, { useEffect, useState } from "react";
import { useSettings } from "../../hooks/useSettings";
import { Container, Box, Tab, Tabs } from "@mui/material";
import { CustomFolderModel } from "../../../models/custom-folder";
import { useConfirmationDialog } from "../../hooks/useConfirmationDialog";
import { SettingsModel } from "../../../models/settings.model";
import { CustomFoldersSettings } from "./CustomFoldersSettings";
import { GeneralSettings } from "./GeneralSettings";
import { a11yProps, CustomTabPanel } from "../common/TabPanel";
import useSelectFolder from "../../hooks/useSelectFolder";
import ConfirmationDialog from "../common/ConfirmationDialog";
import { useMovies } from "../../hooks/useMovies";
import { useTvShows } from "../../hooks/useTvShows";
import { useSnackbar } from "../../contexts/SnackbarContext";

export const SettingsPage: React.FC = () => {
  const { settings, setSetting } = useSettings();
  const { getMovies } = useMovies();
  const { getTvShows } = useTvShows();
  const [movieFolderPath, setMovieFolderPath] = useState("");
  const [tvShowsFolderPath, setTvShowsFolderPath] = useState("");
  const [continuousPlay, setContinuousPlay] = useState(false);
  const [port, setPort] = useState("");
  const [customFolders, setCustomFolders] = useState<CustomFolderModel[]>([]);
  const [currentTabValue, setCurrentTabValue] = useState(0);
  const { selectFolder } = useSelectFolder();
  const { isOpen, openDialog, closeDialog, message, setMessage } =
    useConfirmationDialog();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    if (settings.movieFolderPath) setMovieFolderPath(settings.movieFolderPath);
    if (settings.tvShowsFolderPath)
      setTvShowsFolderPath(settings.tvShowsFolderPath);
    if (settings.port) setPort(settings.port);
    if (settings.folders)
      setCustomFolders(settings.folders as CustomFolderModel[]);
    if (settings.continuousPlay) setContinuousPlay(settings.continuousPlay);
  }, [settings]);

  const handleFolderUpdate = async (
    onFolderPathSelected: (folderPath: string) => Promise<void>
  ) => {
    const folderPath = await selectFolder();
    if (folderPath) await onFolderPathSelected(folderPath);
  };

  const handleFolderSelection = async (settingName: keyof SettingsModel) => {
    await handleFolderUpdate(async (folderPath) => {
      await setSetting(settingName, folderPath);
      showSnackbar("Setting updated successfully", "success");
      if (settingName === "movieFolderPath") getMovies();
      else if (settingName === "tvShowsFolderPath") getTvShows();
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
      showSnackbar("Custom Folder Updated", "success");
    });
  };

  const handleUpdateSetting = async (
    settingName: keyof SettingsModel,
    value: any
  ) => {
    try {
      if (settingName === "port") {
        const portNumber = parseInt(value, 10);
        if (isNaN(portNumber) || portNumber < 1024 || portNumber > 65535) {
          showSnackbar("Port number must be between 1024 and 65535", "error");
          return;
        }
        await setSetting(settingName, value);
        showSnackbar(
          "Port updated successfully. Please restart for change to take effect",
          "success",
          "Restart",
          () => window.mainUtilAPI.restart()
        );
      } else {
        await setSetting(settingName, value);
        showSnackbar("Setting updated successfully", "success");
      }
    } catch (error) {
      showSnackbar("Failed to update setting", "error");
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
    showSnackbar("Folder name updated successfully", "success");
  };

  const saveNewFolder = async (newFolder: CustomFolderModel) => {
    const updatedFolders = [...customFolders, newFolder];
    await setSetting("folders", updatedFolders);
    showSnackbar("New folder added successfully", "success");
  };

  const handleDeleteFolder = async (folderId: string) => {
    setMessage("Are you sure you want to delete this folder?");
    const dialogDecision = await openDialog();
    if (dialogDecision === "Ok") {
      const updatedFolders = customFolders.filter(
        (folder) => folder.id !== folderId
      );
      await setSetting("folders", updatedFolders);
      showSnackbar("Folder deleted successfully", "success");
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
              sx={{ "&:not(.Mui-selected)": { color: "gray" } }}
            />
            <Tab
              label="Custom Folders"
              {...a11yProps(1)}
              sx={{ "&:not(.Mui-selected)": { color: "gray" } }}
            />
          </Tabs>
        </Box>
        <CustomTabPanel value={currentTabValue} index={0}>
          <GeneralSettings
            continuousPlay={continuousPlay}
            movieFolderPath={movieFolderPath}
            tvShowsFolderPath={tvShowsFolderPath}
            port={port}
            handleFolderSelection={handleFolderSelection}
            handleUpdateSetting={handleUpdateSetting}
            handleContinuousPlayChange={(value) => {
              setContinuousPlay(value);
              handleUpdateSetting("continuousPlay", value);
            }}
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
      <ConfirmationDialog
        open={isOpen}
        message={message}
        handleClose={closeDialog}
      />
    </>
  );
};
