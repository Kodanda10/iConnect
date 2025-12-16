import 'package:equatable/equatable.dart';
import '../../domain/entities/task.dart';

abstract class TaskEvent extends Equatable {
  const TaskEvent();

  @override
  List<Object?> get props => [];
}

class LoadTasksForDate extends TaskEvent {
  final DateTime date;

  const LoadTasksForDate(this.date);

  @override
  List<Object?> get props => [date];
}

class LoadPendingTasks extends TaskEvent {}

class UpdateTaskStatus extends TaskEvent {
  final String taskId;
  final String status;

  const UpdateTaskStatus({required this.taskId, required this.status});

  @override
  List<Object?> get props => [taskId, status];
}

class LoadCompletedTasks extends TaskEvent {}

/// Event to update a specific action status (CALL, SMS, WHATSAPP)
class UpdateActionStatus extends TaskEvent {
  final String taskId;
  final String actionType; // 'CALL', 'SMS', 'WHATSAPP'

  const UpdateActionStatus({
    required this.taskId,
    required this.actionType,
  });

  @override
  List<Object?> get props => [taskId, actionType];
}
