import { Timestamp } from "firebase/firestore";

export type AppStackParamList = {
    Dashboard: undefined;
    QuestionnaireList: undefined;
    SelfAssessment: { questionnaireId: string };
    Results: { totalScore: number; scoringRules: any[] } | { assessmentId: string };
    MyProgress: undefined;
    Journal: undefined;
  };

export interface CompletedAssessment {
  id: string;
  userId: string;
  questionnaireId: string;
  answers: any; // You might want to define a more specific type for answers
  totalScore: number;
  severityLevel: string;
  completedAt: Timestamp;
  wellnessPlan?: string; // Added based on functions/src/index.ts
}

export interface JournalEntry {
  id: string;
  userId: string;
  createdAt: Timestamp;
  text: string;
  sentimentScore?: number;
  sentimentMagnitude?: number;
}
