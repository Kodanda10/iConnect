import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:iconnect_mobile/core/widgets/glass_pill.dart';

/// TDD Tests for GlassPill widget
/// 
/// @changelog
/// - 2025-12-26: Initial TDD tests for Apple-inspired glass pill FAB
void main() {
  group('GlassPill Widget', () {
    testWidgets('renders vertically with two icons', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlassPill(
              items: [
                GlassPillItem(icon: Icons.home, onTap: () {}),
                GlassPillItem(icon: Icons.calendar_today, onTap: () {}),
              ],
            ),
          ),
        ),
      );

      // Should find both icons
      expect(find.byIcon(Icons.home), findsOneWidget);
      expect(find.byIcon(Icons.calendar_today), findsOneWidget);

      // Should be vertical (Column layout)
      final column = find.byType(Column);
      expect(column, findsWidgets);
    });

    testWidgets('icons are tappable and trigger callbacks', (tester) async {
      var homeTapped = false;
      var calendarTapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlassPill(
              items: [
                GlassPillItem(icon: Icons.home, onTap: () => homeTapped = true),
                GlassPillItem(icon: Icons.calendar_today, onTap: () => calendarTapped = true),
              ],
            ),
          ),
        ),
      );

      // Tap home icon
      await tester.tap(find.byIcon(Icons.home));
      await tester.pump();
      expect(homeTapped, isTrue);

      // Tap calendar icon
      await tester.tap(find.byIcon(Icons.calendar_today));
      await tester.pump();
      expect(calendarTapped, isTrue);
    });

    testWidgets('applies glass styling with blur and border', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlassPill(
              items: [
                GlassPillItem(icon: Icons.home, onTap: () {}),
              ],
            ),
          ),
        ),
      );

      // Should have ClipRRect for rounded corners
      expect(find.byType(ClipRRect), findsWidgets);

      // Should have BackdropFilter for blur effect
      expect(find.byType(BackdropFilter), findsOneWidget);
    });
  });
}
