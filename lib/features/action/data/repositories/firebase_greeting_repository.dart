import 'package:cloud_functions/cloud_functions.dart';
import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/greeting_request.dart';
import '../../domain/repositories/greeting_repository.dart';

class FirebaseGreetingRepository implements GreetingRepository {
  final FirebaseFunctions _functions;

  FirebaseGreetingRepository({FirebaseFunctions? functions})
      : _functions = functions ?? FirebaseFunctions.instanceFor(region: 'asia-south1');

  @override
  Future<Either<Failure, String>> generateGreeting(GreetingRequest request) async {
    try {
      final callable = _functions.httpsCallable('generateGreeting');
      final result = await callable.call(request.toJson());
      
      final data = result.data as Map<String, dynamic>;
      if (data.containsKey('greeting')) {
        return Right(data['greeting'] as String);
      } else {
        return const Left(ServerFailure('Invalid response from AI service'));
      }
    } on FirebaseFunctionsException catch (e) {
      return Left(ServerFailure('AI Generation failed: ${e.message}'));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
