import 'package:flutter_test/flutter_test.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:iconnect_mobile/features/tasks/data/models/task_model.dart';

class FakeDocumentSnapshot extends Fake implements DocumentSnapshot<Map<String, dynamic>> {
  final Map<String, dynamic> _data;
  @override
  final String id;

  FakeDocumentSnapshot(this.id, this._data);

  @override
  Map<String, dynamic> data() => _data;

  @override
  bool get exists => true;
}

void main() {
  group('TaskModel Persistence', () {
    test('should parse action flags correctly from Firestore (snake_case)', () {
      final data = {
        'constituent_id': 'c123',
        'type': 'BIRTHDAY',
        'status': 'PENDING',
        'due_date': Timestamp.fromDate(DateTime(2025, 12, 18)),
        'created_at': Timestamp.fromDate(DateTime(2025, 12, 17)),
        'call_sent': true,
        'sms_sent': false,
        'whatsapp_sent': true,
      };
      
      final mockDoc = FakeDocumentSnapshot('t123', data);
      final model = TaskModel.fromFirestore(mockDoc);

      expect(model.callSent, isTrue);
      expect(model.smsSent, isFalse);
      expect(model.whatsappSent, isTrue);
    });

    test('should parse legacy camelCase action flags', () {
      final data = {
        'constituentId': 'c123',
        'type': 'ANNIVERSARY',
        'status': 'COMPLETED',
        'dueDate': Timestamp.fromDate(DateTime(2025, 12, 18)),
        'createdAt': Timestamp.fromDate(DateTime(2025, 12, 17)),
        'callSent': true,
        'smsSent': true,
        'whatsappSent': false,
      };
      
      final mockDoc = FakeDocumentSnapshot('t456', data);
      final model = TaskModel.fromFirestore(mockDoc);

      expect(model.callSent, isTrue);
      expect(model.smsSent, isTrue);
      expect(model.whatsappSent, isFalse);
    });
  });
}
