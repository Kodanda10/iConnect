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
    on<UpdateTaskStatus>(_onUpdateTaskStatus);
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
}
