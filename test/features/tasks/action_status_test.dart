/// Test suite for Action Status Tracking
/// 
/// @changelog
/// - 2024-12-16: Initial TDD tests for action status tracking (RED phase)
/// - 2025-12-17: Added bloc tests for UpdateActionStatus event handling
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
  group('EnrichedTask Action Status Fields', () {
    test('should have callSent field defaulting to false', () {
      final task = EnrichedTask(
        id: '1',
        constituentId: 'c1',
        type: 'BIRTHDAY',
        status: 'PENDING',
        dueDate: DateTime(2024, 12, 16),
        createdAt: DateTime(2024, 12, 10),
        name: 'Test User',
        ward: '12',
        mobile: '9876543210',
      );
      
      // This test will FAIL until we add callSent field
      expect(task.callSent, false);
    });

    test('should have smsSent field defaulting to false', () {
      final task = EnrichedTask(
        id: '1',
        constituentId: 'c1',
        type: 'BIRTHDAY',
        status: 'PENDING',
        dueDate: DateTime(2024, 12, 16),
        createdAt: DateTime(2024, 12, 10),
        name: 'Test User',
        ward: '12',
        mobile: '9876543210',
      );
      
      // This test will FAIL until we add smsSent field
      expect(task.smsSent, false);
    });

    test('should have whatsappSent field defaulting to false', () {
      final task = EnrichedTask(
        id: '1',
        constituentId: 'c1',
        type: 'BIRTHDAY',
        status: 'PENDING',
        dueDate: DateTime(2024, 12, 16),
        createdAt: DateTime(2024, 12, 10),
        name: 'Test User',
        ward: '12',
        mobile: '9876543210',
      );
      
      // This test will FAIL until we add whatsappSent field
      expect(task.whatsappSent, false);
    });

    test('should be able to create EnrichedTask with action status set to true', () {
      final task = EnrichedTask(
        id: '1',
        constituentId: 'c1',
        type: 'BIRTHDAY',
        status: 'PENDING',
        dueDate: DateTime(2024, 12, 16),
        createdAt: DateTime(2024, 12, 10),
        name: 'Test User',
        ward: '12',
        mobile: '9876543210',
        callSent: true,
        smsSent: true,
        whatsappSent: false,
      );
      
      expect(task.callSent, true);
      expect(task.smsSent, true);
      expect(task.whatsappSent, false);
    });
  });

  group('UpdateActionStatus Event', () {
    late TaskBloc taskBloc;
    late MockTaskRepository mockTaskRepository;

    setUp(() {
      mockTaskRepository = MockTaskRepository();
      taskBloc = TaskBloc(taskRepository: mockTaskRepository);
    });

    tearDown(() {
      taskBloc.close();
    });

    test('UpdateActionStatus event should exist with taskId and actionType', () {
      // This test will FAIL until UpdateActionStatus event is created
      final event = UpdateActionStatus(
        taskId: 'task_1',
        actionType: 'CALL',
      );
      
      expect(event.taskId, 'task_1');
      expect(event.actionType, 'CALL');
    });

    blocTest<TaskBloc, TaskState>(
      'emits ActionStatusUpdated when UpdateActionStatus is added successfully',
      build: () {
        when(() => mockTaskRepository.updateActionStatus(
          any(),
          any(),
        )).thenAnswer((_) async => const Right(null));
        when(() => mockTaskRepository.getPendingTasks()).thenAnswer(
          (_) async => const Right([]),
        );
        return TaskBloc(taskRepository: mockTaskRepository);
      },
      act: (bloc) => bloc.add(const UpdateActionStatus(
        taskId: 'task_1',
        actionType: 'SMS',
      )),
      expect: () => [
        isA<ActionStatusUpdating>(),
        isA<ActionStatusUpdated>(),
        isA<TaskLoading>(),
        isA<TaskLoaded>(),
      ],
      verify: (_) {
        verify(() => mockTaskRepository.updateActionStatus('task_1', 'SMS')).called(1);
        verify(() => mockTaskRepository.getPendingTasks()).called(1);
      },
    );

    blocTest<TaskBloc, TaskState>(
      'emits TaskError when UpdateActionStatus fails',
      build: () {
        when(() => mockTaskRepository.updateActionStatus(
          any(),
          any(),
        )).thenAnswer((_) async => Left(ServerFailure('Network error')));
        return TaskBloc(taskRepository: mockTaskRepository);
      },
      act: (bloc) => bloc.add(const UpdateActionStatus(
        taskId: 'task_1',
        actionType: 'WHATSAPP',
      )),
      expect: () => [
        isA<ActionStatusUpdating>(),
        isA<TaskError>(),
      ],
    );
  });
}

