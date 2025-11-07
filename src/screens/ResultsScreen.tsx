// src/screens/ResultsScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { AppStackParamList } from '../navigation/AppStack';
import { getAssessmentById } from '../services/assessmentService';

type ResultsScreenRouteProp = RouteProp<AppStackParamList, 'Results'>;
type ResultsScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Results'>;

type Props = {
  route: ResultsScreenRouteProp;
  navigation: ResultsScreenNavigationProp;
};

type ScoringRule = {
  level: string;
  minScore: number;
  maxScore: number;
};

export default function ResultsScreen({ route, navigation }: Props) {
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [scoringRules, setScoringRules] = useState<ScoringRule[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if ('assessmentId' in route.params) {
        const result = await getAssessmentById(route.params.assessmentId);
        if (result) {
          setTotalScore(result.totalScore);
          setScoringRules(result.scoringRules);
        }
      } else {
        setTotalScore(route.params.totalScore);
        setScoringRules(route.params.scoringRules);
      }
      setLoading(false);
    };

    fetchResults();
  }, [route.params]);

  const getResultDetails = () => {
    if (totalScore === null || !scoringRules) {
      return { level: 'Loading...' };
    }
    for (const rule of scoringRules) {
      if (totalScore >= rule.minScore && totalScore <= rule.maxScore) {
        return { level: rule.level };
      }
    }
    return { level: 'Undetermined' };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#8A2BE2" />
      </SafeAreaView>
    );
  }

  const result = getResultDetails();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headerText}>Your Result</Text>

        <View style={styles.resultCard}>
          <Text style={styles.scoreLabel}>Your Score</Text>
          <Text style={styles.scoreText}>{totalScore}</Text>
          <Text style={styles.levelText}>{result.level}</Text>
        </View>

        <View style={styles.infoBox}>
          <Feather name="info" size={24} color="#6A5ACD" />
          <Text style={styles.infoText}>
            This is not a diagnosis. This tool is for informational purposes to help you track your well-being. Please consult a healthcare professional for a diagnosis.
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.doneButton} onPress={() => navigation.navigate('Dashboard')}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', justifyContent: 'center' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#483D8B',
    marginBottom: 40,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 40,
  },
  scoreLabel: {
    fontSize: 18,
    color: '#778899',
  },
  scoreText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#8A2BE2',
    marginVertical: 10,
  },
  levelText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#483D8B',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E6E6FA',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#6A5ACD',
    marginLeft: 15,
    lineHeight: 20,
  },
  doneButton: {
    backgroundColor: '#8A2BE2',
    margin: 20,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
