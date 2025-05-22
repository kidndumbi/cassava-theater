import { Box } from "@mui/material";
import theme from "../../theme";
import { YoutubeDownloadQueueItem } from "../../../main/services/youtube.service";

export const YoutubeDownloadProgressDetails = ({
  item,
}: {
  item: YoutubeDownloadQueueItem;
}) => (
  <Box
    className="flex flex-col gap-1"
    sx={{
      p: 1,
      borderRadius: 1,
      backgroundColor: theme.customVariables.appDark,
      color: theme.customVariables.appWhiteSmoke,
      minWidth: 0,
      flex: 1,
    }}
  >
    <Box
      sx={{
        fontWeight: 600,
        fontSize: "1rem",
        color: theme.customVariables.appWhiteSmoke,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      title={item.title}
    >
      {item.title}
    </Box>
    <Box
      sx={{
        fontSize: "0.85rem",
        color: theme.palette.primary.light,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      title={item.url}
    >
      {item.url}
    </Box>
    <Box
      sx={{
        fontSize: "0.8rem",
        color: theme.palette.grey[400],
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
      title={item.destinationPath}
    >
      {item.destinationPath}
    </Box>
  </Box>
);
