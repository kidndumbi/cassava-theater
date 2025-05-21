import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
} from "@mui/material";
import theme from "../../theme";

interface ToolListPanelProps {
  tools: { id: string; name: string }[] | undefined;
  selectedTool: { id: string; name: string } | null;
  setSelectedTool: (tool: { id: string; name: string }) => void;
}

export const ToolListPanel = ({
  tools,
  selectedTool,
  setSelectedTool,
}: ToolListPanelProps) => {
  return (
    <Paper
      sx={{
        minWidth: 220,
        maxWidth: 300,
        flex: "0 0 220px",
        backgroundColor: theme.customVariables.appDark,
      }}
    >
      <List
        sx={{
          color: theme.customVariables.appWhiteSmoke,
          bgcolor: theme.customVariables.appDark,
        }}
      >
        {tools?.map((tool) => (
          <ListItem key={tool.id} disablePadding>
            <ListItemButton
              selected={selectedTool?.id === tool.id}
              onClick={() => setSelectedTool(tool)}
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
                primary={tool.name}
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
