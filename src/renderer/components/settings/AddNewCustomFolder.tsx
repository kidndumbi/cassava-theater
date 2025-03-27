import React from "react";
import { Card, CardContent, Button, useTheme } from "@mui/material";
import { Folder as FolderIcon } from "@mui/icons-material";
import { CustomFolderModel } from "../../../models/custom-folder";
import { AppTextField } from "../common/AppTextField";
import { v4 as uuidv4 } from "uuid";
import { useForm, Controller } from "react-hook-form";
import { selectFolder } from "../../util/helperFunctions";

interface AddNewCustomFolderProps {
  onSave: (customFolder: CustomFolderModel) => void;
  onCancel: () => void;
}

const AddNewCustomFolder: React.FC<AddNewCustomFolderProps> = ({
  onSave,
  onCancel,
}) => {
  const theme = useTheme();
  const { control, handleSubmit, setValue, watch } = useForm<CustomFolderModel>(
    {
      defaultValues: {
        id: uuidv4(),
        name: "",
        folderPath: "",
      },
    },
  );

  const newFolder = watch();

  const handleFolderPathButtonClick = async () => {
    const selectedFolderPath = await selectFolder();
    if (selectedFolderPath) {
      setValue("folderPath", selectedFolderPath);
    }
  };

  const onSubmit = (data: CustomFolderModel) => {
    onSave(data);
  };

  return (
    <Card
      style={{
        marginTop: "20px",
        marginBottom: "16px",
        backgroundColor: theme.customVariables.appDarker,
      }}
    >
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <AppTextField
                  label="Folder Name"
                  value={field.value}
                  onChange={field.onChange}
                  theme={theme}
                  readOnly={false} // Set to true if you want it to be read-only
                />
              )}
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "8px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <Controller
                name="folderPath"
                control={control}
                render={({ field }) => (
                  <AppTextField
                    label="Folder Path"
                    value={field.value}
                    onChange={field.onChange}
                    theme={theme}
                    readOnly={true} // Make it read-only to prevent manual input
                  />
                )}
              />
              <Button
                variant="contained"
                color="primary"
                style={{ marginLeft: "8px" }}
                onClick={handleFolderPathButtonClick}
              >
                <FolderIcon />
              </Button>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "8px",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={!newFolder.name || !newFolder.folderPath}
              sx={{
                "&.Mui-disabled": {
                  color: theme.customVariables.appWhiteSmoke,
                  backgroundColor: "grey",
                },
              }}
            >
              Save New Folder
            </Button>
            <Button variant="contained" color="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddNewCustomFolder;
