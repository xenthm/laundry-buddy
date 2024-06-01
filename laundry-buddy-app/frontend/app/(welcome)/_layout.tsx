import { Stack } from 'expo-router';

export default function WelcomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000000',
        }
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }}/>
      <Stack.Screen name="signup" options={{headerShown: false}}/>
      <Stack.Screen name="forget" options={{headerShown: false}}/>
    </Stack>
  );
}
