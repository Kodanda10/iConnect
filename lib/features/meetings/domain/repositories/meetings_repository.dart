/**
 * @file lib/features/meetings/domain/repositories/meetings_repository.dart
 * @description Abstract repository interface for meetings data
 * @changelog
 * - 2025-12-17: Initial implementation (TDD GREEN phase)
 */

import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/scheduled_meeting.dart';

/// Abstract repository for fetching meeting data
abstract class MeetingsRepository {
  /// Get the currently active meeting (if any)
  Future<Either<Failure, ScheduledMeeting?>> getActiveMeeting();

  /// Get all upcoming meetings
  Future<Either<Failure, List<ScheduledMeeting>>> getUpcomingMeetings();

  /// Get meeting by ID
  Future<Either<Failure, ScheduledMeeting>> getMeetingById(String id);
}
