import { useEffect } from "react";
import { Stack, router } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import axios from "axios";

console.log(`Using API URL: '${process.env.EXPO_PUBLIC_API_URL}'`);

axios.defaults.headers.common['Authorization'] = `Bearer ${SecureStore.getItem("token")}`;

export default function WelcomeLayout() {
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/api/user/profile`
        );
        console.log(`Successfully restored previous session with user: ${response.data.user.username}`);
        return true;
      } catch (error) {
        console.log(`Failed to restore previous session, redirecting to login page: (${error.response.status}) ${error.response.data.msg}`)
        return false; // Return false if an error occurs or user is not logged in
      }
    };

    const navigateToStatusScreen = async () => {
      if (await checkLoggedIn()) {
        router.navigate('(main)/status'); // Navigate to the status screen
      } else {
        // Optionally handle the case where the user is not logged in
        // For example, navigate to the login screen or display a login form
      }
    };

    navigateToStatusScreen(); // Call the function to initiate the navigation logic
  }, []);

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
