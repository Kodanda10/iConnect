import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:iconnect_mobile/core/widgets/scroll_aware_fab.dart';
import 'package:iconnect_mobile/core/widgets/glass_pill.dart';

/// TDD Tests for ScrollAwareFab widget
/// 
/// @changelog
/// - 2025-12-26: Initial TDD tests for scroll-aware auto-hide animation
void main() {
  group('ScrollAwareFab Widget', () {
    testWidgets('is visible by default', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ScrollAwareFab(
              child: GlassPill(
                items: [
                  GlassPillItem(icon: Icons.home, onTap: () {}),
                ],
              ),
            ),
          ),
        ),
      );

      // Should be visible
      final opacity = tester.widget<AnimatedOpacity>(find.byType(AnimatedOpacity));
      expect(opacity.opacity, equals(1.0));
    });

    testWidgets('hides when scroll notification received', (tester) async {
      final scrollController = ScrollController();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Stack(
              children: [
                ScrollAwareFab(
                  scrollController: scrollController,
                  child: GlassPill(
                    items: [
                      GlassPillItem(icon: Icons.home, onTap: () {}),
                    ],
                  ),
                ),
                ListView.builder(
                  controller: scrollController,
                  itemCount: 50,
                  itemBuilder: (_, i) => ListTile(title: Text('Item $i')),
                ),
              ],
            ),
          ),
        ),
      );

      // Start scrolling
      scrollController.jumpTo(100);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      // FAB should start hiding (opacity < 1)
      final opacity = tester.widget<AnimatedOpacity>(find.byType(AnimatedOpacity));
      expect(opacity.opacity, lessThan(1.0));
    });

    testWidgets('shows after scroll idle for 500ms', (tester) async {
      final scrollController = ScrollController();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Stack(
              children: [
                ScrollAwareFab(
                  scrollController: scrollController,
                  idleDelay: const Duration(milliseconds: 500),
                  child: GlassPill(
                    items: [
                      GlassPillItem(icon: Icons.home, onTap: () {}),
                    ],
                  ),
                ),
                ListView.builder(
                  controller: scrollController,
                  itemCount: 50,
                  itemBuilder: (_, i) => ListTile(title: Text('Item $i')),
                ),
              ],
            ),
          ),
        ),
      );

      // Scroll and then stop
      scrollController.jumpTo(100);
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 200));

      // Wait for idle delay
      await tester.pump(const Duration(milliseconds: 600));
      await tester.pumpAndSettle();

      // FAB should be visible again
      final opacity = tester.widget<AnimatedOpacity>(find.byType(AnimatedOpacity));
      expect(opacity.opacity, equals(1.0));
    });
  });
}
