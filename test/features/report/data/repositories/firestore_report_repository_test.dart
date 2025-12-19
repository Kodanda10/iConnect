
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:iconnect_mobile/features/report/data/repositories/firestore_report_repository.dart';

class MockFirebaseFirestore extends Mock implements FirebaseFirestore {}
class MockFirebaseAuth extends Mock implements FirebaseAuth {}
class MockUser extends Mock implements User {}
class MockCollectionReference extends Mock implements CollectionReference<Map<String, dynamic>> {}
class MockQuery extends Mock implements Query<Map<String, dynamic>> {}
class MockQuerySnapshot extends Mock implements QuerySnapshot<Map<String, dynamic>> {}
class MockQueryDocumentSnapshot extends Mock implements QueryDocumentSnapshot<Map<String, dynamic>> {}
class MockAggregateQuery extends Mock implements AggregateQuery {}
class MockAggregateQuerySnapshot extends Mock implements AggregateQuerySnapshot {}

void main() {
  late FirestoreReportRepository repository;
  late MockFirebaseFirestore mockFirestore;
  late MockFirebaseAuth mockAuth;
  late MockUser mockUser;
  late MockCollectionReference mockActionLogs;
  late MockCollectionReference mockTasks;
  late MockQuery mockQuery;
  late MockAggregateQuery mockAggregateQuery;
  late MockAggregateQuerySnapshot mockAggregateSnapshot;
  late MockQuerySnapshot mockQuerySnapshot;

  const tUserId = 'test_user_id';

  setUp(() {
    mockFirestore = MockFirebaseFirestore();
    mockAuth = MockFirebaseAuth();
    mockUser = MockUser();
    mockActionLogs = MockCollectionReference();
    mockTasks = MockCollectionReference();
    mockQuery = MockQuery();
    mockAggregateQuery = MockAggregateQuery();
    mockAggregateSnapshot = MockAggregateQuerySnapshot();
    mockQuerySnapshot = MockQuerySnapshot();

    when(() => mockAuth.currentUser).thenReturn(mockUser);
    when(() => mockUser.uid).thenReturn(tUserId);

    when(() => mockFirestore.collection('action_logs')).thenReturn(mockActionLogs);
    when(() => mockFirestore.collection('tasks')).thenReturn(mockTasks);
    
    repository = FirestoreReportRepository(firestore: mockFirestore, auth: mockAuth);
  });

  group('getTodaySummary', () {
    test('returns correct stats using aggregation queries', () async {
      // Mock CollectionReference.where -> Query
      // The actual code chains multiple where() calls, so mock needs to return mockQuery
      // for any where() invocation on both CollectionReference and Query
      
      when(() => mockActionLogs.where(
        any(), 
        isEqualTo: any(named: 'isEqualTo'),
        isGreaterThanOrEqualTo: any(named: 'isGreaterThanOrEqualTo'),
        isLessThanOrEqualTo: any(named: 'isLessThanOrEqualTo'),
        isLessThan: any(named: 'isLessThan'),
      )).thenReturn(mockQuery);

      when(() => mockTasks.where(
        any(),
        isEqualTo: any(named: 'isEqualTo'),
        isGreaterThanOrEqualTo: any(named: 'isGreaterThanOrEqualTo'), 
        isLessThanOrEqualTo: any(named: 'isLessThanOrEqualTo'),
        isLessThan: any(named: 'isLessThan'),
      )).thenReturn(mockQuery);

      // Mock chainable where calls on Query (for chained .where().where() patterns)
      when(() => mockQuery.where(
        any(), 
        isEqualTo: any(named: 'isEqualTo'),
        isGreaterThanOrEqualTo: any(named: 'isGreaterThanOrEqualTo'),
        isLessThanOrEqualTo: any(named: 'isLessThanOrEqualTo'),
        isLessThan: any(named: 'isLessThan'),
      )).thenReturn(mockQuery);

      // Mock count() and get() for aggregation
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
        'id': '1', 
        'action_type': 'CALL',
        'executed_at': Timestamp.fromDate(now),
        'success': true,
        'constituent_id': 'c1',
        'executed_by': tUserId,
      });
      
      final mockDoc2 = MockQueryDocumentSnapshot();
      when(() => mockDoc2.id).thenReturn('2');
      when(() => mockDoc2.data()).thenReturn({
        'id': '2',
        'action_type': 'SMS',
        'executed_at': Timestamp.fromDate(now.subtract(const Duration(days: 1))),
        'success': false,
        'constituent_id': 'c2',
        'executed_by': tUserId,
      });

      // 1. collection.where calls - including executed_by
      when(() => mockActionLogs.where(
        any(), 
        isEqualTo: any(named: 'isEqualTo'),
        isGreaterThanOrEqualTo: any(named: 'isGreaterThanOrEqualTo'),
      )).thenReturn(mockQuery); 

      // 2. query.where chains
      when(() => mockQuery.where(
        any(),
        isEqualTo: any(named: 'isEqualTo'),
        isGreaterThanOrEqualTo: any(named: 'isGreaterThanOrEqualTo'),
        isLessThanOrEqualTo: any(named: 'isLessThanOrEqualTo'),
      )).thenReturn(mockQuery);

      when(() => mockQuery.orderBy(any(), descending: any(named: 'descending'))).thenReturn(mockQuery);
      when(() => mockQuery.get()).thenAnswer((_) async => mockQuerySnapshot);
      when(() => mockQuerySnapshot.docs).thenReturn([mockDoc1, mockDoc2]);

      // Act
      final result = await repository.getReportForDays(7);

      // Assert
      result.fold(
        (l) => fail('Returned Failure: ${l.message}'),
        (summaries) {
          expect(summaries.length, 2); 
          expect(summaries.first.actions.length, 1);
        }
      );
    });
  });
}
