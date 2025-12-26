import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// App background - Clean white with subtle green glow accents
/// 
/// @changelog
/// - 2024-12-18: Original dark gradient background
/// - 2025-12-26: Refactored to white theme with subtle green accents
class AppBackground extends StatelessWidget {
  final Widget child;

  const AppBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: Stack(
        children: [
          // Layer 1: Base White/Off-white gradient
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0xFFFFFFFF), // Pure white (top)
                  Color(0xFFF9FAFB), // Gray 50 (bottom)
                ],
              ),
            ),
          ),

          // Layer 2: Subtle green glow at top (very subtle)
          Positioned(
            top: -50,
            left: 0,
            right: 0,
            height: 300,
            child: Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.topCenter,
                  radius: 1.2,
                  colors: [
                    AppColors.primary.withOpacity(0.04), // Green 4%
                    Colors.transparent,
                  ],
                  stops: const [0.0, 1.0],
                ),
              ),
            ),
          ),

          // Layer 3: Content
          SafeArea(child: child),
        ],
      ),
    );
  }
}
