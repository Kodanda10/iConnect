import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:get_it/get_it.dart';

import 'features/auth/data/repositories/firebase_auth_repository.dart';
import 'features/auth/domain/repositories/auth_repository.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';

import 'features/action/data/repositories/firebase_greeting_repository.dart';
import 'features/action/domain/repositories/greeting_repository.dart';
import 'features/action/presentation/bloc/greeting_bloc.dart';

import 'features/tasks/data/repositories/firestore_task_repository.dart';
import 'features/tasks/domain/repositories/task_repository.dart';
import 'features/tasks/presentation/bloc/task_bloc.dart';

import 'features/settings/data/repositories/firestore_settings_repository.dart';
import 'features/settings/domain/repositories/settings_repository.dart';
import 'features/settings/presentation/cubit/settings_cubit.dart';

final sl = GetIt.instance; // Service Locator

Future<void> init() async {
  //! Features - Auth
  // Bloc
  sl.registerFactory(() => AuthBloc(authRepository: sl()));

  // Repository
  sl.registerLazySingleton<AuthRepository>(
    () => FirebaseAuthRepository(firebaseAuth: sl(), firestore: sl()),
  );

  //! Features - Tasks
  // Bloc
  sl.registerFactory(() => TaskBloc(taskRepository: sl()));

  // Repository
  sl.registerLazySingleton<TaskRepository>(
    () => FirestoreTaskRepository(firestore: sl()),
  );

  //! Features - Action (Greetings)
  // Bloc
  sl.registerFactory(() => GreetingBloc(repository: sl()));

  // Repository
  sl.registerLazySingleton<GreetingRepository>(
    () => FirebaseGreetingRepository(functions: sl()),
  );

  //! Features - Settings
  // Cubit
  sl.registerFactory(() => SettingsCubit(repository: sl()));

  // Repository
  sl.registerLazySingleton<SettingsRepository>(
    () => FirestoreSettingsRepository(firestore: sl()),
  );

  //! External
  sl.registerLazySingleton(() => FirebaseAuth.instance);
  sl.registerLazySingleton(() => FirebaseFirestore.instance);
  sl.registerLazySingleton(() => FirebaseFunctions.instanceFor(region: 'asia-south1'));
}
