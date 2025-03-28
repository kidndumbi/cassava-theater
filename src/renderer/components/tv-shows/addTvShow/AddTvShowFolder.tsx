import { Box, Container, Divider, Button, Alert } from "@mui/material";
import { useEffect, useState } from "react";
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

interface AddTvShowFolderProps {
  tvShows: VideoDataModel[];
}

export const AddTvShowFolder: React.FC<AddTvShowFolderProps> = ({
  tvShows,
}) => {
  const { settings } = useSettings();
  const { AddTvShowFolder } = useTvShows();
  const [tvShowName, setTvShowName] = useState("");
  const [subfolders, setSubfolders] = useState<string[]>([]);
  const [tvShowDetails, setTvShowDetails] = useState<TvShowDetails | null>(
    null,
  );
  const [openTvShowSuggestionsModal, setOpenTvShowSuggestionsModal] =
    useState(false);
  const [existingTvShows, setExistingTvShows] = useState<string[]>(
    tvShows.map((tv) => tv.fileName?.toLowerCase().trim()),
  );
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const newErrors: string[] = [];
    if (tvShowName.trim() === "") newErrors.push("TV Show Name is required.");
    if (
      subfolders.length > 0 &&
      (!areSubfolderNamesUnique() ||
        subfolders.some((subfolder) => subfolder.trim() === ""))
    ) {
      newErrors.push("Subfolder names must be unique and non-empty.");
    }
    if (
      existingTvShows.includes(trimFileName(tvShowName.trim())?.toLowerCase())
    ) {
      newErrors.push("A TV Show with this name already exists.");
    }
    setErrors(newErrors);
  }, [tvShowName, subfolders, existingTvShows]);

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
    return (
      tvShowName.trim() !== "" &&
      (subfolders.length === 0 ||
        (areSubfolderNamesUnique() &&
          subfolders.every((subfolder) => subfolder.trim() !== ""))) &&
      !existingTvShows.includes(trimFileName(tvShowName.trim())?.toLowerCase())
    );
  };

  const handleCreate = () => {
    if (!isFormValid()) return;
    AddTvShowFolder({
      tvShowName: tvShowName.trim(),
      subfolders,
      tvShowDetails,
      tvShowsFolderPath: settings?.tvShowsFolderPath?.trim(),
    });
  };

  const handleSelectTvShow = async (tvShow: TvShowDetails) => {
    const extraTvShowDetails = await fetchFilmDataById(
      tvShow.id.toString(),
      "tv",
    );
    setTvShowDetails(extraTvShowDetails);
    setOpenTvShowSuggestionsModal(false);
  };

  return (
    <>
      <Container className="flex flex-col">
        {settings?.tvShowsFolderPath?.trim() ? (
          <Box>
            {errors.length > 0 && (
              <Alert
                className="mt-3"
                icon={<WarningIcon fontSize="inherit" />}
                severity="error"
              >
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.5rem",
                    listStyleType: "disc",
                  }}
                >
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
                onClick={() => setOpenTvShowSuggestionsModal(true)}
              >
                <MovieIcon />
              </AppIconButton>
            </Box>
            {tvShowDetails && (
              <TvShowDetailsCard
                details={tvShowDetails}
                onClear={() => setTvShowDetails(null)}
                onEdit={() => setOpenTvShowSuggestionsModal(true)}
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
        ) : (
          <Box>
            Please go to settings and provide a path for the Tv Shows Locations
          </Box>
        )}
      </Container>

      <TvShowSuggestionsModal
        open={openTvShowSuggestionsModal}
        handleClose={() => setOpenTvShowSuggestionsModal(false)}
        fileName={tvShowName.trim() || ""}
        handleSelectTvShow={handleSelectTvShow}
      />
    </>
  );
};
