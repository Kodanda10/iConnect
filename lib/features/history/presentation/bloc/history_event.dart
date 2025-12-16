/**
 * @file lib/features/history/presentation/bloc/history_event.dart
 * @description Events for HistoryBloc
 * @changelog
 * - 2025-12-17: Initial implementation (TDD GREEN phase)
 */

import 'package:equatable/equatable.dart';

abstract class HistoryEvent extends Equatable {
  const HistoryEvent();

  @override
  List<Object?> get props => [];
}

/// Load history for the last N days
class LoadHistory extends HistoryEvent {
  final int days;

  const LoadHistory({this.days = 7});

  @override
  List<Object?> get props => [days];
}

/// Load more history (infinite scroll)
class LoadMoreHistory extends HistoryEvent {}

/// Refresh history
class RefreshHistory extends HistoryEvent {}
