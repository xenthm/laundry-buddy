import { EntriesContext } from "@/contexts/EntriesContext";
import { useContext, useState, useEffect } from "react";
import {
  Alert,
  Modal,
  TouchableOpacity,
  View,
  Text,
  Button,
  StyleSheet,
} from "react-native";
import React from "react";
import axios from "axios";

// This modal searches for the fastest completed machine with the chosen requirements
// These requirements are either by floor (or any floor) or by machine type

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const TypeModal = ({ visible, onClose, sendPushNotification }) => {
  //const { isTypeModalOpen, setTypeModalOpen } = useContext(TypeStateContext);
  const { entries, setEntries } = useContext<any>(EntriesContext);
  const [selectedType, setSelectedType] = useState("");
  const [selectedFloor, setSelectedFloor] = useState<any>(0);
  const [responseAlphaId, setResponseAlphaId] = useState("");


  const handleTypeSelect = (option) => {
    if (option === 'W') {
      option = 'washer';
    } else if (option === 'D') {
      option = 'dryer';
    } else {
      return;
    }
    setSelectedType(option);
  };

  const handleFloorSelect = (option) => {
    setSelectedFloor(option);
  };

  const makeNewEntry = async (machine) => {
    const endTime = new Date(machine.endTime);
    const remainingTime = new Date(endTime.getTime() - Date.now()).getTime();
    let status;
    if (machine.state === 'on') {
      if (endTime.getTime() > Date.now()) {
        status = 'In use';
      } else {
        status = 'Complete';
      }
    } else {
      status = 'Not in use';
    }

    const newMachineId = machine.machineId;
    const newAlphaId = newMachineId.slice(-1); // in the machine naming convention, the last character is the unique identifier for its floor
    console.log(`machine alpha id is: ${newAlphaId}`);
    setResponseAlphaId(newAlphaId);

    return {
      id: newMachineId,
      alpha_id: newAlphaId,
      floor: machine.floor,
      type: selectedType,
      status: status,
      duration: machine.duration,
      endTime: endTime,
      notifSent: false,
    };
  };

  const addEntry = async () => {
    onClose();
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/user/watch-earliest-machine`,
        {
          'earliestMachineType': selectedType,
          'earliestMachineFloor': selectedFloor,
        },
      );

      if (entries.some((entry: any) => { return entry.id === response.data.machineId })) {
        Alert.alert(
          "Failed to watch earliest machine",
          `Already watching machine ${response.data.machineId}`
        );
        return;
      }
      setEntries(response.data.watchedMachines);
    } catch (error) {
      if (error.response && (error.response.status === 400 || error.response.status === 404)) {
        Alert.alert("Failed to watch earliest machine", `${error.response.data.msg}`);
      } else {
        Alert.alert(
          "Failed to watch machine",
          `Please contact the developers with the following information\n\n${error}`
        );
        console.error(error);
      }
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Machine Type</Text>
          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                selectedType === "washer" && styles.selectedButton,
              ]}
              onPress={() => handleTypeSelect("W")}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedType === "washer" && styles.selectedText,
                ]}
              >
                Washer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                selectedType === "dryer" && styles.selectedButton,
              ]}
              onPress={() => handleTypeSelect("D")}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedType === "dryer" && styles.selectedText,
                ]}
              >
                Dryer
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.modalTitle}>Floor</Text>
          <View style={styles.optionTopContainer}>
            <TouchableOpacity
              style={[
                styles.optionAllButton,
                selectedFloor === "all" && styles.selectedButton,
              ]}
              onPress={() => handleFloorSelect("all")}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedFloor === "all" && styles.selectedText,
                ]}
              >
                All Floors
              </Text>
            </TouchableOpacity>
            <View style={styles.optionBottomContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedFloor === 9 && styles.selectedButton,
                ]}
                onPress={() => handleFloorSelect(9)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedFloor === 9 && styles.selectedText,
                  ]}
                >
                  Floor 9
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedFloor === 17 && styles.selectedButton,
                ]}
                onPress={() => handleFloorSelect(17)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedFloor === 17 && styles.selectedText,
                  ]}
                >
                  Floor 17
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Cancel" color="red" onPress={onClose} />
            <Button title="Watch" onPress={addEntry} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  optionContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    flexDirection: "row",
  },
  optionBottomContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    flexDirection: "row",
  },
  optionTopContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    flexDirection: "column",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-around",
    width: "100%",
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
    marginBottom: 5,
  },
  optionButton: {
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 5,
    backgroundColor: "#ddd",
    borderRadius: 5,
    height: 40,
    width: 80,
    alignItems: "center",
  },
  optionAllButton: {
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 5,
    backgroundColor: "#ddd",
    borderRadius: 5,
    height: 40,
    width: 165,
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
  },

  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  selectedButton: {
    backgroundColor: "darkgrey",
  },
  selectedText: {
    color: "#fff",
  },
});

export default TypeModal;
