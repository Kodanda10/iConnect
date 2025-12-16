/**
 * History Tab TDD Tests
 * @description Test-first implementation for 7-day action log history
 * @changelog
 * - 2025-12-17: Initial TDD RED phase - writing failing tests
 */

import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dartz/dartz.dart';

import 'package:iconnect_mobile/features/history/domain/entities/action_log.dart';
import 'package:iconnect_mobile/features/history/domain/entities/day_summary.dart';
import 'package:iconnect_mobile/features/history/domain/repositories/history_repository.dart';
import 'package:iconnect_mobile/features/history/presentation/bloc/history_bloc.dart';
import 'package:iconnect_mobile/features/history/presentation/bloc/history_event.dart';
import 'package:iconnect_mobile/features/history/presentation/bloc/history_state.dart';
import 'package:iconnect_mobile/core/error/failures.dart';

class MockHistoryRepository extends Mock implements HistoryRepository {}

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

  group('HistoryBloc', () {
    late MockHistoryRepository mockRepository;
    late HistoryBloc historyBloc;

    setUp(() {
      mockRepository = MockHistoryRepository();
      historyBloc = HistoryBloc(repository: mockRepository);
    });

    tearDown(() {
      historyBloc.close();
    });

    test('initial state is HistoryInitial', () {
      expect(historyBloc.state, isA<HistoryInitial>());
    });

    blocTest<HistoryBloc, HistoryState>(
      'emits [HistoryLoading, HistoryLoaded] when LoadHistory is successful',
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

        when(() => mockRepository.getHistoryForDays(7))
            .thenAnswer((_) async => Right(mockSummaries));

        return HistoryBloc(repository: mockRepository);
      },
      act: (bloc) => bloc.add(const LoadHistory(days: 7)),
      expect: () => [
        isA<HistoryLoading>(),
        isA<HistoryLoaded>().having(
          (s) => s.daySummaries.length,
          'has 2 day summaries',
          2,
        ),
      ],
      verify: (_) {
        verify(() => mockRepository.getHistoryForDays(7)).called(1);
      },
    );

    blocTest<HistoryBloc, HistoryState>(
      'emits [HistoryLoading, HistoryError] when LoadHistory fails',
      build: () {
        when(() => mockRepository.getHistoryForDays(any()))
            .thenAnswer((_) async => Left(ServerFailure('Network error')));

        return HistoryBloc(repository: mockRepository);
      },
      act: (bloc) => bloc.add(const LoadHistory(days: 7)),
      expect: () => [
        isA<HistoryLoading>(),
        isA<HistoryError>().having(
          (s) => s.message,
          'has error message',
          'Network error',
        ),
      ],
    );

    blocTest<HistoryBloc, HistoryState>(
      'LoadMoreHistory appends to existing data',
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

        when(() => mockRepository.getHistoryForDays(7))
            .thenAnswer((_) async => Right([initialSummary]));

        when(() => mockRepository.getHistoryForDateRange(any(), any()))
            .thenAnswer((_) async => Right([olderSummary]));

        return HistoryBloc(repository: mockRepository);
      },
      seed: () => HistoryLoaded(
        daySummaries: [
          DaySummary(
            date: DateTime.now(),
            actions: [],
          ),
        ],
        hasMore: true,
      ),
      act: (bloc) => bloc.add(LoadMoreHistory()),
      expect: () => [
        // First: loading more indicator
        isA<HistoryLoaded>().having(
          (s) => s.loadingMore,
          'is loading more',
          true,
        ),
        // Then: combined results with loading done
        isA<HistoryLoaded>().having(
          (s) => s.daySummaries.length,
          'has more summaries after loading more',
          2,
        ).having(
          (s) => s.loadingMore,
          'is not loading more',
          false,
        ),
      ],
    );
  });
}
