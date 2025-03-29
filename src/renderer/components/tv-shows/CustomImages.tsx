import { Box, Button, useTheme } from "@mui/material";
import { AppTextField } from "../common/AppTextField";
import { Save, Folder as FolderIcon } from "@mui/icons-material";
import React, { useState } from "react";
import { VideoDataModel } from "../../../models/videoData.model";
import { selectFile } from "../../util/helperFunctions";

interface ImageSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBrowse: () => Promise<void>;
  onSave: () => void;
}

const ImageSelector: React.FC<ImageSelectorProps> = ({
  label,
  value,
  onChange,
  onBrowse,
  onSave,
}) => {
  const theme = useTheme();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value || "");
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      <AppTextField
        label={label}
        value={value}
        onChange={handleChange}
        theme={theme}
      />
      <Button
        sx={{ marginLeft: 1 }}
        variant="contained"
        color="primary"
        onClick={onBrowse}
        aria-label={`Browse for ${label.toLowerCase()}`}
      >
        <FolderIcon />
      </Button>
      <Button
        sx={{ marginLeft: 1 }}
        variant="contained"
        color="primary"
        onClick={onSave}
        aria-label={`Save ${label.toLowerCase()}`}
      >
        <Save />
      </Button>
    </Box>
  );
};

interface CustomImagesProps {
  posterUrl: string;
  backdropUrl: string;
  updateImage: (data: Partial<VideoDataModel>) => void;
}

export const CustomImages: React.FC<CustomImagesProps> = ({
  posterUrl,
  backdropUrl,
  updateImage,
}) => {
  const [poster, setPoster] = useState(posterUrl || "");
  const [backdrop, setBackdrop] = useState(backdropUrl || "");

  const handleImageSelect = async (
    type: "poster" | "backdrop",
    filePath: string,
  ) => {
    if (type === "poster") {
      setPoster(filePath);
    } else {
      setBackdrop(filePath);
    }
    updateImage({ [type]: filePath });
  };

  const handleSave = (type: "poster" | "backdrop", value: string) => {
    updateImage({ [type]: value });
  };

  const handleBrowse = async (type: "poster" | "backdrop") => {
    const filePath = await selectFile([
      { name: "image files", extensions: ["png", "jpg"] },
    ]);
    if (filePath) {
      handleImageSelect(type, filePath);
    }
  };

  return (
    <Box>
      <ImageSelector
        label="Poster"
        value={poster}
        onChange={(value) => setPoster(value)}
        onBrowse={() => handleBrowse("poster")}
        onSave={() => handleSave("poster", poster)}
      />
      <ImageSelector
        label="Backdrop"
        value={backdrop}
        onChange={(value) => setBackdrop(value)}
        onBrowse={() => handleBrowse("backdrop")}
        onSave={() => handleSave("backdrop", backdrop)}
      />
    </Box>
  );
};
