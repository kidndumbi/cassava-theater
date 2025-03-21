import { IconButton, Box } from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import theme from "../../../theme";
import { AppSlider } from "../../common/AppSlider";
import { useLocalStorage } from "@uidotdev/usehooks";

export const VolumeControl = () => {
  const [vol, setVolume] = useLocalStorage("volume", 1);

  return (
    <Box className="group ml-4 flex items-center justify-center">
      <Box className="mr-2 hidden w-20 group-hover:block">
        <AppSlider
          max={1}
          step={0.01}
          value={vol}
          onChange={(event, newValue) => {
            setVolume(newValue as number);
          }}
        ></AppSlider>
      </Box>

      <IconButton
        aria-label="toggle playback"
        // onClick={() => onPlayPause(!paused)}
        sx={{
          color: theme.customVariables.appWhite,
          width: 48,
          height: 48,
        }}
      >
        <VolumeUpIcon sx={{ fontSize: 40 }} />
      </IconButton>
    </Box>
  );
};
