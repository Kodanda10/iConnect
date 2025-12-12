import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/app_settings.dart';
import '../../domain/repositories/settings_repository.dart';

class FirestoreSettingsRepository implements SettingsRepository {
  final FirebaseFirestore _firestore;

  FirestoreSettingsRepository({FirebaseFirestore? firestore}) 
      : _firestore = firestore ?? FirebaseFirestore.instance;

  @override
  Future<Either<Failure, AppSettings>> getSettings() async {
    try {
      final doc = await _firestore.collection('settings').doc('app_config').get();
      if (doc.exists && doc.data() != null) {
        final data = doc.data()!;
        return Right(AppSettings(
          appName: data['appName'] ?? 'AC Connect',
          leaderName: data['leaderName'] ?? 'Pranab Kumar Balabantaray',
          headerImageUrl: data['headerImageUrl'],
        ));
      } else {
        return Right(AppSettings.defaults());
      }
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
