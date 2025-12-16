import 'package:dartz/dartz.dart';
import '../../../../../core/error/failures.dart';
import '../entities/ticker.dart';

abstract class TickerRepository {
  /// Stream of the active ticker for the current leader
  Stream<MeetingTicker?> getActiveTicker();
}
