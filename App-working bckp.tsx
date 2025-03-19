/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import type { PropsWithChildren } from 'react';
import {
  Button,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import CallDetectorManager from "./callDetectionModule/index"



function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  let callDetector = null;

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const getReadStatePermissions = () => {
    return new Promise(resolve => {
      try {
        const OsVer = Platform.constants['Version'];
        if (OsVer > 26 && Platform.OS == 'android') {
          console.log("here now")
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
            {
              title: 'Phone State Permission',
              message:
                'This app needs access to your phone state in order to react and/or to adapt to incoming calls.',
            },
          )
        } else {
          resolve(true);
        }
      } catch (e) {
        resolve(false);
      }
    });
  };

  const startCallListener = async () => {

    // if (Platform.OS === 'android') {
    //   await getReadStatePermissions();
    // }
    
    if (callDetector) {
      console.log("start -> call detector found.....disposing")
      callDetector.dispose();
      callDetector = null;
    }
    console.log("start =>")
    
      callDetector = new CallDetectorManager(
        async (event, phoneNumber) => {

          if (event === 'Dialing' || event === 'Offhook') {
            console.log("Dialing or Offhook");
          }

          if (event === 'Connected') {
            console.log("Connected");
          }

          if (event === 'Disconnected') {
            console.log("Disconnected");
          }
        },
        true, 
        e => {
        }, 
        {
          title: 'Phone State Permission',
          message:
            'This app needs access to your phone state in order to react and/or to adapt to incoming calls.',
        },
      );
  };

  const stopCallListener = () => {
      if (callDetector) {
        console.log("stop -> disposing")
        callDetector && callDetector.dispose();
        callDetector = null;
      } else {
        console.log("stop -> call detector not found")
      }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Button title="Start" onPress={startCallListener} />
        <Button title="Stop" onPress={stopCallListener} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
