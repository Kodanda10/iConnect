/**
 * @file lib/features/report/presentation/bloc/report_event.dart
 * @description Events for ReportBloc
 * @changelog
 * - 2025-12-17: Initial implementation (TDD GREEN phase)
 */

import 'package:equatable/equatable.dart';

abstract class ReportEvent extends Equatable {
  const ReportEvent();

  @override
  List<Object?> get props => [];
}

/// Load report for the last N days
class LoadReport extends ReportEvent {
  final int days;

  const LoadReport({this.days = 7});

  @override
  List<Object?> get props => [days];
}

/// Load more report (infinite scroll)
class LoadMoreReport extends ReportEvent {}

/// Refresh report
class RefreshReport extends ReportEvent {}
