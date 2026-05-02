export interface ExerciseAiMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ExerciseAiConversation {
  exerciseId: string;
  messages: ExerciseAiMessage[];
  lastUpdated: number;
}
