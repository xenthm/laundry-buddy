import {
    Alert,
    Image,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ImageBackground,
    Pressable,
  } from "react-native";

export default function LevelMachines(item) {
    return (
        <View style={styles.levelFullView}>
        <View style={styles.levelView}>
          <Text style={styles.levelText}>{item.level}</Text>
        </View>
        <View style={styles.machinesView}>
          <View style={styles.ratioContainer}>
            <Text style={styles.freeText}>{item.freeWashers}/</Text>
            <Text style={styles.machinesText}>{item.totalWasher}</Text>
          </View>
            <Text style={styles.availableText}>available</Text>
        </View>
        <View style={styles.machinesView}>
          <View style={styles.ratioContainer}>
            <Text style={styles.freeText}>{item.freeDryers}/</Text>
            <Text style={styles.machinesText}>{item.totalDryers}</Text>
          </View>
            <Text style={styles.availableText}>available</Text>
        </View>
      </View>
    );
  }

  const styles = StyleSheet.create({
    dashboard: {
      height: "100%",
      alignItems: "flex-start",
    },
    machineContainer: {
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
    titleView: {
      flexDirection: "row",
      paddingTop: 20,
      alignItems: "flex-start",
    },
    watchingView: {
      flexDirection: "row",
      paddingTop: 20,
      alignContent: "center",
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
    button: {
      backgroundColor: "blue",
      height: 35,
      width: 65,
      borderColor: "gray",
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      padding: 3,
    },
    buttonText: {
      color: "white",
      fontSize: 15,
      fontWeight: "bold",
    },
    buttonView: {
      paddingHorizontal: 50,
      paddingTop: 10,
    },
    levelFullView: {
      paddingTop: 15,
      paddingBottom: 10,
      flexDirection: "row",
      alignContent: "center",
      alignItems: "flex-start",
      justifyContent: "flex-start",
    },
    levelView: {
      flex: 1,
    },
    levelText: {
      fontFamily: "Roboto",
      fontSize: 22,
      fontWeight: "bold",
      alignItems: "center",
      textAlign: "center",
      color: "black",
    },
    machinesView: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
      alignContent: "center",
      alignItems: "center",
    },
    freeText: {
      fontFamily: "Roboto",
      fontSize: 22,
      alignItems: "center",
      textAlign: "center",
      color: "black",
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
  });
  