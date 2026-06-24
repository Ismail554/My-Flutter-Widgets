# Android Late Alarm Issue in Flutter

## 1. Problem Summary

In some Android devices, scheduled alarms or prayer-time notifications may trigger late.  
For example, a Fajr alarm scheduled for **3:44 AM** may trigger much later, such as **9:13 AM**, when the user wakes up and unlocks the phone.

This usually happens because Android tries to save battery when the device is inactive for a long time. During deep sleep, Android may delay normal alarms and background tasks.

For time-sensitive alarms, the app must handle:

- Android Doze Mode
- Exact alarm permission
- Battery optimization restrictions
- Silent fallback from exact alarms to inexact alarms

---

## 2. Why This Happens

### 2.1 Android Doze Mode

When an Android phone stays inactive for a long time, such as overnight, Android can enter **Doze Mode**.

In Doze Mode, Android restricts background activity to save battery. This can delay:

- Background tasks
- Network calls
- Normal scheduled alarms
- Notifications

So, if the app schedules a normal alarm, Android may not trigger it at the exact time.

---

### 2.2 Exact Alarm Permission

For accurate alarms, Android requires exact alarm scheduling.

On newer Android versions, especially Android 12+ and Android 13/14, apps may need permission to schedule exact alarms.

If this permission is not granted, the app may fail to schedule an exact alarm.

The important permission is:

```xml
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
```

This permission should be added inside:

```text
android/app/src/main/AndroidManifest.xml
```

Example:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />

    <application
        android:label="Your App Name"
        android:name="${applicationName}"
        android:icon="@mipmap/ic_launcher">

        <!-- Other app config -->

    </application>
</manifest>
```

---

### 2.3 Silent Fallback Issue

In the current implementation, exact alarm scheduling may fail if the permission is missing or revoked.

If the exception is caught silently, the app may fall back to:

```dart
AndroidScheduleMode.inexactAllowWhileIdle
```

This prevents the app from crashing, but it creates another problem:

> The alarm is no longer guaranteed to trigger at the exact scheduled time.

Android may delay inexact alarms until the device becomes active again.

---

### 2.4 Battery Optimization Restrictions

Some Android brands have aggressive battery-saving systems.

Common examples:

- Samsung
- Xiaomi
- Redmi
- OnePlus
- Oppo
- Vivo
- Realme
- Huawei

These manufacturers may restrict apps from running in the background.

Even if exact alarm permission is granted, the alarm can still be delayed if the app is under battery optimization.

For better reliability, users should set the app battery mode to:

```text
Unrestricted
```

or disable battery optimization for the app.

---

## 3. Required Packages

This solution uses the `permission_handler` package.

Add it to `pubspec.yaml`:

```yaml
dependencies:
  permission_handler: ^11.3.1
```

Then run:

```bash
flutter pub get
```

---

## 4. Permission Helper Code

Create a helper class to check and request the required Android permissions.

Example file:

```text
lib/services/alarm_permission_service.dart
```

```dart
import 'dart:io';

import 'package:permission_handler/permission_handler.dart';

class AlarmPermissionService {
  /// Checks whether exact alarm permission is granted.
  ///
  /// On iOS, this returns true because this Android-specific permission
  /// is not required.
  Future<bool> isExactAlarmPermissionGranted() async {
    if (Platform.isAndroid) {
      return await Permission.scheduleExactAlarm.isGranted;
    }

    return true;
  }

  /// Checks whether the app is ignored by Android battery optimization.
  ///
  /// On iOS, this returns true because Android battery optimization
  /// does not apply.
  Future<bool> isBatteryOptimizationIgnored() async {
    if (Platform.isAndroid) {
      return await Permission.ignoreBatteryOptimizations.isGranted;
    }

    return true;
  }

  /// Requests exact alarm permission.
  ///
  /// On some Android versions, this may open a system settings screen
  /// where the user must manually allow the permission.
  Future<void> requestExactAlarmPermission() async {
    if (Platform.isAndroid) {
      await Permission.scheduleExactAlarm.request();
    }
  }

  /// Requests the user to ignore battery optimization for this app.
  ///
  /// Some devices may show a system dialog.
  /// Some OEM devices may require the user to change this manually
  /// from app settings.
  Future<void> requestIgnoreBatteryOptimization() async {
    if (Platform.isAndroid) {
      await Permission.ignoreBatteryOptimizations.request();
    }
  }
}
```

---

## 5. Checking Permissions Before Scheduling Alarm

Before scheduling a time-sensitive alarm, check both permissions.

```dart
final alarmPermissionService = AlarmPermissionService();

Future<bool> canScheduleReliableAlarm() async {
  final hasExactAlarmPermission =
      await alarmPermissionService.isExactAlarmPermissionGranted();

  final isIgnoringBatteryOptimization =
      await alarmPermissionService.isBatteryOptimizationIgnored();

  return hasExactAlarmPermission && isIgnoringBatteryOptimization;
}
```

Example usage:

```dart
Future<void> schedulePrayerAlarm() async {
  final canScheduleAlarm = await canScheduleReliableAlarm();

  if (!canScheduleAlarm) {
    // Show a screen or dialog explaining the issue to the user.
    // Then ask the user to enable the required permissions.
    return;
  }

  // Continue scheduling the exact alarm here.
}
```

---

## 6. Requesting Permissions From UI

A beginner-friendly way is to show a button when permissions are missing.

```dart
import 'package:flutter/material.dart';

class AlarmPermissionPage extends StatefulWidget {
  const AlarmPermissionPage({super.key});

  @override
  State<AlarmPermissionPage> createState() => _AlarmPermissionPageState();
}

class _AlarmPermissionPageState extends State<AlarmPermissionPage> {
  final AlarmPermissionService _permissionService = AlarmPermissionService();

  bool _exactAlarmGranted = false;
  bool _batteryOptimizationIgnored = false;

  @override
  void initState() {
    super.initState();
    _checkPermissions();
  }

  Future<void> _checkPermissions() async {
    final exactAlarmGranted =
        await _permissionService.isExactAlarmPermissionGranted();

    final batteryOptimizationIgnored =
        await _permissionService.isBatteryOptimizationIgnored();

    setState(() {
      _exactAlarmGranted = exactAlarmGranted;
      _batteryOptimizationIgnored = batteryOptimizationIgnored;
    });
  }

  Future<void> _requestPermissions() async {
    if (!_exactAlarmGranted) {
      await _permissionService.requestExactAlarmPermission();
    }

    if (!_batteryOptimizationIgnored) {
      await _permissionService.requestIgnoreBatteryOptimization();
    }

    await _checkPermissions();
  }

  @override
  Widget build(BuildContext context) {
    final allPermissionsGranted =
        _exactAlarmGranted && _batteryOptimizationIgnored;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Alarm Permissions'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: allPermissionsGranted
            ? const Text(
                'All required alarm permissions are enabled.',
              )
            : Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'To make alarms ring on time, please enable the required permissions.',
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Exact alarm permission: ${_exactAlarmGranted ? "Enabled" : "Missing"}',
                  ),
                  Text(
                    'Battery optimization: ${_batteryOptimizationIgnored ? "Ignored" : "Still active"}',
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: _requestPermissions,
                    child: const Text('Enable Required Permissions'),
                  ),
                ],
              ),
      ),
    );
  }
}
```

---

## 7. Scheduling Exact Alarm Correctly

If you are using `flutter_local_notifications`, use exact scheduling mode for important alarms.

Example:

```dart
await flutterLocalNotificationsPlugin.zonedSchedule(
  notificationId,
  'Fajr Alarm',
  'It is time for Fajr prayer.',
  scheduledDate,
  notificationDetails,
  androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
  uiLocalNotificationDateInterpretation:
      UILocalNotificationDateInterpretation.absoluteTime,
);
```

For time-sensitive alarms, avoid using this as the default:

```dart
AndroidScheduleMode.inexactAllowWhileIdle
```

This mode allows Android to delay the alarm.

---

## 8. Avoid Silent Fallback

Do not silently fall back from exact alarm to inexact alarm without informing the user.

Not recommended:

```dart
try {
  await scheduleExactAlarm();
} catch (e) {
  await scheduleInexactAlarm();
}
```

Better approach:

```dart
try {
  await scheduleExactAlarm();
} catch (e) {
  debugPrint('Exact alarm scheduling failed: $e');

  // Show a user-friendly message.
  // Explain that exact alarm permission is required.
  // Ask the user to enable permission before scheduling again.
}
```

Or:

```dart
Future<void> scheduleAlarmSafely() async {
  final hasExactAlarmPermission =
      await alarmPermissionService.isExactAlarmPermissionGranted();

  if (!hasExactAlarmPermission) {
    await alarmPermissionService.requestExactAlarmPermission();

    final permissionGrantedAfterRequest =
        await alarmPermissionService.isExactAlarmPermissionGranted();

    if (!permissionGrantedAfterRequest) {
      throw Exception(
        'Exact alarm permission is required to schedule reliable alarms.',
      );
    }
  }

  await scheduleExactAlarm();
}
```

---

## 9. Recommended User Message

Show a clear explanation to the user before sending them to settings.

Example:

```text
To make prayer alarms ring exactly on time, please allow exact alarms and disable battery optimization for this app.

Android may delay alarms when the phone is in deep sleep mode, especially overnight. Enabling these settings helps the app trigger alarms at the correct time.
```

For battery settings:

```text
Please set this app's battery usage to "Unrestricted" from Android settings. Some phone brands may delay alarms if battery optimization is enabled.
```

---

## 10. Recommended Flow

Use this flow in the app:

```text
1. User opens the app.
2. App checks exact alarm permission.
3. App checks battery optimization status.
4. If any permission is missing, show an explanation screen.
5. User taps "Enable Required Permissions".
6. App opens the required Android permission/settings screen.
7. User enables the permission manually if needed.
8. App checks permissions again.
9. If permissions are enabled, schedule alarms using exactAllowWhileIdle.
10. If permissions are still missing, show a warning that alarms may be delayed.
```

---

## 11. Final Solution Summary

The late alarm issue happens because Android may delay alarms when the device is in deep sleep or battery-saving mode.

The solution is:

- Add exact alarm permission in `AndroidManifest.xml`
- Add battery optimization permission in `AndroidManifest.xml`
- Check exact alarm permission before scheduling alarms
- Ask the user to enable exact alarm permission if missing
- Ask the user to disable battery optimization for the app
- Use `AndroidScheduleMode.exactAllowWhileIdle` for important alarms
- Do not silently fall back to `inexactAllowWhileIdle`
- Inform the user clearly when reliable alarm scheduling is not possible

---

## 12. Quick Checklist

Before releasing the fix, confirm:

- [ ] `SCHEDULE_EXACT_ALARM` is added to `AndroidManifest.xml`
- [ ] `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS` is added to `AndroidManifest.xml`
- [ ] Exact alarm permission is checked before scheduling
- [ ] Battery optimization status is checked
- [ ] User is guided to enable required settings
- [ ] Exact alarms use `AndroidScheduleMode.exactAllowWhileIdle`
- [ ] Silent fallback to inexact alarms is removed or clearly handled
- [ ] The app explains that alarms may be delayed if permissions are not enabled
