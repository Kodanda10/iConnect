/**
 * Meetings Tab TDD Tests
 * @description Test-first implementation for conference call only UI
 * @changelog
 * - 2025-12-17: Initial TDD RED phase - writing failing tests
 */

import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dartz/dartz.dart';

import 'package:iconnect_mobile/features/meetings/domain/entities/scheduled_meeting.dart';
import 'package:iconnect_mobile/features/meetings/domain/repositories/meetings_repository.dart';
import 'package:iconnect_mobile/features/meetings/presentation/bloc/meetings_bloc.dart';
import 'package:iconnect_mobile/features/meetings/presentation/bloc/meetings_event.dart';
import 'package:iconnect_mobile/features/meetings/presentation/bloc/meetings_state.dart';
import 'package:iconnect_mobile/core/error/failures.dart';

class MockMeetingsRepository extends Mock implements MeetingsRepository {}

void main() {
  group('ScheduledMeeting Entity', () {
    test('creates ScheduledMeeting with conference call details', () {
      final meeting = ScheduledMeeting(
        id: 'meeting_1',
        title: 'Block A Town Hall',
        scheduledTime: DateTime(2025, 12, 18, 10, 0),
        dialInNumber: '1800-123-4567',
        accessCode: '9876',
        targetGroup: TargetGroup.block,
        targetId: 'block_a',
      );

      expect(meeting.id, 'meeting_1');
      expect(meeting.dialInNumber, '1800-123-4567');
      expect(meeting.accessCode, '9876');
      expect(meeting.targetGroup, TargetGroup.block);
    });

    test('isUpcoming returns true for future meetings', () {
      final futureMeeting = ScheduledMeeting(
        id: 'meeting_1',
        title: 'Future Meeting',
        scheduledTime: DateTime.now().add(const Duration(hours: 2)),
        dialInNumber: '1800-123-4567',
        accessCode: '1234',
        targetGroup: TargetGroup.assembly,
        targetId: 'assembly_1',
      );

      expect(futureMeeting.isUpcoming, true);
    });

    test('isUpcoming returns false for past meetings', () {
      final pastMeeting = ScheduledMeeting(
        id: 'meeting_1',
        title: 'Past Meeting',
        scheduledTime: DateTime.now().subtract(const Duration(hours: 2)),
        dialInNumber: '1800-123-4567',
        accessCode: '1234',
        targetGroup: TargetGroup.gp,
        targetId: 'gp_1',
      );

      expect(pastMeeting.isUpcoming, false);
    });

    test('TargetGroup enum has correct values', () {
      expect(TargetGroup.values, contains(TargetGroup.assembly));
      expect(TargetGroup.values, contains(TargetGroup.block));
      expect(TargetGroup.values, contains(TargetGroup.gp));
    });
  });

  group('MeetingsBloc', () {
    late MockMeetingsRepository mockRepository;
    late MeetingsBloc meetingsBloc;

    setUp(() {
      mockRepository = MockMeetingsRepository();
      meetingsBloc = MeetingsBloc(repository: mockRepository);
    });

    tearDown(() {
      meetingsBloc.close();
    });

    test('initial state is MeetingsInitial', () {
      expect(meetingsBloc.state, isA<MeetingsInitial>());
    });

    blocTest<MeetingsBloc, MeetingsState>(
      'emits [MeetingsLoading, MeetingsLoaded] with active meeting',
      build: () {
        final activeMeeting = ScheduledMeeting(
          id: 'meeting_1',
          title: 'Block A Town Hall',
          scheduledTime: DateTime.now().add(const Duration(hours: 1)),
          dialInNumber: '1800-123-4567',
          accessCode: '9876',
          targetGroup: TargetGroup.block,
          targetId: 'block_a',
        );

        when(() => mockRepository.getActiveMeeting())
            .thenAnswer((_) async => Right(activeMeeting));

        return MeetingsBloc(repository: mockRepository);
      },
      act: (bloc) => bloc.add(LoadActiveMeeting()),
      expect: () => [
        isA<MeetingsLoading>(),
        isA<MeetingsLoaded>().having(
          (s) => s.activeMeeting?.id,
          'has active meeting',
          'meeting_1',
        ),
      ],
    );

    blocTest<MeetingsBloc, MeetingsState>(
      'emits [MeetingsLoading, MeetingsLoaded] with null when no meeting scheduled',
      build: () {
        when(() => mockRepository.getActiveMeeting())
            .thenAnswer((_) async => const Right(null));

        return MeetingsBloc(repository: mockRepository);
      },
      act: (bloc) => bloc.add(LoadActiveMeeting()),
      expect: () => [
        isA<MeetingsLoading>(),
        isA<MeetingsLoaded>().having(
          (s) => s.activeMeeting,
          'no active meeting',
          isNull,
        ),
      ],
    );

    blocTest<MeetingsBloc, MeetingsState>(
      'emits [MeetingsLoading, MeetingsError] on failure',
      build: () {
        when(() => mockRepository.getActiveMeeting())
            .thenAnswer((_) async => Left(ServerFailure('Connection failed')));

        return MeetingsBloc(repository: mockRepository);
      },
      act: (bloc) => bloc.add(LoadActiveMeeting()),
      expect: () => [
        isA<MeetingsLoading>(),
        isA<MeetingsError>().having(
          (s) => s.message,
          'has error message',
          'Connection failed',
        ),
      ],
    );
  });
}
