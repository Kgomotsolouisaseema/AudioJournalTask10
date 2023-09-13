import { StatusBar } from 'expo-status-bar';
import { StyleSheet,View , Text} from 'react-native';
// import LandPage from './components/LandPage';

export default function App() {
  return (
    <View style={styles.container}>
      {/* <LandPage/>  */}
      <Text> Hello World</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
