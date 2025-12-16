/**
 * @file lib/features/report/domain/repositories/report_repository.dart
 * @description Abstract repository interface for report data
 * @changelog
 * - 2025-12-17: Initial implementation (TDD GREEN phase)
 */

import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/day_summary.dart';

/// Abstract repository for fetching action report
abstract class ReportRepository {
  /// Get report for the last N days, grouped by day
  Future<Either<Failure, List<DaySummary>>> getReportForDays(int days);

  /// Get report for a specific date range (for infinite scroll)
  Future<Either<Failure, List<DaySummary>>> getReportForDateRange(
    DateTime start,
    DateTime end,
  );

  /// Get summary statistics for today
  Future<Either<Failure, TodaySummaryStats>> getTodaySummary();
}

/// Stats for today's activity
class TodaySummaryStats {
  final int wishesSent;
  final int totalEvents;
  final int callsMade;
  final int smsCount;
  final int whatsappCount;

  const TodaySummaryStats({
    required this.wishesSent,
    required this.totalEvents,
    required this.callsMade,
    required this.smsCount,
    required this.whatsappCount,
  });
}
