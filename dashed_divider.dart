import 'package:flutter/material.dart';

// 1. 📦 Amader Independent Lego Box (Widget)
class DashedDivider extends StatelessWidget {
  final Color color;
  final double height;

  const DashedDivider({
    super.key,
    this.color = Colors.grey, // Tumi chaile tomar AppColors.inputBorder use korte paro
    this.height = 1.0,
  });

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _DashedLinePainter(color: color),
      child: SizedBox(height: height, width: double.infinity),
    );
  }
}

// 2. 🎨 Amader Painter (Je canvas-e ashole aake)
class _DashedLinePainter extends CustomPainter {
  final Color color;
  
  _DashedLinePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1;

    const dashWidth = 6.0;
    const dashSpace = 4.0;

    double startX = 0;
    while (startX < size.width) {
      canvas.drawLine(Offset(startX, 0), Offset(startX + dashWidth, 0), paint);
      startX += dashWidth + dashSpace;
    }
  }

  @override
  bool shouldRepaint(covariant _DashedLinePainter oldDelegate) {
    // Eita false er bodole color check kora smart, tahole theme change holeo kaj korbe!
    return oldDelegate.color != color; 
  }
}