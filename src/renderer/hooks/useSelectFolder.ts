import { ipcRenderer } from "electron";
import { OpenDialogIpcChannels } from "../../enums/open-dialog-IPC-channels.enum";
// import { IPCChannels } from "../../enums/IPCChannels";

const useSelectFolder = () => {
//   const invokeIpcRenderer = async (
//     channel: string,
//     options?: any
//   ): Promise<string | null> => {
//     try {
//     const result: string | null = await ipcRenderer.invoke(channel, options);
//       return result;
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         console.error(`An error occurred while invoking ${channel}:`, error);
//       }
//       return null;
//     }
//   };

  const selectFolder = async (): Promise<string | null> => {
    return window.openDialogAPI.openFolderDialog();
    // return invokeIpcRenderer(OpenDialogIpcChannels.OPEN_FOLDER_DIALOG);
  };

  const selectFile = async (
    fileDialogOptions = [{ name: ".vtt files", extensions: ["vtt"] }]
  ): Promise<string | null> => {
    //return invokeIpcRenderer(OpenDialogIpcChannels.OPEN_FILE_DIALOG, fileDialogOptions);
    return window.openDialogAPI.openFileDialog(fileDialogOptions);
  };

  return { selectFolder, selectFile };
};

export default useSelectFolder;
