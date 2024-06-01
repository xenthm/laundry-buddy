import { Tabs } from 'expo-router';

export default function FunctionLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000000',
        }
      }}>
      <Tabs.Screen name="dashboard" options={{ headerShown: false }}/>
    </Tabs>
  );
}
