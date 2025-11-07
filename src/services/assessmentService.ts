// src/services/assessmentService.ts

import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, DocumentReference } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { CompletedAssessment, JournalEntry } from '../types'; // Import our new types

// Type for a successful service call
type SuccessResult<T> = { success: true; history: T[] };
// Type for a failed service call
type ErrorResult = { success: false; error: unknown };

// Type for the return value of our history functions
type HistoryResult<T> = Promise<SuccessResult<T> | ErrorResult>;

// --- saveAssessmentResult (No changes needed, but good to keep in mind) ---
export const saveAssessmentResult = async (
  userId: string,
  questionnaireId: string,
  answers: any,
  totalScore: number,
  severityLevel: string,
): Promise<DocumentReference | null> => {
  try {
    const docRef = await addDoc(collection(db, "completedAssessments"), {
      userId,
      questionnaireId,
      answers,
      totalScore,
      severityLevel,
      completedAt: serverTimestamp(),
    });
    return docRef;
  } catch (error) {
    console.error("Error saving assessment result: ", error);
    return null;
  }
};


// --- FULLY TYPED getAssessmentHistory ---
export const getAssessmentHistory = async (userId: string): HistoryResult<CompletedAssessment> => {
  try {
    const assessmentsRef = collection(db, "completedAssessments");
    const q = query(
      assessmentsRef,
      where("userId", "==", userId),
      orderBy("completedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as CompletedAssessment[]; // Cast the data to our type
    
    return { success: true, history };
  } catch (error) {
    console.error("Error fetching assessment history: ", error);
    return { success: false, error };
  }
};

// --- FULLY TYPED getJournalHistory ---
export const getJournalHistory = async (userId: string): HistoryResult<JournalEntry> => {
  try {
    const journalRef = collection(db, "journalEntries");
    const q = query(
      journalRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const history = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as JournalEntry[]; // Cast the data to our type
    
    return { success: true, history };
  } catch (error) {
    console.error("Error fetching journal history: ", error);
    return { success: false, error };
  }
};