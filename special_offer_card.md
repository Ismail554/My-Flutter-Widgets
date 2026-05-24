# Special Offer Card Widget

A reusable, stateless UI component for displaying promotional offers and discounts. This widget completely separates the presentation layer from the business logic, relying on the parent view to manage state and interactions.

## 🖼️ Visual Reference

![Special Offer Card Preview](assets/images/special_offer_card_preview.png)
*(Note: Ensure you have your placeholder or actual preview image saved at this path)*

## 💻 Implementation

### `special_offer_card.dart`

```dart
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

// Adjust these imports to match your project's architecture
import 'package:your_app/core/theme/app_colors.dart';
import 'package:your_app/core/theme/app_spacing.dart';
import 'package:your_app/core/theme/font_manager.dart';

class SpecialOfferCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final String discount;
  final String details;
  final List<Color> gradientColors;
  final bool isClaimed;
  final VoidCallback onClaimPressed;

  const SpecialOfferCard({
    super.key,
    required this.title,
    required this.subtitle,
    required this.discount,
    required this.details,
    required this.gradientColors,
    required this.isClaimed,
    required this.onClaimPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 290.w,
      margin: EdgeInsets.only(right: 16.w),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24.r),
        boxShadow: [
          BoxShadow(
            color: gradientColors.first.withOpacity(0.3),
            blurRadius: 15.r,
            offset: Offset(0, 8.h),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Background subtle design circles
          Positioned(
            right: -30.w,
            top: -30.h,
            child: Container(
              width: 120.w,
              height: 120.h,
              decoration: BoxDecoration(
                color: AppColors.white.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            left: -20.w,
            bottom: -20.h,
            child: Container(
              width: 80.w,
              height: 80.h,
              decoration: BoxDecoration(
                color: AppColors.white.withOpacity(0.05),
                shape: BoxShape.circle,
              ),
            ),
          ),
          
          // Card Content
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: EdgeInsets.symmetric(
                        horizontal: 10.w,
                        vertical: 4.h,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12.r),
                      ),
                      child: Text(
                        title,
                        style: FontManager.caption().copyWith(
                          color: AppColors.white,
                          fontSize: 10.sp,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    AppSpacing.h8,
                    Text(
                      subtitle,
                      style: FontManager.heading2().copyWith(
                        color: AppColors.white,
                        fontSize: 18.sp,
                      ),
                    ),
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text.rich(
                            TextSpan(
                              children: [
                                TextSpan(
                                  text: 'Up to ',
                                  style: FontManager.bodyText().copyWith(
                                    color: AppColors.white.withOpacity(0.7),
                                    fontSize: 11.sp,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                TextSpan(
                                  text: discount,
                                  style: FontManager.heading1().copyWith(
                                    color: AppColors.white,
                                    fontSize: 24.sp,
                                  ),
                                ),
                                TextSpan(
                                  text: ' OFF',
                                  style: FontManager.subtitle().copyWith(
                                    color: AppColors.white,
                                    fontSize: 13.sp,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          AppSpacing.h4,
                          Text(
                            details,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: FontManager.caption().copyWith(
                              color: AppColors.white.withOpacity(0.8),
                              fontSize: 8.sp,
                            ),
                          ),
                        ],
                      ),
                    ),
                    AppSpacing.w8,
                    ElevatedButton(
                      // Route the tap event back to the parent
                      onPressed: onClaimPressed,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isClaimed ? AppColors.success : AppColors.white,
                        foregroundColor: isClaimed ? AppColors.white : AppColors.black,
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                        padding: EdgeInsets.symmetric(
                          horizontal: 16.w,
                          vertical: 8.h,
                        ),
                      ),
                      child: Text(
                        isClaimed ? 'Claimed' : 'Claim',
                        style: FontManager.button().copyWith(
                          fontSize: 12.sp,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}