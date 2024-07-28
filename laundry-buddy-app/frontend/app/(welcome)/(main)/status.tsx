import React, { useState, useRef, useEffect, useCallback } from "react";
import LevelMachines from "@/components/LevelMachines";
import { router } from "expo-router";
import axios from "axios";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  FlatList,
  Platform,
} from "react-native";
import { IconButton, FAB, Portal, PaperProvider } from "react-native-paper";
import TypeModal from "@/components/TypeModal";
import { EntriesContext } from "@/contexts/EntriesContext";
import IDModal from "@/components/IDModal";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { executeOnUIRuntimeSync } from "react-native-reanimated";

const bg = require("@/assets/images/water.png");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function sendPushNotification(expoPushToken: string) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Machine cycle complete!",
    body: "Laundry should be cleared soon.",
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
  console.log("Notification sent!");
}

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig.extra.eas.projectId,
        })
      ).data;
      console.log(pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}

export default function Status() {
  const [entries, setEntries] = useState<any>([]);
  const [isFABOpen, setIsFABOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const [machineCount, setMachineCount] = useState({
    test: {
      washer: {
        available: 1,
        total: 1,
      },
      dryer: {
        available: 0,
        total: 0,
      }
    },
    9: {
      washer: {
        available: 5,
        total: 5,
      },
      dryer: {
        available: 4,
        total: 4,
      }
    },
    17: {
      washer: {
        available: 5,
        total: 5,
      },
      dryer: {
        available: 4,
        total: 4,
      }
    }
  });
  const intervalRef = useRef<number | null>(null);

  const fetchWatchedMachines = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/profile`
      );
      if (response.data.watchedMachines) {
        console.log('Successfully restored watched machines');
        setEntries(response.data.watchedMachines);
      }
    } catch (error) {
      if (error.response && (error.response.status >= 400 && error.response.status < 500)) {
        Alert.alert("Failed to fetch watched machines", `${error.response.data.msg}`);
      } else {
        Alert.alert(
          "Failed to fetch watched machines",
          `Please contact the developers with the following information\n\n${error}`
        );
        console.error(error);
      }
    }
  }

  const fetchMachineCount = async (floor: number, machineType: string) => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/machine/count`,
        { floor, machineType }
      );
      return response.data;
    } catch (error) {
      if (error.response && (error.response.status >= 400 && error.response.status < 500)) {
        Alert.alert("Failed to fetch machine count", `${error.response.data.msg}`);
      } else {
        Alert.alert(
          "Failed to fetch machine count",
          `Please contact the developers with the following information\n\n${error}`
        );
        console.error(error);
      }
    }
  }

  const updateDashboard = async () => {
    for (const floor in machineCount) {
      if (floor === 'test') {
        continue;
      }
      const floorNum = Number(floor);
      for (const type of ['washer', 'dryer']) {
        const { available, total } = await fetchMachineCount(floorNum, type);
        setMachineCount(prevState => ({
          ...prevState,
          [floorNum]: {
            ...prevState[floorNum],
            [type]: { available, total },
          }, 
        }));
      }
    }
    console.log('Successfully restored machine count');
  }

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then((token) => setExpoPushToken(token ?? ""))
      .catch((error: any) => setExpoPushToken(`${error}`));

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Get watched machines initially
  useEffect(() => {
    fetchWatchedMachines();
    updateDashboard();
  }, [])

  // Timer for now watching
  useEffect(() => {
    if (entries.length > 0 && intervalRef.current === null) {
      intervalRef.current = window.setInterval(() => {
        updateEntries();
      }, 1000);
    } else if (entries.length === 0 && intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [entries]);

  const toggleTypeModalVisibility = () => {
    setIsTypeModalOpen(!isTypeModalOpen);
  };

  const toggleIDModalVisibility = () => {
    setIsIdModalOpen(!isIdModalOpen);
  };

  // remove this once test machine is removed
  const addEntry = async () => {
    try {
      if (entries.some((entry: any) => { return entry.id === 'test' })) {
        Alert.alert(
          "Failed to watch machine",
          `Already watching machine test`
        );
        return;
      }

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/watch-machine`, {}, {
        headers: {
          'machineId': 'test',
        }
      });
      setEntries(response.data.watchedMachines);
    } catch (error) {
      if (error.response && (error.response.status === 400 || error.response.status === 404)) {
        Alert.alert("Failed to watch machine", `${error.response.data.msg}`);
      } else {
        Alert.alert(
          "Failed to watch machine",
          `Please contact the developers with the following information\n\n${error}`
        );
        console.error(error);
      }
    }
  };

  // remove this once test machine is removed
  const updateEntries = useCallback(() => {
    try {
      setEntries((prevEntries: any) =>
        prevEntries.map((item: any) => {
          let status;
          const remainingTime = new Date(item.endTime).getTime() - Date.now();
          if (item.state === 'on') {
            if (remainingTime <= 999) {
              status = 'Done';
            } else if (remainingTime > 0) {
              const minutes = Math.floor((remainingTime / 1000) / 60);
              const seconds = Math.floor((remainingTime / 1000) % 60);
              status = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            }
          } else {
            status = 'Available';
          }

          const alphaId = item.machineId.slice(-1);
          return { ...item, status, alphaId };
        })
      );
    } catch (err) {
      console.error(err);
    }
  }, []);

  const deleteEntry = async (id) => {
    // const machineID = "test"; // hard-coded machineID
    const machineID = id;

    try {
      setEntries((entries: any) => {
        return entries.filter((item: any) => item.machineId != id);
      });

      await axios.delete(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/watch-machine`,
        {
          data: {
            all: false,
          },
          headers: {
            machineId: machineID,
          },
        }
      );
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 400 || error.response.status === 404)
      ) {
        Alert.alert(
          "Failed to set machine state",
          `${error.response.data.msg}`
        );
      } else {
        Alert.alert(
          "Failed to set machine state",
          `Please contact the developers with the following information\n\n${error}`
        );
        console.error(error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/logout`
      );
      Alert.alert("Log out", response.data.msg);
      router.back();
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status < 500
      ) {
        Alert.alert(
          "Failed to set machine state",
          `${error.response.data.msg}`
        );
      } else {
        Alert.alert(
          "Failed to set machine state",
          `Please contact the developers with the following information\n\n${error}`
        );
        console.error(error);
      }
    }
  };
  return (
    <EntriesContext.Provider value={{ entries, setEntries }}>
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={bg}
          resizeMode="cover"
          style={styles.imagebackground}
        >
          <PaperProvider>
            <View style={styles.optionsView}>
              <IconButton
                icon="account-circle"
                size={50}
                onPress={() => handleLogout()}
              />
              <IconButton
                icon="cog"
                size={50}
                onPress={() => console.log("Settings pressed")}
              />
            </View>
            <View style={styles.dashboard}>
              <View style={styles.titleView}>
                <Text style={styles.titleText}>Level</Text>
                <Text style={styles.titleText}>Washer</Text>
                <Text style={styles.titleText}>Dryer</Text>
              </View>
              <View style={styles.machineContainer}>
                <LevelMachines
                  level={17}
                  freeWashers={machineCount[17].washer.available}
                  totalWasher={machineCount[17].washer.total}
                  freeDryers={machineCount[17].dryer.available}
                  totalDryers={machineCount[17].dryer.total}
                >
                  {" "}
                </LevelMachines>
                <LevelMachines
                  level={9}
                  freeWashers={machineCount[9].washer.available}
                  totalWasher={machineCount[9].washer.total}
                  freeDryers={machineCount[9].dryer.available}
                  totalDryers={machineCount[9].dryer.total}
                >
                  {" "}
                </LevelMachines>
              </View>
              <View style={styles.titleView}>
                <Text style={styles.titleText}>Now Watching</Text>
              </View>
              <View style={styles.watchingView}>
                <FlatList
                  ListEmptyComponent={<Text style={styles.watchText}>{"You are not watching any machines now.\nSelect the '+' button to watch a machine."}</Text>}
                  contentContainerStyle={styles.list}
                  data={entries}
                  keyExtractor={(item) => item.machineId}
                  renderItem={({ item }) => (
                    <View style={styles.entryFullView}>
                      <View style={styles.entryView}>
                        <Text style={styles.entry}>{item.machineId === 'test' ? 'Test' : `Level ${item.floor}`}</Text>
                        <Text style={styles.entry}>
                          {item.machineType == "washer" ? "Washer" : (item.machineType == "dryer" ? "Dryer" : "")} {item.machineId === 'test' ? '' : item.alphaId}
                        </Text>
                        <Text style={styles.entry}>{item.status}</Text>
                      </View>
                      <IconButton
                        icon="trash-can-outline"
                        size={30}
                        onPress={() => deleteEntry(item.machineId)}
                      />
                    </View>
                  )}
                />
              </View>
            </View>
            <Portal>
              <FAB.Group
                style={styles.fab}
                visible={true}
                open={isFABOpen}
                icon={isFABOpen ? 'window-close' : 'plus'}
                fabStyle={styles.fabButton}
                color="black"
                backdropColor="#ffffff00"
                actions={[
                  {
                    icon: "bash",
                    label: "Machine ID",
                    color: "black",
                    style: { backgroundColor: "lightblue" },
                    onPress: () => toggleIDModalVisibility(),
                  },
                  {
                    icon: "tumble-dryer",
                    label: "Machine Type",
                    color: "black",
                    style: { backgroundColor: "lightblue" },
                    onPress: () => toggleTypeModalVisibility(),
                  },
                  {
                    icon: "code-braces",
                    label: "Watch test machine",
                    color: "black",
                    style: { backgroundColor: "lightblue" },
                    onPress: () => addEntry(),
                  },
                ]}
                onStateChange={() => { setIsFABOpen(!isFABOpen) }}
              />
            </Portal>
          </PaperProvider>
          <TypeModal
            visible={isTypeModalOpen}
            onClose={() => setIsTypeModalOpen(false)}
            sendPushNotification={() => sendPushNotification(expoPushToken)}
          ></TypeModal>
          <IDModal
            visible={isIdModalOpen}
            onClose={() => setIsIdModalOpen(false)}
            sendPushNotification={() => sendPushNotification(expoPushToken)}
          ></IDModal>
        </ImageBackground>
      </SafeAreaView>
    </EntriesContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
  },
  dashboard: {
    height: "100%",
    paddingTop: 10,
    alignItems: "flex-start",
  },
  machineContainer: {
    paddingTop: 10,
    alignItems: "flex-start",
  },
  ratioContainer: {
    flexDirection: "row",
  },
  image: {
    height: 240,
    width: 240,
    justifyContent: "center",
  },
  imagebackground: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  machinebackground: {
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderCurve: "continuous",
    borderRadius: 20,
    width: "80%",
  },
  titleView: {
    flexDirection: "row",
    paddingTop: 10,
    alignItems: "flex-start",
  },
  watchingView: {
    flexDirection: "row",
    paddingTop: 20,
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontFamily: "Roboto",
    fontSize: 22,
    fontWeight: "bold",
    alignItems: "center",
    textAlign: "center",
    color: "darkblue",
    flex: 1,
  },
  levelFullView: {
    flexDirection: "row",
    padding: 15,
    alignContent: "center",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    borderBottomWidth: 2,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomColor: "lightgrey",
  },
  levelView: {
    flex: 1,
  },
  optionsView: {
    paddingTop: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  levelText: {
    fontFamily: "Roboto",
    fontSize: 22,
    fontWeight: "bold",
    alignItems: "center",
    textAlign: "center",
    color: "black",
  },
  freeText: {
    fontFamily: "Roboto",
    fontSize: 22,
    alignItems: "center",
    textAlign: "center",
    color: "black",
  },
  watchText: {
    fontSize: 16,
    alignSelf: "center",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    textAlign: "left",
    color: "black",
    paddingHorizontal: 30,
  },
  availableText: {
    fontFamily: "Roboto",
    fontSize: 12,
    alignItems: "center",
    textAlign: "center",
    color: "black",
  },
  machinesText: {
    fontFamily: "Roboto",
    fontSize: 22,
    alignItems: "center",
    textAlign: "center",
    color: "black",
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: "white",
  },
  fab: {
    position: "absolute",
    margin: 10,
    right: 0,
    bottom: 0,
  },
  fabButton: {
    color: "blue",
    backgroundColor: "lightblue",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  optionButton: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#ddd",
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
  },
  list: {
    flexGrow: 1,
    justifyContent: "space-around",
  },
  entryFullView: {
    flexDirection: "row",
    padding: 0,
    marginVertical: 0,
    borderRadius: 10,
    alignContent: "center",
    justifyContent: "space-around",
    alignSelf: "center",
  },
  entryView: {
    flexDirection: "row",
    padding: 10,
    width: 300,
    backgroundColor: "#add8e6",
    marginVertical: 5,
    borderRadius: 10,
    alignContent: "center",
    justifyContent: "space-around",
    alignSelf: "center",
  },
  entry: {
    fontSize: 20,
    textAlign: "center",
    alignItems: "center",
    alignSelf: "center",
  },
});
