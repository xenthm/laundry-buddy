// TODO: dashboard
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ImageBackground,
} from "react-native";
import axios from "axios";
const bg = require("@/assets/images/water.png");

export default function Status() {
  const [email, setEmail] = useState("");
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={bg}
        resizeMode="cover"
        style={styles.imagebackground}
      >
        <View style={styles.titleView}>
          <View style={styles.textView}>
            <Text style={styles.titleText}>Level</Text>
          </View>
          <View style={styles.textView}>
            <Text style={styles.titleText}>Washer</Text>
          </View>
          <View style={styles.textView}>
            <Text style={styles.titleText}>Dryer</Text>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
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
    flex: 3,
    flexDirection: "row",
    paddingTop: 20,
    alignContent: "center",
  },
  textView: {
    flex: 1,
  },
  titleText: {
    fontFamily: "Roboto",
    fontSize: 22,
    fontWeight: "bold",
    alignItems: "center",
    textAlign: "center",
    color: "darkblue",
  },
  subtitle: {
    fontFamily: "Roboto",
    fontSize: 17,
    textAlign: "center",
    paddingBottom: 20,
    color: "black",
    width: "60%",
  },
  tokenView: {
    width: "100%",
    paddingHorizontal: 50,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingBottom: 10,
  },
  tokenText: {
    fontSize: 17,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingRight: 10,
    fontWeight: "bold",
  },
  keyText: {
    fontFamily: "Roboto",
    fontSize: 17,
    textAlign: "center",
    color: "black",
    width: 70,
    backgroundColor: "lightblue",
    borderRadius: 20,
    padding: 5,
  },
  inputView: {
    gap: 15,
    width: "100%",
    paddingHorizontal: 40,
    marginBottom: 5,
  },
  input: {
    height: 50,
    paddingHorizontal: 20,
    borderColor: "lightblue",
    borderWidth: 2,
    borderRadius: 20,
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 20,
    borderColor: "lightblue",
    borderWidth: 2,
    borderRadius: 20,
  },
  passwordView: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    position: "absolute",
    right: 20,
  },
  button: {
    backgroundColor: "blue",
    height: 45,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonView: {
    width: "100%",
    paddingHorizontal: 50,
    paddingTop: 10,
  },
});
