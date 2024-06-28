import { EntriesContext } from "@/contexts/EntriesContext";
import { useContext, useState } from "react";
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  Button,
  StyleSheet,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import React from "react";

// This modal allows users to watch a specific machine in the laundry room

const IDModal = ({ visible, onClose }) => {
  const { entries, setEntries } = useContext(EntriesContext);

  const [selectedType, setSelectedType] = useState("Washer");
  const [selectedFloor, setSelectedFloor] = useState("9");
  const [selectedAlphaID, setSelectedAlphaID] = useState("");
  const [isFocus, setIsFocus] = useState(false);
  // current timer is dummy timer
  const [timer, setTimer] = useState("30:00");

  const handleTypeSelect = (option) => {
    setSelectedType(option);
  };

  const handleFloorSelect = (option) => {
    setSelectedFloor(option);
  };

  const renderLabel = () => {
    if (selectedAlphaID || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: "darkblue" }]}>
          Machine ID
        </Text>
      );
    }
    return null;
  };

  const addEntry = () => {
    setEntries([
      ...entries,
      {
        id: selectedFloor + selectedType + selectedAlphaID,
        alpha_id: selectedAlphaID,
        floor: selectedFloor,
        type: selectedType,
        time: timer,
      },
    ]);
    console.log("Floor: " + selectedFloor + " Type: " + selectedType);
    console.log("Entries now..." + entries.length);
    onClose();
  };

  const dataWasher = [
    { label: "Washer A", value: "A" },
    { label: "Washer B", value: "B" },
    { label: "Washer C", value: "C" },
    { label: "Washer D", value: "D" },
    { label: "Washer E", value: "E" },
  ];

  const dataDryer = [
    { label: "Dryer A", value: "A" },
    { label: "Dryer B", value: "B" },
    { label: "Dryer C", value: "C" },
    { label: "Dryer D", value: "D" },
  ];

  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Machine Type</Text>
          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                selectedType === "W" && styles.selectedButton,
              ]}
              onPress={() => handleTypeSelect("W")}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedType === "W" && styles.selectedText,
                ]}
              >
                Washer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                selectedType === "D" && styles.selectedButton,
              ]}
              onPress={() => handleTypeSelect("Dryer")}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedType === "D" && styles.selectedText,
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
          <View style={styles.dropContainer}>
            {renderLabel()}
            <Dropdown
              style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={selectedType == "W" ? dataWasher : dataDryer}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocus ? "Select ID" : "..."}
              searchPlaceholder="Search..."
              value={selectedAlphaID}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={(item) => {
                setSelectedAlphaID(item.value);
                setIsFocus(false);
              }}
            />
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
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  dropdown: {
    height: 50,
    width: "70%",
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  dropContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    marginBottom: 5,
    flexDirection: "row",
    padding: 16,
  },
});

export default IDModal;
