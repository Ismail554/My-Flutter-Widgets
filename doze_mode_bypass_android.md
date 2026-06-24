# Android Doze Mode and Reliable Alarm Notifications in Flutter

## Purpose

This document explains why Android alarms or scheduled local notifications can trigger late, especially when the phone is inactive overnight. It focuses on **Android Doze Mode**, exact alarms, battery optimization, and how to organize Flutter code for a beginner-friendly alarm implementation.

The example used here is a prayer alarm:

> Fajr alarm should trigger at **3:44 AM**, but on some Android devices it triggers much later, for example when the user unlocks the phone at **9:13 AM**.

---

## 1. The Core Problem

On Android, alarms are not always guaranteed to run exactly on time.

When the phone is inactive for a long time, Android enters a battery-saving state called **Doze Mode**. In Doze Mode, Android reduces background activity to save battery.

This can delay:

- Normal alarms
- Scheduled notifications
- Background tasks
- Network requests
- Periodic timers
- Sync jobs

So even if the app schedules an alarm for `3:44 AM`, Android may delay it until the system wakes up again.

---

## 2. What Is Android Doze Mode?

Android Doze Mode was introduced in Android 6.0, API level 23.

When the device is:

- Not charging
- Screen off
- Not moving for a while
- Inactive for a long period

Android can enter Doze Mode.

In this state, Android limits background execution to reduce battery usage.

### Simple explanation

Think of Doze Mode like this:

```text
Phone is sleeping deeply.
Android does not want apps waking the phone too often.
So Android delays normal background work until later.
```

This is good for battery life, but it creates problems for apps that need exact timing, such as:

- Alarm clock apps
- Prayer time apps
- Calendar reminder apps
- Medicine reminder apps
- Time-sensitive notification apps

---

## 3. Why Normal Alarms Become Late

If the app uses an inexact alarm mode like this:

```dart
AndroidScheduleMode.inexactAllowWhileIdle
```

Android is allowed to delay the alarm.

That means the alarm may not trigger at the exact scheduled time. Android may batch it with other system work and deliver it later.

Example:

```text
Expected alarm time: 3:44 AM
Actual trigger time: 9:13 AM
Reason: Android delayed the inexact alarm while the phone was idle.
```

---

## 4. Exact Alarm vs Inexact Alarm

### Inexact alarm

Use this when timing is flexible.

Examples:

- Sync data sometime today
- Refresh cache
- Upload logs
- Send a non-urgent reminder

```dart
AndroidScheduleMode.inexactAllowWhileIdle
```

This is battery-friendly, but not reliable for exact alarm timing.

---

### Exact alarm

Use this when timing is important.

Examples:

- Wake-up alarm
- Fajr alarm
- Appointment alert
- Medicine reminder

```dart
AndroidScheduleMode.exactAllowWhileIdle
```

This tells Android that the alarm should run as close as possible to the selected time, even while the device is idle.

However, newer Android versions require special permission for exact alarms.

---

## 5. Android Exact Alarm Permission

On newer Android versions, exact alarms need special handling.

Important permissions:

```xml
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
```

For Android 13+ notifications:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

For battery optimization request:

```xml
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
```

### Important note about `USE_EXACT_ALARM`

There is also this permission:

```xml
<uses-permission android:name="android.permission.USE_EXACT_ALARM" />
```

But do not add it blindly.

`USE_EXACT_ALARM` is mainly for apps that qualify as alarm clock or calendar apps. Google Play may reject apps that declare this permission without a valid policy reason.

For many apps, the safer approach is:

```xml
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
```

Then check and request exact alarm permission properly.

---

## 6. Battery Optimization Problem

Even if exact alarm permission is granted, some Android phones may still delay alarms because of battery optimization.

This is common on brands like:

- Samsung
- Xiaomi
- Redmi
- OnePlus
- Oppo
- Vivo
- Realme
- Huawei

These devices may aggressively restrict background activity.

For better alarm reliability, ask the user to set the app battery usage to:

```text
Unrestricted
```

or allow the app to ignore battery optimization.

### Important

You cannot fully control this from Flutter. You can request or guide the user, but some OEM settings must be changed manually by the user.

---

## 7. iOS Complexity

iOS does not have Android Doze Mode, but iOS has its own limitations.

On iOS:

- Apps cannot run freely in the background.
- iOS may suspend the app when it goes to the background.
- Local notifications are handled by the system.
- Background tasks are not guaranteed to run at an exact time.
- Low Power Mode can reduce background activity.
- Focus Mode, Silent Mode, notification settings, and sound settings can affect how the alert appears.
- Critical alerts require a special Apple entitlement and are not available for normal apps.

### Simple iOS rule

For alarm-style apps on iOS, do not rely on background timers.

Use local notifications.

The app should schedule notifications in advance, then iOS will deliver them according to the user notification settings.

---

## 8. Recommended Flutter File Structure

Organize alarm-related code like this:

```text
lib/
└── features/
    └── alarms/
        ├── services/
        │   ├── alarm_permission_service.dart
        │   └── local_alarm_service.dart
        ├── pages/
        │   └── alarm_permission_page.dart
        └── models/
            └── alarm_schedule_result.dart
```

This keeps permission logic separate from notification scheduling logic.

---

## 9. Required Packages

Add these packages:

```yaml
dependencies:
  flutter_local_notifications: ^22.0.1
  permission_handler: ^12.0.1
  timezone: ^0.10.1
  flutter_timezone: ^5.0.0
```

Then run:

```bash
flutter pub get
```

Package versions may change over time. Use the latest compatible versions for your Flutter SDK.

---

## 10. Android Manifest Setup

File:

```text
android/app/src/main/AndroidManifest.xml
```

Add permissions above the `<application>` tag:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- Required for Android 13+ notification permission -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Required for exact alarm scheduling on supported Android versions -->
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />

    <!-- Used to request battery optimization exclusion -->
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />

    <application
        android:label="Your App Name"
        android:name="${applicationName}"
        android:icon="@mipmap/ic_launcher">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

    </application>
</manifest>
```

---

## 11. Permission Service

File:

```text
lib/features/alarms/services/alarm_permission_service.dart
```

```dart
import 'dart:io';

import 'package:permission_handler/permission_handler.dart';

class AlarmPermissionService {
  Future<bool> isNotificationPermissionGranted() async {
    if (!Platform.isAndroid && !Platform.isIOS) {
      return true;
    }

    final status = await Permission.notification.status;
    return status.isGranted;
  }

  Future<bool> isExactAlarmPermissionGranted() async {
    if (Platform.isAndroid) {
      return await Permission.scheduleExactAlarm.isGranted;
    }

    // iOS does not use Android exact alarm permission.
    return true;
  }

  Future<bool> isBatteryOptimizationIgnored() async {
    if (Platform.isAndroid) {
      return await Permission.ignoreBatteryOptimizations.isGranted;
    }

    // iOS does not expose Android-style battery optimization exclusion.
    return true;
  }

  Future<void> requestNotificationPermission() async {
    if (Platform.isAndroid || Platform.isIOS) {
      await Permission.notification.request();
    }
  }

  Future<void> requestExactAlarmPermission() async {
    if (Platform.isAndroid) {
      await Permission.scheduleExactAlarm.request();
    }
  }

  Future<void> requestIgnoreBatteryOptimization() async {
    if (Platform.isAndroid) {
      await Permission.ignoreBatteryOptimizations.request();
    }
  }

  Future<bool> hasMinimumAlarmPermissions() async {
    final notificationGranted = await isNotificationPermissionGranted();
    final exactAlarmGranted = await isExactAlarmPermissionGranted();

    return notificationGranted && exactAlarmGranted;
  }
}
```

---

## 12. Alarm Schedule Result Model

File:

```text
lib/features/alarms/models/alarm_schedule_result.dart
```

```dart
enum AlarmScheduleResult {
  scheduled,
  notificationPermissionMissing,
  exactAlarmPermissionMissing,
  batteryOptimizationActive,
  failed,
}
```

This makes your code easier to understand than returning only `true` or `false`.

---

## 13. Local Alarm Service

File:

```text
lib/features/alarms/services/local_alarm_service.dart
```

```dart
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;

import '../models/alarm_schedule_result.dart';
import 'alarm_permission_service.dart';

class LocalAlarmService {
  LocalAlarmService(this._permissionService);

  final AlarmPermissionService _permissionService;

  final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  Future<void> initialize() async {
    await _configureTimezone();

    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');

    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    const initializationSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _plugin.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        debugPrint('Notification tapped: ${response.payload}');
      },
    );
  }

  Future<void> _configureTimezone() async {
    tz.initializeTimeZones();

    final String timezoneName = await FlutterTimezone.getLocalTimezone();
    tz.setLocalLocation(tz.getLocation(timezoneName));
  }

  Future<void> requestPlatformNotificationPermission() async {
    if (Platform.isAndroid) {
      await _plugin
          .resolvePlatformSpecificImplementation<
              AndroidFlutterLocalNotificationsPlugin>()
          ?.requestNotificationsPermission();
    }

    if (Platform.isIOS) {
      await _plugin
          .resolvePlatformSpecificImplementation<
              IOSFlutterLocalNotificationsPlugin>()
          ?.requestPermissions(
            alert: true,
            badge: true,
            sound: true,
          );
    }
  }

  Future<AlarmScheduleResult> scheduleExactAlarm({
    required int id,
    required String title,
    required String body,
    required DateTime dateTime,
    String? payload,
  }) async {
    try {
      final notificationGranted =
          await _permissionService.isNotificationPermissionGranted();

      if (!notificationGranted) {
        return AlarmScheduleResult.notificationPermissionMissing;
      }

      final exactAlarmGranted =
          await _permissionService.isExactAlarmPermissionGranted();

      if (!exactAlarmGranted) {
        return AlarmScheduleResult.exactAlarmPermissionMissing;
      }

      final batteryOptimizationIgnored =
          await _permissionService.isBatteryOptimizationIgnored();

      if (Platform.isAndroid && !batteryOptimizationIgnored) {
        // We still allow scheduling, but return this result so the UI can warn
        // the user that alarm reliability may be reduced.
        //
        // If you want stricter behavior, return here before scheduling.
        debugPrint('Battery optimization is active. Alarm may be delayed.');
      }

      final scheduledDate = tz.TZDateTime.from(dateTime, tz.local);

      const androidDetails = AndroidNotificationDetails(
        'alarm_channel',
        'Alarm Notifications',
        channelDescription: 'Important time-sensitive alarm notifications',
        importance: Importance.max,
        priority: Priority.high,
        playSound: true,
      );

      const iosDetails = DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      );

      const notificationDetails = NotificationDetails(
        android: androidDetails,
        iOS: iosDetails,
      );

      await _plugin.zonedSchedule(
        id: id,
        title: title,
        body: body,
        scheduledDate: scheduledDate,
        notificationDetails: notificationDetails,
        androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
        payload: payload,
      );

      if (Platform.isAndroid && !batteryOptimizationIgnored) {
        return AlarmScheduleResult.batteryOptimizationActive;
      }

      return AlarmScheduleResult.scheduled;
    } catch (e, stackTrace) {
      debugPrint('Failed to schedule exact alarm: $e');
      debugPrintStack(stackTrace: stackTrace);
      return AlarmScheduleResult.failed;
    }
  }
}
```

---

## 14. Android Alarm Example: Fajr Alarm

Assume the Fajr time is:

```text
3:44 AM
```

Example scheduling code:

```dart
Future<void> scheduleFajrAlarm(LocalAlarmService alarmService) async {
  final now = DateTime.now();

  final fajrTime = DateTime(
    now.year,
    now.month,
    now.day,
    3,
    44,
  );

  final scheduledTime = fajrTime.isBefore(now)
      ? fajrTime.add(const Duration(days: 1))
      : fajrTime;

  final result = await alarmService.scheduleExactAlarm(
    id: 1001,
    title: 'Fajr Alarm',
    body: 'It is time for Fajr prayer.',
    dateTime: scheduledTime,
    payload: 'fajr_alarm',
  );

  switch (result) {
    case AlarmScheduleResult.scheduled:
      debugPrint('Fajr alarm scheduled successfully.');
      break;

    case AlarmScheduleResult.notificationPermissionMissing:
      debugPrint('Notification permission is missing.');
      break;

    case AlarmScheduleResult.exactAlarmPermissionMissing:
      debugPrint('Exact alarm permission is missing.');
      break;

    case AlarmScheduleResult.batteryOptimizationActive:
      debugPrint(
        'Alarm scheduled, but battery optimization may delay it.',
      );
      break;

    case AlarmScheduleResult.failed:
      debugPrint('Failed to schedule Fajr alarm.');
      break;
  }
}
```

---

## 15. Important Note for Prayer Times

Prayer times usually change every day.

So do not use a simple daily repeating alarm for Fajr unless the time is always the same, which it is not.

Better approach:

```text
1. Calculate prayer times for today.
2. Schedule today's alarms.
3. Calculate prayer times for tomorrow.
4. Schedule tomorrow's alarms.
5. Refresh schedules whenever:
   - location changes
   - timezone changes
   - calculation method changes
   - app starts
   - user updates prayer settings
```

Recommended approach:

```dart
Future<void> schedulePrayerAlarmsForToday(
  LocalAlarmService alarmService,
) async {
  final now = DateTime.now();

  final fajr = DateTime(now.year, now.month, now.day, 3, 44);
  final dhuhr = DateTime(now.year, now.month, now.day, 12, 30);
  final asr = DateTime(now.year, now.month, now.day, 16, 15);
  final maghrib = DateTime(now.year, now.month, now.day, 18, 50);
  final isha = DateTime(now.year, now.month, now.day, 20, 10);

  final alarms = [
    {'id': 1, 'name': 'Fajr', 'time': fajr},
    {'id': 2, 'name': 'Dhuhr', 'time': dhuhr},
    {'id': 3, 'name': 'Asr', 'time': asr},
    {'id': 4, 'name': 'Maghrib', 'time': maghrib},
    {'id': 5, 'name': 'Isha', 'time': isha},
  ];

  for (final alarm in alarms) {
    final time = alarm['time'] as DateTime;

    if (time.isBefore(now)) {
      continue;
    }

    await alarmService.scheduleExactAlarm(
      id: alarm['id'] as int,
      title: '${alarm['name']} Alarm',
      body: 'It is time for ${alarm['name']} prayer.',
      dateTime: time,
      payload: '${alarm['name']}_alarm'.toLowerCase(),
    );
  }
}
```

---

## 16. Permission UI Page

File:

```text
lib/features/alarms/pages/alarm_permission_page.dart
```

```dart
import 'package:flutter/material.dart';

import '../services/alarm_permission_service.dart';

class AlarmPermissionPage extends StatefulWidget {
  const AlarmPermissionPage({super.key});

  @override
  State<AlarmPermissionPage> createState() => _AlarmPermissionPageState();
}

class _AlarmPermissionPageState extends State<AlarmPermissionPage> {
  final AlarmPermissionService _permissionService = AlarmPermissionService();

  bool _notificationGranted = false;
  bool _exactAlarmGranted = false;
  bool _batteryOptimizationIgnored = false;

  @override
  void initState() {
    super.initState();
    _loadPermissionStatus();
  }

  Future<void> _loadPermissionStatus() async {
    final notificationGranted =
        await _permissionService.isNotificationPermissionGranted();

    final exactAlarmGranted =
        await _permissionService.isExactAlarmPermissionGranted();

    final batteryOptimizationIgnored =
        await _permissionService.isBatteryOptimizationIgnored();

    if (!mounted) return;

    setState(() {
      _notificationGranted = notificationGranted;
      _exactAlarmGranted = exactAlarmGranted;
      _batteryOptimizationIgnored = batteryOptimizationIgnored;
    });
  }

  Future<void> _requestRequiredPermissions() async {
    if (!_notificationGranted) {
      await _permissionService.requestNotificationPermission();
    }

    if (!_exactAlarmGranted) {
      await _permissionService.requestExactAlarmPermission();
    }

    if (!_batteryOptimizationIgnored) {
      await _permissionService.requestIgnoreBatteryOptimization();
    }

    await _loadPermissionStatus();
  }

  @override
  Widget build(BuildContext context) {
    final allRequiredPermissionsGranted =
        _notificationGranted && _exactAlarmGranted;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Alarm Permission Setup'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            const Text(
              'To make alarms ring on time, Android needs some permissions.',
            ),
            const SizedBox(height: 16),

            _PermissionRow(
              title: 'Notification Permission',
              granted: _notificationGranted,
            ),
            _PermissionRow(
              title: 'Exact Alarm Permission',
              granted: _exactAlarmGranted,
            ),
            _PermissionRow(
              title: 'Battery Optimization Ignored',
              granted: _batteryOptimizationIgnored,
              warningOnly: true,
            ),

            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: _requestRequiredPermissions,
              child: const Text('Enable Required Permissions'),
            ),

            const SizedBox(height: 24),

            if (!allRequiredPermissionsGranted)
              const Text(
                'Warning: Alarms may be delayed if notification or exact alarm permission is missing.',
              ),

            if (!_batteryOptimizationIgnored)
              const Text(
                'Battery optimization is still active. On some phones, this can delay alarms. Please set app battery usage to Unrestricted from system settings.',
              ),
          ],
        ),
      ),
    );
  }
}

class _PermissionRow extends StatelessWidget {
  const _PermissionRow({
    required this.title,
    required this.granted,
    this.warningOnly = false,
  });

  final String title;
  final bool granted;
  final bool warningOnly;

  @override
  Widget build(BuildContext context) {
    final statusText = granted
        ? 'Enabled'
        : warningOnly
            ? 'Recommended'
            : 'Required';

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(
            granted ? Icons.check_circle : Icons.warning,
          ),
          const SizedBox(width: 8),
          Expanded(child: Text(title)),
          Text(statusText),
        ],
      ),
    );
  }
}
```

---

## 17. Do Not Silently Fallback to Inexact Alarm

Avoid this:

```dart
try {
  await scheduleExactAlarm();
} catch (e) {
  await scheduleInexactAlarm();
}
```

This hides the real issue.

The user thinks the alarm is reliable, but Android may delay it.

Better:

```dart
try {
  await scheduleExactAlarm();
} catch (e) {
  debugPrint('Exact alarm failed: $e');

  // Show UI message:
  // "Exact alarm permission is required. Please enable it to make alarms ring on time."
}
```

If you must fallback, tell the user clearly:

```text
Exact alarm permission is not enabled. We can schedule a reminder, but Android may delay it while the phone is in deep sleep mode.
```

---

## 18. Battery Usage Best Practices

Do not fight the operating system by keeping the app alive all night.

Avoid:

```text
- Background infinite loops
- Timer.periodic every minute
- Keeping a foreground service running without a strong reason
- Recalculating prayer times continuously
- Network calls at every alarm time
```

Better:

```text
- Calculate alarm times in advance
- Schedule local notifications
- Use exact alarms only for user-visible time-sensitive alerts
- Use WorkManager for deferrable background work
- Keep network calls away from alarm trigger time when possible
- Keep alarm count reasonable
```

### Bad example

```dart
Timer.periodic(const Duration(minutes: 1), (_) {
  checkIfPrayerTimeReached();
});
```

This is not reliable in the background and wastes battery.

### Better example

```dart
await alarmService.scheduleExactAlarm(
  id: 1001,
  title: 'Fajr Alarm',
  body: 'It is time for Fajr prayer.',
  dateTime: fajrTime,
);
```

---

## 19. Android vs iOS Comparison

| Topic | Android | iOS |
|---|---|---|
| Deep sleep behavior | Doze Mode can delay alarms | iOS suspends background apps |
| Exact alarm permission | Required on newer Android versions | Not applicable |
| Notification permission | Required on Android 13+ | Required |
| Battery optimization | Can delay alarms heavily | Managed by iOS automatically |
| OEM restrictions | Very common | Less fragmented |
| Background timers | Not reliable | Not reliable |
| Best approach | Exact local notification + permission checks | Local notification scheduling |
| Can force exact background execution? | Limited and permission-based | No, not for normal apps |

---

## 20. Recommended App Flow

Use this flow:

```text
1. User opens the app.
2. App initializes notification service.
3. App checks notification permission.
4. App checks exact alarm permission on Android.
5. App checks battery optimization status on Android.
6. If required permission is missing, show explanation screen.
7. User enables permissions.
8. App schedules alarms using exactAllowWhileIdle.
9. If battery optimization is active, show warning.
10. App reschedules alarms when prayer settings, timezone, or location changes.
```

---

## 21. Beginner-Friendly Explanation for Users

You can show this message inside the app:

```text
To make prayer alarms ring on time, please allow notifications and exact alarms.

Android may delay alarms when your phone is in deep sleep mode, especially overnight. For better reliability, please also set this app's battery usage to Unrestricted.
```

For iOS:

```text
Please allow notifications so the app can show prayer reminders. iOS controls notification delivery based on your notification, sound, Focus, and device settings.
```

---

## 22. Testing Checklist

Test these cases:

```text
[ ] Android 12
[ ] Android 13
[ ] Android 14+
[ ] Samsung device
[ ] Xiaomi/Redmi device
[ ] OnePlus/Oppo/Vivo device
[ ] App in foreground
[ ] App in background
[ ] App killed from recent apps
[ ] Phone locked overnight
[ ] Battery optimization enabled
[ ] Battery optimization disabled / Unrestricted
[ ] Notification permission denied
[ ] Exact alarm permission denied
[ ] Exact alarm permission granted
[ ] Timezone changed
[ ] Prayer calculation method changed
```

---

## 23. Final Summary

The late alarm issue is mainly caused by Android power management.

The correct solution is not just one line of code. A reliable alarm implementation needs:

- Proper understanding of Android Doze Mode
- Exact alarm scheduling for time-sensitive alarms
- Runtime permission checks
- Notification permission handling
- Battery optimization guidance
- No silent fallback to inexact alarms
- Clear user communication
- Separate Android and iOS behavior handling

For Android alarm-style notifications, use:

```dart
AndroidScheduleMode.exactAllowWhileIdle
```

But only after checking exact alarm permission.

For iOS, schedule local notifications and avoid background timers.

---

## 24. Official References

- Android Developers: Schedule alarms  
  https://developer.android.com/develop/background-work/services/alarms

- Android Developers: Schedule exact alarms are denied by default  
  https://developer.android.com/about/versions/14/changes/schedule-exact-alarms

- Apple Developer: Scheduling a notification locally from your app  
  https://developer.apple.com/documentation/usernotifications/scheduling-a-notification-locally-from-your-app

- Apple Developer: Energy Efficiency Guide for iOS Apps  
  https://developer.apple.com/library/archive/documentation/Performance/Conceptual/EnergyGuide-iOS/index.html

- flutter_local_notifications package  
  https://pub.dev/packages/flutter_local_notifications

- permission_handler package  
  https://pub.dev/packages/permission_handler
