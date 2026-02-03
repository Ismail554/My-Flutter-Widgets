import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:orbital/core/app_colors.dart';
import 'package:orbital/core/app_spacing.dart';
import 'package:orbital/core/assets_manager.dart';
import 'package:orbital/views/auth/login/login_screen.dart';

import 'package:orbital/views/custom_widgets/gradient_button.dart';
import 'package:orbital/views/nav/main_wrapper.dart';

class CongratulationsScreen extends StatelessWidget {
  const CongratulationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 24.w),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Spacer(flex: 2),
              Image.asset(IconAssets.success, height: 120.h, width: 120.w),
              AppSpacing.h32,
              Text(
                "Congratulations!",
                style: TextStyle(
                  fontSize: 28.sp,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryColor,
                ),
              ),
              AppSpacing.h16,
              Text(
                "Your account has been created\nsuccessfully",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16.sp,
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
              ),
              Spacer(flex: 3),
              GradientButton(
                onPressed: () {
                  Navigator.pushAndRemoveUntil(
                    context,
                    MaterialPageRoute(
                      builder: (context) => const LoginScreen(),
                    ),
                    (route) => false,
                  );
                },
                width: double.infinity,
                child: Text(
                  "Continue",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              AppSpacing.h48,
            ],
          ),
        ),
      ),
    );
  }
}
