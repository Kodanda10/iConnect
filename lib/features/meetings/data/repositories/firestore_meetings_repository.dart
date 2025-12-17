import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/scheduled_meeting.dart';
import '../../domain/repositories/meetings_repository.dart';

class FirestoreMeetingsRepository implements MeetingsRepository {
  final FirebaseFirestore _firestore;

  FirestoreMeetingsRepository({FirebaseFirestore? firestore})
    : _firestore = firestore ?? FirebaseFirestore.instance;

  ScheduledMeeting _fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data() ?? <String, dynamic>{};

    final scheduledVal = data['scheduled_time'];
    DateTime scheduledTime;
    if (scheduledVal is Timestamp) {
      scheduledTime = scheduledVal.toDate();
    } else if (scheduledVal is DateTime) {
      scheduledTime = scheduledVal;
    } else if (scheduledVal is String) {
      scheduledTime =
          DateTime.tryParse(scheduledVal) ??
          DateTime.fromMillisecondsSinceEpoch(0);
    } else {
      scheduledTime = DateTime.fromMillisecondsSinceEpoch(0);
    }

    return ScheduledMeeting(
      id: doc.id,
      title: data['title'] ?? 'Conference Call',
      scheduledTime: scheduledTime,
      dialInNumber: data['dial_in_number'] ?? '',
      accessCode: data['access_code'] ?? '',
      targetGroup: ScheduledMeeting.targetGroupFromString(
        data['target_group'] ?? 'ASSEMBLY',
      ),
      targetId: data['target_id'] ?? '',
      description: data['description'],
      notifiedConstituents:
          (data['notified_constituents'] as List?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
    );
  }

  @override
  Future<Either<Failure, ScheduledMeeting?>> getActiveMeeting() async {
    try {
      final now = DateTime.now();
      final query = await _firestore
          .collection('scheduled_meetings')
          .where(
            'scheduled_time',
            isGreaterThanOrEqualTo: Timestamp.fromDate(now),
          )
          .orderBy('scheduled_time')
          .limit(1)
          .get();

      if (query.docs.isEmpty) return const Right(null);
      return Right(_fromDoc(query.docs.first));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<ScheduledMeeting>>> getUpcomingMeetings() async {
    try {
      final now = DateTime.now();
      final query = await _firestore
          .collection('scheduled_meetings')
          .where(
            'scheduled_time',
            isGreaterThanOrEqualTo: Timestamp.fromDate(now),
          )
          .orderBy('scheduled_time')
          .limit(20)
          .get();

      return Right(query.docs.map(_fromDoc).toList());
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, ScheduledMeeting>> getMeetingById(String id) async {
    try {
      final doc = await _firestore
          .collection('scheduled_meetings')
          .doc(id)
          .get();
      if (!doc.exists) {
        return Left(ServerFailure('Meeting not found'));
      }
      return Right(_fromDoc(doc));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
