import 'dart:ui'; // Required for ImageFilter
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AnimatedBar extends StatefulWidget {
  const AnimatedBar({super.key});

  @override
  State<AnimatedBar> createState() => _AnimatedBarState();
}

class _AnimatedBarState extends State<AnimatedBar>
    with TickerProviderStateMixin {
  int selectedIndex = -1;

  late List<AnimationController> controllers;
  late List<Animation<double>> popAnimations;

  final List<AnimatedFeature> features = [
    AnimatedFeature(
      image: "assets/portal.png",
      title: 'Portal',
      subtitle: 'A new way for creative freelancers to sell services',
      buttonText: 'Get Started',
      popupElements: [
        PopupElement(
          offset: const Offset(-0.3, -0.8),
          rotation: -10,
          color: Colors.blue.withValues(alpha: 0.5),
        ),
        PopupElement(
          offset: const Offset(0.3, -0.9),
          rotation: 10,
          color: Colors.green,
        ),
      ],
    ),
    AnimatedFeature(
      image: "assets/dropable.png",
      title: 'Droppable',
      subtitle: 'Native app builder for freelancers',
      buttonText: 'View Details',
      popupElements: [
        PopupElement(
          offset: const Offset(0.4, -0.8),
          rotation: 12,
          color: Colors.orange,
          height: 90,
          width: 80,
        ),
        PopupElement(
          offset: const Offset(-0.4, -0.6),
          rotation: -15,
          color: Colors.purple.withValues(alpha: 0.4),
        ),
        PopupElement(
          offset: const Offset(-0.6, -4.0),
          rotation: -15,
          height: 30,width: 30,
          color: Colors.brown.withValues(alpha: 0.8),
        ),
      ],
    ),
    AnimatedFeature(
      image: "assets/stack.png",
      title: 'App Stacks',
      subtitle: 'Directory of best designed apps',
      buttonText: 'View Details',
      popupElements: [
        PopupElement(
          offset: const Offset(-0.5, -0.7),
          rotation: -20,
          color: Colors.red.withValues(alpha: 0.6),
        ),
        PopupElement(
          offset: const Offset(0.0, -1.0),
          rotation: 0,
          color: Colors.white.withValues(alpha: 0.8),
          height: 60,
          width: 90,
        ),
        PopupElement(
          offset: const Offset(0.5, -0.7),
          rotation: 20,
          color: Colors.blue,
        ),
      ],
    ),
    AnimatedFeature(
      image: "assets/me_transparent.png",
      title: 'Design',
      subtitle: 'A Senior Flutter Developer',
      buttonText: 'Hire Me',
      popupElements: [
        PopupElement(
          offset: const Offset(-0.4, -1),
          rotation: -6,
          color: Colors.transparent,
          height: 80,
          width: 120,
          boxShadow: null,
          child: Image.asset("assets/view-4-1.png"),
        ),
        PopupElement(
          offset: const Offset(0.4, -0.8),
          rotation: 8,
          color: Colors.transparent,
          height: 100,
          width: 70,
          boxShadow: null,
          child: Image.asset("assets/view-4-2.png"),
        ),
         PopupElement(
          offset: const Offset(-0.8, -1.2),
          rotation: 2,
          color: Colors.transparent,
          height: 30,
          width: 30,
          boxShadow: null,
          child: Image.asset("assets/view-4-3.png"),
        ),
      ],
    ),
  ];

  @override
  void initState() {
    super.initState();

    controllers = List.generate(
      features.length,
      (index) => AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 800),
      ),
    );

    popAnimations = controllers.map((c) {
      return CurvedAnimation(
        parent: c,
        curve: Curves.elasticOut,
        reverseCurve: Curves.elasticIn,
      );
    }).toList();

  }

  @override
  void dispose() {
    for (final c in controllers) {
      c.dispose();
    }
    super.dispose();
  }

  void _onTap(int index) {
    setState(() {
      if (index == selectedIndex) {
        controllers[selectedIndex].reverse();
        selectedIndex = -1;
      } else {
        if (selectedIndex != -1) {
          controllers[selectedIndex].reverse();
        }
        controllers[index].forward();
        selectedIndex = index;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: List.generate(features.length, (index) {
              final isSelected = selectedIndex == index;

              return Expanded(
                child: GestureDetector(
                  onTap: () => _onTap(index),
                  behavior: HitTestBehavior.opaque,
                  child: AnimatedBuilder(
                    animation: controllers[index],
                    builder: (context, child) {
                      return ImageFiltered(
                        imageFilter: ImageFilter.blur(
                          sigmaX: (selectedIndex == -1 || isSelected) ? 0 : 2,
                          sigmaY: (selectedIndex == -1 || isSelected) ? 0 : 2,
                        ),
                        child: AnimatedOpacity(
                          duration: const Duration(milliseconds: 300),
                          opacity: (selectedIndex == -1 || isSelected)
                              ? 1.0
                              : 0.5,
                          child: child,
                        ),
                      );
                    },
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [                        Stack(
                          alignment: Alignment.center,
                          clipBehavior: Clip.none,
                          children: [
                            // 1. DYNAMIC ELEMENTS
                            ...features[index].popupElements.map((element) {
                              return SlideTransition(
                                position: Tween<Offset>(
                                  begin: Offset.zero,
                                  end: element.offset,
                                ).animate(popAnimations[index]),
                                child: ScaleTransition(
                                  scale: popAnimations[index],
                                  child: RotationTransition(
                                    turns: AlwaysStoppedAnimation(
                                      element.rotation / 360,
                                    ),
                                    child: Container(
                                      height: element.height,
                                      width: element.width,
                                      decoration: BoxDecoration(
                                        color: element.color,
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child:
                                          element.child ??
                                          const SizedBox.shrink(),
                                    ),
                                  ),
                                ),
                              );
                            }),
                            // 2. ICON (On top)
                            ScaleTransition(
                              scale: Tween<double>(
                                begin: 1.0,
                                end: 1.6,
                              ).animate(popAnimations[index]),
                              child: Image.asset(
                                features[index].image,
                                height: 40,
                                width: 40,
                              ),
                            ),
                          ],
                        ),

                        // MIDDLE CONTENT (The Popup)
                        SizeTransition(
                          sizeFactor: popAnimations[index],
                          axisAlignment: -1.0,
                          child: Padding(
                            padding: const EdgeInsets.only(
                              top: 12.0,
                              bottom: 8.0,
                            ),
                            child: Column(
                              children: [
                                Text(
                                  features[index].title,
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.rasa(
                                    fontSize: 19,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.black87,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  features[index].subtitle,
                                  textAlign: TextAlign.center,
                                  style: GoogleFonts.raleway(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w500,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // BOTTOM BUTTON / TITLE
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(20),
                            color: Colors.grey[200],
                          ),
                          child: AnimatedSwitcher(
                            duration: const Duration(milliseconds: 200),
                            transitionBuilder: (child, animation) =>
                                ScaleTransition(scale: animation, child: child),
                            child: Text(
                              isSelected
                                  ? features[index].buttonText
                                  : features[index].title,
                              key: ValueKey<String>(
                                isSelected
                                    ? features[index].buttonText
                                    : features[index].title,
                              ),
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.black54,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

class AnimatedFeature {
  final String image;
  final String title;
  final String subtitle;
  final String buttonText;
  final List<PopupElement> popupElements;

  AnimatedFeature({
    required this.image,
    required this.title,
    required this.subtitle,
    required this.buttonText,
    required this.popupElements,
  });
}

class PopupElement {
  final Offset offset;
  final double rotation;
  final Color color;
  final double height;
  final double width;
  final Widget? child;
  final BoxShadow? boxShadow;

  PopupElement({
    required this.offset,
    required this.rotation,
    required this.color,
    this.height = 80,
    this.width = 70,
    this.child,
    this.boxShadow = const BoxShadow(
      color: Colors.black,
      blurRadius: 8,
      offset: Offset(0, 4),
    ),
  });
}