import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
} from "@mui/material";
import theme from "../../theme";

interface AppListPanelProps {
  items: { id: string; name: string }[] | undefined;
  selectedItem: { id: string; name: string } | null;
  setSelectedItem: (item: { id: string; name: string }) => void;
}

export const AppListPanel = ({
  items,
  selectedItem,
  setSelectedItem,
}: AppListPanelProps) => {
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
        {items?.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={selectedItem?.id === item.id}
              onClick={() => setSelectedItem(item)}
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
                primary={item.name}
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
