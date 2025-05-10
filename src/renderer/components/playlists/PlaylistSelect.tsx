import { PlaylistModel } from "../../../models/playlist.model";
import { VideoDataModel } from "../../../models/videoData.model";
import theme from "../../theme";
import { Checkbox, FormControlLabel, FormGroup, Box } from "@mui/material";

export const PlaylistSelect = ({
  video,
  playlists,
  updatePlaylist,
}: {
  video: VideoDataModel;
  playlists: PlaylistModel[];
  updatePlaylist: (playlist: PlaylistModel) => void;
}) => {
  const videoPath = video?.filePath;

  const handleCheckboxChange = (playlist: PlaylistModel, checked: boolean) => {
    if (!videoPath) return;
    let updatedPlaylist: PlaylistModel;
    if (checked) {
      // Add videoPath if not already present
      if (!playlist.videos.includes(videoPath)) {
        updatedPlaylist = {
          ...playlist,
          videos: [...playlist.videos, videoPath],
        };
      } else {
        updatedPlaylist = playlist;
      }
      console.log(`Added "${videoPath}" to playlist "${playlist.name}"`);
    } else {
      // Remove videoPath if present
      updatedPlaylist = {
        ...playlist,
        videos: playlist.videos.filter((v) => v !== videoPath),
      };
      console.log(`Removed "${videoPath}" from playlist "${playlist.name}"`);
    }
    updatePlaylist(updatedPlaylist);
    // Backend call goes here
  };

  return (
    <Box className="p-4">
      <FormGroup>
        {playlists?.map((playlist) => {
          const isChecked = !!videoPath && playlist.videos.includes(videoPath);
          return (
            <FormControlLabel
              key={playlist.id}
              control={
                <Checkbox
                  checked={isChecked}
                  onChange={(e) =>
                    handleCheckboxChange(playlist, e.target.checked)
                  }
                  sx={{
                    marginRight: 1,
                    color: theme.palette.primary.main,
                  }}
                />
              }
              label={playlist.name}
              sx={{
                "& .MuiFormControlLabel-label": {
                  color: theme.customVariables.appWhiteSmoke, // Change to your desired color
                },
              }}
            />
          );
        })}
      </FormGroup>
    </Box>
  );
};
