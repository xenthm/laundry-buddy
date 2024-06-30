import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ImageBackground,
} from "react-native";
import { TextInput } from "react-native-paper";

const logo = require("@/assets/images/icon_laundrybuddy.png");
const bg = require("@/assets/images/water.png");
// const facebook = require("../../assets/facebook.png")
// const linkedin = require("../../assets/linkedin.png")
// const tiktok = require("../../assets/tiktok.png")

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [cfmPassword, setCfmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [valid, setValid] = useState("");
  //const [emailValid, setEmailValid] = useState("");
  useEffect(() => {
    // Trigger form validation when name,
    // email, or password changes
    validateInput();
  }, [email, password, cfmPassword]);
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const validateInput = () => {
    if (!/\S+@\S+\.\S+/.test(email) && email) {
      setValid("Please enter a valid e-mail address.");
      if (password != cfmPassword) {
        setValid("Please enter a valid e-mail address. \nPassword and Confirm Password do not match.");
      }
    } else if (password != cfmPassword) {
      setValid("Password and Confirm Password do not match.");
    } else {
      setValid("");
    }
  };

  const handleSignUp = async () => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/register`,
        {
          username,
          email,
          password,
        }
      );
      const { token } = response.data;

      await SecureStore.setItemAsync("token", token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${SecureStore.getItem("token")}`;
      // for now, show the token when sign up successful
      console.log(
        "Sign Up Successful",
        `Token saved successfully!\n${token}`
      );
      setEmail('');
      setUsername('');
      setPassword('');
      setCfmPassword('');
      setShowPassword(false);
      router.navigate("(main)/status");
    } catch (error) {
      // can use this to see what the response was from the API
      if (error.response && error.response.status === 400) {
        Alert.alert("Sign Up Failed", `${error.response.data.msg}`);
      } else {
        Alert.alert(
          "Sign Up Failed",
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
        <Image source={logo} style={styles.image} resizeMode="contain" />
        <Text style={styles.title}>Sign Up!</Text>

        <View style={styles.inputView}>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCorrect={false}
            autoCapitalize="none"
            mode="outlined"
              activeOutlineColor="darkblue"
              left={<TextInput.Icon style={styles.inputIcon} icon="email" />}
          />
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
              onBlur={validateInput}
              autoCorrect={false}
              autoComplete="off"
              autoCapitalize="none"
              mode="outlined"
              activeOutlineColor="darkblue"
              left={<TextInput.Icon style={styles.inputIcon} icon="cellphone-key" />}
              right={
                <TextInput.Icon
                  style={styles.inputIcon}
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={toggleShowPassword}
                />
              }
            />
          </View>
          <View style={styles.passwordView}>
            <TextInput
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
              keyboardType={showPassword ? "visible-password" : ""}
              label="Confirm Password"
              value={cfmPassword}
              onChangeText={setCfmPassword}
              onBlur={validateInput}
              autoCorrect={false}
              autoComplete="off"
              autoCapitalize="none"
              mode="outlined"
              activeOutlineColor="darkblue"
              left={<TextInput.Icon style={styles.inputIcon} icon="checkbox-multiple-outline" />}
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
        <View>
          <Text style={styles.validationText}>{valid}</Text>
        </View>
        <View style={styles.buttonView}>
          <Pressable
            style={styles.button}
            // onPress={() => Alert.alert("Welcome to Laundry Buddy!")}
            onPress={handleSignUp}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </Pressable>
        </View>
        <View style={styles.loginView}>
          <Text style={styles.footerText}>Have an account already?</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.login}>Log In</Text>
          </Pressable>
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
  inputIcon:  {
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
  switch: {
    flexDirection: "row",
    gap: 1,
    justifyContent: "center",
    alignItems: "center",
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
    paddingTop: 10,
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
  login: {
    paddingTop: 10,
    color: "blue",
    fontSize: 13,
  },
  loginView: {
    width: "70%",
    paddingHorizontal: 50,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    flexDirection: "row",
  },
  validationText: {
    color: "red",
  },
});
