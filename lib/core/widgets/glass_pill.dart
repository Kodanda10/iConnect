import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// A single item in a GlassPill
class GlassPillItem {
  final IconData icon;
  final VoidCallback onTap;
  final String? tooltip;

  const GlassPillItem({
    required this.icon,
    required this.onTap,
    this.tooltip,
  });
}

/// Apple-inspired vertical glass pill with multiple icon buttons
/// 
/// A sleek, translucent pill-shaped container with vertically stacked
/// icon buttons. Uses liquid glass styling matching the app's theme.
/// 
/// @changelog
/// - 2025-12-26: Initial implementation for scroll-aware FAB
class GlassPill extends StatelessWidget {
  final List<GlassPillItem> items;
  final double iconSize;
  final double itemPadding;
  final double borderRadius;

  const GlassPill({
    super.key,
    required this.items,
    this.iconSize = 24.0,
    this.itemPadding = 14.0,
    this.borderRadius = 28.0,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
        child: Container(
          decoration: BoxDecoration(
            // Smoked glass - darker for better contrast
            color: Colors.black.withOpacity(0.5),
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(
              color: Colors.white.withOpacity(0.25),
              width: 1.0,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.3),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: items.asMap().entries.map((entry) {
              final index = entry.key;
              final item = entry.value;
              final isLast = index == items.length - 1;

              return Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildIconButton(item),
                  if (!isLast) _buildDivider(),
                ],
              );
            }).toList(),
          ),
        ),
      ),
    );
  }

  Widget _buildIconButton(GlassPillItem item) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          HapticFeedback.lightImpact();
          item.onTap();
        },
        borderRadius: BorderRadius.circular(borderRadius),
        splashColor: Colors.white.withOpacity(0.1),
        highlightColor: Colors.white.withOpacity(0.05),
        child: Padding(
          padding: EdgeInsets.all(itemPadding),
          child: Icon(
            item.icon,
            size: iconSize,
            color: Colors.white.withOpacity(0.9),
          ),
        ),
      ),
    );
  }

  Widget _buildDivider() {
    return Container(
      width: iconSize + 8,
      height: 1,
      color: Colors.white.withOpacity(0.15),
    );
  }
}
