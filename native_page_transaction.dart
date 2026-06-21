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