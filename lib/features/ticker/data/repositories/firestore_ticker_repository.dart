import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../domain/entities/ticker.dart';
import '../../domain/repositories/ticker_repository.dart';

class FirestoreTickerRepository implements TickerRepository {
  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;

  FirestoreTickerRepository({
    required FirebaseFirestore firestore,
    required FirebaseAuth auth,
  })  : _firestore = firestore,
        _auth = auth;

  @override
  Stream<MeetingTicker?> getActiveTicker() {
    final uid = _auth.currentUser?.uid;
    // Fallback ID for demo if not logged in or specific user
    // In production, strictly use uid
    final targetUid = uid ?? 'leader_pranab'; 

    return _firestore
        .collection('active_tickers')
        .doc(targetUid)
        .snapshots()
        .map((snapshot) {
      if (!snapshot.exists || snapshot.data() == null) {
        return null;
      }
      
      final data = snapshot.data()!;
      // Basic validation
      if (!data.containsKey('title') || !data.containsKey('startTime')) {
        return null;
      }
      
      final status = data['status'] as String? ?? 'scheduled';
      // Auto-hide if concluded
      if (status == 'concluded') return null;

      return MeetingTicker(
        title: data['title'] as String,
        startTime: (data['startTime'] as Timestamp).toDate(),
        meetUrl: data['meetUrl'] as String? ?? '',
        status: status,
        meetingType: data['meetingType'] as String? ?? 'VIDEO_MEET',
        dialInNumber: data['dialInNumber'] as String? ?? '',
        accessCode: data['accessCode'] as String? ?? '',
      );
    });
  }
}
