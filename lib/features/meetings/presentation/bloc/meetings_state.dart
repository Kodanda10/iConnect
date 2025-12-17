/**
 * @file lib/features/meetings/presentation/bloc/meetings_state.dart
 * @description States for MeetingsBloc
 * @changelog
 * - 2025-12-17: Initial implementation (TDD GREEN phase)
 */

import 'package:equatable/equatable.dart';
import '../../domain/entities/scheduled_meeting.dart';

abstract class MeetingsState extends Equatable {
  const MeetingsState();

  @override
  List<Object?> get props => [];
}

/// Initial state
class MeetingsInitial extends MeetingsState {}

/// Loading state
class MeetingsLoading extends MeetingsState {}

/// Loaded state with optional active meeting
class MeetingsLoaded extends MeetingsState {
  final ScheduledMeeting? activeMeeting;
  final List<ScheduledMeeting> upcomingMeetings;

  const MeetingsLoaded({this.activeMeeting, this.upcomingMeetings = const []});

  @override
  List<Object?> get props => [activeMeeting, upcomingMeetings];

  /// Whether there is an active meeting
  bool get hasMeeting => activeMeeting != null;
}

/// Error state
class MeetingsError extends MeetingsState {
  final String message;

  const MeetingsError(this.message);

  @override
  List<Object?> get props => [message];
}
