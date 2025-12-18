import 'package:flutter/material.dart';

class AppBackground extends StatelessWidget {
  final Widget child;

  const AppBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          // Layer 1: Base Linear Gradient (Deep Veridian Theme)
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF022C22), // Deep Veridian (Top-Left)
                  Color(0xFF2A2D4E), // Dark Slate/Purple hint (Bottom-Right match web)
                ],
              ),
            ),
          ),

          // Layer 2: Overlay 1 - Top Center Emerald Glow (Radial)
          Positioned(
            top: -100,
            left: 0,
            right: 0,
            height: 600,
            child: Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.topCenter,
                  radius: 0.8,
                  colors: [
                    const Color(0xFF008F7A).withOpacity(0.12), // Emerald at 12%
                    Colors.transparent,
                  ],
                  stops: const [0.0, 1.0],
                ),
              ),
            ),
          ),

          // Layer 3: Overlay 2 - Bottom Right Amethyst Glow (Radial)
          Positioned(
            bottom: -150,
            right: -150,
            width: 500,
            height: 500,
            child: Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.center,
                  radius: 0.7,
                  colors: [
                    const Color(0xFF5E548E).withOpacity(0.18), // Amethyst at 18%
                    Colors.transparent,
                  ],
                  stops: const [0.0, 1.0],
                ),
              ),
            ),
          ),

          // Layer 4: Content
          SafeArea(child: child),
        ],
      ),
    );
  }
}
