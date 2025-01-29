import React, { useEffect, useState } from "react";
import { Card, CardContent, Button, useTheme } from "@mui/material";
import { Folder as FolderIcon, Save, Delete } from "@mui/icons-material";
import { CustomFolderModel } from "../../../models/custom-folder";

// import AddNewCustomFolder from "./AddNewCustomFolder";
import { renderTextField } from "../common/RenderTextField";
import AddNewCustomFolder from "./AddNewCustomFolder";

interface CustomFoldersSettingsProps {
  customFolders: CustomFolderModel[];
  handleCustomFolderFolderSelection: (
    customFolder: CustomFolderModel
  ) => Promise<void>;
  handleSaveFolderName: (
    customFolder: CustomFolderModel,
    newName: string
  ) => Promise<void>;
  saveNewFolder: (newFolder: CustomFolderModel) => Promise<void>;
  handleDeleteFolder: (folderId: string) => Promise<void>;
}

export const CustomFoldersSettings: React.FC<CustomFoldersSettingsProps> = ({
  customFolders,
  handleCustomFolderFolderSelection,
  handleSaveFolderName,
  saveNewFolder,
  handleDeleteFolder,
}) => {
  const theme = useTheme();

  const [componentCustomFolders, setComponentCustomFolders] =
    useState(customFolders);
  const [isAddingNewFolder, setIsAddingNewFolder] = useState(false);

  useEffect(() => {
    setComponentCustomFolders(customFolders);
  }, [customFolders]);

  const handleFolderNameChange = (folderId: string, newName: string) => {
    setComponentCustomFolders((prevFolders) =>
      prevFolders.map((folder) =>
        folder.id === folderId ? { ...folder, name: newName } : folder
      )
    );
  };

  const handleSaveNewFolder = (newFolder: CustomFolderModel) => {
    saveNewFolder(newFolder);
    setIsAddingNewFolder(false);
  };

  const renderCustomFolderCard = (folder: CustomFolderModel) => (
    <Card
      key={folder.id}
      style={{
        marginTop: "20px",
        marginBottom: "16px",
        backgroundColor: theme.customVariables.appDark,
      }}
    >
      <CardContent>
        <div style={{ display: "flex", alignItems: "center" }}>
          {renderTextField(
            "Folder Name",
            folder.name,
            (e) => handleFolderNameChange(folder.id, e.target.value),
            theme
          )}
          <Button
            variant="contained"
            color="primary"
            style={{ marginLeft: "8px" }}
            onClick={() => handleSaveFolderName(folder, folder.name)}
          >
            <Save />
          </Button>
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", marginTop: "8px" }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {renderTextField("Folder Path", folder.folderPath, () => {}, theme)}
            <Button
              variant="contained"
              color="primary"
              style={{ marginLeft: "8px" }}
              onClick={() => handleCustomFolderFolderSelection(folder)}
            >
              <FolderIcon />
            </Button>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "8px",
          }}
        >
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              handleDeleteFolder(folder.id)
            }}
          >
            <Delete />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsAddingNewFolder(true)}
          style={{ marginBottom: "16px" }}
        >
          Add New Folder
        </Button>
      </div>
      {isAddingNewFolder && (
        <AddNewCustomFolder
          onSave={handleSaveNewFolder}
          onCancel={() => setIsAddingNewFolder(false)}
        />
      )}
      {componentCustomFolders.map(renderCustomFolderCard)}
    </>
  );
};
