import 'package:flutter/material.dart';
import 'dart:ui';
import '../theme/app_theme.dart';

/// App background - Clean white with animated aurora green splashes
/// 
/// @changelog
/// - 2024-12-18: Original dark gradient background
/// - 2025-12-26: Refactored to white theme with subtle green accents
/// - 2025-12-26: Implemented "Green Aurora" animated background with drifting orbs.
class AppBackground extends StatefulWidget {
  final Widget child;

  const AppBackground({super.key, required this.child});

  @override
  State<AppBackground> createState() => _AppBackgroundState();
}

class _AppBackgroundState extends State<AppBackground> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: Stack(
        children: [
          // Layer 1: Base White Gradient
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Color(0xFFFFFFFF), // Pure white
                  Color(0xFFF9FAFB), // Gray 50
                ],
              ),
            ),
          ),

          // Layer 2: Animated Aurora Orbs
          AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              final t = _controller.value;
              return Stack(
                children: [
                  // Orb 1: Top Left (Teal) - Drifting
                  Positioned(
                    top: -100 + (20 * t),
                    left: -100 + (30 * t),
                    child: _AuroraOrb(
                      color: AppColors.secondary.withOpacity(0.15),
                      radius: 400,
                      blur: 80,
                    ),
                  ),

                  // Orb 2: Top Right (Emerald) - Breathing
                  Positioned(
                    top: -50 + (40 * t),
                    right: -100 - (20 * t),
                    child: _AuroraOrb(
                      color: AppColors.primary.withOpacity(0.12),
                      radius: 350 + (50 * t),
                      blur: 90,
                    ),
                  ),

                  // Orb 3: Center/Bottom Right (Mint) - Floating
                  Positioned(
                    bottom: 200 + (50 * (1 - t)),
                    right: -50 - (30 * t),
                    child: _AuroraOrb(
                      color: const Color(0xFF6EE7B7).withOpacity(0.10), // Mint
                      radius: 300,
                      blur: 100,
                    ),
                  ),
                  
                  // Orb 4: Bottom Left (Light Emerald)
                  Positioned(
                    bottom: -100,
                    left: -50 + (40 * t),
                    child: _AuroraOrb(
                      color: AppColors.primaryLight.withOpacity(0.08),
                      radius: 400,
                      blur: 100,
                    ),
                  ),
                ],
              );
            },
          ),
          
          // Layer 3: Glass Diffusion (Optional, subtle blur over orbs)
          // BackdropFilter(
          //   filter: ImageFilter.blur(sigmaX: 30, sigmaY: 30),
          //   child: Container(color: Colors.transparent),
          // ),

          // Layer 4: Content
          SafeArea(child: widget.child),
        ],
      ),
    );
  }
}

class _AuroraOrb extends StatelessWidget {
  final Color color;
  final double radius;
  final double blur;

  const _AuroraOrb({
    super.key,
    required this.color,
    required this.radius,
    required this.blur,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: radius,
      height: radius,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
        boxShadow: [
          BoxShadow(
            color: color,
            blurRadius: blur,
            spreadRadius: blur / 2,
          ),
        ],
      ),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur / 2, sigmaY: blur / 2),
        child: Container(color: Colors.transparent),
      ),
    );
  }
}
