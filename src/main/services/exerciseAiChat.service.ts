import { ExerciseAiConversation, ExerciseAiMessage } from "../../models/exercise-ai-chat.model";
import { levelDBService } from "./levelDB.service";

const COLLECTION = "exerciseAiChats" as const;

export const getConversation = async (
  exerciseId: string,
): Promise<ExerciseAiConversation | null> => {
  return levelDBService.get(COLLECTION, exerciseId);
};

export const saveConversation = async (
  exerciseId: string,
  messages: ExerciseAiMessage[],
): Promise<void> => {
  await levelDBService.put(COLLECTION, exerciseId, {
    exerciseId,
    messages,
    lastUpdated: Date.now(),
  });
};

export const deleteConversation = async (exerciseId: string): Promise<void> => {
  await levelDBService.delete(COLLECTION, exerciseId);
};
