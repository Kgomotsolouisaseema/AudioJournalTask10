import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  Image,
} from "react-native";
// import { Input } from "react-native-elements";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import listenHead from "../assets/listenHead.jpg";
import { TouchableOpacity } from "react-native-web";

const RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: ".m4a",
    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: ".m4a",
    outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: "audio/webm",
    bitsPerSecond: 128000,
  },
};

const AudioRecorder = () => {
  const [recording, setRecording] = useState(null);
  // const [sound, setSound] = React.useState();
  const [title, setTitle] = useState("");
  const [audioTitle, setAudioTitle] = useState("");
  const [recordings, setRecordings] = useState([
    { id: 1, title: "Recording 1" },
    { id: 2, title: "Recording 2" },
  ]);

  console.log(recordings); //dont remove until it works and its a placemarker for Audi Recoder library

  //Playing Sounds

  // async function playSound() {
  //   console.log('Loading Sound');
  //   const { sound } = await Audio.Sound.createAsync( require('./assets/Hello.mp3')
  //   );
  //   setSound(sound);

  //   console.log('Playing Sound');
  //   await sound.playAsync();
  // }

  // React.useEffect(() => {
  //   return sound
  //     ? () => {
  //         console.log('Unloading Sound');
  //         sound.unloadAsync();
  //       }
  //     : undefined;
  // }, [sound]);

  //Recording Sounds

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === "granted") {
        console.log("Requesting Permissiions...");
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          RecordingOptions
        );
        setRecording(recording);
      }
      console.log("Starting recording..");
      // const {recording} = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  }

  // stop the active recording
// stop the active recording
async function stopRecording() {
  try {
    console.log("Recording stopped"); // Add this line for the console log
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    let recordingsArray = [...recordings];
    const { sound, status } = await recording.createNewLoadedSoundAsync();
    const newRecording = {
      id: Date.now().toString(),
      title: audioTitle,
      sound: sound,
      file: recording.getURI(),
      duration: getDurationFormatted(status.durationMillis),
    };
    recordingsArray.push(newRecording);
    setRecordings(recordingsArray);
    setRecording(undefined);
    setAudioTitle("");

    // Save recordings
    await saveRecordings([
      ...recordings,
      {
        sound: recording.getURI(),
        duration: getDurationFormatted(status.durationMillis),
        file: recording.getURI(),
      },
    ]);
  } catch (error) {
    console.log(error);
    console.error(error);
    setErrorMessage("Failed to save. Record audio first!");
  }
}



  // async function stopRecording() {
  //   try {
  //     console.log("Recording stopped"); // Add this line for the console log
  //     await recording.stopAndUnloadAsync();
  //     await Audio.setAudioModeAsync({
  //       allowsRecordingIOS: false,
  //     });
  //     let recordingsArray = [...recordings];
  //     const { sound, status } = await recording.createNewLoadedSoundAsync();
  //     const newRecording = {
  //       id: Date.now().toString(),
  //       title: audioTitle,
  //       sound: sound,
  //       file: recording.getURI(),
  //       duration: getDurationFormatted(status.durationMillis),
  //     };
  //     recordingsArray.push(newRecording);
  //     setRecordings(recordingsArray);
  //     setRecording(undefined);
  //     setAudioTitle("");



  //     // Save recordings
  //     await saveRecordings([
  //       ...recordings,
  //       {
  //         sound: recording.getURI(),
  //         duration: getDurationFormatted(status.durationMillis),
  //         file: recording.getURI(),
  //       },
  //     ]);
  //   } catch (error) {
  //     console.log(error);
  //     console.error(error);
  //     setErrorMessage("Failed to save. Record audio first!");
  //   }
  // }

  // //Get the duration
  // function getDurationFormatted(millis) {
  //   const minutes = millis / 1000 / 60;
  //   const minutesDisplay = Math.floor(minutes);
  //   const seconds = Math.round((minutes - minutesDisplay) * 60);
  //   const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;
  //   return `${minutesDisplay}:${secondsDisplay}`;
  // }

  //async function for recording
  async function saveRecordings(recordings) {
    try {
      await AsyncStorage.setItem("recorded_audio", JSON.stringify(recordings));
      Alert.alert("Success", "Audio Saved", [{ text: "OKAY" }]);
    } catch (Error) {
      console.error("Error saving recording", Error);
      Alert.alert("Error", "Failed to save audio!, Stop Recording First !", [
        { text: "OKAY" },
      ]);
    }
  }

  //Async storage Implementations CRUD

  // const retrieveData = async () => {
  //   try {
  //     const titleName = await AsyncStorage.getItem("audio_name");
  //     if (titleName !== null) {
  //       setRecording(titleName);
  //     }
  //   } catch (error) {
  //     console.error("Error Retriveing recording", error);
  //   }
  // };

  //Load state of recording when app  components mounts
  useEffect(() => {
    const loadRecordingState = async () => {
      try {
        const recordingState = await AsyncStorage.getItem("recording_state");
        if (recordingState !== null) {
          setRecording(recordingState === "true"); //convert string to boolean
        }
      } catch (error) {
        console.error("Error on reording state ", error);
      }
    };

    loadRecordingState();
  }, []); // Empty dependency array ensures this runs once when the component mounts

  //Save title function conneted to Async  storage

  const saveTitle = async (title) => {
    try {
      //create new object with a unique id
      const newRecording = { id: Date.now(), title };

      //update state with new recording
      setRecordings((prevRecordings) => [...prevRecordings, newRecording]);

      //save updated recordings array to AsyncStorage
      await AsyncStorage.setItem(
        "saved_title",
        "Hello",
        JSON.stringify(recordings)
      );
      console.log("Title saved: " + title);
      //clear state
      setTitle("");
    } catch (error) {
      console.error("Error saving title", error);
    }
  };

  //functions to get data and dispay it on the UI
  useEffect(() => {
    const laodRecordings = async () => {
      try {
        const savedRecordings = await AsyncStorage.getItem(
          "Recordings_saved" + recordings
        );
        if (savedRecordings !== null) {
          setRecordings(JSON.parse(savedRecordings));
        }
      } catch (error) {
        console.log("Error saving Recordings ", error);
      }
    };
    laodRecordings();
  }, []); //empty dependency , runs once

  //editRecording function

  const editRecordingTitle = (id, newTitle) => {
    const updatedRecordings = recordings.map((recording) => {
      if (recording.id === id) {
        return { ...recording, title: newTitle }; //update title as needed
      }
      return recording;
    });
    //update state of recordings array
    setRecordings(updatedRecordings);
  };

  const deleteRecording = (id) => {
    const updatedRecordings = recordings.filter(
      (recording) => recording.id !== id
    );

    //Update the state with the new recordings array
    setRecordings(updatedRecordings);
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.titleNew}
        placeholder="New Title"
        value={audioTitle}
        onChangeText={(text) => setAudioTitle(text)}
      />
      <View  style={styles.ImageContainer}>
      <TouchableOpacity onPress={recording ? stopRecording : startRecording}>

        <Image
          source={listenHead} 
          style={styles.imagePress} 
        />
      </TouchableOpacity>
      </View>
   
      <View style={styles.playSound}>
        {/* <Button title="Play Sound" onPress={playSound} /> */}
      </View>

      {/* List of Recorded Titles */}
      <FlatList //react-native element that renders a scrollable list of data
        data={recordings}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => {
          try {
            return (
              <View style={styles.listItem}>
                <Text>{item.title}</Text>
                <TextInput
                  style={styles.input}
                  value={item.title}
                  onChangeText={(text) => editRecordingTitle(item.id, text)}
                />
                <TouchableOpacity 
                  style={styles.btn}
                  title="Edit"
                  onPress={(text) => editRecordingTitle(item.id, text)}
                >
                 <Text style={styles.btntext}>Edit</Text> 
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btn}
                  title="Delete"
                  onPress={() => deleteRecording(item.id)}
                >
                  <Text style={styles.btntext}>Delete</Text>
                </TouchableOpacity>
              </View>
            );
          } catch (error) {
            console.error("Error rendering FlatList item:", error);
            return null; // Return null to skip rendering problematic items
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#FFEBCD", //blanched Almond color
    alignItems: "center",
    justifyContent: "center",
  },
  ImageContainer:{
    width: '30%',
    alignItems: "center",
    justifyContent: "center",
    // flex: 2,
    marginTop: 100, //moves the image in the center of the page 

  },
  imagePress:{
    width: 280, 
    height: 280,
    borderRadius: 100, 
    padding: 15,

  },
  //STYLES FOR THE AREA WHERE I PUT IN THE TITLE OF THE AUDIO
  titleNew:{
    backgroundColor:"red",
    borderColor: "#654321",
    borderWidth: 4,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    justifyItems: "center",
    textAlign: "center",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#654321", //Dark Brown color for the line around the recording names
  },
  btn:{
    backgroundColor: "#654321",
    marginHorizontal: 10,
    width : 50,
    borderRadius: 8,
  },
  btntext:{
    color: "white",
    textAlign: "center",
    margin: 5 ,  //gives the space ,
    

  },
  input: {
    flex: 1,
    borderWidth: 3,
    borderColor: "#654321",
    padding: 5,
    borderRadius: 8,
    marginHorizontal: 10,
  },
});

export default AudioRecorder;
