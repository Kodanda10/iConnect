// Manual implementation of DefaultFirebaseOptions
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;
import 'package:flutter/foundation.dart' show defaultTargetPlatform, kIsWeb, TargetPlatform;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    // For mobile (Android/iOS), google-services.json/GoogleService-Info.plist are usually used.
    // If not found, you can add them here too. 
    // For this simulation, we prioritize Web.
    throw UnsupportedError(
      'DefaultFirebaseOptions are not supported for this platform.',
    );
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyAygMgePqu-C__yOoqDyqFHgnJ5Snr4Ic8',
    appId: '1:887016822564:web:dd5f49de3ef0138fe1c5b1',
    messagingSenderId: '887016822564',
    projectId: 'iconnect-crm',
    authDomain: 'iconnect-crm.firebaseapp.com',
    storageBucket: 'iconnect-crm.firebasestorage.app',
  );
}
