import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:iconnect_mobile/features/report/domain/entities/action_log.dart';
import 'package:iconnect_mobile/features/report/presentation/widgets/action_timeline_card.dart';

void main() {
  group('ActionTimelineCard', () {
    final today = DateTime.now();
    
    testWidgets('renders empty state when no actions provided and initiallyExpanded is true', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ActionTimelineCard(
              actions: [],
              title: Text("Today's Tasks"),
              initiallyExpanded: true,
            ),
          ),
        ),
      );

      expect(find.text("No actions taken yet."), findsOneWidget);
      expect(find.text("Today's Tasks"), findsOneWidget);
    });

    testWidgets('renders list of tasks when actions are provided', (tester) async {
      final actions = [
        ActionLog(
          id: '1',
          constituentId: 'c1',
          constituentName: 'Ravi Kumar',
          actionType: ActionType.call,
          executedAt: DateTime(today.year, today.month, today.day, 10, 30),
          success: true,
          executedBy: 'leader',
          messagePreview: 'Called',
        ),
        ActionLog(
          id: '2',
          constituentId: 'c2',
          constituentName: 'Priya Singh',
          actionType: ActionType.sms,
          executedAt: DateTime(today.year, today.month, today.day, 10, 15),
          success: true,
          executedBy: 'leader',
          messagePreview: 'SMS Sent',
        ),
      ];

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ActionTimelineCard(
              actions: actions,
              title: const Text("Today's Tasks"),
              initiallyExpanded: true,
            ),
          ),
        ),
      );

      // Pump animation
      await tester.pumpAndSettle();

      // Assert
      expect(find.text("Today's Tasks"), findsOneWidget);
      expect(find.byType(ExpansionTile), findsOneWidget); 
      
      expect(find.text("Ravi Kumar"), findsOneWidget);
      expect(find.text("10:30 AM"), findsOneWidget); 
      expect(find.text("Called"), findsOneWidget);
      expect(find.text("Priya Singh"), findsOneWidget);

      expect(find.byIcon(Icons.call), findsOneWidget);
      expect(find.byIcon(Icons.message), findsOneWidget);
    });
  });
}
