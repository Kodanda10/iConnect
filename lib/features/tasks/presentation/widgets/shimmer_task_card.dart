/// Shimmer loading skeleton for task cards
/// 
/// Displays a placeholder skeleton while tasks are loading
/// using shimmer animation effect.
/// 
/// @changelog
/// - 2024-12-15: Initial implementation
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class ShimmerTaskCard extends StatelessWidget {
  const ShimmerTaskCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header row skeleton
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Icon placeholder
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Name placeholder
                      Container(
                        width: double.infinity,
                        height: 18,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                      const SizedBox(height: 8),
                      // Date placeholder
                      Container(
                        width: 100,
                        height: 12,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ],
                  ),
                ),
                // Ward badge placeholder
                Container(
                  width: 60,
                  height: 24,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            // Action buttons skeleton
            Row(
              children: [
                Expanded(child: _buildButtonSkeleton()),
                const SizedBox(width: 8),
                Expanded(child: _buildButtonSkeleton()),
                const SizedBox(width: 8),
                Expanded(child: _buildButtonSkeleton()),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildButtonSkeleton() {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
    );
  }
}

/// Widget that displays multiple shimmer cards as a loading skeleton list
class ShimmerTaskList extends StatelessWidget {
  final int itemCount;
  
  const ShimmerTaskList({super.key, this.itemCount = 3});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(24),
      itemCount: itemCount,
      separatorBuilder: (_, __) => const SizedBox(height: 16),
      itemBuilder: (_, __) => const ShimmerTaskCard(),
    );
  }
}
