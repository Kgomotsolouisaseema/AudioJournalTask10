import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
} from "react-native";
import { Audio, getStatusAsync } from "expo-av";
import theicon from "../assets/theicon.jpg";
import { TouchableOpacity } from "react-native";
import { auth, db, signout } from "../Firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
// import { Platform } from "react-native";

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
    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MIN,
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
  const navigation = useNavigation();

  const [currentUser, setUser] = useState(null);
  const [recording, setRecording] = useState(null);
  // const [title, setTitle] = useState("");
  const [audioTitle, setAudioTitle] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [selectedAudioURL, setSelectedAudioURL] = useState(null);
  const [recordings, setRecordings] = useState([
    { id: 1, title: "Recording 1" },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      onAuthStateChanged(auth, (user) => {
        setUser(user);
      });
    } else {
      console.log("user logged in ", user);
    }
  }, []);

  console.log("Userlogged in");

  useEffect(() => {
    // Load recordings from Firebase Firestore when the component mounts
    const loadRecordings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "recordings"));
        const loadedRecordings = [];
        querySnapshot.forEach((doc) => {
          loadedRecordings.push({
            id: doc.id,
            title: doc.data().title,
            recording: doc.recording,
            // Add other fields you want to retrieve from Firestore here
          });
        });
        setRecordings(loadedRecordings);
      } catch (error) {
        console.log("Error loading recordings", error);
      }
    };

    loadRecordings();
  }, []);

  //trying these start and stop functions

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const recordingObject = new Audio.Recording();
        await recordingObject.prepareToRecordAsync(RecordingOptions);
        await recordingObject.startAsync();
        setRecording(recordingObject);
        console.log("Recording started..");
      } else {
        console.warn("Audio recording permission not granted.");
      }
    } catch (error) {
      console.error("Failed to start recording", error);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording..");

    if (!recording) {
      console.warn("Recording is not active.");
      return;
    }

    try {
      // Stop the recording
      await recording.stopAndUnloadAsync();

      // Set audio mode to disallow recording (if needed)
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      console.log("Recording stopped and stored at", uri);

      // Upload audio to Firebase Storage
      const storage = getStorage();
      const audioFileRef = ref(storage, `audioRecordings/${Date.now()}.m4a`);
      const recordingBlob = await fetch(uri).then((res) => res.blob());

      await uploadBytes(audioFileRef, recordingBlob, {
        contentType: "audio/m4a",
      }); //.then() this is where you will use the getdownload url and then you will have a function that (adddoc) that takes the items to firstore
      const downloadURL = await getDownloadURL(audioFileRef);
      console.log("File upload success", downloadURL);
      //im creating a new object with title and url of the audio  here
      const addAudio = await addDoc(collection(db, "recordings"), {
        title: audioTitle,
        url: downloadURL,
      }); //upload the audio title and url to firestore
      setRecording(""); //reset the audio
      setAudioTitle(""); //reset the title

      // Now, you can save the URL to Firebase Firestore or perform other actions as needed
    } catch (error) {
      console.error("Error stopping or uploading recording:", error);
      // Handle the error as needed
    }
  }

  //Playing Sounds
  async function playSound(downloadURL) {
    try {
      if (!downloadURL) {
        console.warn("Audio URL is null or undefined.");
        return; // Don't attempt to play if the URL is missing
      }

      console.log("Loading Sound");
      const { sound } = await Audio.Sound.createAsync({
        uri: downloadURL,
      });
      setSound(sound);

      console.log("Playing Sound");
      await sound.playAsync();
    } catch (error) {
      console.error("Failed to play sound", error);
    }
  }

  useEffect(() => {
    return () => {
      if (sound) {
        console.log("Unloading Sound");
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const editRecordingTitle = (index) => {
    console.log("edit btn clicked ");
    setEditTitle(index);
    setAudioTitle(recordings[index].title);


  };

  //edit title function
  const updateTitle = async (index, id) => {
    const record = recordings[index];
    console.log("edit btn clicked ", record);

    try {
      await updateDoc(doc(db, "recordings", record.id), {
        title: audioTitle,
      });

      const updatedRecordings = [...recordings]; // Create a copy of recordings
      updatedRecordings[index].title = audioTitle; // Update the title in the copied array
      setRecordings(updatedRecordings); // Set the updated array
      setEditTitle(""); // Clear the edit title state
    } catch (error) {
      console.error("Error editing recording title", error);
    }
  };

  const deleteRecording = async (id) => {
    try {
      await deleteDoc(doc(db, "recordings", id));
      const updatedRecordings = recordings.filter(
        (recording) => recording.id !== id
      );
      setRecordings(updatedRecordings);
    } catch (error) {
      console.error("Error deleting recording", error);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut().then(() => {
        console.log("Signed out success");
        navigation.navigate("Home");
      });
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  }; //google end bracket

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.titleNew}
        placeholder="New Title"
        value={audioTitle}
        onChangeText={(text) => setAudioTitle(text)}
      />
      <View style={styles.ImageContainer}>
        <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
          <Image source={theicon} style={styles.imagePress} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={recordings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => {
          try {
            return (
              <View key={index} style={styles.listItem}>
                <TouchableOpacity
                  style={styles.listItem}
                  onPress={() => setSelectedAudioURL(item.url)}
                >
                  <Text>{item.title}</Text>
                </TouchableOpacity>

                {editTitle === index ? (
                  <TouchableOpacity
                    style={styles.btn}
                    title="Edit"
                    onPress={() => updateTitle(index, item.id)}
                  >
                    <Text style={styles.btntext}>Update</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.btn}
                    title="Edit"
                    onPress={() => editRecordingTitle(index)}
                  >
                    <Text style={styles.btntext}>Edit</Text>
                  </TouchableOpacity>
                )}

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
            return null;
          }
        }}
      />
      <View>
        <TouchableOpacity
          style={styles.titleNew}
          title="Play"
          onPress={() => playSound(selectedAudioURL)}
        >
          <Text style={styles.signIn}>Play Sound</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.titleNew} title="Logout" onPress={logout}>
        <Text style={styles.signIn}>Log Out</Text>
      </TouchableOpacity>
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
  ImageContainer: {
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
    // flex: 2,
    marginTop: 100, //moves the image in the center of the page
  },
  imagePress: {
    width: 280,
    height: 280,
    borderRadius: 100,
    padding: 15,
  },
  //STYLES FOR THE AREA WHERE I PUT IN THE TITLE OF THE AUDIO
  titleNew: {
    // backgroundColor:"red",
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
  btn: {
    backgroundColor: "#654321",
    marginHorizontal: 12,
    width: 52,
    borderRadius: 10,
  },
  btntext: {
    color: "white",
    textAlign: "center",
    margin: 5, //gives the space ,
  },
  input: {
    flex: 1,
    borderWidth: 3,
    borderColor: "#654321",
    padding: 5,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  // actionContainer: {
  //   height: 60,
  //   marginTop: 10,
  //   borderRadius: 10,
  //   backgroundColor: "red",
  //   justifyContent: "center", //ALIGNS THE  CONTENT IN THE BUTTON IN THE CENTER ?
  //   alignItems: "center", //MOVES THE WHOLE BUTTON TO THE CENTER OF THE PAGE
  // },
  signIn: {
    color: "black",
    fontSize: 19,
    fontWeight: "bold",
  },
});

export default AudioRecorder;
