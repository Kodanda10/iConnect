/**
 * @file lib/features/meetings/presentation/bloc/meetings_event.dart
 * @description Events for MeetingsBloc
 * @changelog
 * - 2025-12-17: Initial implementation (TDD GREEN phase)
 */

import 'package:equatable/equatable.dart';

abstract class MeetingsEvent extends Equatable {
  const MeetingsEvent();

  @override
  List<Object?> get props => [];
}

/// Load the currently active meeting
class LoadActiveMeeting extends MeetingsEvent {}

/// Refresh meeting data
class RefreshMeeting extends MeetingsEvent {}
