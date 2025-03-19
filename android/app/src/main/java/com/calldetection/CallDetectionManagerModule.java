package com.calldetection;

import android.Manifest;
import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyCallback;
import android.telephony.TelephonyManager;
import android.media.AudioManager;
import android.util.Log;

import androidx.annotation.RequiresApi;
import androidx.core.content.ContextCompat;

// import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.Map;

public class CallDetectionManagerModule
        extends ReactContextBaseJavaModule
        implements Application.ActivityLifecycleCallbacks,
        CallDetectionPhoneStateListener.PhoneCallStateUpdate {

    private static final String TAG = "CallDetectionManager";
    private static final String EVENT_NAME = "PhoneCallStateUpdateAndroid";

    private boolean wasAppInOffHook = false;
    private boolean wasAppInRinging = false;

    private final ReactApplicationContext reactContext;
    private TelephonyManager telephonyManager;
    private AudioManager audioManager;
    private CallDetectionPhoneStateListener callDetectionPhoneStateListener;
    private Activity activity = null;

    @RequiresApi(api = android.os.Build.VERSION_CODES.S)
    private CallStateListener callStateListener;

    public CallDetectionManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "CallDetectionManager";
    }

    private void sendEvent(String callState, String phoneNumber) {
        if (reactContext.hasActiveCatalystInstance()) {
            // WritableMap eventData = Arguments.createMap();
            // eventData.putString("event", callState);
            // eventData.putString("phoneNumber", phoneNumber);

            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(EVENT_NAME, callState);
        }
    }

    @ReactMethod
    public void startListener() {
        if (activity == null) {
            activity = getCurrentActivity();
            if (activity != null) {
                activity.getApplication().registerActivityLifecycleCallbacks(this);
            }
        }

        telephonyManager = (TelephonyManager) reactContext.getSystemService(Context.TELEPHONY_SERVICE);
        callDetectionPhoneStateListener = new CallDetectionPhoneStateListener(this);

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            if (reactContext.checkSelfPermission(Manifest.permission.READ_PHONE_STATE) == PackageManager.PERMISSION_GRANTED) {
                callStateListener = new CallStateListener();
                telephonyManager.registerTelephonyCallback(ContextCompat.getMainExecutor(reactContext), callStateListener);
            } else {
                Log.e(TAG, "Permission READ_PHONE_STATE is not granted.");
            }
        } else {
            telephonyManager.listen(callDetectionPhoneStateListener, PhoneStateListener.LISTEN_CALL_STATE);
        }
    }

    @ReactMethod
    public void stopListener() {
        if (telephonyManager != null) {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S && callStateListener != null) {
                telephonyManager.unregisterTelephonyCallback(callStateListener);
            } else if (callDetectionPhoneStateListener != null) {
                telephonyManager.listen(callDetectionPhoneStateListener, PhoneStateListener.LISTEN_NONE);
            }
        }
        callDetectionPhoneStateListener = null;
        telephonyManager = null;
    }

    @ReactMethod
    public void checkPhoneState(Callback callback) {
        audioManager = (AudioManager) reactContext.getSystemService(Context.AUDIO_SERVICE);
        boolean isInCall = audioManager.getMode() == AudioManager.MODE_IN_CALL;
        callback.invoke(isInCall);
    }

    @Override
    public Map<String, Object> getConstants() {
        Map<String, Object> constants = new HashMap<>();
        constants.put("Incoming", "Incoming");
        constants.put("Offhook", "Offhook");
        constants.put("Disconnected", "Disconnected");
        constants.put("Missed", "Missed");
        return constants;
    }

    // Handle Call State Updates
    @Override
    public void phoneCallStateUpdated(int state, String phoneNumber) {
        switch (state) {
            case TelephonyManager.CALL_STATE_IDLE:
                if (wasAppInOffHook) {
                    sendEvent("Disconnected", phoneNumber);
                } else if (wasAppInRinging) {
                    sendEvent("Missed", phoneNumber);
                }
                wasAppInRinging = false;
                wasAppInOffHook = false;
                break;

            case TelephonyManager.CALL_STATE_OFFHOOK:
                wasAppInOffHook = true;
                sendEvent("Offhook", phoneNumber);
                break;

            case TelephonyManager.CALL_STATE_RINGING:
                wasAppInRinging = true;
                sendEvent("Incoming", phoneNumber);
                break;
        }
    }

    @RequiresApi(api = android.os.Build.VERSION_CODES.S)
    private class CallStateListener extends TelephonyCallback implements TelephonyCallback.CallStateListener {
        @Override
        public void onCallStateChanged(int state) {
            phoneCallStateUpdated(state, null);
        }
    }

    // Activity Lifecycle Callbacks (Optional for cleanup, if required)
    @Override
    public void onActivityCreated(Activity activity, Bundle savedInstanceState) {}

    @Override
    public void onActivityStarted(Activity activity) {}

    @Override
    public void onActivityResumed(Activity activity) {}

    @Override
    public void onActivityPaused(Activity activity) {}

    @Override
    public void onActivityStopped(Activity activity) {}

    @Override
    public void onActivitySaveInstanceState(Activity activity, Bundle outState) {}

    @Override
    public void onActivityDestroyed(Activity activity) {}
}
