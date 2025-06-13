import React, { useState } from "react";
import {
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  useTheme,
  Alert,
} from "@mui/material";

type ChildFolder = {
  folderPath: string;
  basename: string;
  season_id?: string | null;
};

interface SeasonConvertSelectorProps {
  childFolders: ChildFolder[];
  close: () => void;
}

const SeasonConvertSelector: React.FC<SeasonConvertSelectorProps> = ({
  childFolders,
  close,
}) => {
  const theme = useTheme();
  //const { addToConversionQueue } = useMp4Conversion();
  const [noFilesToConvert, setNoFilesToConvert] = useState(false);
  const [selectedSeasonsToConvert, setSelectedSeasonsToConvert] = useState<
    string[]
  >([]);

  const handleSeasonCheckboxChange = (folderPath: string) => {
    setSelectedSeasonsToConvert((prev) =>
      prev.includes(folderPath)
        ? prev.filter((fp) => fp !== folderPath)
        : [...prev, folderPath],
    );
  };

  const handleConvertSeasons = async () => {
    const selected = childFolders.filter((folder) =>
      selectedSeasonsToConvert.includes(folder.folderPath),
    );

    const allFilesArrays = await Promise.all(
      selected.map((folder) => window.videoAPI.getFolderFiles(folder.folderPath)),
    );

    const allFiles = allFilesArrays
      .flat()
      .filter((file) => !file.endsWith(".json") && !file.endsWith(".mp4"));
    if (allFiles?.length === 0) {
      setNoFilesToConvert(true);
      console.warn("No files to convert in selected seasons.");
      return;
    }

    allFiles.forEach((file) => {
      //addToConversionQueue(file);

    });
    setNoFilesToConvert(false);

    close();
  };

  return (
    <Box className="p-4">
      {noFilesToConvert && (
        <Alert className="mb-2" severity="warning">
          No files to convert.
        </Alert>
      )}
      <FormGroup>
        {childFolders.map((folder) => (
          <FormControlLabel
            key={folder.folderPath}
            control={
              <Checkbox
                checked={selectedSeasonsToConvert.includes(folder.folderPath)}
                onChange={() => handleSeasonCheckboxChange(folder.folderPath)}
                sx={{
                  color: theme.palette.primary.main,
                  "&.Mui-checked": {
                    color: theme.palette.primary.main,
                  },
                }}
              />
            }
            label={folder.basename}
            sx={{
              color: theme.customVariables.appWhiteSmoke,
              ".MuiFormControlLabel-label": {
                color: theme.customVariables.appWhiteSmoke,
              },
            }}
          />
        ))}
      </FormGroup>
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          disabled={selectedSeasonsToConvert.length === 0}
          onClick={handleConvertSeasons}
          sx={{
            "&.Mui-disabled": {
              color: theme.customVariables.appWhiteSmoke,
              backgroundColor: "grey",
            },
          }}
        >
          Convert
        </Button>
      </Box>
    </Box>
  );
};

export default SeasonConvertSelector;
