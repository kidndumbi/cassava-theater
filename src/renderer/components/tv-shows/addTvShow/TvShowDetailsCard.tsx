import { Box, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { PosterCard } from "../../common/PosterCard";
import { useTmdbImageUrl } from "../../../hooks/useImageUrl";
import { trimFileName } from "../../../util/helperFunctions";
import theme from "../../../theme";
import AppIconButton from "../../common/AppIconButton";
import { TvShowDetails } from "../../../../models/tv-show-details.model";

type TvShowDetailsCardProps = {
  details: TvShowDetails;
  onClear: () => void;
  onEdit: () => void;
};

export const TvShowDetailsCard = ({
  details,
  onClear,
  onEdit,
}: TvShowDetailsCardProps) => {
  const { getTmdbImageUrl } = useTmdbImageUrl();

  return (
    <Box sx={{ position: "relative", width: "fit-content" }}>
      <PosterCard
        imageUrl={getTmdbImageUrl(details.poster_path)}
        altText={details.name || ""}
        onClick={onEdit}
        footer={
          <Box className="mt-2">
            <Typography
              variant="subtitle1"
              align="center"
              sx={{ color: theme.customVariables.appWhiteSmoke }}
            >
              {trimFileName(details.name ?? "Unknown Title")}
            </Typography>
          </Box>
        }
      />
      <AppIconButton
        tooltip="clear"
        onClick={onClear}
        sx={{ position: "absolute", top: 8, right: 8 }}
      >
        <DeleteIcon />
      </AppIconButton>
    </Box>
  );
};
