import { VideoDataModel } from "./videoData.model";

export interface SetPlayingModel {
  video: VideoDataModel;
  queryParams: {
    menuId: string;
    resumeId: string;
    startFromBeginning: string;
  };
}