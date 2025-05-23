import { Avatar, Box } from "@mui/material";
import theme from "../../theme";
import { YoutubeDownloadQueueItem } from "../../../main/services/youtube.service";

export const YoutubeDownloadProgressDetails = ({
  item,
}: {
  item: YoutubeDownloadQueueItem;
}) => (
  <Box className="flex gap-1">
    <Avatar
      variant="rounded"
      src={item.poster}
      alt={item.title}
      sx={{ width: 80, height: 80 }}
    />
    <Box
      className="flex min-w-0 flex-1 flex-col gap-1 rounded p-1"
      sx={{
        backgroundColor: theme.customVariables.appDark,
        color: theme.customVariables.appWhiteSmoke,
      }}
    >
      <Box
        className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold"
        sx={{
          color: theme.customVariables.appWhiteSmoke,
        }}
        title={item.title}
      >
        {item.title}
      </Box>
      <Box
        className="overflow-hidden text-ellipsis whitespace-nowrap text-sm"
        sx={{
          color: theme.palette.primary.light,
        }}
        title={item.url}
      >
        {item.url}
      </Box>
      <Box
        className="overflow-hidden text-ellipsis whitespace-nowrap text-xs"
        sx={{
          color: theme.palette.grey[400],
        }}
        title={item.destinationPath}
      >
        {item.destinationPath}
      </Box>
    </Box>
  </Box>
);
