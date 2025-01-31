const useSelectFolder = () => {
  const selectFolder = async (): Promise<string | null> => {
    return window.openDialogAPI.openFolderDialog();
  };

  const selectFile = async (
    fileDialogOptions = [{ name: ".vtt files", extensions: ["vtt"] }]
  ): Promise<string | null> => {
    return window.openDialogAPI.openFileDialog(fileDialogOptions);
  };

  return { selectFolder, selectFile };
};

export default useSelectFolder;
