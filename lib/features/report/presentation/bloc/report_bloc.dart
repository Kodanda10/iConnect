/**
 * @file lib/features/report/presentation/bloc/report_bloc.dart
 * @description BLoC for managing report state
 * @changelog
 * - 2025-12-17: Initial implementation (TDD GREEN phase)
 */

import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/repositories/report_repository.dart';
import 'report_event.dart';
import 'report_state.dart';

class ReportBloc extends Bloc<ReportEvent, ReportState> {
  final ReportRepository _repository;
  int _currentDaysLoaded = 0;

  ReportBloc({required ReportRepository repository})
    : _repository = repository,
      super(ReportInitial()) {
    on<LoadReport>(_onLoadReport);
    on<LoadMoreReport>(_onLoadMoreReport);
    on<RefreshReport>(_onRefreshReport);
  }

  Future<void> _onLoadReport(
    LoadReport event,
    Emitter<ReportState> emit,
  ) async {
    emit(ReportLoading());

    final result = await _repository.getReportForDays(event.days);

    result.fold((failure) => emit(ReportError(failure.message)), (summaries) {
      _currentDaysLoaded = event.days;
      emit(
        ReportLoaded(daySummaries: summaries, hasMore: summaries.isNotEmpty),
      );
    });
  }

  Future<void> _onLoadMoreReport(
    LoadMoreReport event,
    Emitter<ReportState> emit,
  ) async {
    final currentState = state;
    if (currentState is! ReportLoaded || currentState.loadingMore) return;

    emit(currentState.copyWith(loadingMore: true));

    // Calculate next date range (7 more days before oldest loaded)
    final oldestDate = currentState.daySummaries.isNotEmpty
        ? currentState.daySummaries.last.date
        : DateTime.now();

    final endDate = oldestDate.subtract(const Duration(days: 1));
    final startDate = endDate.subtract(const Duration(days: 7));

    final result = await _repository.getReportForDateRange(startDate, endDate);

    result.fold(
      (failure) =>
          emit(currentState.copyWith(loadingMore: false, hasMore: false)),
      (newSummaries) {
        _currentDaysLoaded += 7;
        emit(
          ReportLoaded(
            daySummaries: [...currentState.daySummaries, ...newSummaries],
            hasMore: newSummaries.isNotEmpty,
            loadingMore: false,
          ),
        );
      },
    );
  }

  Future<void> _onRefreshReport(
    RefreshReport event,
    Emitter<ReportState> emit,
  ) async {
    add(const LoadReport(days: 7));
  }
}
