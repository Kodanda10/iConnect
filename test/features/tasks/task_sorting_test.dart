/// Test suite for Task Sorting (A-Z by Constituent Name)
/// 
/// @changelog
/// - 2024-12-24: Initial TDD test for alphabetical sorting (RED phase)
import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dartz/dartz.dart';

import 'package:iconnect_mobile/features/tasks/presentation/bloc/task_bloc.dart';
import 'package:iconnect_mobile/features/tasks/presentation/bloc/task_event.dart';
import 'package:iconnect_mobile/features/tasks/presentation/bloc/task_state.dart';
import 'package:iconnect_mobile/features/tasks/domain/repositories/task_repository.dart';
import 'package:iconnect_mobile/features/tasks/domain/entities/task.dart';
import 'package:iconnect_mobile/core/error/failures.dart';

class MockTaskRepository extends Mock implements TaskRepository {}

void main() {
  group('Task Sorting A-Z by Constituent Name', () {
    late TaskBloc taskBloc;
    late MockTaskRepository mockTaskRepository;

    // Test data: Explicitly unsorted names to verify sorting behavior
    final unsortedTasks = [
      EnrichedTask(
        id: '1',
        constituentId: 'c1',
        type: 'BIRTHDAY',
        status: 'PENDING',
        dueDate: DateTime(2024, 12, 24),
        createdAt: DateTime(2024, 12, 20),
        name: 'Zoning Kumar',  // Should be LAST after sort
        ward: '12',
        mobile: '9876543210',
      ),
      EnrichedTask(
        id: '2',
        constituentId: 'c2',
        type: 'ANNIVERSARY',
        status: 'PENDING',
        dueDate: DateTime(2024, 12, 24),
        createdAt: DateTime(2024, 12, 20),
        name: 'Alpha Sharma',  // Should be FIRST after sort
        ward: '05',
        mobile: '9876543211',
      ),
      EnrichedTask(
        id: '3',
        constituentId: 'c3',
        type: 'BIRTHDAY',
        status: 'PENDING',
        dueDate: DateTime(2024, 12, 24),
        createdAt: DateTime(2024, 12, 20),
        name: 'Beta Patel',    // Should be SECOND after sort
        ward: '08',
        mobile: '9876543212',
      ),
    ];

    setUp(() {
      mockTaskRepository = MockTaskRepository();
      taskBloc = TaskBloc(taskRepository: mockTaskRepository);
    });

    tearDown(() {
      taskBloc.close();
    });

    blocTest<TaskBloc, TaskState>(
      'LoadPendingTasks emits tasks sorted A-Z by name',
      build: () {
        when(() => mockTaskRepository.getPendingTasks())
            .thenAnswer((_) async => Right(unsortedTasks));
        return taskBloc;
      },
      act: (bloc) => bloc.add(LoadPendingTasks()),
      expect: () => [
        TaskLoading(),
        predicate<TaskState>((state) {
          if (state is! TaskLoaded) return false;
          final names = state.tasks.map((t) => t.name).toList();
          // Expected order: Alpha, Beta, Zoning
          return names[0] == 'Alpha Sharma' &&
                 names[1] == 'Beta Patel' &&
                 names[2] == 'Zoning Kumar';
        }),
      ],
    );

    blocTest<TaskBloc, TaskState>(
      'LoadTasksForDate emits tasks sorted A-Z by name',
      build: () {
        when(() => mockTaskRepository.getTasksForDate(any()))
            .thenAnswer((_) async => Right(unsortedTasks));
        return taskBloc;
      },
      act: (bloc) => bloc.add(LoadTasksForDate(DateTime(2024, 12, 24))),
      expect: () => [
        TaskLoading(),
        predicate<TaskState>((state) {
          if (state is! TaskLoaded) return false;
          final names = state.tasks.map((t) => t.name).toList();
          // Expected order: Alpha, Beta, Zoning
          return names[0] == 'Alpha Sharma' &&
                 names[1] == 'Beta Patel' &&
                 names[2] == 'Zoning Kumar';
        }),
      ],
    );
  });
}
