import 'package:flutter_test/flutter_test.dart';
import 'package:iconnect_mobile/features/tasks/data/models/task_model.dart';
import 'package:iconnect_mobile/features/tasks/domain/entities/task.dart';

void main() {
  final tTaskModel = TaskModel(
    id: '1',
    constituentId: 'c1',
    // name/mobile not part of base Task/TaskModel
    type: 'CALL',
    status: 'PENDING',
    dueDate: DateTime.now(),
    createdAt: DateTime.now(),
    whatsappCallSent: true, 
  );

  group('TaskModel', () {
    test('should be a subclass of Task entity', () async {
      expect(tTaskModel, isA<Task>());
    });

    test('should return a valid model from JSON with whatsapp_call_sent', () async {
      final Map<String, dynamic> jsonMap = {
        'id': '1',
        'constituent_id': 'c1', 
        'type': 'CALL',
        'status': 'PENDING',
        'whatsapp_call_sent': true,
      };

      final result = TaskModel.fromMap(jsonMap, '1');
      expect(result.whatsappCallSent, true);
    });

    test('should return a valid model from JSON with camelCase fallback', () async {
      final Map<String, dynamic> jsonMap = {
        'id': '1',
        'constituent_id': 'c1',
        'type': 'CALL',
        'status': 'PENDING',
        'whatsappCallSent': true,
      };

      final result = TaskModel.fromMap(jsonMap, '1');
      expect(result.whatsappCallSent, true);
    });

    test('should return a JSON map containing whatsapp_call_sent', () async {
      final result = tTaskModel.toFirestore();
      expect(result['whatsapp_call_sent'], true);
    });
  });
}
