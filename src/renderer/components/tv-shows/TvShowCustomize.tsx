import { Box, Button, useTheme } from "@mui/material";
import { renderTextField } from "../common/RenderTextField";
import { Save, Folder as FolderIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useTvShows } from "../../hooks/useTvShows";
import useSelectFolder from "../../hooks/useSelectFolder";

export const TvShowCustomize = () => {
  const theme = useTheme();
  const [posterUrl, setPosterUrl] = useState<string>("");
  const [backdropUrl, setBackdropUrl] = useState<string>("");

  const { updateTvShowDbData, tvShowDetails } = useTvShows();
  const { selectFile } = useSelectFolder();

  useEffect(() => {
    console.log("tvShowDetails: ", tvShowDetails);
    if (tvShowDetails) {
      setPosterUrl(tvShowDetails.poster);
      setBackdropUrl(tvShowDetails.backdrop);
    }
  }, [tvShowDetails]);

  return (
    <Box>
      <Box style={{ display: "flex", alignItems: "center" }}>
        {renderTextField(
          "Poster",
          posterUrl,
          (e) => setPosterUrl(e.target.value),
          theme
        )}
        <Button
          sx={{ marginLeft: "8px" }}
          variant="contained"
          color="primary"
          style={{ marginRight: "8px" }}
          onClick={async () => {
            const filePath = await selectFile([{ name: "image files", extensions: ["png", "jpg"] }]);
            setPosterUrl(filePath);
            updateTvShowDbData(tvShowDetails.filePath, { poster: filePath });
            console.log("filePath: ", filePath);
          }}
        >
          <FolderIcon />
        </Button>
        <Button
          sx={{ marginLeft: "8px" }}
          variant="contained"
          color="primary"
          onClick={() =>
            updateTvShowDbData(tvShowDetails.filePath, { poster: posterUrl })
          }
        >
          <Save />
        </Button>
      </Box>
      <Box style={{ display: "flex", alignItems: "center" }}>
        {renderTextField(
          "Backdrop",
          backdropUrl,
          (e) => setBackdropUrl(e.target.value),
          theme
        )}
        <Button
          sx={{ marginLeft: "8px" }}
          variant="contained"
          color="primary"
          onClick={() =>
            updateTvShowDbData(tvShowDetails.filePath, {
              backdrop: backdropUrl,
            })
          }
        >
          <Save />
        </Button>
      </Box>
    </Box>
  );
};
