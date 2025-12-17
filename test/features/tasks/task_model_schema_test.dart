import 'package:flutter_test/flutter_test.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:mockito/mockito.dart';
import 'package:iconnect_mobile/features/tasks/data/models/task_model.dart';

/// TDD Test: Schema Standardization P0.1
/// Backend writes snake_case, Mobile must parse snake_case
/// 
/// MockDocumentSnapshot for testing without Firestore dependency
class MockDocumentSnapshot extends Mock implements DocumentSnapshot<Map<String, dynamic>> {
  final String _id;
  final Map<String, dynamic> _data;

  MockDocumentSnapshot(this._id, this._data);

  @override
  String get id => _id;

  @override
  Map<String, dynamic>? data() => _data;
}

void main() {
  group('TaskModel Schema Standardization', () {
    test('fromFirestore parses snake_case constituent_id field', () {
      // ARRANGE: Backend writes snake_case
      final mockDoc = MockDocumentSnapshot('task1', {
        'constituent_id': 'constituent_abc123',
        'type': 'BIRTHDAY',
        'status': 'PENDING',
        'due_date': Timestamp.fromDate(DateTime(2025, 12, 18)),
        'created_at': Timestamp.fromDate(DateTime(2025, 12, 17)),
      });

      // ACT: Mobile reads
      final task = TaskModel.fromFirestore(mockDoc);

      // ASSERT: Should parse correctly
      expect(task.constituentId, 'constituent_abc123');
      expect(task.type, 'BIRTHDAY');
      expect(task.status, 'PENDING');
    });

    test('fromFirestore parses snake_case due_date field', () {
      // ARRANGE: Backend writes snake_case
      final mockDoc = MockDocumentSnapshot('task2', {
        'constituent_id': 'xyz',
        'type': 'ANNIVERSARY',
        'status': 'COMPLETED',
        'due_date': Timestamp.fromDate(DateTime(2025, 7, 22)),
        'created_at': Timestamp.fromDate(DateTime(2025, 7, 20)),
      });

      // ACT
      final task = TaskModel.fromFirestore(mockDoc);

      // ASSERT
      expect(task.dueDate.month, 7);
      expect(task.dueDate.day, 22);
    });

    test('fromFirestore parses snake_case created_at field', () {
      // ARRANGE
      final mockDoc = MockDocumentSnapshot('task3', {
        'constituent_id': 'abc',
        'type': 'BIRTHDAY',
        'status': 'PENDING',
        'due_date': Timestamp.fromDate(DateTime(2025, 3, 15)),
        'created_at': Timestamp.fromDate(DateTime(2025, 3, 10, 14, 30)),
      });

      // ACT
      final task = TaskModel.fromFirestore(mockDoc);

      // ASSERT
      expect(task.createdAt.day, 10);
      expect(task.createdAt.hour, 14);
    });

    test('toFirestore writes snake_case fields', () {
      // ARRANGE
      final task = TaskModel(
        id: 'task1',
        constituentId: 'abc123',
        type: 'BIRTHDAY',
        status: 'PENDING',
        dueDate: DateTime(2025, 12, 18),
        createdAt: DateTime(2025, 12, 17),
      );

      // ACT
      final data = task.toFirestore();

      // ASSERT: Should write snake_case for consistency
      expect(data.containsKey('constituent_id'), isTrue);
      expect(data.containsKey('due_date'), isTrue);
      expect(data.containsKey('created_at'), isTrue);
      // Should NOT contain camelCase
      expect(data.containsKey('constituentId'), isFalse);
      expect(data.containsKey('dueDate'), isFalse);
      expect(data.containsKey('createdAt'), isFalse);
    });
  });
}
