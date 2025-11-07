// src/screens/SelfAssessmentScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { Feather } from '@expo/vector-icons';
import { saveAssessmentResult } from '../services/assessmentService'; // 1. Import the service

import type { StackNavigationProp } from '@react-navigation/stack';

interface SelfAssessmentScreenProps {
  navigation: StackNavigationProp<any, any>;
}

type QuestionOption = {
  text: string;
  value: string;
};

type Question = {
  id: string;
  text: string;
  options: QuestionOption[];
  order?: number;
};

type Questionnaire = {
  id: string;
  title: string;
  scoringRules: Array<{ level: string; minScore: number; maxScore: number }>;
};

export default function SelfAssessmentScreen({ navigation }: SelfAssessmentScreenProps) {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null); // Store questionnaire details
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedOption, setSelectedOption] = useState<QuestionOption | null>(null);

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        // Fetch questionnaire details (including scoring rules)
        const questionnaireRef = doc(db, 'questionnaires', 'PHQ-9'); // Hardcoded for now
        const questionnaireSnap = await getDoc(questionnaireRef);
        if (questionnaireSnap.exists()) {
          const data = questionnaireSnap.data();
          setQuestionnaire({
            id: questionnaireSnap.id,
            title: data.title || '',
            scoringRules: data.scoringRules || [],
          });
        }

        // Fetch questions
        const q = query(
          collection(db, 'questions'), 
          where("questionnaireId", "==", "PHQ-9"), 
          orderBy("order")
        );
        const querySnapshot = await getDocs(q);
        const fetchedQuestions: Question[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            text: data.text || '',
            options: Array.isArray(data.options) ? data.options : [],
            order: typeof data.order === 'number' ? data.order : undefined,
          };
        });
        if (fetchedQuestions.length > 0) setQuestions(fetchedQuestions);

      } catch (error) {
        console.error("Error fetching data: ", error);
        Alert.alert('Error', 'An error occurred fetching the assessment.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestionnaire();
  }, []);

  const handleAnswerSelection = (option: QuestionOption) => {
    setSelectedOption(option);
    const currentQuestion = questions[currentQuestionIndex];
    const newAnswers = { ...answers, [currentQuestion.id]: option.value };
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (selectedOption === null && currentQuestionIndex < questions.length - 1) {
      Alert.alert('Please select an option');
      return;
    }

    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      // --- 2. This is the new logic for finishing the assessment ---
  const totalScore = Object.values(answers).reduce((sum: number, value: number) => sum + (typeof value === 'number' ? value : 0), 0);

  const getSeverityLevel = (score: number) => {
    if (!questionnaire) return 'Undetermined';
    for (const rule of questionnaire.scoringRules) {
      if (score >= rule.minScore && score <= rule.maxScore) {
        return rule.level;
      }
    }
    return 'Undetermined';
  };

      const severityLevel = getSeverityLevel(totalScore);
      const userId = auth.currentUser?.uid;

      if (userId && questionnaire) {
        const saveResult = await saveAssessmentResult(userId, questionnaire.id, answers, totalScore, severityLevel);
        if (saveResult) {
          navigation.navigate('Results', { assessmentId: saveResult.id });
          return;
        }
        // if save failed fall back to passing the score and rules
      }

      navigation.navigate('Results', { 
        totalScore, 
        scoringRules: questionnaire ? questionnaire.scoringRules : []
      });
    }
  };

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#8A2BE2" /></View>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#483D8B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{questionnaire?.title || 'Self-Assessment'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.questionCard}>
          <Text style={styles.progressText}>{`Question ${currentQuestionIndex + 1} of ${questions.length}`}</Text>
          <Text style={styles.questionText}>{currentQuestion?.text}</Text>
        </View>

        {currentQuestion?.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.optionCard, selectedOption?.text === option.text && styles.selectedOptionCard]}
            onPress={() => handleAnswerSelection(option)}
          >
            <View style={[styles.radioCircle, selectedOption?.text === option.text && styles.selectedRadioCircle]} />
            <Text style={styles.optionText}>{option.text}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
        <Text style={styles.nextButtonText}>{isLastQuestion ? 'Finish' : 'Next'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// --- Styles remain the same ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#483D8B' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  questionCard: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 30 },
  progressText: { fontSize: 14, color: '#778899', marginBottom: 15 },
  questionText: { fontSize: 18, color: '#483D8B', lineHeight: 26 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6E6FA',
  },
  selectedOptionCard: { borderColor: '#8A2BE2', backgroundColor: '#F5F0FF' },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#C0C0C0',
    marginRight: 15,
  },
  selectedRadioCircle: { borderColor: '#8A2BE2', backgroundColor: '#8A2BE2' },
  optionText: { fontSize: 16, color: '#483D8B' },
  nextButton: {
    backgroundColor: '#8A2BE2',
    margin: 20,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  nextButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});