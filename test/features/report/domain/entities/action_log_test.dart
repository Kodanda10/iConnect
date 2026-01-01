import 'package:flutter_test/flutter_test.dart';
import 'package:iconnect_mobile/features/report/domain/entities/action_log.dart';

void main() {
  group('ActionLog', () {
    test('ActionType enum has correct values', () {
      expect(ActionType.values, contains(ActionType.whatsappCall));
    });

    group('actionTypeFromString', () {
      test('should return ActionType.whatsappCall when string is WHATSAPP_CALL', () {
        final result = ActionLog.actionTypeFromString('WHATSAPP_CALL');
        expect(result, ActionType.whatsappCall);
      });

      test('should return ActionType.whatsapp when string is WHATSAPP', () {
        final result = ActionLog.actionTypeFromString('WHATSAPP');
        expect(result, ActionType.whatsapp);
      });

      test('should return ActionType.sms as default', () {
        final result = ActionLog.actionTypeFromString('UNKNOWN');
        expect(result, ActionType.sms);
      });
    });

    group('actionTypeToString', () {
      test('should return WHATSAPP_CALL when type is ActionType.whatsappCall', () {
        final result = ActionLog.actionTypeToString(ActionType.whatsappCall);
        expect(result, 'WHATSAPP_CALL');
      });
    });
    
    // Add factory test
    group('fromMap', () {
      test('should correctly parse WHATSAPP_CALL action type', () {
        final map = {
          'constituent_id': '123',
          'constituent_name': 'Test User',
          'action_type': 'WHATSAPP_CALL',
          'executed_at': '2025-01-01T10:00:00.000',
          'executed_by': 'admin',
          'success': true,
        };
        
        final actionLog = ActionLog.fromMap(map, 'log_id_1');
        
        expect(actionLog.actionType, ActionType.whatsappCall);
      });
    });
  });
}
