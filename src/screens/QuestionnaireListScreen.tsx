// src/screens/QuestionnaireListScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Feather } from '@expo/vector-icons';

// Define the shape of a questionnaire
interface Questionnaire {
  id: string;
  title: string;
  description: string;
  // Add other fields if they exist
}

// Define navigation props
type QuestionnaireListProps = {
  navigation: {
    navigate: (screen: string, params: { questionnaireId: string, questionnaireTitle: string }) => void;
    goBack: () => void;
  };
};

export default function QuestionnaireListScreen({ navigation }: QuestionnaireListProps) {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "questionnaires"));
        const fetchedData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Questionnaire[];
        setQuestionnaires(fetchedData);
      } catch (error) {
        console.error("Error fetching questionnaires: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestionnaires();
  }, []);

  const renderItem = ({ item }: { item: Questionnaire }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SelfAssessment', {
        questionnaireId: item.id,
        questionnaireTitle: item.title,
      })}
    >
      <View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.description}</Text>
      </View>
      <Feather name="chevron-right" size={24} color="#C0C0C0" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#8A2BE2" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#483D8B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose an Assessment</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={questionnaires}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.placeholderText}>No assessments available right now.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#483D8B' },
  listContainer: { paddingHorizontal: 20 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#483D8B' },
  cardSubtitle: { fontSize: 14, color: '#778899', marginTop: 4, paddingRight: 20 },
  placeholderText: { fontSize: 16, color: '#778899' },
});