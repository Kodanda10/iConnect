import 'dart:ui';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Floating Action Button with green liquid glass splash effect
/// 
/// @changelog
/// - 2025-12-26: Created with dark theme
/// - 2025-12-26: Updated for white theme with green splash
class GlassFAB extends StatelessWidget {
  final VoidCallback? onPressed;
  final IconData icon;
  final double size;
  final Color? iconColor;

  const GlassFAB({
    super.key,
    this.onPressed,
    required this.icon,
    this.size = 56.0,
    this.iconColor,
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
              // White glass with green splash
              color: Colors.white,
              shape: BoxShape.circle,
              border: Border.all(
                color: AppColors.glassBorder,
                width: 1.0,
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.15),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
                BoxShadow(
                  color: Colors.black.withOpacity(0.06),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Icon(
              icon,
              color: iconColor ?? AppColors.primary, // Green icon
              size: 24,
            ),
          ),
        ),
      ),
    );
  }
}
