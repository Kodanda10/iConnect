import 'package:flutter_test/flutter_test.dart';
import 'package:dartz/dartz.dart';
import 'package:iconnect_mobile/features/settings/presentation/cubit/settings_cubit.dart';
import 'package:iconnect_mobile/features/settings/presentation/cubit/settings_state.dart';
import 'package:iconnect_mobile/features/settings/domain/repositories/settings_repository.dart';
import 'package:iconnect_mobile/features/settings/domain/entities/app_settings.dart';
import 'package:iconnect_mobile/core/error/failures.dart';

// Fake Repository
class FakeSettingsRepository implements SettingsRepository {
  bool shouldFail = false;

  @override
  Future<Either<Failure, AppSettings>> getSettings() async {
    if (shouldFail) {
      return Left(ServerFailure('Test Error'));
    }
    return Right(const AppSettings(
      appName: 'Test App',
      leaderName: 'Test Leader',
    ));
  }
}

void main() {
  group('SettingsCubit', () {
    late SettingsCubit cubit;
    late FakeSettingsRepository repository;

    setUp(() {
      repository = FakeSettingsRepository();
      cubit = SettingsCubit(repository: repository);
    });

    tearDown(() {
      cubit.close();
    });

    test('initial state is SettingsInitial', () {
      expect(cubit.state, equals(SettingsInitial()));
    });

    test('emits [SettingsLoading, SettingsLoaded] when loadSettings succeeds', () async {
      final expected = [
        SettingsLoading(),
        isA<SettingsLoaded>().having((s) => s.settings.appName, 'appName', 'Test App'),
      ];

      expectLater(cubit.stream, emitsInOrder(expected));

      await cubit.loadSettings();
    });

    test('emits [SettingsLoading, SettingsError] when loadSettings fails', () async {
      repository.shouldFail = true;
      final expected = [
        SettingsLoading(),
        const SettingsError('Test Error'),
      ];

      expectLater(cubit.stream, emitsInOrder(expected));

      await cubit.loadSettings();
    });
  });
}
