import 'package:bloc_test/bloc_test.dart';
import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:iconnect_mobile/features/tasks/presentation/bloc/task_bloc.dart';
import 'package:iconnect_mobile/features/tasks/presentation/bloc/task_event.dart';
import 'package:iconnect_mobile/features/tasks/presentation/bloc/task_state.dart';
import 'package:iconnect_mobile/features/tasks/domain/entities/task.dart';
import 'package:iconnect_mobile/features/tasks/domain/repositories/task_repository.dart';
import 'package:iconnect_mobile/core/error/failures.dart';

class MockTaskRepository extends Mock implements TaskRepository {}

/// TDD Test: DailyTaskView Date-Based Task Loading
/// 
/// RED Phase: These tests verify that LoadTasksForDate event:
/// 1. Fetches tasks for the specific date
/// 2. Returns tasks sorted A-Z by constituent name
/// 
/// @changelog
/// - 2024-12-24: Initial TDD RED phase tests
/// - 2024-12-25: Fixed constructor issues and Failure import
void main() {
  late MockTaskRepository mockTaskRepository;
  late TaskBloc taskBloc;

  final testDate = DateTime(2024, 12, 25);
  final testCreatedAt = DateTime(2024, 12, 20);
  
  // Unsorted tasks for testing
  final List<EnrichedTask> unsortedTasks = [
    EnrichedTask(
      id: '3',
      type: 'BIRTHDAY',
      dueDate: testDate,
      createdAt: testCreatedAt,
      status: 'PENDING',
      constituentId: 'c3',
      name: 'Zara Begum',
      mobile: '9876543212',
      ward: '05',
      block: 'Dharmasala',
      gramPanchayat: 'Jaraka',
      callSent: false,
      smsSent: false,
      whatsappSent: false,
    ),
    EnrichedTask(
      id: '1',
      type: 'ANNIVERSARY',
      dueDate: testDate,
      createdAt: testCreatedAt,
      status: 'PENDING',
      constituentId: 'c1',
      name: 'Abhijeet Mohapatra',
      mobile: '9876543210',
      ward: '03',
      block: 'Dharmasala',
      gramPanchayat: 'Kotapur',
      callSent: false,
      smsSent: false,
      whatsappSent: false,
    ),
    EnrichedTask(
      id: '2',
      type: 'BIRTHDAY',
      dueDate: testDate,
      createdAt: testCreatedAt,
      status: 'PENDING',
      constituentId: 'c2',
      name: 'Manoj Swain',
      mobile: '9876543211',
      ward: '01',
      block: 'Dharmasala',
      gramPanchayat: 'Jenapur',
      callSent: false,
      smsSent: false,
      whatsappSent: false,
    ),
  ];

  setUp(() {
    mockTaskRepository = MockTaskRepository();
    taskBloc = TaskBloc(taskRepository: mockTaskRepository);
  });

  tearDown(() {
    taskBloc.close();
  });

  group('LoadTasksForDate (DailyTaskView)', () {
    blocTest<TaskBloc, TaskState>(
      'emits TaskLoading then TaskLoaded with tasks sorted A-Z by name',
      build: () {
        when(() => mockTaskRepository.getTasksForDate(testDate))
            .thenAnswer((_) async => Right(unsortedTasks));
        return taskBloc;
      },
      act: (bloc) => bloc.add(LoadTasksForDate(testDate)),
      expect: () => [
        TaskLoading(),
        predicate<TaskState>((state) {
          if (state is! TaskLoaded) return false;
          final names = state.tasks.map((t) => t.name).toList();
          // Expected A-Z order: Abhijeet, Manoj, Zara
          return names.length == 3 &&
                 names[0] == 'Abhijeet Mohapatra' &&
                 names[1] == 'Manoj Swain' &&
                 names[2] == 'Zara Begum';
        }),
      ],
    );

    blocTest<TaskBloc, TaskState>(
      'emits TaskLoaded with empty list when no tasks for date',
      build: () {
        when(() => mockTaskRepository.getTasksForDate(testDate))
            .thenAnswer((_) async => const Right([]));
        return taskBloc;
      },
      act: (bloc) => bloc.add(LoadTasksForDate(testDate)),
      expect: () => [
        TaskLoading(),
        predicate<TaskState>((state) {
          if (state is! TaskLoaded) return false;
          return state.tasks.isEmpty;
        }),
      ],
    );

    blocTest<TaskBloc, TaskState>(
      'emits TaskError when repository fails',
      build: () {
        when(() => mockTaskRepository.getTasksForDate(testDate))
            .thenAnswer((_) async => Left(ServerFailure('Index not created')));
        return taskBloc;
      },
      act: (bloc) => bloc.add(LoadTasksForDate(testDate)),
      expect: () => [
        TaskLoading(),
        predicate<TaskState>((state) {
          if (state is! TaskError) return false;
          return state.message.contains('Index');
        }),
      ],
    );
  });
}
