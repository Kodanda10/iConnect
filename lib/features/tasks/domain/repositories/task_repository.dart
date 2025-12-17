import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/task.dart';

abstract class TaskRepository {
  Future<Either<Failure, List<EnrichedTask>>> getTasksForDate(DateTime date);
  Future<Either<Failure, List<EnrichedTask>>> getPendingTasks();
  Future<Either<Failure, List<EnrichedTask>>> getCompletedTasks();
  Future<Either<Failure, List<EnrichedTask>>> getTasksForDateRange(DateTime start, DateTime end);
  Future<Either<Failure, void>> updateTaskStatus(String taskId, String status);
  
  /// Update action status (CALL, SMS, WHATSAPP) for a task
  Future<Either<Failure, void>> updateActionStatus(String taskId, String actionType);
}
