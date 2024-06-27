import { EntriesProvider } from "@/contexts/EntriesContext";
import { Drawer } from "expo-router/drawer";

export default function RootLayout() {
  return (
    <Drawer>
      <Drawer.Screen name="(welcome)" options={{ headerShown: false }} />
    </Drawer>
  );
}
