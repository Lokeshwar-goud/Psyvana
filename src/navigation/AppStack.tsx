// src/navigation/AppStack.tsx

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DashboardScreen from '../screens/DashboardScreen';
import QuestionnaireListScreen from '../screens/QuestionnaireListScreen';
import SelfAssessmentScreen from '../screens/SelfAssessmentScreen';
import ResultsScreen from '../screens/ResultsScreen';
import MyProgressScreen from '../screens/MyProgressScreen';
import JournalScreen from '../screens/JournalScreen';

// Define the parameters for each screen in the stack
export type AppStackParamList = {
  Dashboard: undefined;
  QuestionnaireList: undefined;
  SelfAssessment: { questionnaireId: string };
  Results: { totalScore: number; scoringRules: any[] } | { assessmentId: string };
  MyProgress: undefined;
  Journal: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="QuestionnaireList" component={QuestionnaireListScreen} />
      <Stack.Screen name="SelfAssessment" component={SelfAssessmentScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="MyProgress" component={MyProgressScreen} />
      <Stack.Screen name="Journal" component={JournalScreen} />
    </Stack.Navigator>
  );
}