Page<dynamic> hcCustomTransitionPage({
  required LocalKey key,
  required Widget child,
}) {
  if (defaultTargetPlatform == TargetPlatform.iOS) {
    return CupertinoPage(
      key: key,
      child: child,
    );
  }

  return CustomTransitionPage(
    key: key,
    child: child,
    transitionDuration: const Duration(milliseconds: 300),
    transitionsBuilder:
        (context, animation, secondaryAnimation, child) {
      return FadeTransition(
        opacity: animation,
        child: child,
      );
    },
  );
}




Future<bool> isExactAlarmPermissionGranted() async {
    if (Platform.isAndroid) {
      return await Permission.scheduleExactAlarm.isGranted;
    }
    return true;
  }

  Future<bool> isBatteryOptimizationIgnored() async {
    if (Platform.isAndroid) {
      return await Permission.ignoreBatteryOptimizations.isGranted;
    }
    return true;
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