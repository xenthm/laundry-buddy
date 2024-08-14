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
  RefreshControl,
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

async function sendPushNotification(expoPushToken: string, machineId: string) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: "Machine " + machineId + " cycle complete!",
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
  })
    .then((response) => {
      // if (!response.ok) {
      //   Alert.alert(`HTTP error! Status: ${response.status}`, response.statusText);
      // }
      return response.json();
    });
  console.log(`Notification for ${machineId} sent!`);
}

function handleRegistrationError(errorMessage: string) {
  Alert.alert(errorMessage);
  console.error(errorMessage);
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
          projectId,
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

let globalToken: string;
registerForPushNotificationsAsync()
  .then((token) => {
    globalToken = token ?? "";
  })
  .catch((error: any) => console.error(error));

export default function Status() {
  const [entries, setEntries] = useState<any>([]);
  const [isFABOpen, setIsFABOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);
  const countdownIntervalRef = useRef<number | null>(null);
  const dashboardIntervalRef = useRef<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState(globalToken);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
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
      },
    },
    9: {
      washer: {
        available: 5,
        total: 5,
      },
      dryer: {
        available: 4,
        total: 4,
      },
    },
    17: {
      washer: {
        available: 5,
        total: 5,
      },
      dryer: {
        available: 4,
        total: 4,
      },
    },
  });

  const fetchWatchedMachines = async () => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/profile`
      );
      if (response.data.watchedMachines) {
        setEntries(response.data.watchedMachines);
      }
      console.log(`Successfully restored ${response.data.watchedMachines ? response.data.watchedMachines.length : '0'} watched machines`);
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status < 500
      ) {
        Alert.alert(
          "Failed to fetch watched machines",
          `${error.response.data.msg}`
        );
      } else {
        Alert.alert(
          "Failed to fetch watched machines",
          `Please contact the developers with the following information\n\n${error}`
        );
        console.error(error);
      }
    }
  };

  const fetchMachineCount = useCallback(async (floor: number, machineType: string) => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/machine/count`,
        { floor, machineType }
      );
      return response.data;
    } catch (error) {
      if (
        error.response &&
        error.response.status >= 400 &&
        error.response.status < 500
      ) {
        Alert.alert(
          "Failed to fetch machine count",
          `${error.response.data.msg}`
        );
      } else {
        Alert.alert(
          "Failed to fetch machine count",
          `Please contact the developers with the following information\n\n${error}`
        );
        console.error(error);
      }
    }
  }, [])

  const updateDashboard = useCallback(async () => {
    for (const floor in machineCount) {
      if (floor === "test") {
        continue;
      }

      const floorNum = Number(floor);
      for (const type of ["washer", "dryer"]) {
        const { available, total } = await fetchMachineCount(floorNum, type);
        setMachineCount((prevState) => ({
          ...prevState,
          [floorNum]: {
            ...prevState[floorNum],
            [type]: { available, total },
          },
        }));
      }

      try {
        await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/api/user/refresh`);
        await fetchWatchedMachines();
      } catch (error) {
        Alert.alert(
          "Failed to refresh user watched machine states",
          `Please contact the developers with the following information\n\n${error}`
        );
        console.error(error);
      }
    }
    console.log('Successfully restored machine count');
  }, [])

  useEffect(() => {
    // Notifications
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    // Get watched machines initially
    updateDashboard();
    fetchWatchedMachines();
    updateEntries();

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Timer for now watching
  useEffect(() => {
    if (entries.length > 0 && countdownIntervalRef.current === null) {
      countdownIntervalRef.current = window.setInterval(() => {
        updateEntries();
      }, 1000);
    } else if (entries.length === 0 && countdownIntervalRef.current != null) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    return () => {
      if (countdownIntervalRef.current != null) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [entries]);

  // auto-refresh dashboard
  useEffect(() => {
    dashboardIntervalRef.current = window.setInterval(() => {
      console.log('auto-refreshing');
      updateDashboard();
    }, 60000);

    return () => {
      if (dashboardIntervalRef.current != null) {
        clearInterval(dashboardIntervalRef.current);
        dashboardIntervalRef.current = null;
      }
    }
  }, [])

  // pull down to manaully refresh dashboard
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    console.log('manually refreshing');
    await updateDashboard();
    setRefreshing(false);
  }, []);

  const toggleTypeModalVisibility = () => {
    setIsTypeModalOpen(!isTypeModalOpen);
  };

  const toggleIDModalVisibility = () => {
    setIsIdModalOpen(!isIdModalOpen);
  };

  // remove this once test machine is removed
  const addEntry = async () => {
    try {
      if (
        entries.some((entry: any) => {
          return entry.id === "test";
        })
      ) {
        Alert.alert("Failed to watch machine", `Already watching machine test`);
        return;
      }

      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/watch-machine`,
        {},
        {
          headers: {
            machineId: "test",
          },
        }
      );
      setEntries(response.data.watchedMachines);
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 400 || error.response.status === 404)
      ) {
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

  // append status and alphaId to each entry
  const updateEntries = useCallback(() => {
    try {
      setEntries((prevEntries: any) =>
        prevEntries.map((item: any) => {
          let status = 'Available';
          if (item.notifSent === undefined) {
            item.notifSent = false;
          }
          if (item.state === 'on') {
            const remainingTime = new Date(item.endTime).getTime() - Date.now();
            if (remainingTime <= 999) {
              status = "Done";
              if (item.notifSent === false) {
                sendPushNotification(expoPushToken, item.machineId);
                item.notifSent = true;
              }
            } else if (remainingTime > 0) {
              const minutes = Math.floor(remainingTime / 1000 / 60);
              const seconds = Math.floor((remainingTime / 1000) % 60);
              status = `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""
                }${seconds}`;
            }
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
                  ListEmptyComponent={
                    <Text style={styles.watchText}>
                      {
                        "You are not watching any machines now.\nSelect the '+' button to watch a machine."
                      }
                    </Text>
                  }
                  contentContainerStyle={styles.list}
                  data={entries}
                  keyExtractor={(item) => item.machineId}
                  renderItem={({ item }) => (
                    <View style={styles.entryFullView}>
                      <View style={styles.entryView}>
                        <Text style={[styles.entry, { flex: 9 }]}>{item.machineId === 'test' ? 'Test' : `Level ${item.floor}`}</Text>
                        <Text style={[styles.entry, { flex: 10 }]}>
                          {item.machineType == "washer" ? "Washer" : (item.machineType == "dryer" ? "Dryer" : "")} {item.machineId === 'test' ? '' : item.alphaId}
                        </Text>
                        <Text style={[styles.entry, { flex: 9 }]}>{item.status}</Text>
                      </View>
                      <IconButton
                        icon="trash-can-outline"
                        size={30}
                        onPress={() => deleteEntry(item.machineId)}
                      />
                    </View>
                  )}
                  refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                  }
                />
              </View>
            </View>
            <Portal>
              <FAB.Group
                style={styles.fab}
                visible={true}
                open={isFABOpen}
                icon={isFABOpen ? "window-close" : "plus"}
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
                onStateChange={() => {
                  setIsFABOpen(!isFABOpen);
                }}
              />
            </Portal>
          </PaperProvider>
          <TypeModal
            visible={isTypeModalOpen}
            onClose={() => setIsTypeModalOpen(false)}
          ></TypeModal>
          <IDModal
            visible={isIdModalOpen}
            onClose={() => setIsIdModalOpen(false)}
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
    paddingTop: 10,
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
    justifyContent: "flex-start",
    height: 800,
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
    fontSize: 19,
    paddingHorizontal: 1,
    textAlign: "center",
  },
});
