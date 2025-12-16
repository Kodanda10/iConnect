/**
 * @file lib/features/history/presentation/bloc/history_state.dart
 * @description States for HistoryBloc
 * @changelog
 * - 2025-12-17: Initial implementation (TDD GREEN phase)
 */

import 'package:equatable/equatable.dart';
import '../../domain/entities/day_summary.dart';

abstract class HistoryState extends Equatable {
  const HistoryState();

  @override
  List<Object?> get props => [];
}

/// Initial state
class HistoryInitial extends HistoryState {}

/// Loading state
class HistoryLoading extends HistoryState {}

/// Loaded state with day summaries
class HistoryLoaded extends HistoryState {
  final List<DaySummary> daySummaries;
  final bool hasMore;
  final bool loadingMore;

  const HistoryLoaded({
    required this.daySummaries,
    this.hasMore = true,
    this.loadingMore = false,
  });

  @override
  List<Object?> get props => [daySummaries, hasMore, loadingMore];

  HistoryLoaded copyWith({
    List<DaySummary>? daySummaries,
    bool? hasMore,
    bool? loadingMore,
  }) {
    return HistoryLoaded(
      daySummaries: daySummaries ?? this.daySummaries,
      hasMore: hasMore ?? this.hasMore,
      loadingMore: loadingMore ?? this.loadingMore,
    );
  }
}

/// Error state
class HistoryError extends HistoryState {
  final String message;

  const HistoryError(this.message);

  @override
  List<Object?> get props => [message];
}
