import React, { useState } from "react";
import { BarChart } from "react-native-gifted-charts";
import {
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Alert,
  ScrollView,
} from "react-native";
import { IconButton } from "react-native-paper";
import { router } from "expo-router";
import axios from "axios";

const bg = require("@/assets/images/water.png");

// TODO: Display the current day 
// TODO: Change "NOW" label to reflect current time's crowd by default
// TODO: When a bar is selected, replace NOW with new time and its crowd analysis
// TODO: Create a dummy backend that stores the week's

export default function Status() {
  const footfallData = [
    { value: 11, label: "12am" },
    { value: 5, label: "1am" },
    { value: 2, label: "2am" },
    { value: 0, label: "3am" },
    { value: 0, label: "4am" },
    { value: 0, label: "5am" },
    { value: 1, label: "6am" },
    { value: 2, label: "7am" },
    { value: 3, label: "8am" },
    { value: 3, label: "9am" },
    { value: 5, label: "10am" },
    { value: 7, label: "11am" },
    { value: 10, label: "12pm" },
    { value: 12, label: "1pm" },
    { value: 10, label: "2pm" },
    { value: 10, label: "3pm" },
    { value: 12, label: "4pm" },
    { value: 13, label: "5pm" },
    { value: 14, label: "6pm" },
    { value: 16, label: "7pm" },
    { value: 19, label: "8pm" },
    { value: 20, label: "9pm" },
    { value: 19, label: "10pm" },
    { value: 15, label: "11pm" },
  ];

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
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={bg}
        resizeMode="cover"
        style={styles.imagebackground}
      >
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
        <View style={styles.titleView}>
          <Text style={styles.titleText}>Crowd Statistics</Text>
          <View style={styles.crowdNowContainer}>
            <Text style={styles.nowText}>Now</Text>
            <Text style={styles.footfallText}> A little busy </Text>
          </View>
        </View>
        <View style={styles.scrollView}>
          <ScrollView
            nestedScrollEnabled={true}
            scrollEnabled={true}
          >
            <View style={styles.chartContainer}>
              <BarChart
                data={footfallData}
                horizontal
                hideRules
                spacing={10}
                labelsDistanceFromXaxis={10}
                xAxisThickness={0}
                hideYAxisText
                hideAxesAndRules
              />
            </View>
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {},
  crowdNowContainer: {
    alignSelf: "flex-start",
    borderColor: "white",
    borderRadius: 10,
    borderWidth: 2,
    flexDirection: "row",
    padding: 3,
  },
  imagebackground: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  titleView: {
    width: "70%",
    alignItems: "center",
  },
  scrollView: {
    flexGrow: 1,
    height: 50,
    width: "80%",
    alignItems: "center",
    alignContent: "center",
    alignSelf: "center",
    paddingTop: 20,
  },
  chartContainer: {
    width: "100%",
    paddingBottom: 750,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "darkblue",
    paddingBottom: 10,
  },
  optionsView: {
    paddingTop: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nowText: {
    fontSize: 16,
    padding: 5,
    backgroundColor: "blue",
    borderRadius: 5,
    color: "white",
  },
  footfallText: {
    fontSize: 16,
    padding: 5,
    borderRadius: 5,
    color: "black",
  },
  dayText: {
    fontSize: 16,
    alignItems: "flex-start",
  },
});
