import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import GameScreen from '../../components/GameScreen';
export default function Home() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <GameScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});
