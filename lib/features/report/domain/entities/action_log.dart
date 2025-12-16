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
    }
  }
}
