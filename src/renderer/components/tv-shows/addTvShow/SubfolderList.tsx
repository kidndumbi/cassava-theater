import { Box, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import { AppTextField } from "../../common/AppTextField";
import theme from "../../../theme";
import AppIconButton from "../../common/AppIconButton";

type SubfolderListProps = {
  subfolders: string[];
  onSubfolderChange: (index: number, value: string) => void;
  onRemoveSubfolder: (index: number) => void;
  onAddSubfolder: () => void;
};

export const SubfolderList = ({
  subfolders,
  onSubfolderChange,
  onRemoveSubfolder,
  onAddSubfolder,
}: SubfolderListProps) => (
  <>
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
      <Typography
        variant="h6"
        sx={{ color: theme.customVariables.appWhiteSmoke }}
      >
        Subfolders
      </Typography>
      <AppIconButton tooltip="Add Subfolder" onClick={onAddSubfolder}>
        <AddIcon />
      </AppIconButton>
    </Box>

    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {subfolders.map((subfolder, index) => (
        <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <AppTextField
            label={`Subfolder ${index + 1}`}
            value={subfolder}
            onChange={(e) => onSubfolderChange(index, e.target.value)}
            theme={theme}
          />
          <AppIconButton
            tooltip="Remove Subfolder"
            onClick={() => onRemoveSubfolder(index)}
            color="error"
          >
            <DeleteIcon />
          </AppIconButton>
        </Box>
      ))}
    </Box>
  </>
);
