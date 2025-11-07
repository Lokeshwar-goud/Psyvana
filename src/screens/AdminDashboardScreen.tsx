// src/screens/AdminDashboardScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { signOutUser } from '../services/authService';

import type { StackNavigationProp } from '@react-navigation/stack';

interface AdminDashboardScreenProps {
  navigation: StackNavigationProp<any, any>;
}

export default function AdminDashboardScreen({ navigation }: AdminDashboardScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <TouchableOpacity onPress={signOutUser}>
          <Feather name="log-out" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('CreateQuestionnaire')}
        >
          <Feather name="plus-circle" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Create New Questionnaire</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Feather name="edit" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Manage Existing</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#483D8B' }, // Admin theme
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  content: { flex: 1, justifyContent: 'center', padding: 20 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  icon: { marginRight: 15 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '500' },
});