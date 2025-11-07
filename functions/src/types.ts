// src/types.ts

import { Timestamp } from 'firebase/firestore';

// The data structure for a saved assessment
export interface CompletedAssessment {
  id: string;
  userId: string;
  questionnaireId: string;
  totalScore: number;
  severityLevel: string;
  completedAt: Timestamp;
  wellnessPlan?: string;
  // We can add other fields as needed
}

// The data structure for a saved journal entry
export interface JournalEntry {
  id: string;
  userId: string;
  text: string;
  createdAt: Timestamp;
  sentimentScore?: number;
  sentimentMagnitude?: number;
}