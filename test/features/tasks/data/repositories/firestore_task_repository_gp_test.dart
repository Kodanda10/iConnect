
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:iconnect_mobile/features/tasks/data/repositories/firestore_task_repository.dart';

// Mocks
class MockFirebaseFirestore extends Mock implements FirebaseFirestore {}
class MockFirebaseAuth extends Mock implements FirebaseAuth {}
class MockUser extends Mock implements User {}
class MockCollectionReference extends Mock implements CollectionReference<Map<String, dynamic>> {}
class MockDocumentReference extends Mock implements DocumentReference<Map<String, dynamic>> {}
class MockQuery extends Mock implements Query<Map<String, dynamic>> {}
class MockQuerySnapshot extends Mock implements QuerySnapshot<Map<String, dynamic>> {}
class MockQueryDocumentSnapshot extends Mock implements QueryDocumentSnapshot<Map<String, dynamic>> {}
class MockDocumentSnapshot extends Mock implements DocumentSnapshot<Map<String, dynamic>> {}

void main() {
  late FirestoreTaskRepository repository;
  late MockFirebaseFirestore mockFirestore;
  late MockFirebaseAuth mockAuth;
  late MockUser mockUser;
  late MockCollectionReference mockTasks;
  late MockCollectionReference mockConstituents;
  late MockQuery mockQuery;
  late MockQuerySnapshot mockQuerySnapshot;
  late MockDocumentReference mockDocRef;
  late MockDocumentSnapshot mockDocSnapshot;

  const tUserId = 'test_user_id';

  setUp(() {
    registerFallbackValue(Timestamp.now());
    
    mockFirestore = MockFirebaseFirestore();
    mockAuth = MockFirebaseAuth();
    mockUser = MockUser();
    mockTasks = MockCollectionReference();
    mockConstituents = MockCollectionReference();
    mockQuery = MockQuery();
    mockQuerySnapshot = MockQuerySnapshot();
    mockDocRef = MockDocumentReference();
    mockDocSnapshot = MockDocumentSnapshot();

    when(() => mockAuth.currentUser).thenReturn(mockUser);
    when(() => mockUser.uid).thenReturn(tUserId);

    // Setup collections
    when(() => mockFirestore.collection('tasks')).thenReturn(mockTasks);
    when(() => mockFirestore.collection('constituents')).thenReturn(mockConstituents);
    
    repository = FirestoreTaskRepository(firestore: mockFirestore, auth: mockAuth);
  });

  test('enrichTasks should fetch GP from gp_ulb in constituents when missing in task', () async {
    // 1. Arrange Task with Name but MISSING block/GP
    final mockTaskDoc = MockQueryDocumentSnapshot();
    when(() => mockTaskDoc.id).thenReturn('task1');
    when(() => mockTaskDoc.data()).thenReturn({
      'id': 'task1',
      'title': 'Birthday Wish',
      'date': Timestamp.now(),
      'status': 'PENDING',
      'constituent_id': 'c1',
      'constituent_name': 'Deepak Kumar Barik',
      'constituent_mobile': '6370502503',
      // 'gram_panchayat': MISSING
    });

    // Mock Query for tasks - GENERIC CATCH-ALL
    // This ensures that any .where() call returns mockQuery
    when(() => mockTasks.where(
      any(), 
      isEqualTo: any(named: 'isEqualTo'),
      isNotEqualTo: any(named: 'isNotEqualTo'),
      isLessThan: any(named: 'isLessThan'),
      isLessThanOrEqualTo: any(named: 'isLessThanOrEqualTo'),
      isGreaterThan: any(named: 'isGreaterThan'),
      isGreaterThanOrEqualTo: any(named: 'isGreaterThanOrEqualTo'),
      arrayContains: any(named: 'arrayContains'),
      whereIn: any(named: 'whereIn'),
      whereNotIn: any(named: 'whereNotIn'),
      isNull: any(named: 'isNull'),
    )).thenReturn(mockQuery);
    
    when(() => mockQuery.where(
      any(), 
      isEqualTo: any(named: 'isEqualTo'),
      isNotEqualTo: any(named: 'isNotEqualTo'),
      isLessThan: any(named: 'isLessThan'),
      isLessThanOrEqualTo: any(named: 'isLessThanOrEqualTo'),
      isGreaterThan: any(named: 'isGreaterThan'),
      isGreaterThanOrEqualTo: any(named: 'isGreaterThanOrEqualTo'),
      arrayContains: any(named: 'arrayContains'),
      whereIn: any(named: 'whereIn'),
      whereNotIn: any(named: 'whereNotIn'),
      isNull: any(named: 'isNull'),
    )).thenReturn(mockQuery);

    when(() => mockQuery.orderBy(any(), descending: any(named: 'descending'))).thenReturn(mockQuery);
    when(() => mockQuery.limit(any())).thenReturn(mockQuery);
    when(() => mockQuery.get()).thenAnswer((_) async => mockQuerySnapshot);
    when(() => mockQuerySnapshot.docs).thenReturn([mockTaskDoc]);

    // 2. Arrange Constituent with gp_ulb (Web Portal Style)
    final mockConstituentDoc = MockDocumentSnapshot();
    when(() => mockConstituents.doc('c1')).thenReturn(mockDocRef);
    when(() => mockDocRef.get()).thenAnswer((_) async => mockConstituentDoc);
    when(() => mockConstituentDoc.exists).thenReturn(true);
    when(() => mockConstituentDoc.data()).thenReturn({
      'name': 'Deepak Kumar Barik',
      'mobile': '6370502503',
      'gp_ulb': 'Dharmasala', // Web portal saves as gp_ulb
      'block': 'Dharmasala Block',
    });

    // Act
    final result = await repository.getPendingTasks();

    // Assert
    result.fold(
      (failure) => fail('Repository returned failure: ${failure.message}'),
      (tasks) {
        expect(tasks.length, 1);
        final task = tasks.first;
        expect(task.name, 'Deepak Kumar Barik');
        
        // This confirms the fix: It reads gp_ulb when gram_panchayat is missing
        expect(task.gramPanchayat, 'Dharmasala', reason: 'Should populate GP from gp_ulb in constituent');
        expect(task.block, 'Dharmasala Block');
      }
    );
  });
}
