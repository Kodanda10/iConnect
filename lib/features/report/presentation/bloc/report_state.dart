/**
 * @file lib/features/report/presentation/bloc/report_state.dart
 * @description States for ReportBloc
 * @changelog
 * - 2025-12-17: Initial implementation (TDD GREEN phase)
 */

import 'package:equatable/equatable.dart';
import '../../domain/entities/day_summary.dart';

abstract class ReportState extends Equatable {
  const ReportState();

  @override
  List<Object?> get props => [];
}

/// Initial state
class ReportInitial extends ReportState {}

/// Loading state
class ReportLoading extends ReportState {}

/// Loaded state with day summaries
class ReportLoaded extends ReportState {
  final List<DaySummary> daySummaries;
  final bool hasMore;
  final bool loadingMore;

  const ReportLoaded({
    required this.daySummaries,
    this.hasMore = true,
    this.loadingMore = false,
  });

  @override
  List<Object?> get props => [daySummaries, hasMore, loadingMore];

  ReportLoaded copyWith({
    List<DaySummary>? daySummaries,
    bool? hasMore,
    bool? loadingMore,
  }) {
    return ReportLoaded(
      daySummaries: daySummaries ?? this.daySummaries,
      hasMore: hasMore ?? this.hasMore,
      loadingMore: loadingMore ?? this.loadingMore,
    );
  }
}

/// Error state
class ReportError extends ReportState {
  final String message;

  const ReportError(this.message);

  @override
  List<Object?> get props => [message];
}
