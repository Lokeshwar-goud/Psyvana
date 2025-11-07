// src/screens/DashboardScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Using the recommended SafeAreaView
import { Feather } from '@expo/vector-icons';
import { signOutUser } from '../services/authService';

// This array makes it easy to manage the dashboard buttons
// --- 1. ADDED 'edit-3' TO THE ICON TYPE ---
type FeatherIconName = 'heart' | 'edit-3' | 'bar-chart-2' | 'sun' | 'users';
interface MenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: FeatherIconName;
  screen: string;
}

// --- 2. ADDED THE NEW JOURNAL ITEM AND RE-NUMBERED THE IDs ---
const menuItems: MenuItem[] = [
  { id: '1', title: 'Self-Assessment', subtitle: 'Check your current mental state', icon: 'heart', screen: 'QuestionnaireList' }, // Make sure screen is 'QuestionnaireList'
  { id: '2', title: 'New Journal Entry', subtitle: 'Write down your thoughts', icon: 'edit-3', screen: 'Journal' },
  { id: '3', title: 'My Progress', subtitle: 'Track your wellness journey', icon: 'bar-chart-2', screen: 'MyProgress' },
  { id: '4', title: 'Recommendations', subtitle: 'Personalized wellness tips', icon: 'sun', screen: 'Recommendations' }, // Placeholder
  { id: '5', title: 'Professional Help', subtitle: 'Connect with experts', icon: 'users', screen: 'ProfessionalHelp' }, // Placeholder
];

import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';

type DashboardScreenNavigationProp = StackNavigationProp<any, any>;

interface DashboardScreenProps {
  navigation: DashboardScreenNavigationProp;
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {

  // This function renders each card in our list
  const renderItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate(item.screen)}
    >
      <View style={[styles.iconContainer, { backgroundColor: '#E6E6FA' }]}>
        <Feather name={item.icon} size={24} color="#8A2BE2" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={24} color="#C0C0C0" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hello there!</Text>
        <Text style={styles.subtitle}>How are you feeling today?</Text>
      </View>

      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />

       <TouchableOpacity style={styles.signOutButton} onPress={signOutUser}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 20, 
    paddingBottom: 30 
  },
  title: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#483D8B', 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 18, 
    color: '#6A5ACD', 
    textAlign: 'center', 
    marginTop: 8 
  },
  listContainer: { 
    paddingHorizontal: 20 
  },
  card: {
    flexDirection: 'row',
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
  iconContainer: { 
    padding: 15, 
    borderRadius: 10, 
    marginRight: 15 
  },
  textContainer: { 
    flex: 1 
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#483D8B' 
  },
  cardSubtitle: { 
    fontSize: 14, 
    color: '#778899', 
    marginTop: 4 
  },
  signOutButton: { 
    margin: 20, 
    alignItems: 'center' 
  },
  signOutText: { 
    fontSize: 16, 
    color: '#6A5ACD', 
    fontWeight: '500' 
  },
});