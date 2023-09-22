import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
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
import { auth, db,signout} from "../Firebase";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
// import { Tile } from "react-native-elements";

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

  const [currentUser , setUser]=useState(null);
  const [recording, setRecording] = useState(null);
  const [title, setTitle] = useState("");
  const [audioTitle, setAudioTitle] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [recordings, setRecordings] = useState([
    { id: 1, title: "Recording 1" }
  ]);
  // const [isRecording, setIsRecording] = useState(false);
  // const [sound, setSound] = useState(null);
  // const [sound, setSound] = useState(null);

  
   useEffect(()=>{
    const user = auth.currentUser;
    if(!user){

      onAuthStateChanged(auth,(user)=>{
        setUser(user);
      })
      
    }else{
      
      console.log("user logged in ", user);
      
    }
    

   },[])

  
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

  //Recording Sounds

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
    try {
      if (recording) {
        if (recording.isRecording) {
          console.log("Recording stopped");
          await recording.stopAndUnloadAsync();
  
          // Upload audio to Firebase Storage
          const storage = getStorage();
          const audioFileRef = ref(
            storage,
            `audioRecordings/${Date.now()}.m4a`
          );
          const recordingURL = recording.getURI();
          console.log("Recording stopped and stored at", recordingURL);
          const recordingBlob = await fetch(recordingURL).then((res) =>
            res.blob()
          );
  
          // Upload the audio recording as a string to Storage
          await uploadBytes(audioFileRef, recordingBlob, "data_url");
          console.log("File upload success", recordingBlob);
  
          // Save the recording URL and other details to Firestore
          const docRef = await addDoc(collection(db, "recordings"), {
            title: audioTitle,
            audioTitle: audioTitle,
            audioURL: `gs://${audioFileRef.bucket}/${audioFileRef.fullPath}`,
          });
  
          // Update the recordings list
          setRecordings((prevRecordings) => [
            ...prevRecordings,
            {
              id: docRef.id,
              title: audioTitle,
            },
          ]);
          setRecording(null);
          setAudioTitle("");
        } else {
          console.warn("Recording is not active.");
        }
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to save. Record audio first!");
    }
  }

  const editRecordingTitle = (index) => {
    console.log("edit btn clicked ");
    setEditTitle(index);
    setAudioTitle(recordings[index].title);

    // setTitle(recordings[index].title)
  };

  //edit title function
  const updateTitle = async (index,id) => {
    const record = recordings[index];
    console.log("edit btn clicked ", record);

    try {
      await updateDoc(doc(db, "recordings", record.id), {
        title: audioTitle,
        // Update other fields as needed
      });

      const updatedRecordings = recordings.map((recording) => {
        if (recording.id === id) {
          return { ...recording, title: audioTitle };
        }
        return recording;
      });

      setRecordings(updatedRecordings);
    } catch (error) {
      console.error("Error editing recording title", error);
    }
  };

  const deleteRecording = async (id) => {
    console.log("delete btn clicked ", id);
    try {
      await deleteDoc(doc(db, "recordings", id));
      const updatedRecordings = recordings.filter(
        (recording) => recording.id !== id
      );
      console.log("success delete");
      setRecordings(updatedRecordings);
    } catch (error) {
      console.error("Error deleting recording", error);
    }
  };

  const logout = async() => {
    try{
      await  auth.signOut().then(()=>{
        console.log("Signed out success")
        navigation.navigate("Home")
      })
      }catch(error){
        console.error("Error signing in with Google" , error)
      }

  };//google end bracket

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

      <View style={styles.playSound}></View>

      <FlatList
        data={recordings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => {
          try {
            return (
              <View key={index} style={styles.listItem}>
                <Text>{item.title}</Text>
                {/* <TextInput
                  style={styles.input}
                  value={item.title}
                  onChangeText={(text) => editRecordingTitle(item.id, text)}
                /> */}

                {editTitle === index ? (
                  <TouchableOpacity
                    style={styles.btn}
                    title="Edit"
                    onPress={() => updateTitle(index,item.id)}
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
      <TouchableOpacity
                  style={styles.btn}
                  title="Logout"
                  onPress={logout}
                >
                  <Text style={styles.btntext}>Log Out</Text>
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
});

export default AudioRecorder;
