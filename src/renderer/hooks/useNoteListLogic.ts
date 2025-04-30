import { useState } from "react";
import { useSelector } from "react-redux";
import { selVideoPlayer } from "../store/videoPlayer.slice";
import { v4 as uuidv4 } from "uuid";
import { NoteModel } from "../../models/note.model";
import { VideoDataModel } from "../../models/videoData.model";
import { OverviewModel } from "../../models/overview.model";
import { fetchVideoDetails, 
} from "../api/videoData.api";

export const useNoteListLogic = () => {
  const player = useSelector(selVideoPlayer);

  const [showTextEditor, setShowTextEditor] = useState(false);

  const updateVideoJsonData = (
    updatedData: Partial<VideoDataModel>,
    videoData: VideoDataModel | null,
    callback?: () => void,
  ) => {
    if (!videoData) {
      return;
    }

    const newVideoJsonData: VideoDataModel = {
      ...updatedData,
    };

    window.videoAPI
      .saveVideoJsonData({
        currentVideo: videoData,
        newVideoJsonData,
      })
      .then(() => {
        callback?.();
      })
      .catch((error) => {
        console.error("Error updating video data:", error);
      });
  };

  const updateOverview = (
    body: string,
    videoData: VideoDataModel | null,
    callback?: () => void,
  ) => {
    if (!videoData) {
      return;
    }

    const updatedOverview: OverviewModel = {
      ...videoData.overview,
      body,
      updatedDate: new Date().getTime(),
    };

    updateVideoJsonData({ overview: updatedOverview }, videoData, callback);
  };

  const handleCreateNote = (
    content: string,
    existingNotes: NoteModel[],
    videoData: VideoDataModel | null,
    currentTime: number,
    callback?: () => void,
  ) => {
    if (content === "" || !videoData) {
      return;
    }

    const newNote: NoteModel = {
      id: uuidv4(),
      content,
      videoTimeStamp: currentTime,
      createdAt: new Date().getTime(),
    };

    updateVideoJsonData(
      { notes: [...existingNotes, newNote] },
      videoData,
      () => {
        setShowTextEditor(false);
        callback?.();
      },
    );
  };

  const getNotesAndOverview = async (path: string) => {
    const videoDetails = await fetchVideoDetails({ path, category: null });
    const { notes, overview } = videoDetails;
    return { notes, overview };
  };

  const handleDeleteNote = (
    note: NoteModel,
    existingNotes: NoteModel[],
    videoData: VideoDataModel | null,
    callback?: () => void,
  ) => {
    const filteredNotes = (existingNotes || []).filter((n) => n.id !== note.id);
    updateVideoJsonData({ notes: filteredNotes }, videoData, callback);
  };

  const handleNoteSave = (
    updatedNote: NoteModel,
    existingNotes: NoteModel[],
    videoData: VideoDataModel | null,
    callback?: () => void,
  ) => {
    const notesForUpdate = existingNotes.map((note) =>
      note.id === updatedNote.id
        ? { ...note, content: updatedNote.content }
        : note,
    );

    updateVideoJsonData({ notes: notesForUpdate }, videoData, callback);
  };

  const handleCreateNewNoteButtonClick = () => {
    if (player && player.pause) {
      player.pause();
    }

    setShowTextEditor(true);
  };

  const handleCancelClick = () => setShowTextEditor(false);

  return {
    showTextEditor,
    handleCreateNote,
    handleDeleteNote,
    handleNoteSave,
    handleCreateNewNoteButtonClick,
    handleCancelClick,
    updateOverview,
    getNotesAndOverview,
  };
};
