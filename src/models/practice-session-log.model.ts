export interface PracticeSessionLog {
  date: string; // 'YYYY-MM-DD'
  totalAttempts: number;
  correctCount: number;
  exercisesAttempted: string[]; // unique exercise IDs practiced this day
}
