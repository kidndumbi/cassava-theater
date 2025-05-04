import React, { useState } from "react";
import { Container, Box, Tab, Tabs } from "@mui/material";
import { CustomFolderModel } from "../../../models/custom-folder";
import { SettingsModel } from "../../../models/settings.model";
import { CustomFoldersSettings } from "./CustomFoldersSettings";
import { GeneralSettings } from "./GeneralSettings";
import { a11yProps, CustomTabPanel } from "../common/TabPanel";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { selectFolder } from "../../util/helperFunctions";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { useSetSetting } from "../../hooks/settings/useSetSetting";

export const SettingsPage: React.FC = () => {
  const { data: settings = {} as SettingsModel } = useGetAllSettings();
  const { mutateAsync: setSetting } = useSetSetting();
  const [currentTabValue, setCurrentTabValue] = useState(0);

  const { openDialog, setMessage } = useConfirmation();
  const { showSnackbar } = useSnackbar();

  const handleFolderUpdate = async (
    onFolderPathSelected: (folderPath: string) => Promise<void>,
  ) => {
    const folderPath = await selectFolder();
    if (folderPath) await onFolderPathSelected(folderPath);
  };

  const handleFolderSelection = async (settingName: keyof SettingsModel) => {
    await handleFolderUpdate(async (folderPath) => {
      await setSetting({
        key: settingName,
        value: folderPath,
      });
      showSnackbar("Setting updated successfully", "success");
    });
  };

  const handleUpdateSetting = async (
    settingName: keyof SettingsModel,
    value: SettingsModel[keyof SettingsModel],
  ) => {
    try {
      if (settingName === "port") {
        const portNumber = parseInt(value as string, 10);
        if (isNaN(portNumber) || portNumber < 1024 || portNumber > 65535) {
          showSnackbar("Port number must be between 1024 and 65535", "error");
          return;
        }
        await setSetting({ key: settingName, value });
        showSnackbar(
          "Port updated successfully. Please restart for change to take effect",
          "success",
          "Restart",
          () => window.mainUtilAPI.restart(),
        );
      } else {
        await setSetting({ key: settingName, value });
        showSnackbar("Setting updated successfully", "success");
      }
    } catch {
      showSnackbar("Failed to update setting", "error");
    }
  };

  const handleCustomFolderFolderSelection = async (
    customFolder: CustomFolderModel,
  ) => {
    await handleFolderUpdate(async (folderPath) => {
      const updatedFolder = { ...customFolder, folderPath };
      const updatedFolders = (settings.folders || []).map((f) =>
        f.id === customFolder.id ? updatedFolder : f,
      );
      await setSetting({
        key: "folders",
        value: updatedFolders,
      });
      showSnackbar("Custom Folder Updated", "success");
    });
  };

  const handleSaveFolderName = async (
    customFolder: CustomFolderModel,
    newName: string,
  ) => {
    const updatedFolder = { ...customFolder, name: newName };
    const updatedFolders = (settings.folders || []).map((f) =>
      f.id === customFolder.id ? updatedFolder : f,
    );
    await setSetting({
      key: "folders",
      value: updatedFolders,
    });
    showSnackbar("Folder name updated successfully", "success");
  };

  const saveNewFolder = async (newFolder: CustomFolderModel) => {
    const updatedFolders = [...(settings.folders || []), newFolder];
    await setSetting({
      key: "folders",
      value: updatedFolders,
    });
    showSnackbar("New folder added successfully", "success");
  };

  const handleDeleteFolder = async (folderId: string) => {
    setMessage("Are you sure you want to delete this folder?");
    const dialogDecision = await openDialog();
    if (dialogDecision === "Ok") {
      const updatedFolders = (settings.folders || []).filter(
        (folder) => folder.id !== folderId,
      );
      await setSetting({
        key: "folders",
        value: updatedFolders,
      });
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
            settings={settings}
            handleFolderSelection={handleFolderSelection}
            handleUpdateSetting={handleUpdateSetting}
          />
        </CustomTabPanel>
        <CustomTabPanel value={currentTabValue} index={1}>
          <CustomFoldersSettings
            customFolders={settings.folders || []}
            handleCustomFolderFolderSelection={
              handleCustomFolderFolderSelection
            }
            handleSaveFolderName={handleSaveFolderName}
            saveNewFolder={saveNewFolder}
            handleDeleteFolder={handleDeleteFolder}
          />
        </CustomTabPanel>
      </Container>
    </>
  );
};
