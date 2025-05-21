import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
} from "@mui/material";
import theme from "../../theme";

interface CustomFolderListPanelProps {
  folders:
    | {
        id: string;
        name: string;
        folderPath: string;
      }[]
    | undefined;
  selectedFolder: {
    id: string;
    name: string;
    folderPath: string;
  } | null;
  setSelectedFolder: (folder: {
    id: string;
    name: string;
    folderPath: string;
  }) => void;
  updateFolder: (id: string, folder: string) => void;
}

export const CustomFolderListPanel = ({
  folders,
  selectedFolder,
  setSelectedFolder,
  updateFolder,
}: CustomFolderListPanelProps) => {
  return (
    <Paper
      sx={{
        minWidth: 220,
        maxWidth: 300,
        flex: "0 0 220px",
        backgroundColor: theme.palette.primary.main,
      }}
    >
      <List
        sx={{
          color: theme.customVariables.appWhiteSmoke,
          bgcolor: theme.palette.primary.main,
        }}
      >
        {folders?.map((folder) => (
          <ListItem key={folder.id} disablePadding>
            <ListItemButton
              selected={selectedFolder?.id === folder.id}
              onClick={() => setSelectedFolder(folder)}
              sx={{
                color: theme.customVariables.appWhiteSmoke,
                "&.Mui-selected": {
                  backgroundColor: theme.palette.primary.dark,
                  color: theme.customVariables.appWhiteSmoke,
                },
                "&:hover": {
                  backgroundColor: theme.palette.primary.light,
                  color: theme.customVariables.appWhiteSmoke,
                },
              }}
            >
              <ListItemText
                primary={folder.name}
                slotProps={{
                  primary: {
                    sx: { color: theme.customVariables.appWhiteSmoke },
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
