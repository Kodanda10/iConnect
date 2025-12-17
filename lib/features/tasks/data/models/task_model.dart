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
    super.callSent = false,
    super.smsSent = false,
    super.whatsappSent = false,
  });

  /// Parse Firestore document to TaskModel
  /// SCHEMA: Uses snake_case for Firestore consistency
  /// Backwards compatible: checks both snake_case and camelCase
  factory TaskModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    
    // Read constituent ID (snake_case preferred, camelCase fallback)
    final constituentId = data['constituent_id'] ?? data['constituentId'] ?? '';
    
    // Read due date (snake_case preferred, camelCase fallback)
    final dueDateRaw = data['due_date'] ?? data['dueDate'];
    final dueDate = dueDateRaw is Timestamp 
        ? dueDateRaw.toDate() 
        : DateTime.now();
    
    // Read created at (snake_case preferred, camelCase fallback)
    final createdAtRaw = data['created_at'] ?? data['createdAt'];
    final createdAt = createdAtRaw is Timestamp 
        ? createdAtRaw.toDate() 
        : DateTime.now();
    
    // Read action flags (snake_case preferred, camelCase fallback)
    final callSent = data['call_sent'] ?? data['callSent'] ?? false;
    final smsSent = data['sms_sent'] ?? data['smsSent'] ?? false;
    final whatsappSent = data['whatsapp_sent'] ?? data['whatsappSent'] ?? false;
    
    return TaskModel(
      id: doc.id,
      constituentId: constituentId,
      type: data['type'] ?? 'UNKNOWN',
      status: data['status'] ?? 'PENDING',
      dueDate: dueDate,
      createdAt: createdAt,
      callSent: callSent,
      smsSent: smsSent,
      whatsappSent: whatsappSent,
    );
  }

  /// Write to Firestore in snake_case format
  Map<String, dynamic> toFirestore() {
    return {
      'constituent_id': constituentId,
      'type': type,
      'status': status,
      'due_date': Timestamp.fromDate(dueDate),
      'created_at': Timestamp.fromDate(createdAt),
      'call_sent': callSent,
      'sms_sent': smsSent,
      'whatsapp_sent': whatsappSent,
    };
  }
}

