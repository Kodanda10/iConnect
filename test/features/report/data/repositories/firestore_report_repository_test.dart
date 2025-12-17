
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:iconnect_mobile/features/report/data/repositories/firestore_report_repository.dart';
import 'package:iconnect_mobile/features/report/domain/repositories/report_repository.dart';

class MockFirebaseFirestore extends Mock implements FirebaseFirestore {}
class MockCollectionReference extends Mock implements CollectionReference<Map<String, dynamic>> {}
class MockQuery extends Mock implements Query<Map<String, dynamic>> {}
class MockQuerySnapshot extends Mock implements QuerySnapshot<Map<String, dynamic>> {}
class MockQueryDocumentSnapshot extends Mock implements QueryDocumentSnapshot<Map<String, dynamic>> {}
class MockAggregateQuery extends Mock implements AggregateQuery {}
class MockAggregateQuerySnapshot extends Mock implements AggregateQuerySnapshot {}

void main() {
  late FirestoreReportRepository repository;
  late MockFirebaseFirestore mockFirestore;
  late MockCollectionReference mockActionLogs;
  late MockCollectionReference mockTasks;
  late MockQuery mockQuery;
  late MockAggregateQuery mockAggregateQuery;
  late MockAggregateQuerySnapshot mockAggregateSnapshot;
  late MockQuerySnapshot mockQuerySnapshot;

  setUp(() {
    mockFirestore = MockFirebaseFirestore();
    mockActionLogs = MockCollectionReference();
    mockTasks = MockCollectionReference();
    mockQuery = MockQuery();
    mockAggregateQuery = MockAggregateQuery();
    mockAggregateSnapshot = MockAggregateQuerySnapshot();
    mockQuerySnapshot = MockQuerySnapshot();

    when(() => mockFirestore.collection('action_logs')).thenReturn(mockActionLogs);
    when(() => mockFirestore.collection('tasks')).thenReturn(mockTasks);
    
    repository = FirestoreReportRepository(firestore: mockFirestore);
  });

  group('getTodaySummary', () {
    test('returns correct stats using aggregation queries', () async {
      // Arrange
      // Mock Action Logs counts
      // We need to leniently match any 'where' call to return mockQuery
      // Because where returns a Query, and subsequent where calls are on Query
      
      // Mock CollectionReference.where -> Query
      when(() => mockActionLogs.where(
        any(), 
        isGreaterThanOrEqualTo: any(named: 'isGreaterThanOrEqualTo'),
        isLessThanOrEqualTo: any(named: 'isLessThanOrEqualTo'),
        isEqualTo: any(named: 'isEqualTo'),
      )).thenReturn(mockQuery);

      // Mock Query.where -> Query (chaining)
      when(() => mockQuery.where(
        any(), 
        isGreaterThanOrEqualTo: any(named: 'isGreaterThanOrEqualTo'),
        isLessThanOrEqualTo: any(named: 'isLessThanOrEqualTo'),
        isEqualTo: any(named: 'isEqualTo')
      )).thenReturn(mockQuery);
      
      when(() => mockTasks.where(
        any(),
        isEqualTo: any(named: 'isEqualTo'),
        isGreaterThanOrEqualTo: any(named: 'isGreaterThanOrEqualTo'), 
        isLessThanOrEqualTo: any(named: 'isLessThanOrEqualTo'),
      )).thenReturn(mockQuery);

      when(() => mockQuery.count()).thenReturn(mockAggregateQuery);
      when(() => mockAggregateQuery.get()).thenAnswer((_) async => mockAggregateSnapshot);
      when(() => mockAggregateSnapshot.count).thenReturn(5);

      // Act
      final result = await repository.getTodaySummary();

      // Assert
      expect(result.isRight(), true);
    });
  });

  group('getReportForDays', () {
    test('returns list of DaySummary grouped by date', () async {
      // Arrange
      final now = DateTime.now();
      
      // Mock QuerySnapshot with some docs
      final mockDoc1 = MockQueryDocumentSnapshot();
      when(() => mockDoc1.id).thenReturn('1');
      when(() => mockDoc1.data()).thenReturn({
        'id': '1', // legacy
        'action_type': 'CALL',
        'executed_at': Timestamp.fromDate(now),
        'success': true,
        'constituent_id': 'c1'
      });
      
      final mockDoc2 = MockQueryDocumentSnapshot();
      when(() => mockDoc2.id).thenReturn('2');
      when(() => mockDoc2.data()).thenReturn({
        'id': '2',
        'action_type': 'SMS',
        'executed_at': Timestamp.fromDate(now.subtract(const Duration(days: 1))),
        'success': false,
        'constituent_id': 'c2'
      });

      // 1. collection.where('executed_at', isGreaterThanOrEqualTo: start)
      when(() => mockActionLogs.where(
        any(), 
        isGreaterThanOrEqualTo: any(named: 'isGreaterThanOrEqualTo'),
      )).thenReturn(mockQuery); 

      // 2. query.where('executed_at', isLessThanOrEqualTo: end)
      when(() => mockQuery.where(
        any(),
        isLessThanOrEqualTo: any(named: 'isLessThanOrEqualTo'),
      )).thenReturn(mockQuery);

      when(() => mockQuery.orderBy(any())).thenReturn(mockQuery); // assuming we order by date
      when(() => mockQuery.get()).thenAnswer((_) async => mockQuerySnapshot);
      when(() => mockQuerySnapshot.docs).thenReturn([mockDoc1, mockDoc2]);

      // Act
      final result = await repository.getReportForDays(7);

      // Assert
      result.fold(
        (l) => fail('Returned Failure: ${l.message}'),
        (summaries) {
          expect(summaries.length, 2); // 2 distinct days
          expect(summaries.first.actions.length, 1);
        }
      );
    });
  });
}
