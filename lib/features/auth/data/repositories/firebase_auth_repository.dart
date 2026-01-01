import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/auth_user.dart';
import '../../domain/repositories/auth_repository.dart';

class FirebaseAuthRepository implements AuthRepository {
  final FirebaseAuth _firebaseAuth;
  final FirebaseFirestore _firestore;

  FirebaseAuthRepository({
    FirebaseAuth? firebaseAuth,
    FirebaseFirestore? firestore,
  })  : _firebaseAuth = firebaseAuth ?? FirebaseAuth.instance,
        _firestore = firestore ?? FirebaseFirestore.instance;

  @override
  Future<Either<Failure, AuthUser>> login(String email, String password) async {
    try {
      final userCredential = await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      final user = userCredential.user;
      if (user == null) {
        return const Left(AuthFailure('Login failed: User is null'));
      }

      // Fetch user role from Firestore
      final userDoc = await _firestore.collection('users').doc(user.uid).get();
      String role = 'STAFF'; // Default
      String? name;

      if (userDoc.exists) {
        final data = userDoc.data();
        if (data != null) {
          role = data['role'] ?? 'STAFF';
          name = data['name'];
        }
      }

      return Right(AuthUser(
        id: user.uid,
        email: user.email!,
        name: name,
        role: role,
      ));
    } on FirebaseAuthException catch (e) {
      return Left(AuthFailure(_mapFirebaseError(e.code)));
    } catch (e) {
      return Left(AuthFailure(_mapFirebaseError(e.toString())));
    }
  }

  /// Maps Firebase auth error codes to user-friendly messages
  String _mapFirebaseError(String code) {
    switch (code) {
      case 'user-not-found':
        return 'No account found with this email. Please check your email or sign up.';
      case 'wrong-password':
        return 'Incorrect password. Please try again.';
      case 'invalid-email':
        return 'Please enter a valid email address.';
      case 'user-disabled':
        return 'This account has been disabled. Contact support.';
      case 'too-many-requests':
        return 'Too many login attempts. Please try again later.';
      case 'network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'invalid-credential':
        return 'Invalid email or password. Please try again.';
      default:
        if (code.contains('invalid-credential') || code.contains('INVALID_LOGIN_CREDENTIALS')) {
          return 'Invalid email or password. Please try again.';
        }
        return 'Login failed. Please check your credentials and try again.';
    }
  }

  @override
  Future<Either<Failure, void>> logout() async {
    try {
      await _firebaseAuth.signOut();
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, AuthUser>> getCurrentUser() async {
    try {
      final user = _firebaseAuth.currentUser;
      if (user == null) {
        return const Left(AuthFailure('No user logged in'));
      }

      // We might want to cache the role or fetch it again
      // For now, let's fetch it to be safe, or we could store it in local storage
      // Optimization: For now, just fetching.
      final userDoc = await _firestore.collection('users').doc(user.uid).get();
      String role = 'STAFF';
      String? name;

      if (userDoc.exists) {
        final data = userDoc.data();
        if (data != null) {
          role = data['role'] ?? 'STAFF';
          name = data['name'];
        }
      }

      return Right(AuthUser(
        id: user.uid,
        email: user.email!,
        name: name,
        role: role,
      ));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
