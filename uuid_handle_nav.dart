
  void _handleNavigation() {
    Timer(const Duration(seconds: 2), () async {
      if (!mounted) return;

      final uuid = await _storage.read(key: AppStrings.uuidKey);

      if (uuid == null) {
        // First time app use: Initialize, store UUID and navigate to onboarding
        final newUuid = const Uuid().v4();
        await _storage.write(key: AppStrings.uuidKey, value: newUuid);
        if (mounted) {
          OnboardingController.navigateToOnboarding(context);
        }
      } else {
        // UUID already exists: Navigate to LoginScreen
        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const LoginScreen()),
          );
        }
      }
    });
  }
