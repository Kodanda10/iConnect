/**
 * Report Tab TDD Tests
 * @description Test-first implementation for 7-day action log report
 * @changelog
 * - 2025-12-17: Initial TDD RED phase - writing failing tests
 */

import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dartz/dartz.dart';

import 'package:iconnect_mobile/features/report/domain/entities/action_log.dart';
import 'package:iconnect_mobile/features/report/domain/entities/day_summary.dart';
import 'package:iconnect_mobile/features/report/domain/repositories/report_repository.dart';
import 'package:iconnect_mobile/features/report/presentation/bloc/report_bloc.dart';
import 'package:iconnect_mobile/features/report/presentation/bloc/report_event.dart';
import 'package:iconnect_mobile/features/report/presentation/bloc/report_state.dart';
import 'package:iconnect_mobile/core/error/failures.dart';

class MockReportRepository extends Mock implements ReportRepository {}

void main() {
  group('ActionLog Entity', () {
    test('creates ActionLog with all fields', () {
      final now = DateTime.now();
      final log = ActionLog(
        id: 'log_1',
        constituentId: 'c_1',
        constituentName: 'Test Person',
        actionType: ActionType.sms,
        executedAt: now,
        executedBy: 'user_1',
        success: true,
      );

      expect(log.id, 'log_1');
      expect(log.actionType, ActionType.sms);
      expect(log.success, true);
    });

    test('ActionType enum has correct values', () {
      expect(ActionType.values, contains(ActionType.call));
      expect(ActionType.values, contains(ActionType.sms));
      expect(ActionType.values, contains(ActionType.whatsapp));
    });
  });

  group('DaySummary Entity', () {
    test('groups multiple actions by date', () {
      final today = DateTime.now();
      final summary = DaySummary(
        date: today,
        actions: [
          ActionLog(
            id: 'log_1',
            constituentId: 'c_1',
            constituentName: 'Person A',
            actionType: ActionType.sms,
            executedAt: today,
            executedBy: 'user_1',
            success: true,
          ),
          ActionLog(
            id: 'log_2',
            constituentId: 'c_2',
            constituentName: 'Person B',
            actionType: ActionType.call,
            executedAt: today,
            executedBy: 'user_1',
            success: false,
          ),
        ],
      );

      expect(summary.actions.length, 2);
      expect(summary.successCount, 1);
      expect(summary.totalCount, 2);
    });
  });

  group('ReportBloc', () {
    late MockReportRepository mockRepository;
    late ReportBloc reportBloc;

    setUp(() {
      mockRepository = MockReportRepository();
      reportBloc = ReportBloc(repository: mockRepository);
    });

    tearDown(() {
      reportBloc.close();
    });

    test('initial state is ReportInitial', () {
      expect(reportBloc.state, isA<ReportInitial>());
    });

    blocTest<ReportBloc, ReportState>(
      'emits [ReportLoading, ReportLoaded] when LoadReport is successful',
      build: () {
        final now = DateTime.now();
        final mockSummaries = [
          DaySummary(
            date: now,
            actions: [
              ActionLog(
                id: 'log_1',
                constituentId: 'c_1',
                constituentName: 'Person A',
                actionType: ActionType.sms,
                executedAt: now,
                executedBy: 'user_1',
                success: true,
              ),
            ],
          ),
          DaySummary(
            date: now.subtract(const Duration(days: 1)),
            actions: [
              ActionLog(
                id: 'log_2',
                constituentId: 'c_2',
                constituentName: 'Person B',
                actionType: ActionType.call,
                executedAt: now.subtract(const Duration(days: 1)),
                executedBy: 'user_1',
                success: true,
              ),
            ],
          ),
        ];

        when(
          () => mockRepository.getReportForDays(7),
        ).thenAnswer((_) async => Right(mockSummaries));

        return ReportBloc(repository: mockRepository);
      },
      act: (bloc) => bloc.add(const LoadReport(days: 7)),
      expect: () => [
        isA<ReportLoading>(),
        isA<ReportLoaded>().having(
          (s) => s.daySummaries.length,
          'has 2 day summaries',
          2,
        ),
      ],
      verify: (_) {
        verify(() => mockRepository.getReportForDays(7)).called(1);
      },
    );

    blocTest<ReportBloc, ReportState>(
      'emits [ReportLoading, ReportError] when LoadReport fails',
      build: () {
        when(
          () => mockRepository.getReportForDays(any()),
        ).thenAnswer((_) async => Left(ServerFailure('Network error')));

        return ReportBloc(repository: mockRepository);
      },
      act: (bloc) => bloc.add(const LoadReport(days: 7)),
      expect: () => [
        isA<ReportLoading>(),
        isA<ReportError>().having(
          (s) => s.message,
          'has error message',
          'Network error',
        ),
      ],
    );

    blocTest<ReportBloc, ReportState>(
      'LoadMoreReport appends to existing data',
      build: () {
        final now = DateTime.now();
        final initialSummary = DaySummary(
          date: now,
          actions: [
            ActionLog(
              id: 'log_1',
              constituentId: 'c_1',
              constituentName: 'Person A',
              actionType: ActionType.sms,
              executedAt: now,
              executedBy: 'user_1',
              success: true,
            ),
          ],
        );

        final olderSummary = DaySummary(
          date: now.subtract(const Duration(days: 8)),
          actions: [
            ActionLog(
              id: 'log_2',
              constituentId: 'c_2',
              constituentName: 'Person B',
              actionType: ActionType.call,
              executedAt: now.subtract(const Duration(days: 8)),
              executedBy: 'user_1',
              success: true,
            ),
          ],
        );

        when(
          () => mockRepository.getReportForDays(7),
        ).thenAnswer((_) async => Right([initialSummary]));

        when(
          () => mockRepository.getReportForDateRange(any(), any()),
        ).thenAnswer((_) async => Right([olderSummary]));

        return ReportBloc(repository: mockRepository);
      },
      seed: () => ReportLoaded(
        daySummaries: [DaySummary(date: DateTime.now(), actions: [])],
        hasMore: true,
      ),
      act: (bloc) => bloc.add(LoadMoreReport()),
      expect: () => [
        // First: loading more indicator
        isA<ReportLoaded>().having(
          (s) => s.loadingMore,
          'is loading more',
          true,
        ),
        // Then: combined results with loading done
        isA<ReportLoaded>()
            .having(
              (s) => s.daySummaries.length,
              'has more summaries after loading more',
              2,
            )
            .having((s) => s.loadingMore, 'is not loading more', false),
      ],
    );
  });
}
