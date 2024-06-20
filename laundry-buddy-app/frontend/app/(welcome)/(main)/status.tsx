import React, { createContext, useContext, useState } from "react";
import LevelMachines from "@/components/LevelMachines";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Modal,
  TouchableOpacity,
  Button,
} from "react-native";
import { IconButton, FAB, Portal, PaperProvider } from "react-native-paper";
import TypeModal from "@/components/TypeModal";
import { TypeStateContext } from "@/contexts/TypeStateContext";


const bg = require("@/assets/images/water.png");

export default function Status() {
  const [showWatchText, setShowWatchText] = useState(true);
  const [state, setState] = React.useState({ open: false });
  // state variable for both the ID and Type Modal
  //const context = useContext(TypeStateContext);
  const [isIDModalOpen, setIDModalOpen] = useState(false);
  const onStateChange = ({ open }) => setState({ open });
  const { open } = state;
  const [isTypeModalOpen, setTypeModalOpen] = useState(false);
  const toggleTypeModalVisibility = () => {
    setTypeModalOpen(!isTypeModalOpen);
  };
  //if user is watching a machine, set showWatchText to FALSE
  return (
    <TypeStateContext.Provider value={{isTypeModalOpen, setTypeModalOpen}}>
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
                onPress={() => console.log("Pressed")}
              />
              <IconButton
                icon="cog"
                size={50}
                onPress={() => console.log("Pressed")}
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
              </View>
              <View style={styles.titleView}>
                <Text style={styles.titleText}>Now Watching</Text>
              </View>
              <View style={styles.watchingView}>
                <Text style={styles.watchText}>
                  {showWatchText
                    ? "You are currently not watching any machines. Press the '+' button to watch a machine."
                    : ""}
                </Text>
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
                    onPress: () => setIDModalOpen(true),
                  },
                  {
                    icon: "tumble-dryer",
                    label: "Machine Type",
                    color: "black",
                    style: { backgroundColor: "lightblue" },
                    onPress: () => toggleTypeModalVisibility(),
                  },
                ]}
                onStateChange={onStateChange}
                onPress={() => {
                  if (open) {
                    // do something if the speed dial is open
                  }
                }}
              />
            </Portal>
          </PaperProvider>
          <TypeModal></TypeModal>
        </ImageBackground>
      </SafeAreaView>
    </TypeStateContext.Provider>
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
    flexDirection: "column",
    paddingTop: 20,
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
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
});
