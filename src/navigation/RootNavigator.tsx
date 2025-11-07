// src/navigation/RootNavigator.tsx
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

import AuthStack from './AuthStack';
import AppStack from './AppStack';
import AdminStack from './AdminStack'; // Import the new AdminStack

// Define a type for our user profile data from Firestore
type UserProfile = {
  role: 'admin' | 'user';
  // other fields like displayName, email, etc.
};

export default function RootNavigator() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
      if (authenticatedUser) {
        // User is logged in, now fetch their profile from Firestore
        const userDocRef = doc(db, 'users', authenticatedUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          setUserProfile(userDocSnap.data() as UserProfile);
        } else {
          // Handle case where user exists in Auth but not Firestore (optional)
          setUserProfile(null);
        }
      } else {
        // User is logged out
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return unsubscribe; // Unsubscribe when component unmounts
  }, []);

  if (isLoading) {
    // Show a loading screen while we check for the user
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userProfile?.role === 'admin' ? (
        <AdminStack />
      ) : userProfile?.role === 'user' ? (
        <AppStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}