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
      // Filter for Today Only logic requested by user
      final now = DateTime.now();
      final start = DateTime(now.year, now.month, now.day);
      final end = DateTime(now.year, now.month, now.day, 23, 59, 59);

      final querySnapshot = await _firestore
          .collection('tasks')
          .where('status', isEqualTo: 'PENDING')
          // Assuming we want pending tasks for TODAY (or overdue? User said "Today-only events")
          // Stick to strict Today match for now per instruction. 
          .where('dueDate', isGreaterThanOrEqualTo: Timestamp.fromDate(start))
          .where('dueDate', isLessThanOrEqualTo: Timestamp.fromDate(end))
          .limit(50) 
          .get();

      return _enrichTasks(querySnapshot.docs);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<EnrichedTask>>> getCompletedTasks() async {
    try {
      final querySnapshot = await _firestore
          .collection('tasks')
          .where('status', isEqualTo: 'COMPLETED')
          .orderBy('createdAt', descending: true)
          .limit(50)
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

      
      final futures = docs.map((doc) async {
        final task = TaskModel.fromFirestore(doc);
        final data = doc.data() as Map<String, dynamic>;

        // Check for denormalized data on the task document first (for Seed/Demo data)
        String name = data['name'] ?? 'Unknown';
        String ward = data['ward']?.toString() ?? 'Unknown';
        String block = data['block'] ?? '';
        String gp = data['gram_panchayat'] ?? '';
        String mobile = data['mobile'] ?? '';

        // If 'Unknown' (default from above) and we have a constituentId, try to fetch it
        // Note: Demo seed might leave constituentId empty or point to nothing.
        // If data['name'] was present, we skip this lookup or merge? 
        // Let's prioritizing task-level overrides. If name is 'Unknown', try fetch.
        if ((name == 'Unknown' || name.isEmpty) && task.constituentId.isNotEmpty) {
            final constituentDoc =
                await _firestore.collection('constituents').doc(task.constituentId).get();
            
            if (constituentDoc.exists) {
                final cData = constituentDoc.data();
                if (cData != null) {
                    name = cData['name'] ?? name;
                    ward = cData['ward']?.toString() ?? ward;
                    block = cData['block'] ?? block;
                    gp = cData['gram_panchayat'] ?? gp;
                    mobile = cData['mobile'] ?? mobile;
                }
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
            block: block,
            gramPanchayat: gp,
            mobile: mobile,
        );
      });
      
      return Right(await Future.wait(futures));
      
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
