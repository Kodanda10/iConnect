import 'dart:ui';

import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class GlassCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final BorderRadius borderRadius;
  final double blurSigma;
  final double surfaceOpacity;
  final Gradient? surfaceGradient;
  final Border? border;
  final List<BoxShadow>? boxShadow;
  final Gradient? overlayGradient;

  const GlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(20),
    this.borderRadius = const BorderRadius.all(Radius.circular(AppRadius.xl)),
    this.blurSigma = 12,
    this.surfaceOpacity = 0.12,
    this.surfaceGradient,
    this.border,
    this.boxShadow,
    this.overlayGradient,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveBorder =
        border ?? Border.all(color: Colors.white.withOpacity(0.25), width: 1);
    final effectiveShadow =
        boxShadow ??
        [
          BoxShadow(
            color: Colors.black.withOpacity(0.12),
            blurRadius: 32,
            offset: const Offset(0, 8),
          ),
        ];

    final content = DecoratedBox(
      decoration: BoxDecoration(
        color: surfaceGradient == null
            ? Colors.white.withOpacity(surfaceOpacity)
            : null,
        gradient: surfaceGradient,
        borderRadius: borderRadius,
        border: effectiveBorder,
        boxShadow: effectiveShadow,
      ),
      child: Stack(
        children: [
          if (overlayGradient != null)
            Positioned.fill(
              child: IgnorePointer(
                child: DecoratedBox(
                  decoration: BoxDecoration(gradient: overlayGradient),
                ),
              ),
            ),
          Padding(padding: padding, child: child),
        ],
      ),
    );

    if (blurSigma <= 0) {
      return ClipRRect(borderRadius: borderRadius, child: content);
    }

    return ClipRRect(
      borderRadius: borderRadius,
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blurSigma, sigmaY: blurSigma),
        child: content,
      ),
    );
  }
}
