import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../entities/greeting_request.dart';

abstract class GreetingRepository {
  Future<Either<Failure, String>> generateGreeting(GreetingRequest request);
}
