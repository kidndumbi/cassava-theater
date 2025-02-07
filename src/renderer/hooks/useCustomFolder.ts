import { useSelector } from "react-redux";
import { useAppDispatch } from "../store";
import { folderVideosInfoActions, selCustomFolder, selLoadingCustomFolder } from "../store/folderVideosInfo.slice";

export const useCustomFolder = () => {
  const dispatch = useAppDispatch();
  const customFolderData = useSelector(selCustomFolder);
  const loadingCustomFolderData = useSelector(selLoadingCustomFolder);

  const loadCustomFolder = async (path: string) => {
    dispatch(
      folderVideosInfoActions.fetchVideoData({
        path,
        category: "customFolder",
        includeThumbnail: false,
      })
    );
  };

  return {
    customFolderData,
    loadCustomFolder,
    loadingCustomFolderData,
  };
};
