/**
 * @file lib/features/report/domain/entities/day_summary.dart
 * @description Day summary entity grouping actions by date
 * @changelog
 * - 2025-12-17: Initial implementation (TDD GREEN phase)
 */

import 'package:equatable/equatable.dart';
import 'action_log.dart';

/// Entity representing a summary of actions for a single day
class DaySummary extends Equatable {
  final DateTime date;
  final List<ActionLog> actions;

  const DaySummary({
    required this.date,
    required this.actions,
  });

  /// Number of successful actions
  int get successCount => actions.where((a) => a.success).length;

  /// Total number of actions
  int get totalCount => actions.length;

  /// Number of failed actions
  int get failedCount => actions.where((a) => !a.success).length;

  /// Success rate as percentage (0-100)
  double get successRate =>
      totalCount > 0 ? (successCount / totalCount) * 100 : 0;

  @override
  List<Object?> get props => [date, actions];
}
