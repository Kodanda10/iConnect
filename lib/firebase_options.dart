// Manual implementation of DefaultFirebaseOptions
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
      case TargetPlatform.windows:
      case TargetPlatform.linux:
      default:
        throw UnsupportedError(
          'DefaultFirebaseOptions are not supported for this platform.',
        );
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyAygMgePqu-C__yOoqDyqFHgnJ5Snr4Ic8',
    appId: '1:887016822564:web:dd5f49de3ef0138fe1c5b1',
    messagingSenderId: '887016822564',
    projectId: 'iconnect-crm',
    authDomain: 'iconnect-crm.firebaseapp.com',
    storageBucket: 'iconnect-crm.firebasestorage.app',
  );

  // Android config - uses same Firebase project
  // Note: For production, download google-services.json from Firebase Console
  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAygMgePqu-C__yOoqDyqFHgnJ5Snr4Ic8',
    appId: '1:887016822564:android:iconnect_mobile_android',
    messagingSenderId: '887016822564',
    projectId: 'iconnect-crm',
    storageBucket: 'iconnect-crm.firebasestorage.app',
  );

  // iOS config - uses same Firebase project
  // Note: For production, download GoogleService-Info.plist from Firebase Console
  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAygMgePqu-C__yOoqDyqFHgnJ5Snr4Ic8',
    appId: '1:887016822564:ios:iconnect_mobile_ios',
    messagingSenderId: '887016822564',
    projectId: 'iconnect-crm',
    storageBucket: 'iconnect-crm.firebasestorage.app',
    iosBundleId: 'com.iconnect.iconnectMobile',
  );
}
