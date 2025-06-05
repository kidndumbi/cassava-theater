import { Box, Menu, MenuItem, SxProps, Theme } from "@mui/material";
import AppIconButton from "../common/AppIconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { ListDisplayType } from "../../../models/playlist.model";
import ArtTrackIcon from "@mui/icons-material/ArtTrack";
import theme from "../../../renderer/theme";
import ListIcon from "@mui/icons-material/List";
import GridViewIcon from "@mui/icons-material/GridView";
import RestoreIcon from "@mui/icons-material/Restore";
import { useState } from "react";
import { VideoDataModel } from "../../../models/videoData.model";

interface SelectedCustomFolderToolbarProps {
  displayType: ListDisplayType;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  onUpdateVideoJsonData: (data: VideoDataModel) => void;
  onResetTime: () => void;
}

export const SelectedCustomFolderToolbar = ({
  displayType: initialDisplayType,
  onDelete,
  onEdit,
  onRefresh,
  onUpdateVideoJsonData,
  onResetTime,
}: SelectedCustomFolderToolbarProps) => {
  const [displayTypeEl, setDisplayTypeEl] = useState<null | HTMLElement>(null);
  const [displayType, setDisplayType] =
    useState<ListDisplayType>(initialDisplayType);

  const menuPaperStyles: SxProps<Theme> = {
    "& .MuiPaper-root": {
      backgroundColor: theme.customVariables.appDark,
    },
  };

  const menuItemStyles = (color?: string): SxProps<Theme> => ({
    color: color || theme.customVariables.appWhiteSmoke,
  });

  const handleDisplayTypeChange = (type: ListDisplayType) => {
    setDisplayType(type);
    onUpdateVideoJsonData({
      display: type,
    });

    setDisplayTypeEl(null);
  };

  return (
    <Box className="flex items-center gap-2 pb-3">
      <AppIconButton tooltip="Rename folder" onClick={onEdit}>
        <EditIcon />
      </AppIconButton>
      <AppIconButton tooltip="refresh folder" onClick={onRefresh}>
        <RefreshIcon />
      </AppIconButton>

      <AppIconButton
        tooltip="Display"
        onClick={(event) => setDisplayTypeEl(event.currentTarget)}
      >
        <ArtTrackIcon />
      </AppIconButton>
      <Menu
        anchorEl={displayTypeEl}
        open={Boolean(displayTypeEl)}
        onClose={() => setDisplayTypeEl(null)}
        sx={menuPaperStyles}
      >
        {(["grid", "list"] as ListDisplayType[]).map((type) => {
          return (
            <MenuItem
              key={type}
              selected={displayType === type}
              sx={{
                ...menuItemStyles(),
                fontWeight: displayType === type ? "bold" : "normal",
                backgroundColor:
                  displayType === type ? theme.palette.primary.dark : undefined,
                borderRadius: displayType === type ? 2 : undefined,
                "&:hover": {
                  backgroundColor: theme.palette.primary.main,
                },
              }}
              onClick={() => handleDisplayTypeChange(type)}
            >
              <Box className="flex items-center gap-2">
                {type === "grid" ? (
                  <GridViewIcon fontSize="small" />
                ) : (
                  <ListIcon fontSize="small" />
                )}
                <span>{type === "grid" ? "Grid View" : "List View"}</span>
              </Box>
            </MenuItem>
          );
        })}
      </Menu>
      <AppIconButton tooltip="Reset time" onClick={onResetTime}>
        <RestoreIcon />
      </AppIconButton>
      <AppIconButton tooltip="Delete folder" onClick={onDelete}>
        <DeleteIcon />
      </AppIconButton>
    </Box>
  );
};
