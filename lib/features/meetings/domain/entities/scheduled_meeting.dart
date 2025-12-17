/**
 * @file lib/features/meetings/domain/entities/scheduled_meeting.dart
 * @description Scheduled meeting entity for conference calls
 * @changelog
 * - 2025-12-17: Initial implementation (TDD GREEN phase)
 */

import 'package:equatable/equatable.dart';

/// Target group for meeting notifications
enum TargetGroup { assembly, block, gp }

/// Entity representing a scheduled conference call meeting
class ScheduledMeeting extends Equatable {
  final String id;
  final String title;
  final DateTime scheduledTime;
  final String dialInNumber;
  final String accessCode;
  final TargetGroup targetGroup;
  final String targetId;
  final String? description;
  final List<String> notifiedConstituents;

  const ScheduledMeeting({
    required this.id,
    required this.title,
    required this.scheduledTime,
    required this.dialInNumber,
    required this.accessCode,
    required this.targetGroup,
    required this.targetId,
    this.description,
    this.notifiedConstituents = const [],
  });

  /// Whether the meeting is upcoming (scheduled time is in the future)
  bool get isUpcoming => scheduledTime.isAfter(DateTime.now());

  /// Whether the meeting is currently active (within 30 min window)
  bool get isActive {
    final now = DateTime.now();
    final startWindow = scheduledTime.subtract(const Duration(minutes: 10));
    final endWindow = scheduledTime.add(const Duration(hours: 2));
    return now.isAfter(startWindow) && now.isBefore(endWindow);
  }

  /// Time until meeting starts (negative if already started)
  Duration get timeUntilStart => scheduledTime.difference(DateTime.now());

  @override
  List<Object?> get props => [
    id,
    title,
    scheduledTime,
    dialInNumber,
    accessCode,
    targetGroup,
    targetId,
    description,
    notifiedConstituents,
  ];

  /// Convert target group string from Firestore to enum
  static TargetGroup targetGroupFromString(String group) {
    switch (group.toUpperCase()) {
      case 'ASSEMBLY':
        return TargetGroup.assembly;
      case 'BLOCK':
        return TargetGroup.block;
      case 'GP':
        return TargetGroup.gp;
      default:
        return TargetGroup.block;
    }
  }

  /// Convert target group enum to string for Firestore
  static String targetGroupToString(TargetGroup group) {
    switch (group) {
      case TargetGroup.assembly:
        return 'ASSEMBLY';
      case TargetGroup.block:
        return 'BLOCK';
      case TargetGroup.gp:
        return 'GP';
    }
  }
}
