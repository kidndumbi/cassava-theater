import { Box, Button, useTheme } from "@mui/material";
import { renderTextField } from "../common/RenderTextField";
import { Save, Folder as FolderIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useTvShows } from "../../hooks/useTvShows";
import useSelectFolder from "../../hooks/useSelectFolder";

interface ImageSelectorProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBrowse: () => void;
  onSave: () => void;
}

const ImageSelector = ({
  label,
  value,
  onChange,
  onBrowse,
  onSave,
}: ImageSelectorProps) => {
  const theme = useTheme();
  return (
    <Box style={{ display: "flex", alignItems: "center" }}>
      {renderTextField(label, value, onChange, theme)}
      <Button
        sx={{ marginLeft: "8px" }}
        variant="contained"
        color="primary"
        style={{ marginRight: "8px" }}
        onClick={onBrowse}
      >
        <FolderIcon />
      </Button>
      <Button
        sx={{ marginLeft: "8px" }}
        variant="contained"
        color="primary"
        onClick={onSave}
      >
        <Save />
      </Button>
    </Box>
  );
};

export const TvShowCustomize = () => {
  const [posterUrl, setPosterUrl] = useState<string>("");
  const [backdropUrl, setBackdropUrl] = useState<string>("");

  const { updateTvShowDbData, tvShowDetails } = useTvShows();
  const { selectFile } = useSelectFolder();

  useEffect(() => {
    if (tvShowDetails) {
      setPosterUrl(tvShowDetails.poster);
      setBackdropUrl(tvShowDetails.backdrop);
    }
  }, [tvShowDetails]);

  return (
    <Box>
      <ImageSelector
        label="Poster"
        value={posterUrl}
        onChange={(e) => setPosterUrl(e.target.value)}
        onBrowse={async () => {
          const filePath = await selectFile([
            { name: "image files", extensions: ["png", "jpg"] },
          ]);
          setPosterUrl(filePath);
          updateTvShowDbData(tvShowDetails.filePath, { poster: filePath });
        }}
        onSave={() =>
          updateTvShowDbData(tvShowDetails.filePath, { poster: posterUrl })
        }
      />
      <ImageSelector
        label="Backdrop"
        value={backdropUrl}
        onChange={(e) => setBackdropUrl(e.target.value)}
        onBrowse={async () => {
          const filePath = await selectFile([
            { name: "image files", extensions: ["png", "jpg"] },
          ]);
          setBackdropUrl(filePath);
          updateTvShowDbData(tvShowDetails.filePath, { backdrop: filePath });
        }}
        onSave={() =>
          updateTvShowDbData(tvShowDetails.filePath, { backdrop: backdropUrl })
        }
      />
    </Box>
  );
};
