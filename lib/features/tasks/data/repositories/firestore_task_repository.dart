import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/task.dart';
import '../../domain/repositories/task_repository.dart';
import '../models/task_model.dart';

class FirestoreTaskRepository implements TaskRepository {
  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;

  FirestoreTaskRepository({FirebaseFirestore? firestore, FirebaseAuth? auth})
      : _firestore = firestore ?? FirebaseFirestore.instance,
        _auth = auth ?? FirebaseAuth.instance;

  @override
  Future<Either<Failure, List<EnrichedTask>>> getTasksForDate(DateTime date) async {
    try {
      final user = _auth.currentUser;
      if (user == null) return Left(ServerFailure('User not authenticated'));

      // Set start and end of day
      final start = DateTime(date.year, date.month, date.day);
      final end = DateTime(date.year, date.month, date.day, 23, 59, 59);

      final querySnapshot = await _firestore
          .collection('tasks')
          .where('uid', isEqualTo: user.uid)
          .where('due_date', isGreaterThanOrEqualTo: Timestamp.fromDate(start))
          .where('due_date', isLessThanOrEqualTo: Timestamp.fromDate(end))
          .get();

      return _enrichTasks(querySnapshot.docs);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<EnrichedTask>>> getPendingTasks() async {
    try {
      final user = _auth.currentUser;
      if (user == null) return Left(ServerFailure('User not authenticated'));

      // Filter for Today Only logic requested by user
      final now = DateTime.now();
      final start = DateTime(now.year, now.month, now.day);
      final end = DateTime(now.year, now.month, now.day, 23, 59, 59);

      final querySnapshot = await _firestore
          .collection('tasks')
          .where('uid', isEqualTo: user.uid)
          .where('status', isEqualTo: 'PENDING')
          // Standardized: Using snake_case for Firestore consistency
          .where('due_date', isGreaterThanOrEqualTo: Timestamp.fromDate(start))
          .where('due_date', isLessThanOrEqualTo: Timestamp.fromDate(end))
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
      final user = _auth.currentUser;
      if (user == null) return Left(ServerFailure('User not authenticated'));

      final querySnapshot = await _firestore
          .collection('tasks')
          .where('uid', isEqualTo: user.uid)
          .where('status', isEqualTo: 'COMPLETED')
          .orderBy('created_at', descending: true)
          .limit(50)
          .get();

      return _enrichTasks(querySnapshot.docs);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<EnrichedTask>>> getTasksForDateRange(DateTime start, DateTime end) async {
    try {
      final user = _auth.currentUser;
      if (user == null) return Left(ServerFailure('User not authenticated'));

      final querySnapshot = await _firestore
          .collection('tasks')
          .where('uid', isEqualTo: user.uid)
          .where('due_date', isGreaterThanOrEqualTo: Timestamp.fromDate(start))
          .where('due_date', isLessThanOrEqualTo: Timestamp.fromDate(end))
          .orderBy('due_date', descending: true)
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
        'updated_at': FieldValue.serverTimestamp(),
      });
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> updateActionStatus(String taskId, String actionType) async {
    try {
      final user = _auth.currentUser;
      if (user == null) return Left(ServerFailure('User not authenticated'));
      
      // Map action type to field name (snake_case for Firestore consistency)
      final fieldMap = {
        'CALL': 'call_sent',
        'SMS': 'sms_sent',
        'WHATSAPP': 'whatsapp_sent',
      };
      
      final fieldName = fieldMap[actionType.toUpperCase()];
      if (fieldName == null) {
        return Left(ServerFailure('Invalid action type: $actionType'));
      }
      
      // 1. Update the task document
      final taskDoc = await _firestore.collection('tasks').doc(taskId).get();
      if (!taskDoc.exists) {
        return Left(ServerFailure('Task not found: $taskId'));
      }
      
      final taskData = taskDoc.data()!;
      final constituentName = taskData['constituent_name'] ?? taskData['name'] ?? 'Unknown';
      final constituentId = taskData['constituent_id'] ?? '';
      final mobile = taskData['constituent_mobile'] ?? taskData['mobile'] ?? '';
      
      await _firestore.collection('tasks').doc(taskId).update({
        fieldName: true,
        '${fieldName}_at': FieldValue.serverTimestamp(),
        'updated_at': FieldValue.serverTimestamp(),
      });
      
      // 2. Write to action_logs collection for Report page
      await _firestore.collection('action_logs').add({
        'task_id': taskId,
        'constituent_id': constituentId,
        'constituent_name': constituentName,
        'mobile': mobile,
        'action_type': actionType.toLowerCase(), // 'call', 'sms', 'whatsapp'
        'executed_by': user.uid,
        'executed_at': FieldValue.serverTimestamp(),
        'success': true,
        'message_preview': _getActionPreview(actionType),
      });
      
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
  
  String _getActionPreview(String actionType) {
    switch (actionType.toUpperCase()) {
      case 'CALL': return 'Called';
      case 'SMS': return 'SMS Sent';
      case 'WHATSAPP': return 'WhatsApp Sent';
      default: return 'Action Completed';
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
        String name = data['constituent_name'] ?? data['name'] ?? 'Unknown';
        String ward = data['ward_number']?.toString() ?? data['ward']?.toString() ?? 'Unknown';
        String block = data['block'] ?? '';
        String gp = data['gram_panchayat'] ?? data['gp_ulb'] ?? '';
        String mobile = data['constituent_mobile'] ?? data['mobile'] ?? '';

        // If key data is missing (name Unknown OR block/gp empty), try to fetch from constituents
        if ((name == 'Unknown' || name.isEmpty || block.isEmpty || gp.isEmpty) && task.constituentId.isNotEmpty) {
            final constituentDoc =
                await _firestore.collection('constituents').doc(task.constituentId).get();
            
            if (constituentDoc.exists) {
                final cData = constituentDoc.data();
                if (cData != null) {
                    if (name == 'Unknown' || name.isEmpty) name = cData['name'] ?? name;
                    if (ward == 'Unknown' || ward.isEmpty) ward = cData['ward']?.toString() ?? ward;
                    if (block.isEmpty) block = cData['block'] ?? block;
                    if (gp.isEmpty) gp = cData['gram_panchayat'] ?? cData['gp_ulb'] ?? gp;
                    if (mobile.isEmpty) mobile = cData['mobile'] ?? mobile;
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
            callSent: task.callSent,
            smsSent: task.smsSent,
            whatsappSent: task.whatsappSent,
        );
      });
      
      return Right(await Future.wait(futures));
      
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
