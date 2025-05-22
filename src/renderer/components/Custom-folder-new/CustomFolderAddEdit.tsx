import { Button, Paper, Stack, Box } from "@mui/material";
import { CustomFolderModel } from "../../../models/custom-folder";
import { AppTextField } from "../common/AppTextField";
import { Folder as FolderIcon } from "@mui/icons-material";
import theme from "../../theme";
import { useState } from "react";
import { selectFolder } from "../../util/helperFunctions";
import { AppButton } from "../common/AppButton";
import { v4 as uuidv4 } from "uuid";

export const CustomFolderAddEdit = ({
  folder,
  onEdit,
  onAdd,
}: {
  folder?: CustomFolderModel;
  onEdit?: (changes: Partial<CustomFolderModel>) => void;
  onAdd?: (newFolder: CustomFolderModel) => void;
}) => {
  const isEdit = !!folder;
  const [folderName, setFolderName] = useState(folder?.name || "");
  const [folderPath, setFolderPath] = useState(folder?.folderPath || "");

  const isSaveDisabled =
    !folderName.trim() ||
    !folderPath.trim() ||
    (isEdit && folderName === folder?.name && folderPath === folder?.folderPath);

  const handleSave = () => {
    if (isEdit && onEdit) {
      const changes: Partial<CustomFolderModel> = {};
      if (folderName !== folder?.name) changes.name = folderName;
      if (folderPath !== folder?.folderPath) changes.folderPath = folderPath;
      onEdit(changes);
    } else if (!isEdit && onAdd) {
      onAdd({
        id: uuidv4(),
        name: folderName,
        folderPath: folderPath,
      });
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 2.5,
        mb: 2,
        p: 3,
        backgroundColor: theme.customVariables.appDarker,
        borderRadius: 2,
        boxShadow: "none",
        border: "none",
        width: "600px",
      }}
    >
      <Stack spacing={2}>
        <AppTextField
          label="Folder Name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          theme={theme}
        />
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ flex: 1 }}>
            <AppTextField
              label="Folder Path"
              value={folderPath}
              theme={theme}
              readOnly={true}
            />
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => {
              const folderPath = await selectFolder();
              if (folderPath) {
                setFolderPath(folderPath);
              }
            }}
            sx={{ minWidth: 40, px: 1 }}
          >
            <FolderIcon />
          </Button>
        </Stack>
        <Box display="flex" justifyContent="flex-end">
          <AppButton
            color="primary"
            disabled={isSaveDisabled}
            onClick={handleSave}
          >
            {isEdit ? "Save" : "Add"}
          </AppButton>
        </Box>
      </Stack>
    </Paper>
  );
};
