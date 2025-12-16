/**
 * @file lib/features/history/presentation/bloc/history_bloc.dart
 * @description BLoC for managing history state
 * @changelog
 * - 2025-12-17: Initial implementation (TDD GREEN phase)
 */

import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/repositories/history_repository.dart';
import 'history_event.dart';
import 'history_state.dart';

class HistoryBloc extends Bloc<HistoryEvent, HistoryState> {
  final HistoryRepository _repository;
  int _currentDaysLoaded = 0;

  HistoryBloc({required HistoryRepository repository})
      : _repository = repository,
        super(HistoryInitial()) {
    on<LoadHistory>(_onLoadHistory);
    on<LoadMoreHistory>(_onLoadMoreHistory);
    on<RefreshHistory>(_onRefreshHistory);
  }

  Future<void> _onLoadHistory(
    LoadHistory event,
    Emitter<HistoryState> emit,
  ) async {
    emit(HistoryLoading());

    final result = await _repository.getHistoryForDays(event.days);

    result.fold(
      (failure) => emit(HistoryError(failure.message)),
      (summaries) {
        _currentDaysLoaded = event.days;
        emit(HistoryLoaded(
          daySummaries: summaries,
          hasMore: summaries.isNotEmpty,
        ));
      },
    );
  }

  Future<void> _onLoadMoreHistory(
    LoadMoreHistory event,
    Emitter<HistoryState> emit,
  ) async {
    final currentState = state;
    if (currentState is! HistoryLoaded || currentState.loadingMore) return;

    emit(currentState.copyWith(loadingMore: true));

    // Calculate next date range (7 more days before oldest loaded)
    final oldestDate = currentState.daySummaries.isNotEmpty
        ? currentState.daySummaries.last.date
        : DateTime.now();

    final endDate = oldestDate.subtract(const Duration(days: 1));
    final startDate = endDate.subtract(const Duration(days: 7));

    final result = await _repository.getHistoryForDateRange(startDate, endDate);

    result.fold(
      (failure) =>
          emit(currentState.copyWith(loadingMore: false, hasMore: false)),
      (newSummaries) {
        _currentDaysLoaded += 7;
        emit(HistoryLoaded(
          daySummaries: [...currentState.daySummaries, ...newSummaries],
          hasMore: newSummaries.isNotEmpty,
          loadingMore: false,
        ));
      },
    );
  }

  Future<void> _onRefreshHistory(
    RefreshHistory event,
    Emitter<HistoryState> emit,
  ) async {
    add(const LoadHistory(days: 7));
  }
}
