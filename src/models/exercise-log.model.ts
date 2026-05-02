export type ExerciseLogType = 'practice' | 'exercise-update';

export interface PracticeLogDetails {
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  nativeText: string;
}

export interface ExerciseUpdateDetails {
  changedFields: string[];
  before: Record<string, any>;
  after: Record<string, any>;
}

export interface ExerciseLogEntry {
  id: string;
  exerciseId: string;
  timestamp: number;
  type: ExerciseLogType;
  practiceDetails?: PracticeLogDetails;
  updateDetails?: ExerciseUpdateDetails;
}

export interface ExerciseLogs {
  exerciseId: string;
  entries: ExerciseLogEntry[];
}
