import { EntriesContext } from "@/contexts/EntriesContext";
import { useContext, useState, useEffect } from "react";
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  Button,
  StyleSheet,
} from "react-native";
import React from "react";

// This modal searches for the fastest completed machine with the chosen requirements
// These requirements are either by floor (or any floor) or by machine type

const TypeModal = ({ visible, onClose }) => {
  //const { isTypeModalOpen, setTypeModalOpen } = useContext(TypeStateContext);
  const { entries, setEntries } = useContext(EntriesContext);

  const [selectedType, setSelectedType] = useState("Washer");
  const [selectedFloor, setSelectedFloor] = useState("9");
  // current timer is dummy timer
  const [timer, setTimer] = useState("30:00");

  const handleTypeSelect = (option) => {
    setSelectedType(option);
  };

  const handleFloorSelect = (option) => {
    setSelectedFloor(option);
  };

  const addEntry = () => {
    // setNewEntry(selectedFloor + " " + selectedType);
    setEntries([
      ...entries,
      {
        id: entries.length,
        floor: selectedFloor,
        type: selectedType,
        time: timer,
      },
    ]);
    console.log("Floor: " + selectedFloor + " Type: " + selectedType);
    console.log("Entries now..." + entries.length);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      // onRequestClose={toggleTypeModalVisibility}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Machine Type</Text>
          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                selectedType === "Washer" && styles.selectedButton,
              ]}
              onPress={() => handleTypeSelect("Washer")}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedType === "Washer" && styles.selectedText,
                ]}
              >
                Washer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                selectedType === "Dryer" && styles.selectedButton,
              ]}
              onPress={() => handleTypeSelect("Dryer")}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedType === "Dryer" && styles.selectedText,
                ]}
              >
                Dryer
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.modalTitle}>Floor</Text>
          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                selectedFloor === "" && styles.selectedButton,
              ]}
              onPress={() => handleFloorSelect("9")}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedFloor === "9" && styles.selectedText,
                ]}
              >
                Floor 9
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                selectedFloor === "17" && styles.selectedButton,
              ]}
              onPress={() => handleFloorSelect("17")}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedFloor === "17" && styles.selectedText,
                ]}
              >
                Floor 17
              </Text>
            </TouchableOpacity>
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
    width: 80,
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
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
