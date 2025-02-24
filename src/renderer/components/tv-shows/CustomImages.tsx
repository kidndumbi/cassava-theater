import { Box, Button, useTheme } from "@mui/material";
import { renderTextField } from "../common/RenderTextField";
import { Save, Folder as FolderIcon } from "@mui/icons-material";
import React, { useState } from "react";
import { VideoDataModel } from "../../../models/videoData.model";
import { selectFile } from "../../util/helperFunctions";

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

interface CustomImagesProps {
  posterUrl: string;
  backdropUrl: string;
  updateImage: (data: VideoDataModel) => void;
}

export const CustomImages: React.FC<CustomImagesProps> = ({
  posterUrl,
  backdropUrl,
  updateImage,
}) => {
  const [componentPosterUrl, setPosterUrl] = useState<string>(posterUrl);
  const [componentBackdropUrl, setBackdropUrl] = useState<string>(backdropUrl);

  return (
    <Box>
      <ImageSelector
        label="Poster"
        value={componentPosterUrl}
        onChange={(e) => setPosterUrl(e.target.value)}
        onBrowse={async () => {
          const filePath = await selectFile([
            { name: "image files", extensions: ["png", "jpg"] },
          ]);
          setPosterUrl(filePath);
          updateImage({ poster: filePath });
        }}
        onSave={() =>
          updateImage({
            poster: componentPosterUrl,
          })
        }
      />
      <ImageSelector
        label="Backdrop"
        value={componentBackdropUrl}
        onChange={(e) => setBackdropUrl(e.target.value)}
        onBrowse={async () => {
          const filePath = await selectFile([
            { name: "image files", extensions: ["png", "jpg"] },
          ]);
          setBackdropUrl(filePath);
          updateImage({ backdrop: filePath });
        }}
        onSave={() =>
          updateImage({
            backdrop: componentBackdropUrl,
          })
        }
      />
    </Box>
  );
};
