import { Stack } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import axios from "axios";

console.log(`Using API URL: '${process.env.EXPO_PUBLIC_API_URL}'`);

axios.defaults.headers.common['Authorization'] = `Bearer ${SecureStore.getItem("token")}`;

export default function WelcomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000000',
        },
        headerShown: false,
      }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="forget" options={{ headerShown: false }} />
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
    </Stack>
  );
}
