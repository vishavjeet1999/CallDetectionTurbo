import {
  NativeModules,
  NativeEventEmitter,
  Platform,
  PermissionsAndroid,
} from 'react-native'

import NativeCallDetector from '../specs/CallDetectionManager';

export const permissionDenied = 'PERMISSION DENIED'


// const NativeCallDetector = NativeModules.CallDetectionManager
const NativeCallDetectorAndroid = NativeCallDetector



const requestPermissionsAndroid = (permissionMessage) => {
  const requiredPermission = Platform.constants.Release >= 9
                             ? PermissionsAndroid.PERMISSIONS.READ_CALL_LOG
                             : PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE
  return PermissionsAndroid.check(requiredPermission)
    .then((gotPermission) => gotPermission
                             ? true
                             : PermissionsAndroid.request(requiredPermission, permissionMessage)
                               .then((result) => result === PermissionsAndroid.RESULTS.GRANTED),
    )
}

class CallDetectorManager {

  subscription
  callback

  constructor (callback, readPhoneNumberAndroid = false, permissionDeniedCallback = () => { }, permissionMessage = {
    title: 'Phone State Permission',
    message: 'This app needs access to your phone state in order to react and/or to adapt to incoming calls.',
  }) {
    this.callback = callback
    if (Platform.OS === 'ios') {
      NativeCallDetector && NativeCallDetector.startListener()
      this.subscription = new NativeEventEmitter(NativeCallDetector)
      this.subscription.addListener('PhoneCallStateUpdate', callback)
    } else {
      if (NativeCallDetectorAndroid) {
        if (readPhoneNumberAndroid) {

          requestPermissionsAndroid(permissionMessage)
            .then((permissionGrantedReadState) => {
              if (!permissionGrantedReadState) {
                permissionDeniedCallback(permissionDenied)
              }
            })
            .catch(permissionDeniedCallback)

        }
        NativeCallDetectorAndroid && NativeCallDetectorAndroid.startListener()
        this.subscription = new NativeEventEmitter()
        this.subscription.addListener('PhoneCallStateUpdateAndroid', callback)
      }
    }
  }

  checkPhoneState (cb) {
    if (cb == undefined) {
      cb = () => {

      }
    }
    if (NativeCallDetectorAndroid) {
      NativeCallDetectorAndroid.checkPhoneState(cb)
    }
  }

  dispose () {
    NativeCallDetector && NativeCallDetector.stopListener()
    NativeCallDetectorAndroid && NativeCallDetectorAndroid.stopListener()
    if (this.subscription) {
      this.subscription.removeAllListeners('PhoneCallStateUpdate')
      this.subscription.removeAllListeners('PhoneCallStateUpdateAndroid')
      this.subscription = undefined
    }
  }
}

export default module.exports = CallDetectorManager
