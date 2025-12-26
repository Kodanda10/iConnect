import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:iconnect_mobile/core/widgets/scroll_aware_fab.dart';
import 'package:iconnect_mobile/core/widgets/glass_pill.dart';

/// TDD Tests for ScrollAwareFab on Home Page
/// 
/// @changelog
/// - 2025-12-26: TDD test for Today page scroll-aware FAB
void main() {
  group('Home Page Scroll-Aware FAB', () {
    testWidgets('FAB is visible when not scrolling', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ScrollAwareFabWithListener(
              fabBuilder: (isScrolling) => GlassPill(
                items: [
                  GlassPillItem(icon: Icons.calendar_today, onTap: () {}),
                ],
              ),
              child: ListView.builder(
                itemCount: 20,
                itemBuilder: (_, i) => ListTile(title: Text('Task $i')),
              ),
            ),
          ),
        ),
      );
      
      await tester.pumpAndSettle();

      // FAB should be visible (opacity = 1)
      final opacity = tester.widget<AnimatedOpacity>(find.byType(AnimatedOpacity));
      expect(opacity.opacity, equals(1.0));
      expect(find.byIcon(Icons.calendar_today), findsOneWidget);
    });

    testWidgets('FAB hides during scroll', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ScrollAwareFabWithListener(
              fabBuilder: (isScrolling) => GlassPill(
                items: [
                  GlassPillItem(icon: Icons.calendar_today, onTap: () {}),
                ],
              ),
              child: ListView.builder(
                itemCount: 50,
                itemBuilder: (_, i) => ListTile(title: Text('Task $i')),
              ),
            ),
          ),
        ),
      );
      
      await tester.pumpAndSettle();

      // Scroll down
      await tester.drag(find.byType(ListView), const Offset(0, -200));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 100));

      // FAB should be hidden (opacity < 1)
      final opacity = tester.widget<AnimatedOpacity>(find.byType(AnimatedOpacity));
      expect(opacity.opacity, lessThan(1.0));
    });

    testWidgets('FAB reappears after idle (500ms)', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ScrollAwareFabWithListener(
              idleDelay: const Duration(milliseconds: 500),
              fabBuilder: (isScrolling) => GlassPill(
                items: [
                  GlassPillItem(icon: Icons.calendar_today, onTap: () {}),
                ],
              ),
              child: ListView.builder(
                itemCount: 50,
                itemBuilder: (_, i) => ListTile(title: Text('Task $i')),
              ),
            ),
          ),
        ),
      );
      
      await tester.pumpAndSettle();

      // Scroll and stop
      await tester.drag(find.byType(ListView), const Offset(0, -200));
      await tester.pump();

      // Wait for idle delay + animation
      await tester.pump(const Duration(milliseconds: 600));
      await tester.pumpAndSettle();

      // FAB should be visible again
      final opacity = tester.widget<AnimatedOpacity>(find.byType(AnimatedOpacity));
      expect(opacity.opacity, equals(1.0));
    });

    testWidgets('Calendar FAB tap callback works', (tester) async {
      var tapped = false;
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ScrollAwareFabWithListener(
              fabBuilder: (isScrolling) => GlassPill(
                items: [
                  GlassPillItem(
                    icon: Icons.calendar_today, 
                    onTap: () => tapped = true,
                  ),
                ],
              ),
              child: ListView.builder(
                itemCount: 10,
                itemBuilder: (_, i) => ListTile(title: Text('Task $i')),
              ),
            ),
          ),
        ),
      );
      
      await tester.pumpAndSettle();

      // Tap the calendar icon
      await tester.tap(find.byIcon(Icons.calendar_today));
      await tester.pump();

      expect(tapped, isTrue);
    });
  });
}
