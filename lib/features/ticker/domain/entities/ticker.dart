import 'package:equatable/equatable.dart';

class MeetingTicker extends Equatable {
  final String title;
  final DateTime startTime;
  final String meetUrl;
  final String status; // 'scheduled', 'live', 'concluded'

  final String meetingType; // VIDEO_MEET or CONFERENCE_CALL
  final String dialInNumber;
  final String accessCode;

  const MeetingTicker({
    required this.title,
    required this.startTime,
    required this.meetUrl,
    required this.status,
    this.meetingType = 'VIDEO_MEET',
    this.dialInNumber = '',
    this.accessCode = '',
  });

  @override
  List<Object?> get props => [
    title,
    startTime,
    meetUrl,
    status,
    meetingType,
    dialInNumber,
    accessCode,
  ];
}
