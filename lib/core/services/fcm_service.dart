import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

/// FCMService handles Firebase Cloud Messaging for push notifications
/// 
/// Responsibilities:
/// - Request notification permissions
/// - Capture and sync FCM token to Firestore users/{uid}
/// - Handle foreground/background messages
/// 
/// @changelog
/// - 2025-12-17: Initial implementation for P0.2 System Integrity Fix
class FCMService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;
  
  static final FCMService _instance = FCMService._internal();
  factory FCMService() => _instance;
  FCMService._internal();
  
  /// Initialize FCM service - call after Firebase.initializeApp()
  Future<void> initialize() async {
    try {
      // 1. Request permission (iOS requires explicit request)
      final settings = await _messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      );
      
      if (settings.authorizationStatus == AuthorizationStatus.denied) {
        debugPrint('[FCM] Permission denied by user');
        return;
      }
      
      if (settings.authorizationStatus == AuthorizationStatus.notDetermined) {
        debugPrint('[FCM] Permission not determined');
        return;
      }
      
      debugPrint('[FCM] Permission granted: ${settings.authorizationStatus}');
      
      // 2. Get current token and sync to Firestore
      final token = await _messaging.getToken();
      await _syncTokenToFirestore(token);
      
      // 3. Listen for token refresh
      _messaging.onTokenRefresh.listen(_syncTokenToFirestore);
      
      // 4. Handle foreground messages
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
      
      // 5. Handle notification tap when app was in background
      FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpenedApp);
      
      debugPrint('[FCM] Initialization complete');
    } catch (e) {
      debugPrint('[FCM] Initialization error: $e');
    }
  }
  
  /// Sync FCM token to Firestore users collection
  Future<void> _syncTokenToFirestore(String? token) async {
    if (token == null) {
      debugPrint('[FCM] Token is null, skipping sync');
      return;
    }
    
    final uid = _auth.currentUser?.uid;
    if (uid == null) {
      debugPrint('[FCM] No authenticated user, skipping token sync');
      return;
    }
    
    try {
      await _firestore.collection('users').doc(uid).set({
        'fcmToken': token,
        'fcmTokenUpdatedAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
      
      debugPrint('[FCM] Token synced for user (redacted)');
    } catch (e) {
      debugPrint('[FCM] Token sync error: $e');
    }
  }
  
  /// Handle foreground messages (app is open)
  void _handleForegroundMessage(RemoteMessage message) {
    debugPrint('[FCM] Foreground message received');
    
    // TODO: Show local notification or update UI
    // For now, just log the message
    if (message.notification != null) {
      debugPrint('[FCM] Title: (redacted)');
      debugPrint('[FCM] Body: (redacted)');
    }
  }
  
  /// Handle when user taps notification (app was in background)
  void _handleMessageOpenedApp(RemoteMessage message) {
    debugPrint('[FCM] Message opened app (redacted)');
    
    // TODO: Navigate to relevant screen based on message data
    // For now, just log
    if (message.data.isNotEmpty) {
      debugPrint('[FCM] Data keys: ${message.data.keys}');
    }
  }
  
  /// Manual token sync (call after login)
  Future<void> syncToken() async {
    final token = await _messaging.getToken();
    await _syncTokenToFirestore(token);
  }
}

/// Background message handler - must be top-level function
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('[FCM] Background message received');
  // Handle background message
  // Note: Cannot use context-dependent operations here
}
