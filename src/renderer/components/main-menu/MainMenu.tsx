import React from "react";
import { Box, Button, List } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { MenuItem } from "../../../models/menu-item.model";
import { SettingsModel } from "../../../models/settings.model";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { useSetSetting } from "../../hooks/settings/useSetSetting";
import { DraggableMenuItem } from "./DraggableMenuItem";
import buttonStyle from "./buttonStyle";
import { AppDrop } from "../common/AppDrop";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { useSnackbar } from "../../contexts/SnackbarContext";

interface MainMenuProps {
  menuItems: MenuItem[];
  activeMenuItem: MenuItem;
  onActiveMenuItemChange: (menuItem: MenuItem) => void;
  onSettingsClick: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({
  menuItems,
  activeMenuItem,
  onActiveMenuItemChange,
  onSettingsClick,
}) => {
  const { data: { folders } = {} as SettingsModel } = useGetAllSettings();
  const { mutateAsync: setSetting } = useSetSetting();
  const { openDialog } = useConfirmation();
  const { showSnackbar } = useSnackbar();

  const [draggingIdx, setDraggingIdx] = React.useState<number | null>(null);

  const handleButtonClick = (item: MenuItem) => {
    onActiveMenuItemChange(item);
    item.handler(item);
  };

  const switchCustomFolderPosition = (id1: string, id2: string) => {
    const folder1 = folders?.find((item) => item.id === id1);
    const folder2 = folders?.find((item) => item.id === id2);
    if (folder1 && folder2 && Array.isArray(folders)) {
      const index1 = folders.indexOf(folder1);
      const index2 = folders.indexOf(folder2);
      const newFolders = [...folders];
      newFolders[index1] = folder2;
      newFolders[index2] = folder1;
      setSetting({
        key: "folders",
        value: newFolders,
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    const dialogDecision = await openDialog(
      undefined,
      undefined,
      "Are you sure you want to delete this folder?",
    );
    if (dialogDecision === "Ok") {
      const updatedFolders = (folders || []).filter(
        (folder) => folder.id !== folderId,
      );
      await setSetting({
        key: "folders",
        value: updatedFolders,
      });
      showSnackbar("Folder deleted successfully", "success");
    }
  };

  return (
    <>
      <List sx={{ width: "130px", borderRight: "1px solid #ccc" }}>
        {menuItems.map((menu, idx) => (
          <DraggableMenuItem
            key={menu.label}
            menu={menu}
            idx={idx}
            activeMenuItem={activeMenuItem}
            handleButtonClick={handleButtonClick}
            switchCustomFolderPosition={switchCustomFolderPosition}
            dragging={(isDragging: boolean, dragIdx: number) => {
              if (isDragging) {
                setDraggingIdx(dragIdx);
              } else {
                setDraggingIdx((current) =>
                  current === dragIdx ? null : current,
                );
              }
            }}
          />
        ))}

        <Button style={{ ...buttonStyle }} onClick={onSettingsClick}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <SettingsIcon />
            <span>Settings</span>
          </Box>
        </Button>
      </List>

      {draggingIdx !== null && (
        <AppDrop
          itemDroped={(item: {
            index: number;
            type: string;
            menu: MenuItem;
          }) => {
            handleDeleteFolder(item.menu.id);
          }}
          accept={["MENUITEM"]}
        />
      )}
    </>
  );
};

export default MainMenu;
