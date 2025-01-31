import React, { useEffect, useState } from "react";
import { Modal, Typography, Paper, Box, Button } from "@mui/material";
import theme from "../../theme";
import { useTvShows } from "../../hooks/useTvShows";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { Season, TvShowDetails } from "../../../models/tv-show-details.model";
import { getFilename } from "../../util/helperFunctions";

interface TvShowSuggestionsModalProps {
  open: boolean;
  handleClose: () => void;
  fileName: string;
  id?: string;
  handleSelectTvShow: (tv_show_details: TvShowDetails) => void;
}

const TvShowSuggestionsModal: React.FC<TvShowSuggestionsModalProps> = ({
  open,
  handleClose,
  fileName,
  id,
  handleSelectTvShow,
}) => {
  const {
    tvShowSuggestions,
    getTvShowSuggestions,
    resetTvShowSuggestions,
    getTvShowById,
  } = useTvShows();

  const { getTmdbImageUrl } = useTmdbImageUrl();
  const [seasons, setSeasons] = useState<Season[]>([]);

  useEffect(() => {
    if (fileName && open) {
      resetTvShowSuggestions();
      getTvShowSuggestions(getFilename(fileName));
      if (id) {
        getTvShowById(id, (data) => {
          setSeasons(data.seasons);
        });
      }
    }
  }, [fileName, open, id]);

  return (
    <Modal open={open} onClose={handleClose}>
      <Paper
        sx={{
          maxHeight: "80%",
          overflowY: "auto",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          bgcolor: theme.customVariables.appDark,
          color: theme.customVariables.appWhiteSmoke,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" component="h2" color="primary">
          TV Show Suggestions
        </Typography>
        <Typography sx={{ mt: 2, color: theme.customVariables.appWhiteSmoke }}>
          {fileName}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mt: 2,
          }}
        >
          {tvShowSuggestions.map((tvShow) => (
            <Box
              key={tvShow.id}
              sx={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <img
                src={getTmdbImageUrl(tvShow.poster_path, "w300")}
                alt={tvShow.name}
                style={{ width: 150, height: 225 }}
              />
              {tvShow.id.toString() === id ? (
                <Typography
                  variant="body2"
                  sx={{ color: theme.customVariables.appWhiteSmoke }}
                >
                  Selected
                </Typography>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => {
                    handleSelectTvShow(tvShow);
                  }}
                >
                  Select
                </Button>
              )}
            </Box>
          ))}
        </Box>
      </Paper>
    </Modal>
  );
};

export { TvShowSuggestionsModal };
