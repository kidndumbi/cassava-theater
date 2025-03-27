import { dialog, OpenDialogOptions } from "electron";

interface DialogOptions {
  filters?: { name: string; extensions: string[] }[];
  properties?: OpenDialogOptions["properties"];
}

const showDialog = async (options: DialogOptions) => {
  const result = await dialog.showOpenDialog({
    properties: options.properties,
    filters: options.filters || [],
  });

  return result.canceled ? null : result.filePaths[0];
};

export const openFolderDialog = async () => {
  return showDialog({
    properties: ["openDirectory"],
  });
};

export const openFileDialog = async (
  _event: Electron.IpcMainInvokeEvent,
  filters?: { name: string; extensions: string[] }[]
) => {
  return showDialog({
    properties: ["openFile"],
    filters,
  });
};