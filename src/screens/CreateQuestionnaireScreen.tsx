// src/screens/CreateQuestionnaireScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

import type { StackNavigationProp } from '@react-navigation/stack';

interface CreateQuestionnaireScreenProps {
  navigation: StackNavigationProp<any, any>;
}

type ScoringRule = {
  level: string;
  minScore: string;
  maxScore: string;
};

export default function CreateQuestionnaireScreen({ navigation }: CreateQuestionnaireScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([
    { level: '', minScore: '', maxScore: '' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Handles changes in the scoring rule inputs
  const handleRuleChange = (index: number, field: keyof ScoringRule, value: string) => {
    const newRules = [...scoringRules];
    newRules[index][field] = value;
    setScoringRules(newRules);
  };                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        

  // Adds a new, empty scoring rule row
  const addRule = () => {
    setScoringRules([...scoringRules, { level: '', minScore: '', maxScore: '' }]);
  };

  const handleSave = async () => {
    if (!title) {
      Alert.alert('Error', 'Please enter a title for the questionnaire.');
      return;
    }

    setIsLoading(true);
    try {
      // Convert scores to numbers before saving
      const formattedRules = scoringRules.map(rule => ({
        level: rule.level,
        minScore: parseInt(rule.minScore, 10) || 0,
        maxScore: parseInt(rule.maxScore, 10) || 0,
      }));

      const docRef = await addDoc(collection(db, "questionnaires"), {
        title: title,
        description: description,
        scoringRules: formattedRules,
      });

      Alert.alert('Success', 'Questionnaire created successfully!');
        // In the next step, we'll navigate to an "Add Questions" screen
        // For now, we'll go back to the dashboard
        navigation.navigate('AddQuestions', { 
            questionnaireId: docRef.id, 
            questionnaireTitle: title 
      });
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert('Error', 'Could not save the questionnaire.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Questionnaire</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.formContainer}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., GAD-7 Anxiety Assessment"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe what this assessment is for..."
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Scoring Rules</Text>
        {scoringRules.map((rule, index) => (
          <View key={index} style={styles.ruleContainer}>
            <TextInput
              style={styles.ruleInput}
              placeholder="Level (e.g., Mild)"
              value={rule.level}
              onChangeText={(text) => handleRuleChange(index, 'level', text)}
            />
            <TextInput
              style={styles.ruleInput}
              placeholder="Min Score"
              value={rule.minScore}
              onChangeText={(text) => handleRuleChange(index, 'minScore', text)}
              keyboardType="number-pad"
            />
            <TextInput
              style={styles.ruleInput}
              placeholder="Max Score"
              value={rule.maxScore}
              onChangeText={(text) => handleRuleChange(index, 'maxScore', text)}
              keyboardType="number-pad"
            />
          </View>
        ))}
        <TouchableOpacity style={styles.addRuleButton} onPress={addRule}>
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.addRuleText}>Add Rule</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save and Add Questions</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#483D8B' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  formContainer: { flex: 1, padding: 20 },
  label: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 10 },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  ruleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  ruleInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    color: '#fff',
    width: '32%',
  },
  addRuleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  addRuleText: { color: '#fff', marginLeft: 8 },
  saveButton: {
    backgroundColor: '#8A2BE2',
    margin: 20,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});