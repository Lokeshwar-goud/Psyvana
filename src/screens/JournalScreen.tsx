// src/screens/JournalScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function JournalScreen({ navigation }) {
  const [entry, setEntry] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (entry.trim().length === 0) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }

    setIsLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('No user logged in');
      }

      // Save the entry to a new 'journalEntries' collection
      await addDoc(collection(db, "journalEntries"), {
        userId: userId,
        text: entry,
        createdAt: serverTimestamp(),
        // Our Cloud Function will add 'sentimentScore' here later
      });

      Alert.alert('Saved!', 'Your journal entry has been saved.');
      navigation.goBack();

    } catch (error) {
      console.error("Error saving entry: ", error);
      Alert.alert('Error', 'Could not save your entry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color="#483D8B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Entry</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
          {isLoading ? <ActivityIndicator size="small" color="#8A2BE2" /> : <Text style={styles.saveButtonText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.textInput}
        placeholder="How are you feeling today? What's on your mind?"
        placeholderTextColor="#778899"
        multiline
        value={entry}
        onChangeText={setEntry}
        autoFocus={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#483D8B' },
  saveButton: {
    backgroundColor: '#E6E6FA',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  saveButtonText: { color: '#8A2BE2', fontSize: 16, fontWeight: 'bold' },
  textInput: {
    flex: 1,
    padding: 20,
    fontSize: 18,
    textAlignVertical: 'top',
    lineHeight: 26,
  },
});