import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {StyleSheet, TextInput, TouchableOpacity,Text,View,Pressable,Image} from "react-native";
import { auth  } from "../Firebase";
import { createUserWithEmailAndPassword  } from "firebase/auth";


export default function SignUp() {
  const navigation = useNavigation();

  // const navigatetoAudioJournal =() =>{
  //   navigation.navigate("AudioJournal") //navigate to signIn page
  //   console.log("Proceed btn pressed ,to Audi Journal")
  // };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  

//Functions for buttons 
  const handleSubmit = async () => {
    try{
      await  createUserWithEmailAndPassword( auth ,email, password).then(()=>{
        console.log("SignUp BTN clicked");
        navigation.navigate("AudioJournal") //navigate to signIn page
      })
      }catch(error){
        console.error("Error" , error)
      }
   
  };

  const handleSignUp = async () =>{
   
    console.log('Signup page')
  };

  const handleForgotPassword = () =>{
    console.log('password forgot')
  }


  return (
    <View style={styles.container}>
      <View style={styles.topContainer}>
      <Text style={styles.appName}>Audio Journal </Text>
      <Image
            style={styles.image}
            source={require("../assets/blackcasset.jpg")}
          />
 
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
              <Text style={styles.signIn}>SIGN UP</Text>
            </Pressable>
            <View>
              <View style={styles.signUpOpt}>
                <Text style={styles.noAccText}>Haven't Signed Up?</Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.signUpText}>Sign In</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.forgotPassWordCont}>
                <TouchableOpacity onPress={handleForgotPassword}>
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
    backgroundColor: "#FFEBCD", //blanched Almond color
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
    fontSize: 40,
    fontWeight: "bold",
    // fontFamily: "C",
    alignItems: "center"
  },
  image: {
    width: 350,
    height: 250,
    borderRadius: 400,
    
  },

  bottomContainer: {
    flex: 1,
    width: "100%",
    // backgroundColor: "red",
    alignItems: "center",
  },

  innerContainer: {
    height: 380,
    // backgroundColor:"#CD7F32", //BRONZE
    borderRadius: 25,
    padding: 20,
    width: 320,
  },
  textInput: {
    //fields for email and password
    borderRadius: 15,
    // borderColor: "#654321", ///Dark Brown
    borderWidth: 1,
    padding: 10,
    height: 40,
    marginVertical: 12, //spaces in between the input areas
  },

  actionContainer: {
    height: 60,
    marginTop: 10,
    // backgroundColor: 'red', //include these for checking purposes
    justifyContent: "center",
  },

  actionButton: {
    backgroundColor: "#654321", //Dark Brown color
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    width: 280, //width of the save button ,
    height: 46,
    marginVertical: 13,
  },

  signIn: {
    color: "#FFF",
    fontSize: 19,
    fontWeight: "bold",
  },
});
