import { dialog } from "electron";

export const openFolderDialog = async (_event: any) => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (!result.canceled) {
    return result.filePaths[0];
  }

  return null;
};

export const openFileDialog = async (
  _event: any,
  filters?: { name: string; extensions: string[] }[]
) => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"], // Allow file selection
    filters: filters || [], // Use provided filters or default to an empty array
  });

  if (!result.canceled) {
    return result.filePaths[0]; // Return the first selected file path
  }

  return null; // Return null if the dialog was canceled
};
