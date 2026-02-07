import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:orbital/core/app_colors.dart';

class CalendarStrip extends StatefulWidget {
  const CalendarStrip({super.key});

  @override
  State<CalendarStrip> createState() => _CalendarStripState();
}

class _CalendarStripState extends State<CalendarStrip> {
  DateTime _currentDate = DateTime(
    2026,
    1,
    6,
  ); // Mocking Jan 2026 as starting point
  final DateTime _selectedDate = DateTime(2026, 1, 6);

  void _changeMonth(int increment) {
    setState(() {
      _currentDate = DateTime(
        _currentDate.year,
        _currentDate.month + increment,
      );
    });
  }

  int _daysInMonth(DateTime date) {
    return DateTime(date.year, date.month + 1, 0).day;
  }

  @override
  Widget build(BuildContext context) {
    final int daysInMonth = _daysInMonth(_currentDate);
    final int firstWeekdayOfMonth = DateTime(
      _currentDate.year,
      _currentDate.month,
      1,
    ).weekday;

    // Adjust logic for Sunday start
    // standard DateTime.weekday: Mon=1 ... Sun=7.
    // We want Sun=0, Mon=1, ... Sat=6 for our grid which starts with S M T W T F S
    final int firstDayOffset = firstWeekdayOfMonth == 7
        ? 0
        : firstWeekdayOfMonth;

    final List<String> weekDays = ["S", "M", "T", "W", "T", "F", "S"];

    return Column(
      children: [
        // Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            IconButton(
              onPressed: () => _changeMonth(-1),
              icon: Icon(Icons.arrow_back_ios, size: 16.sp, color: Colors.grey),
            ),
            Text(
              _formatMonthYear(_currentDate),
              style: TextStyle(
                fontSize: 16.sp,
                fontWeight: FontWeight.w600,
                color: Colors.black,
              ),
            ),
            IconButton(
              onPressed: () => _changeMonth(1),
              icon: Icon(
                Icons.arrow_forward_ios,
                size: 16.sp,
                color: Colors.grey,
              ),
            ),
          ],
        ),
        SizedBox(height: 10.h),

        // Days Row
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: weekDays
              .map(
                (day) => Text(
                  day,
                  style: TextStyle(fontSize: 12.sp, color: Colors.grey),
                ),
              )
              .toList(),
        ),
        SizedBox(height: 10.h),

        // Grid
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: daysInMonth + firstDayOffset,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 7,
            childAspectRatio: 1.0,
          ),
          itemBuilder: (context, index) {
            if (index < firstDayOffset) {
              return const SizedBox();
            }

            final int day = index - firstDayOffset + 1;
            final bool isSelected =
                day == _selectedDate.day &&
                _currentDate.month == _selectedDate.month &&
                _currentDate.year == _selectedDate.year;

            // Mock dots logic (example: 6, 8, 10 have events) based on screenshot
            // Only showing dots for January 2026 to match design specifics, or generally every few days
            final bool hasDot =
                (_currentDate.month == 1 && _currentDate.year == 2026) &&
                (day == 6 || day == 8 || day == 10);

            return Center(
              child: Container(
                width: 36.r,
                height: 36.r,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.primaryColor.withOpacity(0.1)
                      : Colors.transparent,
                  shape: BoxShape.circle,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "$day",
                      style: TextStyle(
                        fontSize: 14.sp,
                        fontWeight: isSelected
                            ? FontWeight.bold
                            : FontWeight.normal,
                        color: isSelected
                            ? AppColors.primaryColor
                            : Colors.black,
                      ),
                    ),
                    if (hasDot)
                      Container(
                        margin: EdgeInsets.only(top: 2.h),
                        width: 4.r,
                        height: 4.r,
                        decoration: BoxDecoration(
                          color: AppColors.primaryColor,
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  String _formatMonthYear(DateTime date) {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return "${months[date.month - 1]} ${date.year}";
  }
}
