import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/app_theme.dart';

/// Glass pill with green liquid glass splash effect
/// 
/// Vertical layout with green translucent styling.
/// 
/// @changelog
/// - 2025-12-26: Created with dark theme
/// - 2025-12-26: Updated for white theme with green splash
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
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
        child: Container(
          decoration: BoxDecoration(
            // White glass with green splash
            color: Colors.white,
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(
              color: AppColors.glassBorder,
              width: 1.0,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.12),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
              BoxShadow(
                color: Colors.black.withOpacity(0.06),
                blurRadius: 8,
                offset: const Offset(0, 2),
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
        splashColor: AppColors.primary.withOpacity(0.15),
        highlightColor: AppColors.primary.withOpacity(0.08),
        child: Padding(
          padding: EdgeInsets.all(itemPadding),
          child: Icon(
            item.icon,
            size: iconSize,
            color: AppColors.primary, // Green icon
          ),
        ),
      ),
    );
  }

  Widget _buildDivider() {
    return Container(
      width: iconSize + 8,
      height: 1,
      color: AppColors.glassBorder,
    );
  }
}
