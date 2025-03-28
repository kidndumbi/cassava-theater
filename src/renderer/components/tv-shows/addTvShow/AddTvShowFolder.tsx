import { Box, Container, Divider, Button, Alert } from "@mui/material";
import { useEffect, useState, useMemo } from "react";
import WarningIcon from "@mui/icons-material/Warning";
import MovieIcon from "@mui/icons-material/Movie";
import { AppTextField } from "../../common/AppTextField";
import theme from "../../../theme";
import AppIconButton from "../../common/AppIconButton";
import { TvShowSuggestionsModal } from "../TvShowSuggestionsModal";
import { fetchFilmDataById } from "../../../store/theMovieDb.slice";
import { TvShowDetails } from "../../../../models/tv-show-details.model";
import { trimFileName } from "../../../util/helperFunctions";
import { useSettings } from "../../../hooks/useSettings";
import { TvShowDetailsCard } from "./TvShowDetailsCard";
import { SubfolderList } from "./SubfolderList";
import { useTvShows } from "../../../hooks/useTvShows";
import { VideoDataModel } from "../../../../models/videoData.model";
import { data } from "react-router-dom/dist";

interface AddTvShowFolderProps {
  tvShows: VideoDataModel[];
  dataSaved: () => void;
}

export const AddTvShowFolder: React.FC<AddTvShowFolderProps> = ({
  tvShows,dataSaved
}) => {
  const { settings } = useSettings();
  const { AddTvShowFolder } = useTvShows();
  const [tvShowName, setTvShowName] = useState("");
  const [subfolders, setSubfolders] = useState<string[]>([]);
  const [tvShowDetails, setTvShowDetails] = useState<TvShowDetails | null>(
    null,
  );
  const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const existingTvShowNames = useMemo(
    () => tvShows.map((tv) => tv.fileName?.toLowerCase().trim()),
    [tvShows],
  );

  useEffect(() => {
    const validateForm = () => {
      const newErrors: string[] = [];

      if (!tvShowName.trim()) {
        newErrors.push("TV Show Name is required.");
      }

      if (
        existingTvShowNames.includes(
          trimFileName(tvShowName.trim())?.toLowerCase(),
        )
      ) {
        newErrors.push("A TV Show with this name already exists.");
      }

      if (subfolders.length > 0) {
        if (!areSubfolderNamesUnique()) {
          newErrors.push("Subfolder names must be unique.");
        }
        if (subfolders.some((subfolder) => !subfolder.trim())) {
          newErrors.push("Subfolder names cannot be empty.");
        }
      }

      setErrors(newErrors);
    };

    validateForm();
  }, [tvShowName, subfolders, existingTvShowNames]);

  const handleTvShowNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setTvShowName(event.target.value);
  };

  const handleSubfolderChange = (index: number, value: string) => {
    const updatedSubfolders = [...subfolders];
    updatedSubfolders[index] = value;
    setSubfolders(updatedSubfolders);
  };

  const addSubfolder = () => setSubfolders([...subfolders, ""]);

  const removeSubfolder = (index: number) => {
    setSubfolders(subfolders.filter((_, i) => i !== index));
  };

  const areSubfolderNamesUnique = (): boolean => {
    return new Set(subfolders).size === subfolders.length;
  };

  const isFormValid = (): boolean => {
    return errors.length === 0;
  };

  const handleCreate = async () => {
    if (!isFormValid()) return;

    try {
      await AddTvShowFolder({
        tvShowName: tvShowName.trim(),
        subfolders,
        tvShowDetails,
        tvShowsFolderPath: settings?.tvShowsFolderPath?.trim(),
      });

      dataSaved(); // Call the parent component's dataSaved function to indicate success

    } catch (error) {

    }
  };

  const handleSelectTvShow = async (tvShow: TvShowDetails) => {
    const extraTvShowDetails = await fetchFilmDataById(
      tvShow.id.toString(),
      "tv",
    );
    setTvShowDetails(extraTvShowDetails);
    setIsSuggestionsModalOpen(false);
  };

  if (!settings?.tvShowsFolderPath?.trim()) {
    return (
      <Container>
        <Box>
          Before adding TV shows, please go to Settings and select a folder
          where your TV shows will be stored.
        </Box>
      </Container>
    );
  }

  return (
    <>
      <Container className="flex flex-col">
        <Box>
          {errors.length > 0 && (
            <Alert
              className="mt-3"
              icon={<WarningIcon fontSize="inherit" />}
              severity="error"
            >
              <ul className="m-0 list-disc pl-6">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AppTextField
              label="TV Show Name"
              value={tvShowName}
              onChange={handleTvShowNameChange}
              theme={theme}
            />
            <AppIconButton
              tooltip="theMovieDb data"
              onClick={() => setIsSuggestionsModalOpen(true)}
            >
              <MovieIcon />
            </AppIconButton>
          </Box>

          {tvShowDetails && (
            <TvShowDetailsCard
              details={tvShowDetails}
              onClear={() => setTvShowDetails(null)}
              onEdit={() => setIsSuggestionsModalOpen(true)}
            />
          )}

          <Divider
            sx={{ backgroundColor: theme.palette.primary.main, my: 2 }}
          />

          <SubfolderList
            subfolders={subfolders}
            onSubfolderChange={handleSubfolderChange}
            onRemoveSubfolder={removeSubfolder}
            onAddSubfolder={addSubfolder}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreate}
              disabled={!isFormValid()}
              sx={{
                "&.Mui-disabled": {
                  backgroundColor: theme.palette.grey[500],
                  color: theme.palette.grey[300],
                },
              }}
            >
              Create
            </Button>
          </Box>
        </Box>
      </Container>

      <TvShowSuggestionsModal
        open={isSuggestionsModalOpen}
        handleClose={() => setIsSuggestionsModalOpen(false)}
        fileName={tvShowName.trim()}
        handleSelectTvShow={handleSelectTvShow}
      />
    </>
  );
};
