import React, { useState } from "react";
import { Typography, Box, Button, Theme } from "@mui/material";
import { TvShowDetails } from "../../../models/tv-show-details.model";
import { AppTextField } from "../common/AppTextField";
import AppIconButton from "../common/AppIconButton";
import SearchIcon from "@mui/icons-material/Search";
import { getFilename } from "../../util/helperFunctions";

interface TvShowSuggestionsProps {
  fileName: string;
  tvShowSuggestions: TvShowDetails[];
  id?: string;
  handleSelectTvShow: (show: TvShowDetails) => void;
  getTmdbImageUrl: (path: string, size: string) => string;
  theme: Theme;
  triggererSuggestionsUpdate: (searchValue: string) => void;
}

const TvShowSuggestions: React.FC<TvShowSuggestionsProps> = ({
  fileName,
  tvShowSuggestions,
  id,
  handleSelectTvShow,
  getTmdbImageUrl,
  theme,
  triggererSuggestionsUpdate,
}) => {
  const [tvShowName, setTvShowName] = useState(getFilename(fileName));

  const handleTvShowNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setTvShowName(event.target.value);
  };

  return (
    <>
      <Typography variant="h6" component="h2" color="primary">
        TV Show Suggestions
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <AppTextField
          label="TV Show Name"
          value={tvShowName}
          onChange={handleTvShowNameChange}
          theme={theme}
        />
        <AppIconButton
          tooltip="theMovieDb data"
          onClick={() => triggererSuggestionsUpdate(tvShowName.trim())} // Call the function to update suggestions
        >
          <SearchIcon />
        </AppIconButton>
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
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
                onClick={() => handleSelectTvShow(tvShow)}
              >
                Select
              </Button>
            )}
          </Box>
        ))}
      </Box>
    </>
  );
};

export default TvShowSuggestions;
