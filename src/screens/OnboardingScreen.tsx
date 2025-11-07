// src/screens/OnboardingScreen.tsx

import React, { useRef } from 'react';
import { View, Text, StyleSheet, FlatList, useWindowDimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, Extrapolate, SharedValue } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

// --- Data for our slides ---
const onboardingSlides = [
  {
    id: '1',
    icon: 'smile',
    title: 'Welcome to Psyvana',
    description: 'Begin your journey towards self-awareness and mental well-being in a safe, private space.',
  },
  {
    id: '2',
    icon: 'bar-chart-2',
    title: 'Track Your Progress',
    description: 'Use clinically-validated assessments to understand your feelings and visualize your progress over time.',
  },
  {
    id: '3',
    icon: 'heart',
    title: 'Find Support',
    description: 'Access personalized resources or connect seamlessly with verified professionals when you need them.',
  },
];

// --- Type Definitions ---
type SlideItemProps = {
  item: typeof onboardingSlides[0];
  scrollX: SharedValue<number>;
  index: number;
};
  interface PaginationProps {
    data: typeof onboardingSlides;
    scrollX: SharedValue<number>;
  }

type OnboardingScreenProps = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

// --- Reusable Slide Item Component ---
const SlideItem = ({ item, scrollX, index }: SlideItemProps) => {
  const { width } = useWindowDimensions();
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], Extrapolate.CLAMP);
    const translateY = interpolate(scrollX.value, inputRange, [40, 0, 40], Extrapolate.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View style={[styles.slideContainer, { width }]}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <Feather name={item.icon as any} size={80} color="#483D8B" style={styles.icon} />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
};

// --- Reusable Pagination Component ---
const Pagination = ({ data, scrollX }: PaginationProps) => {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.paginationContainer}>
  {data.map((_: typeof onboardingSlides[0], i: number) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const animatedStyle = useAnimatedStyle(() => {
          const dotWidth = interpolate(scrollX.value, inputRange, [10, 25, 10], Extrapolate.CLAMP);
          const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], Extrapolate.CLAMP);
          return {
            width: dotWidth,
            opacity,
          };
        });
        return <Animated.View key={i.toString()} style={[styles.dot, animatedStyle]} />;
      })}
    </View>
  );
};

// --- Main Onboarding Screen Component ---
export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const { width } = useWindowDimensions();
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);

  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollX.value = event.contentOffset.x;
  });

  const handleNextPress = (currentIndex: number) => {
    if (currentIndex < onboardingSlides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <LinearGradient colors={['#E6E6FA', '#F0F8FF', '#FFFFFF']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.FlatList
          ref={flatListRef}
          data={onboardingSlides}
          renderItem={({ item, index }) => <SlideItem item={item} scrollX={scrollX} index={index} />}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          bounces={false}
        />
        <View style={styles.footer}>
          <Pagination data={onboardingSlides} scrollX={scrollX} />
          <TouchableOpacity onPress={() => handleNextPress(Math.round(scrollX.value / width))}>
            <LinearGradient colors={['#8A2BE2', '#BA55D3']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  slideContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  icon: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#483D8B',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#6A5ACD',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8A2BE2',
    marginHorizontal: 8,
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 80,
    borderRadius: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});