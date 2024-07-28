import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NavigationHelpersContext } from "@react-navigation/native";
import { Link, router } from "expo-router";
import React, { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import {
  Alert,
  Button,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  View,
  ImageBackground,
} from "react-native";
import { TextInput } from "react-native-paper";
import Spinner from 'react-native-loading-spinner-overlay';

const logo = require("@/assets/images/icon_laundrybuddy.png");
const bg = require("@/assets/images/water.png");

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    setIsLoggingIn(true);
    const checkLoggedIn = async () => {
      try {
        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL}/api/user/profile`
        );
        console.log(`Successfully restored previous session with user: ${response.data.username}`);
        return true;
      } catch (error) {
        console.log(`Failed to restore previous session, redirecting to login page: (${error.response.status}) ${error.response.data.msg}`)
        return false; // Return false if an error occurs or user is not logged in
      }
    };

    const navigateToStatusScreen = async () => {
      if (await checkLoggedIn()) {
        router.navigate('(main)/status'); // Navigate to the status screen
      } else {
        Alert.alert(
          'Failed to log in automatically',
          'Please log in again'
        )
      }
      setIsLoggingIn(false);
    };

    navigateToStatusScreen(); // Call the function to initiate the navigation logic
  }, []);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/login`,
        {
          username,
          password,
        }
      );
      const { token } = response.data;

      await SecureStore.setItemAsync("token", token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${SecureStore.getItem("token")}`;
      console.log("Login Successful", `Token saved successfully!`);
      setUsername('');
      setPassword('');
      setShowPassword(false);
      setIsLoggingIn(false);
      router.navigate("(main)/status");
    } catch (error) {
      // can use this to see what the response was from the API
      if (error.response && (error.response.status === 400 || error.response.status === 401)) {
        Alert.alert("Login Failed", `${error.response.data.msg}`);
      } else {
        Alert.alert(
          "Login Failed",
          `Please contact the developers with the following information\n\n${error}`
        );
        console.error(error);
      }
      setIsLoggingIn(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Spinner
        visible={loggingIn}
        textContent={'Logging in...'}
      />
      <ImageBackground
        source={bg}
        resizeMode="cover"
        style={styles.imagebackground}
      >
        <Image source={logo} style={styles.image} resizeMode="contain" />
        <Text style={styles.title}>Login</Text>
        <View style={styles.inputView}>
          <TextInput
            style={styles.input}
            label="Username"
            value={username}
            onChangeText={setUsername}
            autoCorrect={false}
            autoCapitalize="none"
            mode="outlined"
            activeOutlineColor="darkblue"
            left={<TextInput.Icon style={styles.inputIcon} icon="account" />}
          />
          <View style={styles.passwordView}>
            <TextInput
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
              keyboardType={showPassword ? "visible-password" : ""}
              label="Password"
              value={password}
              onChangeText={setPassword}
              autoComplete="off"
              autoCorrect={false}
              autoCapitalize="none"
              mode="outlined"
              activeOutlineColor="darkblue"
              left={
                <TextInput.Icon style={styles.inputIcon} icon="cellphone-key" />
              }
              right={
                <TextInput.Icon
                  style={styles.inputIcon}
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={toggleShowPassword}
                />
              }
            />
          </View>
        </View>
        {/* <View style={styles.rememberView}>
          <View>
            <Pressable onPress={() => router.navigate("forget")}>
              <Text style={styles.forgetText}>Forgot Password?</Text>
            </Pressable>
          </View>
        </View> */}

        <View style={styles.buttonView}>
          <Pressable style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </Pressable>
        </View>
        <View style={styles.signupView}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Link style={styles.signup} href="/signup">
            Sign Up
          </Link>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 10,
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
  title: {
    fontFamily: "Roboto",
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    paddingBottom: 20,
    color: "darkblue",
  },
  inputView: {
    gap: 15,
    width: "100%",
    paddingHorizontal: 40,
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderColor: "lightblue",
    backgroundColor: "lightblue",
    margin: 10,
  },
  inputIcon: {
    paddingTop: 10,
  },
  passwordView: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
  },
  passwordInput: {
    flex: 1,
    height: 50,
    borderColor: "lightblue",
    backgroundColor: "lightblue",
    margin: 10,
  },
  icon: {
    position: "absolute",
    right: 20,
  },
  rememberView: {
    width: "100%",
    paddingHorizontal: 50,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8,
  },
  switch: {
    flexDirection: "row",
    gap: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  rememberText: {
    fontSize: 13,
  },
  forgetText: {
    fontSize: 13,
    color: "blue",
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
  },
  optionsText: {
    textAlign: "center",
    paddingVertical: 10,
    color: "gray",
    fontSize: 13,
    marginBottom: 6,
  },
  mediaIcons: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 23,
  },
  icons: {
    width: 40,
    height: 40,
  },
  footerText: {
    paddingTop: 10,
    paddingRight: 10,
    textAlign: "center",
    color: "gray",
  },
  signup: {
    paddingTop: 10,
    color: "blue",
    fontSize: 13,
  },
  signupView: {
    width: "70%",
    paddingHorizontal: 50,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    flexDirection: "row",
  },
});
