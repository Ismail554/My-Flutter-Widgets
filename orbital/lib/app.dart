import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:orbital/core/app_colors.dart';
import 'package:orbital/core/app_padding.dart';
import 'package:orbital/views/splash/splash_screen.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ScreenUtilInit(
      designSize: const Size(388, 843),
      builder: (context, child) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: "Orbital",
          theme: ThemeData(
            useMaterial3: true,
            appBarTheme: AppBarTheme(scrolledUnderElevation: 0),

            scaffoldBackgroundColor: AppColors.bgColor,
            //  Background for Cards, Sheets, and Dialogs
            colorScheme: ColorScheme.fromSeed(
              seedColor: AppColors.primaryColor,
              surface: AppColors.white, // Set surface to match your bgColor
            ),

            filledButtonTheme: FilledButtonThemeData(
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: AppColors.white,
                // padding: EdgeInsets.symmetric(vertical: 16.h),
                fixedSize: Size.fromHeight(48.h),
                shape: RoundedRectangleBorder(borderRadius: AppPadding.c12),
                elevation: 0,
              ),
            ),
            outlinedButtonTheme: OutlinedButtonThemeData(
              style: OutlinedButton.styleFrom(
                backgroundColor: AppColors.white,
                foregroundColor: AppColors.primaryColor,
                side: BorderSide(color: AppColors.primaryColor, width: 1.5),
                // padding: EdgeInsets.symmetric(vertical: 16.h),
                fixedSize: Size.fromHeight(52.h),
                shape: RoundedRectangleBorder(borderRadius: AppPadding.c12),
              ),
            ),
            primarySwatch: Colors.blue,
          ),
          home: child,
        );
      },
      child: const SplashScreen(),
    );
  }
}
