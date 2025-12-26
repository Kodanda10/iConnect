import 'dart:ui';
import 'package:flutter/material.dart';

/// A Floating Action Button with liquid glass styling
/// matching the app's NavBar and GlassContainer aesthetic.
/// 
/// @changelog
/// - 2025-12-26: Created for calendar time travel button
class GlassFAB extends StatelessWidget {
  final VoidCallback? onPressed;
  final IconData icon;
  final double size;
  final Color iconColor;

  const GlassFAB({
    super.key,
    this.onPressed,
    required this.icon,
    this.size = 56.0,
    this.iconColor = Colors.white,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(size / 2),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
          child: Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              // Smoked Glass: Matches GlassContainer
              color: Colors.black.withOpacity(0.4),
              shape: BoxShape.circle,
              border: Border.all(
                color: Colors.white.withOpacity(0.3),
                width: 1.0,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(
              icon,
              color: iconColor,
              size: 24,
            ),
          ),
        ),
      ),
    );
  }
}
