import 'package:cloud_firestore/cloud_firestore.dart';
import '../../domain/entities/task.dart';

class TaskModel extends Task {
  const TaskModel({
    required super.id,
    required super.constituentId,
    required super.type,
    required super.status,
    required super.dueDate,
    required super.createdAt,
  });

  static DateTime _parseFirestoreDate(dynamic value) {
    if (value == null) return DateTime.fromMillisecondsSinceEpoch(0);
    if (value is Timestamp) return value.toDate();
    if (value is DateTime) return value;
    if (value is String) {
      return DateTime.tryParse(value) ?? DateTime.fromMillisecondsSinceEpoch(0);
    }
    return DateTime.fromMillisecondsSinceEpoch(0);
  }

  factory TaskModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return TaskModel(
      id: doc.id,
      constituentId: data['constituentId'] ?? '',
      type: data['type'] ?? 'UNKNOWN',
      status: data['status'] ?? 'PENDING',
      dueDate: _parseFirestoreDate(data['dueDate'] ?? data['due_date']),
      createdAt: _parseFirestoreDate(data['createdAt'] ?? data['created_at']),
    );
  }

  Map<String, dynamic> toFirestore() {
    return {
      'constituentId': constituentId,
      'type': type,
      'status': status,
      'dueDate': Timestamp.fromDate(dueDate),
      'createdAt': Timestamp.fromDate(createdAt),
    };
  }
}
