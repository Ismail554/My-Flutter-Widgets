 Agora Calling System — Complete Beginner's Guide

> **Who is this for?** This guide is written for developers who are new to real-time calling systems. Every step is explained in plain language, with diagrams and code walkthroughs.

---

## 🗺️ What Does This System Do?

This system lets two users make **real-time audio/video calls** inside the app. It uses three main technologies working together:

| Technology | What it does |
|---|---|
| **Agora RTC** | Transmits the actual audio and video between two devices |
| **Backend REST API** | Creates and manages the call (start, answer, end, decline) |
| **WebSocket / Push Notifications** | Notifies the other person that a call is incoming |

> **Think of it this way:** The backend is like a telephone operator who sets up the connection. Agora is the actual phone line. WebSocket/Push is the ringing sound.

---

## 🏗️ Architecture Overview

Here's how all the pieces fit together at a high level:

```
╔══════════════════════════════════════════════════════════════════╗
║                    CALL FLOW — BIG PICTURE                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  [Caller App]                          [Backend Server]          ║
║      │                                       │                  ║
║      │── POST /calls/instant/ ──────────────▶│                  ║
║      │◀─ 201 { call_id, agora_credentials } ─│                  ║
║      │                                       │                  ║
║      │   joinChannel() ──▶ [Agora Cloud] ◀── │                  ║
║      │                                       │                  ║
║      │                    [Backend Server]   │                  ║
║      │                         │             │                  ║
║      │             WebSocket ──┼──▶ [Receiver App]             ║
║      │             or Push  ───┘       │                        ║
║      │                                 │── POST /calls/answer/ ─▶│ ║
║      │                                 │◀─ 200 { agora_creds } ──│ ║
║      │                                 │                          ║
║      │         [Agora Cloud] ◀── joinChannel()                   ║
║      │               │                │                          ║
║      └───────────────┴────────────────┘                          ║
║              Both connected via Agora RTC ✅                     ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## 📁 File Structure (What Each File Does)

Before diving in, understand where each piece of code lives:

| File | Responsibility | Think of it as... |
|---|---|---|
| `call_provider.dart` | The **brain** — manages all call state and API calls | A traffic controller |
| `agora_client_service.dart` | The **screen** — Agora engine + video UI | The actual phone screen |
| `callkit_service.dart` | The **native UI bridge** — shows iOS/Android system call UI | The ringtone & lock screen |
| `incoming_call_screen.dart` | The **in-app incoming call overlay** | The pop-up you see when a call arrives |
| `firebase_messaging_service.dart` | **Background push handler** (Android) | Wakes the app when a call arrives |
| `AppDelegate.swift` | **iOS VoIP push handler** | Wakes iOS from killed state |

---

## ⚙️ Dependencies

Add these to your `pubspec.yaml`:

```yaml
dependencies:
  agora_rtc_engine: ^6.3.2        # Core audio/video streaming
  flutter_callkit_incoming: ^2.x   # Shows native call UI (like Apple Phone app)
  firebase_messaging: ^15.x        # Push notifications (background calls)
  wakelock_plus: ^1.5.2            # Keeps screen on during a call
  permission_handler: ^11.x        # Asks user for mic/camera access
```

> 💡 **Beginner tip:** Run `flutter pub get` after editing `pubspec.yaml` to download these packages.

---

## 🔄 Call State Machine

The call always moves through these states in order. Think of it like a traffic light.

```
  ┌──────────────────────────────────────────────────────────────┐
  │                    CALL STATE DIAGRAM                        │
  │                                                              │
  │   App starts ──▶ [IDLE] ──── initiateCall() ──▶ [RINGING]   │
  │                    ▲              ▲                  │       │
  │                    │              │                  │       │
  │                    │         declineCall()      60s timeout  │
  │                    │         or endCall()            │       │
  │                    │                                 ▼       │
  │                    │                          [CONNECTING]   │
  │                    │                                │        │
  │                    │                    remote user joins    │
  │                    │                                ▼        │
  │                    └────── endCall() ────── [IN CALL] ✅    │
  │                                                              │
  └──────────────────────────────────────────────────────────────┘
```

**State meanings:**
- **IDLE** — No call happening. Default state.
- **RINGING** — A call was started but the receiver hasn't answered yet.
- **CONNECTING** — The receiver accepted. Waiting for Agora to connect both sides.
- **IN CALL** — Both parties are live and talking.

---

## 🚀 Step-by-Step Walkthrough

---

### Step 1 — Register Device Tokens (After Login)

**When does this happen?** Right after the user logs in.
**Why?** The backend needs to know *where* to send push notifications for incoming calls.

```
┌─────────────────────────────────────────────┐
│           STEP 1 FLOW                        │
│                                             │
│  User logs in                               │
│       ↓                                     │
│  CallProvider.init()                        │
│       ↓                                     │
│  registerDeviceToken()                      │
│       ↓                                     │
│  Collect FCM token (both platforms)         │
│  + VoIP token (iOS only)                    │
│       ↓                                     │
│  POST /api/v1/auth/device-token/            │
│       ↓                                     │
│  Backend stores tokens ✅                   │
└─────────────────────────────────────────────┘
```

**Code breakdown:**

```dart
// File: call_provider.dart → registerDeviceToken()

final body = {
  'device_token': fcmToken,       // Works on both Android and iOS
  'platform': Platform.isIOS ? 'IOS' : 'ANDROID',
};

// iOS needs an extra token for reliable background wake-up
if (Platform.isIOS) {
  final voipToken = await FlutterCallkitIncoming.getDevicePushTokenVoIP();
  body['voip_token'] = voipToken;
}

await DioManager.apiRequest(url: ApiServices.deviceToken, body: body);
```

> ⚠️ **Why two tokens on iOS?**
> Regular FCM push can be delayed or blocked when iOS puts the app to sleep. Apple's **VoIP PushKit** is special — iOS guarantees it wakes the app instantly so the native call screen appears right away.

---

### Step 2 — Connect to WebSocket (Real-time Events)

**When does this happen?** Also right after login, alongside Step 1.
**Why?** When the app is open (foreground), incoming calls are delivered through a WebSocket instead of push notifications — it's faster and more reliable.

```
┌──────────────────────────────────────────────────────┐
│               WEBSOCKET EVENT FLOW                   │
│                                                      │
│  Backend sends event                                 │
│         ↓                                            │
│  _onNotificationEvent() receives it                 │
│         ↓                                            │
│  ┌──────────────────────────────────┐                │
│  │  event.type == 'incoming_call'   │──▶ Show UI     │
│  │  event.type == 'call_declined'   │──▶ Reset state │
│  │  event.type == 'call_ended'      │──▶ Reset state │
│  └──────────────────────────────────┘                │
└──────────────────────────────────────────────────────┘
```

**WebSocket connection URL format:**
```
ws://<YOUR_SERVER>/ws/notifications/?token=<USER_ACCESS_TOKEN>
```

**Example event payload the server sends:**
```json
{
  \"type\": \"incoming_call\",
  \"data\": {
    \"call_id\": \"abc-123-uuid\",
    \"call_type\": \"VIDEO\",
    \"caller_name\": \"Jane Doe\",
    \"caller_avatar\": \"https://server.com/media/jane.jpg\"
  }
}
```

---

### Step 3 — Initiating a Call (Caller Side)

**Who does this?** The user who taps the call button.
**Where is it triggered?** From `ChatScreen` or the scheduled calls tab.

```
┌───────────────────────────────────────────────────────────┐
│                   CALLER FLOW                             │
│                                                           │
│  User taps \"Call\" button                                  │
│         ↓                                                 │
│  CallProvider.initiateCall()                             │
│         ↓                                                 │
│  POST /api/v1/calls/instant/                             │
│  { target_user_id, call_type }                           │
│         ↓                                                 │
│  Backend responds with:                                   │
│  { call_id, agora_connection: { app_id, channel, token }}│
│         ↓                                                 │
│  State → RINGING                                          │
│  60-second timer starts ⏱️                               │
│         ↓                                                 │
│  Navigate to CallScreen (caller view)                    │
│         ↓                                                 │
│  Agora joinChannel() → waiting for receiver...           │
└───────────────────────────────────────────────────────────┘
```

**Code breakdown:**

```dart
// File: call_provider.dart → initiateCall()

// Step A: Call the API to create the call
final response = await DioManager.apiRequest(
  url: ApiServices.instantCall,
  body: {
    'target_user_id': targetUserId,
    'call_type': 'VIDEO',        // or 'AUDIO'
  },
);

// Step B: Save the Agora credentials from the response
// These are needed to join the Agora channel
_agoraData = AgoraConnectionData.fromJson(response['agora_connection']);

// Step C: Navigate to the call screen
if (success) {
  Navigator.push(context, MaterialPageRoute(
    builder: (_) => CallScreen(
      agoraData: provider.agoraData!,
      isCaller: true,            // ← tells the screen this is the caller
      callType: CallType.video,
      peerName: 'Jane',
    ),
  ));
}
```

> 💡 **What is `agora_connection`?**
> It contains everything needed to join the Agora channel:
> - `app_id` — your Agora project ID
> - `channel_name` — the unique \"room\" both callers join
> - `token` — a temporary security credential (expires)
> - `uid` — your user ID inside Agora (0 = auto-assigned)

---

### Step 4 — Receiving a Call (Receiver Side)

There are **3 different scenarios** depending on the receiver's app state:

```
┌────────────────────────────────────────────────────────────────┐
│              HOW INCOMING CALLS ARE DELIVERED                  │
│                                                                │
│  Is the app in the foreground?                                 │
│          ↓ YES                         ↓ NO                   │
│   WebSocket delivers              What platform?              │
│   incoming_call event             ↙            ↘             │
│          ↓                    Android           iOS            │
│   Show Flutter               FCM push         VoIP Push       │
│   IncomingCallScreen        (Firebase)        (PushKit)        │
│                                  ↓                ↓           │
│                         firebaseMessaging    AppDelegate.swift │
│                         BackgroundHandler    handles it        │
│                                  ↓                ↓           │
│                          Show native CallKit UI on device      │
└────────────────────────────────────────────────────────────────┘
```

**4A — Foreground (WebSocket path):**
```dart
// File: call_provider.dart
void _showIncomingCallUI() {
  // Guard: don't show if already in a call
  if (_callState != CallState.idle) return;  // deduplication!

  if (navigatorContext != null) {
    // Show the Flutter in-app overlay
    Navigator.push(navigatorContext!, ...IncomingCallScreen...);
  } else {
    // Fallback: show native CallKit
    CallkitService().showIncomingCall(...);
  }
}
```

**4B — Background/Killed on Android (FCM):**
```dart
// File: firebase_messaging_service.dart
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  final payloadData = message.data;

  if (payloadData['type'] == 'incoming_call') {
    // Note: handles both snake_case AND camelCase keys (server inconsistency)
    await CallkitService().showIncomingCall(
      name: payloadData['caller_name'] ?? payloadData['callerName'],
      callId: payloadData['call_id'] ?? payloadData['callId'],
    );
  }
}
```

**4C — Background/Killed on iOS (VoIP PushKit):**
```swift
// File: AppDelegate.swift
func pushRegistry(_ registry: PKPushRegistry,
                  didReceiveIncomingPushWith payload: PKPushPayload,
                  for type: PKPushType, completion: @escaping () -> Void) {

    // Extract call info from the push payload
    let callId = payload.dictionaryPayload[\"call_id\"] as? String ?? \"\"
    let callerName = payload.dictionaryPayload[\"caller_name\"] as? String ?? \"Unknown\"

    // Pass extra data to Flutter (so it knows which call to answer)
    let extraData: [String: Any] = [
        \"callId\": callId,
        \"callType\": callType,
        \"callerName\": callerName,
        \"callerAvatar\": callerAvatar,
    ]

    // Show the native iOS call screen
    SwiftFlutterCallkitIncomingPlugin.showCallkitIncoming(data, fromPushKit: true)
    completion()  // ← MUST be called, or iOS will kill your app
}
```

> ⚠️ **Important:** You MUST call `completion()` in the VoIP push handler. If you forget, Apple will terminate your app.

---

### Step 5 — Answering a Call

**Who does this?** The receiver, when they tap Accept.
**Two entry points:** From the in-app Flutter screen OR the native CallKit UI.

```
┌──────────────────────────────────────────────────────────────┐
│                    ANSWER CALL FLOW                          │
│                                                              │
│  User taps Accept (in-app OR native CallKit)                │
│         ↓                                                    │
│  Dismiss native CallKit UI  ← FlutterCallkitIncoming.endAll │
│         ↓                                                    │
│  POST /api/v1/calls/{call_id}/answer/                        │
│         ↓                                                    │
│  Response: { agora_connection: { app_id, channel, token }}  │
│         ↓                                                    │
│  State → CONNECTING                                          │
│         ↓                                                    │
│  Navigate to CallScreen (isCaller: false)                   │
│         ↓                                                    │
│  Agora joinChannel() → both parties connected ✅            │
└──────────────────────────────────────────────────────────────┘
```

```dart
// File: call_provider.dart → answerCall()

// 1. Hide the native call UI first
FlutterCallkitIncoming.endAllCalls();

// 2. Tell the server we're answering
final result = await DioManager.apiRequest(
  url: ApiServices.answerCall(callId),
);

// 3. Store the Agora credentials (same channel the caller already joined)
_agoraData = AgoraConnectionData.fromJson(result['agora_connection']);

// 4. Go to the call screen
Navigator.pushReplacement(context, MaterialPageRoute(
  builder: (_) => CallScreen(
    agoraData: _agoraData,
    isCaller: false,          // ← receiver, not caller
    callType: callType,
    peerName: callerName,
  ),
));
```

---

### Step 6 — Declining a Call

**Simple flow:**

```
User taps Decline
     ↓
POST /api/v1/calls/{call_id}/decline/
     ↓
FlutterCallkitIncoming.endAllCalls()   ← dismiss UI
     ↓
_resetState()                          ← back to IDLE
```

The **caller** gets notified automatically via the WebSocket `call_declined` event, which also resets their state to IDLE.

---

### Step 7 — Ending a Call

**Triggered by:** Either party tapping End, or it happening automatically.

```
┌──────────────────────────────────────────────────────┐
│             WAYS A CALL CAN END                      │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ 1. User taps End button                      │   │
│  │    → POST /calls/{id}/end/                   │   │
│  │    → endAllCalls() + resetState()            │   │
│  ├──────────────────────────────────────────────┤   │
│  │ 2. Remote user leaves Agora channel          │   │
│  │    → Agora fires onUserOffline event         │   │
│  │    → endCall() called automatically          │   │
│  ├──────────────────────────────────────────────┤   │
│  │ 3. 60-second ringing timeout (no answer)     │   │
│  │    → Timer fires → endCall()                 │   │
│  ├──────────────────────────────────────────────┤   │
│  │ 4. WebSocket 'call_ended' event received     │   │
│  │    → Remote hung up → reset locally          │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

---

### Step 8 — Agora Engine Setup (CallScreen)

This is the heart of the actual call. The `CallScreen` widget (`agora_client_service.dart`) initializes the Agora engine and handles all audio/video events.

```
┌─────────────────────────────────────────────────────────┐
│               _initAgora() FLOW                         │
│                                                         │
│  Start                                                  │
│    ↓                                                    │
│  Request permissions (mic + camera for video)           │
│    ↓ denied?  ──▶  Show error SnackBar ──▶ Pop screen  │
│    ↓ granted                                            │
│  createAgoraRtcEngine()                                 │
│    ↓                                                    │
│  initialize(appId)                                      │
│    ↓                                                    │
│  registerEventHandler()                                 │
│    ├── onJoinChannelSuccess  → mark local user joined   │
│    ├── onUserJoined          → show remote video        │
│    │                           start call timer ⏱️      │
│    │                           state → IN_CALL          │
│    ├── onUserOffline         → remote left → end call   │
│    └── onError               → log error                │
│    ↓                                                    │
│  setAudioProfile(chatroom)                              │
│    ↓                                                    │
│  enableVideo() / enableAudio()                          │
│    ↓                                                    │
│  joinChannel(token, channelName, uid)                   │
│    ↓                                                    │
│  WakelockPlus.enable() — keep screen on                 │
└─────────────────────────────────────────────────────────┘
```

**Listening for remote hang-up:**
```dart
// CallScreen listens to CallProvider state
void _onCallProviderChanged() {
  final state = context.read<CallProvider>().callState;

  // If remote party ended via WebSocket, auto-close this screen
  if (state == CallState.idle || state == CallState.ended) {
    _onCallEnd(notifyServer: false);  // false = don't call the API again
  }
}
```

**Always clean up in dispose:**
```dart
@override
void dispose() {
  _disposed = true;               // 🛡️ prevents setState after widget is gone
  _callTimer?.cancel();           // stop call timer
  _pulseController.dispose();     // stop animations
  provider.removeListener(_onCallProviderChanged);
  _disposeAgora();                // leave channel + release engine
  WakelockPlus.disable();        // allow screen to sleep again
  super.dispose();
}
```

---

## 📱 Platform Setup

### iOS Setup (Required for VoIP)

**1. Add to `Info.plist`:**
```xml
<key>UIBackgroundModes</key>
<array>
    <string>voip</string>
    <string>fetch</string>
    <string>remote-notification</string>
</array>
```

**2. In Xcode Signing & Capabilities:**
- ✅ Background Modes → Voice over IP
- ✅ Push Notifications

**3. PushKit Registration in `AppDelegate.swift`:**
```swift
voipRegistry = PKPushRegistry(queue: DispatchQueue.main)
voipRegistry?.delegate = self
voipRegistry?.desiredPushTypes = [PKPushType.voIP]
```

### Android Setup

**Add to `AndroidManifest.xml`:**
```xml
<uses-permission android:name=\"android.permission.CAMERA\" />
<uses-permission android:name=\"android.permission.RECORD_AUDIO\" />
<uses-permission android:name=\"android.permission.WAKE_LOCK\" />
```

**Register background handler in `main.dart`:**
```dart
void main() {
  // This must be called before runApp()
  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  runApp(MyApp());
}
```

---

## 🛡️ Safety Mechanisms (Built-in Protections)

These are guardrails built into the code to handle edge cases gracefully.

| Protection | Why it exists | How it works |
|---|---|---|
| **60s Ringing Timeout** | Caller shouldn't wait forever | Timer fires `endCall()` if no answer in 60 seconds |
| **Incoming Call Deduplication** | Server might send duplicate events | If `callState != idle`, new `incoming_call` is ignored |
| **`_disposed` Guard** | Flutter can crash if you call `setState` on a removed widget | Set `_disposed = true` first, check before every `setState` |
| **Nullable Agora Engine** | Engine might not be ready yet | All `_engine` access is null-safe (`_engine?.method()`) |
| **CallKit Cleanup on All Exits** | Native UI can get stuck | `FlutterCallkitIncoming.endAllCalls()` called on every exit path |
| **Remote End Detection** | Remote user might hang up at any moment | `CallScreen` listens to `CallProvider` and auto-pops |
| **Permission Denied Handling** | User might deny mic/camera | Shows a helpful error and exits gracefully instead of crashing |
| **Wakelock** | Screen dims/locks during calls | `WakelockPlus.enable()` on start, `disable()` on dispose |

---

## 📡 API Endpoints Reference

| Endpoint | Method | Purpose | Key Request Fields | Key Response Fields |
|---|---|---|---|---|
| `/api/v1/auth/device-token/` | POST | Register push tokens | `device_token`, `platform`, `voip_token` (iOS) | — |
| `/api/v1/calls/instant/` | POST | Start a call | `target_user_id`, `call_type` | `call_id`, `agora_connection` |
| `/api/v1/calls/{id}/answer/` | POST | Accept incoming call | — | `agora_connection` |
| `/api/v1/calls/{id}/decline/` | POST | Reject a call | — | — |
| `/api/v1/calls/{id}/end/` | POST | End active call | — | — |

**WebSocket URL:** `ws://<SERVER>/ws/notifications/?token=<ACCESS_TOKEN>`

**WebSocket Event Types:**

| Event | Sent to | Meaning |
|---|---|---|
| `incoming_call` | Receiver | A new call is coming in |
| `call_declined` | Caller | Receiver rejected the call |
| `call_ended` | Both | The other party ended the call |

---

## 🔁 Full End-to-End Flow Summary

```
 CALLER                    BACKEND                   RECEIVER
   │                          │                          │
   │── POST /calls/instant/ ─▶│                          │
   │◀─ { call_id, agora } ────│                          │
   │                          │                          │
   │  joinChannel() ─────────────────────────────────▶ [Agora]
   │                          │                          │
   │  [Waiting... 60s] ◀─────│─ WebSocket/Push ────────▶│
   │                          │   incoming_call event    │
   │                          │                          │
   │                          │         [User taps Accept]
   │                          │◀─ POST /calls/{id}/answer/
   │                          │── { agora_connection } ─▶│
   │                          │                          │
   │                          │           joinChannel() ─▶ [Agora]
   │                          │                          │
 [Agora: onUserJoined] ◀─────────────────────────────── │
   │                                                     │
   │ ◀══════════ LIVE AUDIO/VIDEO via Agora ════════════▶│
   │                          │                          │
   │── POST /calls/{id}/end/ ▶│                          │
   │                          │── call_ended WebSocket ─▶│
   │  leaveChannel()          │                    leaveChannel()
   │                          │                          │
  IDLE                        │                        IDLE
```

---

> 📝 **Original doc:** See parent page — Agora Video Implementation
> 🔄 **Last improved:** April 2026"
    }
  ]
}