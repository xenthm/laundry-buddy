import { Tabs } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export default function status() {
  // const [username, setUsername] = useState("");
  // const retrieveUser = async () => {
  //   try {
  //     const token = await SecureStore.getItemAsync("token");
  //     const response = await axios.get(
  //       "https://laundry-buddy.onrender.com/api/user/profile",
  //       {
  //         headers: {
  //           Authorization: "Bearer " + token,
  //         },
  //       }
  //     );

  //     const { email, username } = response.data;
  //     setUsername(username);
  //   } catch (error) {
  //     // can use this to see what the response was from the API
  //     if (error.response && error.response.status === 400) {
  //       Alert.alert("Something went wrong", `${error.response.data.msg}`);
  //     } else {
  //       Alert.alert(
  //         "Something went wrong",
  //         `Please contact the developers with the following information\n\n${error}`
  //       );
  //       console.log(Object.keys(error.request._response));
  //       console.error(error.request);
  //     }
  //   }
  // };
  // useEffect(() => {
  //   // write your code here, it's like componentWillMount
  //   retrieveUser();
  // }, []);
  
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
