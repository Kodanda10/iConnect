import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:iconnect_mobile/features/ticker/data/repositories/firestore_ticker_repository.dart';
import 'package:iconnect_mobile/features/ticker/domain/entities/ticker.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';

import 'firestore_ticker_repository_test.mocks.dart';

@GenerateMocks([FirebaseFirestore, FirebaseAuth, User, CollectionReference, DocumentReference, DocumentSnapshot])
void main() {
  late FirestoreTickerRepository repository;
  late MockFirebaseFirestore mockFirestore;
  late MockFirebaseAuth mockAuth;
  late MockUser mockUser;
  late MockCollectionReference<Map<String, dynamic>> mockCollection;
  late MockDocumentReference<Map<String, dynamic>> mockDoc;

  setUp(() {
    mockFirestore = MockFirebaseFirestore();
    mockAuth = MockFirebaseAuth();
    mockUser = MockUser();
    mockCollection = MockCollectionReference();
    mockDoc = MockDocumentReference();

    repository = FirestoreTickerRepository(firestore: mockFirestore, auth: mockAuth);

    // Mock Auth
    when(mockAuth.currentUser).thenReturn(mockUser);
    when(mockUser.uid).thenReturn('leader_123');
  });

  group('FirestoreTickerRepository', () {
    test('getActiveTicker emits MeetingTicker when document exists and is active', () {
      // Arrange
      final tickerData = {
        'title': 'Town Hall',
        'startTime': Timestamp.fromDate(DateTime(2025, 12, 25, 10, 0)),
        'meetUrl': 'https://meet.google.com/abc',
        'status': 'scheduled',
      };

      final mockSnapshot = MockDocumentSnapshot<Map<String, dynamic>>();
      when(mockSnapshot.exists).thenReturn(true);
      when(mockSnapshot.data()).thenReturn(tickerData);

      when(mockFirestore.collection('active_tickers')).thenReturn(mockCollection);
      when(mockCollection.doc('leader_123')).thenReturn(mockDoc);
      when(mockDoc.snapshots()).thenAnswer((_) => Stream.value(mockSnapshot));

      // Act
      final stream = repository.getActiveTicker();
      
      // Assert
      expect(
        stream,
        emits(
          isA<MeetingTicker>()
              .having((t) => t.title, 'title', 'Town Hall')
              .having((t) => t.status, 'status', 'scheduled')
              .having((t) => t.meetingType, 'meetingType', 'VIDEO_MEET')
        ),
      );
    });

    test('getActiveTicker correctly maps CONFERENCE_CALL type', () {
      // Arrange
      final tickerData = {
        'title': 'Emergency Sync',
        'startTime': Timestamp.now(),
        'status': 'live',
        'meetingType': 'CONFERENCE_CALL',
        'dialInNumber': '+918005551212',
        'accessCode': '4567',
      };

      final mockSnapshot = MockDocumentSnapshot<Map<String, dynamic>>();
      when(mockSnapshot.exists).thenReturn(true);
      when(mockSnapshot.data()).thenReturn(tickerData);

      when(mockFirestore.collection('active_tickers')).thenReturn(mockCollection);
      when(mockCollection.doc('leader_123')).thenReturn(mockDoc);
      when(mockDoc.snapshots()).thenAnswer((_) => Stream.value(mockSnapshot));

      // Act
      final stream = repository.getActiveTicker();

      // Assert
      expect(
        stream,
        emits(
          isA<MeetingTicker>()
              .having((t) => t.title, 'title', 'Emergency Sync')
              .having((t) => t.meetingType, 'meetingType', 'CONFERENCE_CALL')
              .having((t) => t.dialInNumber, 'dialInNumber', '+918005551212')
              .having((t) => t.accessCode, 'accessCode', '4567')
        ),
      );
    });

    test('getActiveTicker emits null when document does not exist', () {
      // Arrange
      final mockSnapshot = MockDocumentSnapshot<Map<String, dynamic>>();
      when(mockSnapshot.exists).thenReturn(false);
      when(mockSnapshot.data()).thenReturn(null);

      when(mockFirestore.collection('active_tickers')).thenReturn(mockCollection);
      when(mockCollection.doc('leader_123')).thenReturn(mockDoc);
      when(mockDoc.snapshots()).thenAnswer((_) => Stream.value(mockSnapshot));

      // Act
      final stream = repository.getActiveTicker();

      // Assert
      expect(stream, emits(null));
    });

    test('getActiveTicker emits null when status is concluded', () {
      // Arrange
      final tickerData = {
        'title': 'Town Hall',
        'startTime': Timestamp.now(),
        'status': 'concluded',
      };

      final mockSnapshot = MockDocumentSnapshot<Map<String, dynamic>>();
      when(mockSnapshot.exists).thenReturn(true);
      when(mockSnapshot.data()).thenReturn(tickerData);

      when(mockFirestore.collection('active_tickers')).thenReturn(mockCollection);
      when(mockCollection.doc('leader_123')).thenReturn(mockDoc);
      when(mockDoc.snapshots()).thenAnswer((_) => Stream.value(mockSnapshot));

      // Act
      final stream = repository.getActiveTicker();

      // Assert
      expect(stream, emits(null));
    });
  });
}
