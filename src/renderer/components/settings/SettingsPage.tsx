import React, { useState } from "react";
import { Container, Box, Tab, Tabs, Alert } from "@mui/material";
import { SettingsModel } from "../../../models/settings.model";
import { GeneralSettings } from "./GeneralSettings";
import { a11yProps, CustomTabPanel } from "../common/TabPanel";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { selectFolder } from "../../util/helperFunctions";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { useSetSetting } from "../../hooks/settings/useSetSetting";
import WarningIcon from "@mui/icons-material/Warning";

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
    confirmationtext?: string,
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
        if (confirmationtext) {
          setMessage(
            <Alert icon={<WarningIcon fontSize="inherit" />} severity="warning">
              {confirmationtext}
            </Alert>,
          );
          const dialogDecision = await openDialog();
          if (dialogDecision === "Ok") {
            await setSetting({ key: settingName, value });
            showSnackbar("Setting updated successfully", "success");
          }
        } else {
          await setSetting({ key: settingName, value });
          showSnackbar("Setting updated successfully", "success");
        }
      }
    } catch {
      showSnackbar("Failed to update setting", "error");
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
          </Tabs>
        </Box>
        <CustomTabPanel value={currentTabValue} index={0}>
          <GeneralSettings
            settings={settings}
            handleFolderSelection={handleFolderSelection}
            handleUpdateSetting={handleUpdateSetting}
          />
        </CustomTabPanel>
      </Container>
    </>
  );
};
