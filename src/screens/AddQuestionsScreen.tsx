// src/screens/AddQuestionsScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';

import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';

interface AddQuestionsScreenRoute {
  params: {
    questionnaireId: string;
    questionnaireTitle: string;
  };
}

interface AddQuestionsScreenProps {
  route: AddQuestionsScreenRoute;
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

export default function AddQuestionsScreen({ route, navigation }: AddQuestionsScreenProps) {
  const { questionnaireId, questionnaireTitle } = route.params;

  const [existingQuestions, setExistingQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // State for the new question form
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<QuestionOption[]>([{ text: '', value: '' }]);

  // Fetch existing questions for this questionnaire
  const fetchQuestions = async () => {
    try {
      const q = query(
        collection(db, 'questions'),
        where("questionnaireId", "==", questionnaireId),
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
      setExistingQuestions(fetchedQuestions);
    } catch (error) {
      console.error("Error fetching questions: ", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleOptionChange = (index: number, field: keyof QuestionOption, value: string) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { text: '', value: '' }]);
  };

  const handleSaveQuestion = async () => {
    if (!questionText || options.some(opt => !opt.text || !opt.value)) {
      Alert.alert('Error', 'Please fill in the question and all option fields.');
      return;
    }
    setIsLoading(true);
    try {
      await addDoc(collection(db, "questions"), {
        questionnaireId: questionnaireId,
        text: questionText,
        order: existingQuestions.length + 1,
        options: options.map(opt => ({ text: opt.text, value: parseInt(opt.value, 10) || 0 })),
      });
      // Reset form and refetch questions
      setQuestionText('');
      setOptions([{ text: '', value: '' }]);
      fetchQuestions();
    } catch (error) {
      console.error("Error adding question: ", error);
      Alert.alert('Error', 'Could not save the question.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestionItem = ({ item }: { item: Question }) => (
    <View style={styles.questionItem}>
      <Text style={styles.questionItemText}>{item.order}. {item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')}>
          <Feather name="x" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{questionnaireTitle}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.formContainer}>
        <Text style={styles.subHeader}>Existing Questions ({existingQuestions.length})</Text>
        {isFetching ? <ActivityIndicator color="#fff" /> : (
          <FlatList
            data={existingQuestions}
            renderItem={renderQuestionItem}
            keyExtractor={item => item.id}
          />
        )}
        
        <View style={styles.divider} />

        <Text style={styles.subHeader}>Add New Question</Text>
        <TextInput
          style={styles.input}
          placeholder="Question Text"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={questionText}
          onChangeText={setQuestionText}
          multiline
        />

        <Text style={styles.label}>Options</Text>
        {options.map((option, index) => (
          <View key={index} style={styles.optionContainer}>
            <TextInput
              style={styles.optionInput}
              placeholder="Option Text"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={option.text}
              onChangeText={(text) => handleOptionChange(index, 'text', text)}
            />
            <TextInput
              style={styles.valueInput}
              placeholder="Value"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={option.value}
              onChangeText={(text) => handleOptionChange(index, 'value', text)}
              keyboardType="number-pad"
            />
          </View>
        ))}
        <TouchableOpacity style={styles.addRuleButton} onPress={addOption}>
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.addRuleText}>Add Option</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveQuestionButton} onPress={handleSaveQuestion} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#483D8B" /> : <Text style={styles.saveQuestionButtonText}>Save Question</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#483D8B' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#fff', marginHorizontal: 10 },
  formContainer: { flex: 1, padding: 20 },
  subHeader: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  questionItem: { backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: 15, borderRadius: 10, marginBottom: 5 },
  questionItemText: { color: '#fff', fontSize: 16 },
  divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)', marginVertical: 30 },
  label: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 10 },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top'
  },
  optionContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  optionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    color: '#fff',
    flex: 1,
    marginRight: 10
  },
  valueInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    color: '#fff',
    width: '25%',
    textAlign: 'center',
  },
  addRuleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingVertical: 10, borderRadius: 10, marginTop: 10, marginBottom: 30 },
  addRuleText: { color: '#fff', marginLeft: 8 },
  saveQuestionButton: { backgroundColor: '#fff', padding: 18, borderRadius: 15, alignItems: 'center', marginBottom: 40 },
  saveQuestionButtonText: { color: '#483D8B', fontSize: 18, fontWeight: 'bold' },
});