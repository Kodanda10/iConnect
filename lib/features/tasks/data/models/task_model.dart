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
    super.whatsappCallSent = false,
  });

  /// Parse Firestore data map to TaskModel
  factory TaskModel.fromMap(Map<String, dynamic> data, String id) {
    // Read constituent ID (snake_case preferred, camelCase fallback)
    final constituentId = data['constituent_id'] ?? data['constituentId'] ?? '';
    
    // Read due date
    final dueDateRaw = data['due_date'] ?? data['dueDate'];
    final dueDate = dueDateRaw is Timestamp 
        ? dueDateRaw.toDate() 
        : DateTime.now();
    
    // Read created at
    final createdAtRaw = data['created_at'] ?? data['createdAt'];
    final createdAt = createdAtRaw is Timestamp 
        ? createdAtRaw.toDate() 
        : DateTime.now();
    
    // Read action flags
    final callSent = data['call_sent'] ?? data['callSent'] ?? false;
    final smsSent = data['sms_sent'] ?? data['smsSent'] ?? false;
    final whatsappSent = data['whatsapp_sent'] ?? data['whatsappSent'] ?? false;
    final whatsappCallSent = data['whatsapp_call_sent'] ?? data['whatsappCallSent'] ?? false;
    
    // Read name/mobile if present (optional in base Task but useful for EnrichedTask or if model carries it)
    final name = data['name'] ?? '';
    final mobile = data['mobile'] ?? '';

    return TaskModel(
      id: id,
      constituentId: constituentId,
      type: data['type'] ?? 'UNKNOWN',
      status: data['status'] ?? 'PENDING',
      dueDate: dueDate,
      createdAt: createdAt,
      callSent: callSent,
      smsSent: smsSent,
      whatsappSent: whatsappSent,
      whatsappCallSent: whatsappCallSent,
    );
  }

  /// Parse Firestore document to TaskModel
  factory TaskModel.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return TaskModel.fromMap(data, doc.id);
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
      'whatsapp_call_sent': whatsappCallSent,
    };
  }
}

