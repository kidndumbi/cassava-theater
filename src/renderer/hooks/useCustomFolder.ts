import { useSelector } from "react-redux";
import { useAppDispatch } from "../store";
import { selCustomFolder, selLoadingCustomFolder } from "../store/videoInfo/folderVideosInfoSelectors";
import { fetchVideoData } from "../store/videoInfo/folderVideosInfoActions";

export const useCustomFolder = () => {
  const dispatch = useAppDispatch();
  const customFolderData = useSelector(selCustomFolder);
  const loadingCustomFolderData = useSelector(selLoadingCustomFolder);

  const loadCustomFolder = async (path: string) => {
    dispatch(
      fetchVideoData({
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
