/// Test suite for TaskBloc
///
/// @changelog
/// - 2024-12-15: Initial test for LoadCompletedTasks event
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
  late TaskBloc taskBloc;
  late MockTaskRepository mockTaskRepository;

  setUp(() {
    mockTaskRepository = MockTaskRepository();
    taskBloc = TaskBloc(taskRepository: mockTaskRepository);
  });

  tearDown(() {
    taskBloc.close();
  });

  group('LoadCompletedTasks', () {
    final tCompletedTasks = [
      EnrichedTask(
        id: '1',
        constituentId: 'c1',
        type: 'BIRTHDAY',
        status: 'COMPLETED',
        dueDate: DateTime(2024, 12, 15),
        createdAt: DateTime(2024, 12, 10),
        name: 'Test User',
        ward: '12',
        mobile: '9876543210',
      ),
    ];

    blocTest<TaskBloc, TaskState>(
      'emits [TaskLoading, TaskLoaded] when LoadCompletedTasks succeeds',
      build: () {
        when(
          () => mockTaskRepository.getCompletedTasks(),
        ).thenAnswer((_) async => Right(tCompletedTasks));
        return taskBloc;
      },
      act: (bloc) => bloc.add(LoadCompletedTasks()),
      expect: () => [TaskLoading(), TaskLoaded(tCompletedTasks)],
    );

    blocTest<TaskBloc, TaskState>(
      'emits [TaskLoading, TaskError] when LoadCompletedTasks fails',
      build: () {
        when(
          () => mockTaskRepository.getCompletedTasks(),
        ).thenAnswer((_) async => Left(ServerFailure('Server error')));
        return taskBloc;
      },
      act: (bloc) => bloc.add(LoadCompletedTasks()),
      expect: () => [TaskLoading(), const TaskError('Server error')],
    );
  });
}
