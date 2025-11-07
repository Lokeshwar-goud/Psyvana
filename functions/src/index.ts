// functions/src/index.ts

// 1. Import all necessary v2 libraries
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import {GoogleGenerativeAI} from "@google/generative-ai";
import {LanguageServiceClient} from "@google-cloud/language";
import {defineString} from "firebase-functions/params";

// 2. Initialize Firebase and AI Clients
admin.initializeApp();
const languageClient = new LanguageServiceClient();
const geminiApiKey = defineString("GEMINI_KEY");

// -----------------------------------------------------------------
// FUNCTION 1: Generate Wellness Plan
// -----------------------------------------------------------------
export const generateWellnessPlan = onDocumentCreated(
  "completedAssessments/{assessmentId}",
  async (event) => {
    const snap = event.data;
    if (!snap) {
      console.log("No data associated with the event.");
      return;
    }
    const assessmentData = snap.data();

    // --- MANUALLY FIXED LINE 28 ---
    const {
      totalScore = 0,
      severityLevel = "Unknown",
      questionnaireId = "",
    } = assessmentData;

    if (questionnaireId !== "PHQ-9" || totalScore <= 4) {
      console.log("No wellness plan needed for this assessment.");
      return null;
    }

    console.log(`Generating plan for severity: ${severityLevel}`);

    // Initialize the model using the new secret-handling method
    const genAI = new GoogleGenerativeAI(geminiApiKey.value());
    const model = genAI.getGenerativeModel({model: "gemini-pro"});

    const prompt = `
      You are a compassionate wellness assistant for an app called Psyvana.
      A user has just completed a PHQ-9 depression assessment and their
      result is "${severityLevel}" with a score of ${totalScore}.
      Based on this result, create a simple, safe, and encouraging 3-day
      "First Steps" wellness plan. The plan should be non-medical and focus
      on very small, actionable behaviors.
      For each day, provide one simple activity suggestion related to either
      mindfulness, physical activity, or self-reflection.
      Format the output as a single string with each day's plan separated
      by a newline character (\n). For example:
      Day 1: [Suggestion]\nDay 2: [Suggestion]\nDay 3: [Suggestion]
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const wellnessPlanText = response.text();

      console.log("Generated plan:", wellnessPlanText);

      // Save the generated plan back to the document
      return snap.ref.update({
        wellnessPlan: wellnessPlanText,
      });
    } catch (error) {
      console.error("Error generating wellness plan:", error);
      return null;
    }
  },
);

// -----------------------------------------------------------------
// FUNCTION 2: Analyze Journal Entry
// -----------------------------------------------------------------
export const analyzeJournalEntry = onDocumentCreated(
  "journalEntries/{entryId}",
  async (event) => {
    const snap = event.data;
    if (!snap) {
      console.log("No data associated with the event.");
      return;
    }
    const journalData = snap.data();
    const text = journalData.text;

    // 1. Prepare the text for the AI
    const document = {
      content: text,
      type: "PLAIN_TEXT" as const,
    };

    try {
      // 2. Call the Natural Language API to analyze sentiment
      const [result] = await languageClient.analyzeSentiment({document});
      const sentiment = result.documentSentiment;

      // --- MANUALLY FIXED LINES 98 & 99 ---
      // A score from -1.0 (negative) to 1.0 (positive)
      const score = sentiment?.score ?? 0;
      // The "strength" of the emotion
      const magnitude = sentiment?.magnitude ?? 0;

      console.log(`Journal entry ${snap.id} sentiment score: ${score}`);

      // 3. Save the score back to the same document
      return snap.ref.update({
        sentimentScore: score,
        sentimentMagnitude: magnitude,
      });
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      return null;
    }
  },
);
