import { Tabs } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";

export default function status() {  
  return (
    <Tabs>
      <Tabs.Screen
        name="status"
        options={{
          headerShown: false,
          tabBarStyle: { height: 55 },
          tabBarLabel: "Home",
          tabBarIcon: ({ color = "darkblue" }) => (
            <MaterialIcons
              name="local-laundry-service"
              color={color}
              size={35}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          headerShown: false,
          tabBarStyle: { height: 55 },
          tabBarLabel: "Statistics",
          tabBarIcon: ({ color = "darkblue" }) => (
            <AntDesign name="linechart" color={color} size={35} />
          ),
        }}
      />
    </Tabs>
  );
}
