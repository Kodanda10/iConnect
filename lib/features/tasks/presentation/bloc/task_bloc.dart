import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/repositories/task_repository.dart';
import 'task_event.dart';
import 'task_state.dart';

class TaskBloc extends Bloc<TaskEvent, TaskState> {
  final TaskRepository _taskRepository;

  TaskBloc({required TaskRepository taskRepository})
      : _taskRepository = taskRepository,
        super(TaskInitial()) {
    on<LoadTasksForDate>(_onLoadTasksForDate);
    on<LoadPendingTasks>(_onLoadPendingTasks);
    on<LoadCompletedTasks>(_onLoadCompletedTasks);
    on<LoadHistory>(_onLoadHistory);
    on<UpdateTaskStatus>(_onUpdateTaskStatus);
    on<UpdateActionStatus>(_onUpdateActionStatus);
  }

  Future<void> _onLoadTasksForDate(
    LoadTasksForDate event,
    Emitter<TaskState> emit,
  ) async {
    emit(TaskLoading());
    final result = await _taskRepository.getTasksForDate(event.date);
    result.fold(
      (failure) => emit(TaskError(failure.message)),
      (tasks) => emit(TaskLoaded(tasks)),
    );
  }

  Future<void> _onLoadPendingTasks(
    LoadPendingTasks event,
    Emitter<TaskState> emit,
  ) async {
    emit(TaskLoading());
    final result = await _taskRepository.getPendingTasks();
    result.fold(
      (failure) => emit(TaskError(failure.message)),
      (tasks) => emit(TaskLoaded(tasks)),
    );
  }

  Future<void> _onLoadHistory(
    LoadHistory event,
    Emitter<TaskState> emit,
  ) async {
    emit(TaskLoading());
    // Fetch last 7 days including today
    final now = DateTime.now();
    final start = DateTime(now.year, now.month, now.day).subtract(const Duration(days: 6));
    final end = DateTime(now.year, now.month, now.day, 23, 59, 59);
    
    final result = await _taskRepository.getTasksForDateRange(start, end);
    result.fold(
      (failure) => emit(TaskError(failure.message)),
      (tasks) => emit(TaskLoaded(tasks)),
    );
  }

  Future<void> _onLoadCompletedTasks(
    LoadCompletedTasks event,
    Emitter<TaskState> emit,
  ) async {
    emit(TaskLoading());
    final result = await _taskRepository.getCompletedTasks();
    result.fold(
      (failure) => emit(TaskError(failure.message)),
      (tasks) => emit(TaskLoaded(tasks)),
    );
  }

  Future<void> _onUpdateTaskStatus(
    UpdateTaskStatus event,
    Emitter<TaskState> emit,
  ) async {
    final result = await _taskRepository.updateTaskStatus(event.taskId, event.status);
    result.fold(
      (failure) => emit(TaskError(failure.message)),
      (_) => add(LoadPendingTasks()),
    );
  }

  /// Handle UpdateActionStatus event - marks CALL/SMS/WHATSAPP as sent
  Future<void> _onUpdateActionStatus(
    UpdateActionStatus event,
    Emitter<TaskState> emit,
  ) async {
    emit(ActionStatusUpdating(
      taskId: event.taskId,
      actionType: event.actionType,
    ));
    
    final result = await _taskRepository.updateActionStatus(
      event.taskId,
      event.actionType,
    );
    
    result.fold(
      (failure) => emit(TaskError(failure.message)),
      (_) {
        emit(ActionStatusUpdated(
          taskId: event.taskId,
          actionType: event.actionType,
        ));
        // Refresh the task list so the UI reflects persisted action flags
        add(LoadPendingTasks());
      },
    );
  }
}
