import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  View,
  Alert,
  Pressable,
} from "react-native";
import * as yup from "yup";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const schema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().required().min(8).max(10),
  });

  const handleSubmit = () => {
    schema
      .isValid({
        email: email,
        password: password,
        name : name
      })
      .then((valid) => {
        if (!valid) {
          Alert.alert("Form error", "Form has invalid inputs", [
            {
              text: "Ok",
              onPress: () => console.log("okay pressed"),
            },
          ]);
        } else {
        }
      });
  };

  const handleSignUpPress = () =>{
    console.log('Signup page')
  };

  const handleForgotPasswordPress = () =>{
    console.log('password forgot')
  }

  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
        <Text style={styles.appName}>Bubbles Audio Journal</Text>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.innerContainer}>
          <View style={styles.inputContainer}>
          <TextInput
              style={styles.textInput}
              placeholder="Name"
              onChangeText={(text) => setName(text)}
            />

            <TextInput
              style={styles.textInput}
              placeholder="Email"
              onChangeText={(text) => setEmail(text)}
            />

            <TextInput
              style={styles.textInput}
              placeholder="Password"
              onChangeText={(text) => setPassword(text)}
            />
          </View>
          <View style={styles.actionContainer}>
     
            <Pressable
              style={styles.actionButton}
              onPress={() => handleSubmit()}
            >
              <Text style={styles.signIn}>Sign In</Text>
            </Pressable>
            <View>
              <View style={styles.signUpOpt}>
                <Text style={styles.noAccText}>No account?</Text>
                <TouchableOpacity onPress={handleSignUpPress}>
                  <Text style={styles.signUpText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.forgotPassWordCont}>
                <TouchableOpacity onPress={handleForgotPasswordPress}>
                  <Text style={styles.forgotPassWordText}>Forgot Password</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#26394D",
    alignItems: "center",
  },
  topContainer: {
    height: 280,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "green",
  },
  appName: {
    // color: "white",
    fontSize: 17,
    fontWeight: "bold",
    width: 200,
    height: 200,
    backgroundColor: "red",
  },

  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  camContainer: {
    height: 42,
    width: 42,
    backgroundColor: "#1EA0E5",
    borderRadius: 21,
    position: "absolute",
    top: 146,
    left: 146,
    justifyContent: "center",
    alignItems: "center",
  },

  bottomContainer: {
    flex: 1,
    width: "100%",
    // backgroundColor: "red",
    alignItems: "center",
  },

  innerContainer: {
    height: 380,
    backgroundColor: "#FFF",
    borderRadius: 25,
    padding: 20,
    width: 320,
  },
  textInput: {
    //fields for email and password
    borderRadius: 15,
    borderColor: "#1EA0E5",
    borderWidth: 1,
    padding: 10,
    height: 46,
    marginVertical: 15, //spaces in between the input areas
  },

  actionContainer: {
    height: 60,
    marginTop: 10,
    // backgroundColor: 'red', //include these for checking purposes
    justifyContent: "center",
  },

  actionButton: {
    backgroundColor: "#1EA0E5",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    width: 280, //width of the save button ,
    height: 46,
    marginVertical: 10,
  },

  signIn: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "bold",
  },
});
