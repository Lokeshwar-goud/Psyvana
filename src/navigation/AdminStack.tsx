// src/navigation/AdminStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import CreateQuestionnaireScreen from '../screens/CreateQuestionnaireScreen';
import AddQuestionsScreen from '../screens/AddQuestionsScreen';
// We will create and add 'CreateQuestionnaireScreen' here later

const Stack = createStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="CreateQuestionnaire" component={CreateQuestionnaireScreen} />
  <Stack.Screen name="AddQuestions" component={AddQuestionsScreen as React.ComponentType<any>} />
    </Stack.Navigator>
  );
}