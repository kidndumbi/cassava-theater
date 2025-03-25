import { IconButton, Box } from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import theme from "../../../theme";
import { AppSlider } from "../../common/AppSlider";
import { useLocalStorage, usePrevious } from "@uidotdev/usehooks";

export const VolumeControl = () => {
  const [volume, setVolume] = useLocalStorage("volume", 1);
  const previousVolume = usePrevious(volume);

  return (
    <Box className="group ml-4 flex items-center justify-center">
      <Box className="mr-2 hidden w-20 group-hover:block">
        <AppSlider
          max={1}
          step={0.01}
          value={volume}
          onChange={(event, newValue) => {
            setVolume(newValue as number);
          }}
        ></AppSlider>
      </Box>

      <IconButton
        aria-label="toggle playback"
        onClick={() => {
          setVolume((prevVolume) => (prevVolume === 0 ? previousVolume : 0));
        }}
        sx={{
          color: theme.customVariables.appWhite,
          width: 48,
          height: 48,
        }}
      >
        {volume === 0 ? (
          <VolumeOffIcon sx={{ fontSize: 40 }} />
        ) : (
          <VolumeUpIcon sx={{ fontSize: 40 }} />
        )}
      </IconButton>
    </Box>
  );
};
