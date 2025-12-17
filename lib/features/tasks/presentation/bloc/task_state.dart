import 'package:equatable/equatable.dart';
import '../../domain/entities/task.dart';

abstract class TaskState extends Equatable {
  const TaskState();

  @override
  List<Object?> get props => [];
}

class TaskInitial extends TaskState {}

class TaskLoading extends TaskState {}

class TaskLoaded extends TaskState {
  final List<EnrichedTask> tasks;

  const TaskLoaded(this.tasks);

  @override
  List<Object?> get props => [tasks];
}

class TaskError extends TaskState {
  final String message;

  const TaskError(this.message);

  @override
  List<Object?> get props => [message];
}

/// State while an action (CALL, SMS, WHATSAPP) is being recorded
class ActionStatusUpdating extends TaskState {
  final String taskId;
  final String actionType;

  const ActionStatusUpdating({required this.taskId, required this.actionType});

  @override
  List<Object?> get props => [taskId, actionType];
}

/// State when action status has been successfully updated
class ActionStatusUpdated extends TaskState {
  final String taskId;
  final String actionType;

  const ActionStatusUpdated({required this.taskId, required this.actionType});

  @override
  List<Object?> get props => [taskId, actionType];
}
