import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import LevelMachines from "@/components/LevelMachines";
import { router } from 'expo-router';
import axios from "axios";
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  FlatList,
} from "react-native";
import { IconButton, FAB, Portal, PaperProvider } from "react-native-paper";
import TypeModal from "@/components/TypeModal";
import { EntriesContext } from "@/contexts/EntriesContext";
import IDModal from "@/components/IDModal";

const bg = require("@/assets/images/water.png");

export default function Status() {
  const [entries, setEntries] = useState<any>([]);
  const [state, setState] = React.useState({ open: false });
  const animationRef = useRef<number | null>(null);
  const onStateChange = ({ open }) => setState({ open });
  const { open } = state;
  const [isTypeModalOpen, setTypeModalOpen] = useState(false);
  const [isIdModalOpen, setIModalOpen] = useState(false);

  const [testAvail, setTestAvail] = useState(true);   // TODO: refresh status page and get machine info overview at a set interval (auto refresh), or when user refreshes page

  const toggleTypeModalVisibility = () => {
    setTypeModalOpen(!isTypeModalOpen);
  };

  const toggleIDModalVisibility = () => {
    setIModalOpen(!isIdModalOpen);
    console.log(`entries length: ${entries.length}`);
  };

  // remove this once test machine is removed
  const makeNewEntry = async (newMachineId: any) => {
    try {
      const response = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL}/api/machine`,
        {
          headers: {
            'machineId': newMachineId,
          }
        }
      );

      const endTime = new Date(response.data.endTime);
      let status;
      if (response.data.state === 'on') {
        if (endTime.getTime() > Date.now()) {
          status = 'In use';
        } else {
          status = 'Complete';
        }
      } else {
        status = 'Not in use';
      }

      return {
        id: newMachineId,
        alpha_id: '',  // not from response
        floor: 'test',       // not from response
        type: response.data.machineType,
        status: status,
        duration: response.data.duration,
        endTime: endTime,
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        Alert.alert("Failed to get machine state", `${error.response.data.msg}`);
      } else {
        Alert.alert(
          "Failed to get machine state",
          `Please contact the developers with the following information\n\n${error}`
        );
        console.error(error);
      }
    }
  };

  // remove this once test machine is removed
  const addEntry = async () => {
    const newMachineID = "test";
    try {
      setEntries([
        ...entries,
        await makeNewEntry(newMachineID),
      ]);
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/watch-machine`,
        {},
        {
          headers: {
            'machineId': newMachineID,
          }
        }
      );
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
          if (item.status === 'Not in use') {
            setTestAvail(true);
            return item;
          }
          const remainingTime = new Date(item.endTime.getTime() - Date.now());
          if (remainingTime.getTime() <= 999) {
            setTestAvail(true);
            return { ...item, status: 'Complete' };
          }
          setTestAvail(false);
          return { ...item, status: `${remainingTime.getMinutes() < 10 ? '0' : ''}${remainingTime.getMinutes()}:${remainingTime.getSeconds() < 10 ? '0' : ''}${remainingTime.getSeconds()} left` };
        })
      );
    } catch (err) {
      console.error(err);
    }
  }, []);

  const tick = useCallback(() => {
    updateEntries();
    animationRef.current = requestAnimationFrame(tick);
  }, [updateEntries]);

  useEffect(() => {
    if (!animationRef.current && entries.length > 0) {
      animationRef.current = requestAnimationFrame(tick);
    } else if (entries.length === 0) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [entries, tick]);

  const deleteEntry = async (id) => {
    // const machineID = "test"; // hard-coded machineID
    const machineID = id;

    try {
      setEntries((entries: any) => {
        return entries.filter((item: any) => item.id !== id);
      });

      const response = await axios.delete(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/watch-machine`,
        {
          data: {
            'all': false,
          },
          headers: {
            'machineId': machineID,
          },
        }
      );
    } catch (error) {
      if (error.response && (error.response.status === 400 || error.response.status === 404)) {
        Alert.alert("Failed to set machine state", `${error.response.data.msg}`);
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
      Alert.alert('Log out', response.data.msg);
      router.back();
    } catch (error) {
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        Alert.alert("Failed to set machine state", `${error.response.data.msg}`);
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
                  freeWashers={1}
                  totalWasher={5}
                  freeDryers={2}
                  totalDryers={4}
                >
                  {" "}
                </LevelMachines>
                <LevelMachines
                  level={9}
                  freeWashers={3}
                  totalWasher={5}
                  freeDryers={4}
                  totalDryers={4}
                >
                  {" "}
                </LevelMachines>
                <LevelMachines
                  level={'test'}
                  freeWashers={testAvail ? 1 : 0}
                  totalWasher={1}
                  freeDryers={0}
                  totalDryers={0}
                >
                  {" "}
                </LevelMachines>
              </View>
              <View style={styles.titleView}>
                <Text style={styles.titleText}>Now Watching</Text>
              </View>
              <View style={styles.watchingView}>
                {!entries.length ? (
                  <Text style={styles.watchText}>{"You are not watching any machines now. Select the '+' button to watch a machine."}</Text>
                ) : (
                  <FlatList
                    contentContainerStyle={styles.list}
                    data={entries}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.entryFullView}>
                        <View style={styles.entryView}>
                          {/* If item.type == A, needs to be handled by backend to determine
                          which level has the fastest machine time */}
                          <Text style={styles.entry}>{(item.id && item.id === 'test') ? '' : 'Level'} {item.floor}</Text>
                          <Text style={styles.entry}>
                            {" "}
                            {item.type == "washer" ? "Washer" : (item.type == "dryer" ? "Dryer" : "")} {item.alpha_id}
                          </Text>
                          <Text style={styles.entry}> {item.status}</Text>
                        </View>
                        <IconButton
                          icon="trash-can-outline"
                          size={30}
                          onPress={() => deleteEntry(item.id)}
                        // to link
                        />
                      </View>
                    )}
                  />
                )}
              </View>
            </View>
            <Portal>
              <FAB.Group
                style={styles.fab}
                open={open}
                visible
                icon={open ? "filter-menu" : "plus"}
                label={open ? "Filter watch by" : ""}
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
                onStateChange={onStateChange}
              />
            </Portal>
          </PaperProvider>
          <TypeModal
            visible={isTypeModalOpen}
            onClose={() => setTypeModalOpen(false)}
          ></TypeModal>
          <IDModal
            visible={isIdModalOpen}
            onClose={() => setIModalOpen(false)}
          ></IDModal>
        </ImageBackground>
      </SafeAreaView>
    </EntriesContext.Provider >
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
    alignSelf: "flex-start",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    textAlign: "center",
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
    margin: 16,
    right: 10,
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
    padding: 10,
    marginVertical: 5,
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
