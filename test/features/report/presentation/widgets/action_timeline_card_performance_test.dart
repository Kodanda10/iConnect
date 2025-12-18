import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:iconnect_mobile/features/report/domain/entities/action_log.dart';
import 'package:iconnect_mobile/features/report/presentation/widgets/action_timeline_card.dart';

void main() {
  group('ActionTimelineCard Performance', () {
    final today = DateTime.now();
    
    // Helper to generate many actions
    List<ActionLog> generateActions(int count) {
      return List.generate(count, (index) {
        return ActionLog(
          id: 'action_$index',
          constituentId: 'const_$index',
          constituentName: 'Constituent $index',
          actionType: index % 3 == 0 
              ? ActionType.call 
              : (index % 3 == 1 ? ActionType.sms : ActionType.whatsapp),
          executedAt: today.subtract(Duration(minutes: index * 10)),
          success: true,
          executedBy: 'leader',
          messagePreview: 'Action $index completed',
        );
      });
    }

    testWidgets('Efficiently renders large list (50 items) with scrolling', (tester) async {
      final manyActions = generateActions(50);
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: ActionTimelineCard(
                actions: manyActions,
                title: const Text("Today's Tasks"),
                initiallyExpanded: true,
              ),
            ),
          ),
        ),
      );

      // Allow initial animations to settle
      await tester.pump(const Duration(milliseconds: 50));
      await tester.pump(const Duration(milliseconds: 50)); 
      
      // Verify initial rendering of top items
      expect(find.text('Constituent 0'), findsOneWidget);
      expect(find.text('Constituent 49'), findsNothing); // Should be off-screen

      // Fling scroll to bottom to test scrolling performance/errors
      await tester.fling(find.byType(ListView), const Offset(0, -2000), 2000);
      await tester.pumpAndSettle();

      // Verify bottom items reachable
      expect(find.text('Constituent 49'), findsOneWidget);
    });

    testWidgets('Animation logic handles rapid updates without crashing', (tester) async {
      // 1. Initial Load
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ActionTimelineCard(
              actions: generateActions(3),
              title: const Text("Today's Tasks"),
              initiallyExpanded: true,
            ),
          ),
        ),
      );
      await tester.pump(const Duration(milliseconds: 100)); // Start animation

      // 2. Rapid Update (Simulate realtime update while animating)
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ActionTimelineCard(
              actions: generateActions(5), // List grew
              title: const Text("Today's Tasks"),
              initiallyExpanded: true,
            ),
          ),
        ),
      );
      
      // Check that it didn't crash and controllers were disposed/recreated
      await tester.pumpAndSettle();
      expect(find.text('Constituent 4'), findsOneWidget);
    });
  });
}
