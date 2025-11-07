// src/screens/MyProgressScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';
import { getAssessmentHistory, getJournalHistory } from '../services/assessmentService';
import { LineChart } from "react-native-gifted-charts";
import { CompletedAssessment, JournalEntry } from '../types'; // Import our types

// Define the shape of our chart data
interface ChartDataPoint {
  value: number;
  label: string;
}

export default function MyProgressScreen({ navigation }: { navigation: any }) {
  // Use our new types for state
  const [assessmentHistory, setAssessmentHistory] = useState<CompletedAssessment[]>([]);
  const [assessmentChartData, setAssessmentChartData] = useState<ChartDataPoint[]>([]);
  const [sentimentChartData, setSentimentChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAllHistory = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      const [assessmentResult, journalResult] = await Promise.all([
        getAssessmentHistory(userId),
        getJournalHistory(userId)
      ]);

      // --- THIS BLOCK IS NOW FULLY TYPE-SAFE ---
      if (assessmentResult.success) {
        // TypeScript KNOWS assessmentResult has .history because .success is true
        setAssessmentHistory(assessmentResult.history); 
        const formattedData = assessmentResult.history.slice(0, 7).reverse().map(item => ({
          value: item.totalScore,
          label: new Date(item.completedAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }));
        setAssessmentChartData(formattedData);
      }

      if (journalResult.success) {
        const formattedData = journalResult.history.slice(0, 7).reverse().map(item => ({
          value: item.sentimentScore || 0, // Use || 0 as a fallback
          label: new Date(item.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }));
        setSentimentChartData(formattedData);
      }

      setIsLoading(false);
    };
    loadAllHistory();
  }, []);

  const renderHistoryItem = ({ item }: { item: CompletedAssessment }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.cardTitle}>{item.severityLevel}</Text>
        <Text style={styles.cardDate}>
          {new Date(item.completedAt.seconds * 1000).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
      </View>
      <Text style={styles.cardScore}>{item.totalScore}</Text>
    </View>
  );

  // ... (Rest of the component remains the same) ...
  
  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#8A2BE2" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#483D8B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Progress</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        <Text style={styles.chartHeader}>Assessment Scores</Text>
        <View style={styles.chartContainer}>
          {assessmentChartData.length > 1 ? (
            <LineChart
              data={assessmentChartData}
              height={220}
              color="#8A2BE2"
              thickness={3}
              startFillColor="rgba(138, 43, 226, 0.1)"
              endFillColor="rgba(138, 43, 226, 0.01)"
              dataPointsColor="#8A2BE2"
              yAxisTextStyle={{ color: '#778899' }}
              xAxisLabelTextStyle={{ color: '#778899' }}
              yAxisLabelSuffix="/27"
              maxValue={27}
              noOfSections={4}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Complete at least two assessments to see your progress chart.</Text>
            </View>
          )}
        </View>

        <Text style={styles.chartHeader}>Journal Sentiment</Text>
        <View style={styles.chartContainer}>
          {sentimentChartData.length > 1 ? (
            <LineChart
              data={sentimentChartData}
              height={220}
              color="#32CD32"
              thickness={3}
              startFillColor="rgba(50, 205, 50, 0.1)"
              endFillColor="rgba(50, 205, 50, 0.01)"
              dataPointsColor="#32CD32"
              yAxisTextStyle={{ color: '#778899' }}
              xAxisLabelTextStyle={{ color: '#778899' }}
              maxValue={1}
              mostNegativeValue={-1}
              yAxisLabelTexts={['-1.0', '-0.5', '0.0', '0.5', '1.0']}
              noOfSections={4}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>Write at least two journal entries to see your sentiment trend.</Text>
            </View>
          )}
        </View>

        <Text style={styles.listHeader}>Recent Assessments</Text>
        {assessmentHistory.length > 0 ? (
           <FlatList
            data={assessmentHistory}
            renderItem={renderHistoryItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>You haven't completed any assessments yet.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#483D8B' },
  chartHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#483D8B',
    marginHorizontal: 20,
    marginTop: 10,
  },
  chartContainer: {
    backgroundColor: 'white',
    margin: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#483D8B',
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  listContainer: { paddingHorizontal: 20 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#483D8B' },
  cardDate: { fontSize: 14, color: '#778899', marginTop: 4 },
  cardScore: { fontSize: 24, fontWeight: 'bold', color: '#8A2BE2' },
  placeholderContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#778899',
    textAlign: 'center',
  }
});