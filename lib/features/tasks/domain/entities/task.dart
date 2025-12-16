import 'package:equatable/equatable.dart';

class Task extends Equatable {
  final String id;
  final String constituentId;
  final String type; // BIRTHDAY, ANNIVERSARY
  final String status; // PENDING, COMPLETED, SKIPPED
  final DateTime dueDate;
  final DateTime createdAt;

  const Task({
    required this.id,
    required this.constituentId,
    required this.type,
    required this.status,
    required this.dueDate,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [id, constituentId, type, status, dueDate, createdAt];
}

class EnrichedTask extends Task {
  final String name;
  final String ward;
  final String block;
  final String gramPanchayat;
  final String mobile;
  
  // Action status tracking
  final bool callSent;
  final bool smsSent;
  final bool whatsappSent;

  const EnrichedTask({
    required super.id,
    required super.constituentId,
    required super.type,
    required super.status,
    required super.dueDate,
    required super.createdAt,
    required this.name,
    required this.ward,
    this.block = '',
    this.gramPanchayat = '',
    required this.mobile,
    this.callSent = false,
    this.smsSent = false,
    this.whatsappSent = false,
  });

  @override
  List<Object?> get props => [...super.props, name, ward, block, gramPanchayat, mobile, callSent, smsSent, whatsappSent];
}

