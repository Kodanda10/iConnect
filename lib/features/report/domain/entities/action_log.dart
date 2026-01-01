/**
 * @file lib/features/report/domain/entities/action_log.dart
 * @description Action log entity for tracking constituent interactions
 * @changelog
 * - 2025-12-17: Initial implementation (TDD GREEN phase)
 */

import 'package:equatable/equatable.dart';

/// Action type enum for different interaction types
enum ActionType {
  call,
  sms,
  whatsapp,
  whatsappCall,
}

/// Entity representing a single action log entry
class ActionLog extends Equatable {
  final String id;
  final String constituentId;
  final String constituentName;
  final ActionType actionType;
  final DateTime executedAt;
  final String executedBy;
  final bool success;
  final String? messagePreview;
  final int? durationSeconds;

  const ActionLog({
    required this.id,
    required this.constituentId,
    required this.constituentName,
    required this.actionType,
    required this.executedAt,
    required this.executedBy,
    required this.success,
    this.messagePreview,
    this.durationSeconds,
  });

  @override
  List<Object?> get props => [
        id,
        constituentId,
        constituentName,
        actionType,
        executedAt,
        executedBy,
        success,
        messagePreview,
        durationSeconds,
      ];

  /// Convert action type string from Firestore to enum
  static ActionType actionTypeFromString(String type) {
    switch (type.toUpperCase()) {
      case 'CALL':
        return ActionType.call;
      case 'SMS':
        return ActionType.sms;
      case 'WHATSAPP':
        return ActionType.whatsapp;
      case 'WHATSAPP_CALL':
        return ActionType.whatsappCall;
      default:
        return ActionType.sms;
    }
  }

  /// Convert action type enum to string for Firestore
  static String actionTypeToString(ActionType type) {
    switch (type) {
      case ActionType.call:
        return 'CALL';
      case ActionType.sms:
        return 'SMS';
      case ActionType.whatsapp:
        return 'WHATSAPP';
      case ActionType.whatsappCall:
        return 'WHATSAPP_CALL';
    }
  }
  /// Create ActionLog from Firestore Map
  factory ActionLog.fromMap(Map<String, dynamic> map, String id) {
    // Handle Timestamp or String for executed_at
    DateTime executedAt;
    final dateVal = map['executed_at'];
    if (dateVal != null && dateVal.runtimeType.toString().contains('Timestamp')) {
      // Dynamic check to avoid importing cloud_firestore in domain
      executedAt = (dateVal as dynamic).toDate();
    } else if (dateVal is String) {
      executedAt = DateTime.parse(dateVal);
    } else {
      executedAt = DateTime.now(); // Fallback
    }

    return ActionLog(
      id: id,
      constituentId: map['constituent_id'] ?? '',
      constituentName: map['constituent_name'] ?? 'Unknown',
      actionType: actionTypeFromString(map['action_type'] ?? ''),
      executedAt: executedAt,
      executedBy: map['executed_by'] ?? '',
      success: map['success'] ?? false,
      messagePreview: map['message_preview'],
      durationSeconds: map['duration_seconds'],
    );
  }
}
