import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/task.dart';
import '../../domain/repositories/task_repository.dart';
import '../models/task_model.dart';

class FirestoreTaskRepository implements TaskRepository {
  final FirebaseFirestore _firestore;

  FirestoreTaskRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  @override
  Future<Either<Failure, List<EnrichedTask>>> getTasksForDate(DateTime date) async {
    try {
      // Set start and end of day
      final start = DateTime(date.year, date.month, date.day);
      final end = DateTime(date.year, date.month, date.day, 23, 59, 59);

      final querySnapshot = await _firestore
          .collection('tasks')
          .where('dueDate', isGreaterThanOrEqualTo: Timestamp.fromDate(start))
          .where('dueDate', isLessThanOrEqualTo: Timestamp.fromDate(end))
          .get();

      return _enrichTasks(querySnapshot.docs);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<EnrichedTask>>> getPendingTasks() async {
    try {
      final querySnapshot = await _firestore
          .collection('tasks')
          .where('status', isEqualTo: 'PENDING')
          // .orderBy('dueDate', descending: false) // Commented out to bypass index requirement for now
          .limit(50) // Limit for performance
          .get();

      return _enrichTasks(querySnapshot.docs);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> updateTaskStatus(String taskId, String status) async {
    try {
      await _firestore.collection('tasks').doc(taskId).update({
        'status': status,
        'updatedAt': FieldValue.serverTimestamp(),
      });
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  // Private helper to fetch constituent details
  Future<Either<Failure, List<EnrichedTask>>> _enrichTasks(
      List<QueryDocumentSnapshot> docs) async {
    try {
      final tasks = docs.map((doc) => TaskModel.fromFirestore(doc)).toList();
      final enrichedTasks = <EnrichedTask>[];

      // Batch fetch or parallel fetch
      // For simplicity/performance trade-off, we'll do parallel requests
      // In production with thousands, we'd use 'in' queries or specialized indexing
      await Future.wait(tasks.map((task) async {
        final constituentDoc =
            await _firestore.collection('constituents').doc(task.constituentId).get();

        String name = 'Unknown';
        String ward = 'Unknown';
        String mobile = '';

        if (constituentDoc.exists) {
          final data = constituentDoc.data();
          if (data != null) {
            name = data['name'] ?? 'Unknown';
            ward = data['ward']?.toString() ?? 'Unknown';
            mobile = data['mobile'] ?? '';
          }
        }

        enrichedTasks.add(EnrichedTask(
          id: task.id,
          constituentId: task.constituentId,
          type: task.type,
          status: task.status,
          dueDate: task.dueDate,
          createdAt: task.createdAt,
          name: name,
          ward: ward,
          mobile: mobile,
        ));
      }));

      // Sort by date again just in case async messed up order (though Future.wait preserves order, the list add might not if we pushed directly, but here we process. Wait, enrichedTasks.add is unsafe in parallel if not synchronized? Dart is single threaded event loop, so basic List.add is safe from race conditions, but order is NOT guaranteed by Future.wait unless we map back.)
      
      // Better approach for order:
      final futures = tasks.map((task) async {
        final constituentDoc =
            await _firestore.collection('constituents').doc(task.constituentId).get();
            
        String name = 'Unknown';
        String ward = 'Unknown';
        String mobile = '';

        if (constituentDoc.exists) {
            final data = constituentDoc.data();
            if (data != null) {
                name = data['name'] ?? 'Unknown';
                ward = data['ward']?.toString() ?? 'Unknown';
                mobile = data['mobile'] ?? '';
            }
        }
        
        return EnrichedTask(
            id: task.id,
            constituentId: task.constituentId,
            type: task.type,
            status: task.status,
            dueDate: task.dueDate,
            createdAt: task.createdAt,
            name: name,
            ward: ward,
            mobile: mobile,
        );
      });
      
      return Right(await Future.wait(futures));
      
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
