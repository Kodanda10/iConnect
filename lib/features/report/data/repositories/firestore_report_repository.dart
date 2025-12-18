
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:dartz/dartz.dart';
import '../../../../core/error/failures.dart';
import '../../domain/entities/day_summary.dart';
import '../../domain/entities/action_log.dart';
import '../../domain/repositories/report_repository.dart';

class FirestoreReportRepository implements ReportRepository {
  final FirebaseFirestore firestore;
  final FirebaseAuth auth;

  FirestoreReportRepository({
    required this.firestore,
    required this.auth,
  });

  @override
  Future<Either<Failure, List<DaySummary>>> getReportForDays(int days) async {
    try {
      final now = DateTime.now();
      final start = now.subtract(Duration(days: days));
      return getReportForDateRange(start, now);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<DaySummary>>> getReportForDateRange(
      DateTime start, DateTime end) async {
    try {
      final user = auth.currentUser;
      if (user == null) {
        return Left(ServerFailure('User not authenticated'));
      }

      final querySnapshot = await firestore
          .collection('action_logs')
          .where('executed_by', isEqualTo: user.uid)
          .where('executed_at', isGreaterThanOrEqualTo: start)
          .where('executed_at', isLessThanOrEqualTo: end)
          .orderBy('executed_at', descending: true)
          .get();

      // Group by Date (YYYY-MM-DD)
      final Map<String, List<ActionLog>> groupedLogs = {};
      
      for (var doc in querySnapshot.docs) {
        final data = doc.data();
        final action = ActionLog.fromMap(data, doc.id);
        
        final dateKey = action.executedAt.toLocal().toIso8601String().split('T')[0];
        
        if (!groupedLogs.containsKey(dateKey)) {
          groupedLogs[dateKey] = [];
        }
        groupedLogs[dateKey]!.add(action);
      }

      final List<DaySummary> summaries = groupedLogs.entries.map((entry) {
        return DaySummary(
          date: DateTime.parse(entry.key),
          actions: entry.value,
        );
      }).toList();

      // Sort by date descending
      summaries.sort((a, b) => b.date.compareTo(a.date));

      return Right(summaries);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, TodaySummaryStats>> getTodaySummary() async {
    try {
      final user = auth.currentUser;
      if (user == null) {
        return Left(ServerFailure('User not authenticated'));
      }

      final now = DateTime.now();
      final startOfDay = DateTime(now.year, now.month, now.day);
      final startTimestamp = Timestamp.fromDate(startOfDay);
      final nextDayTimestamp = Timestamp.fromDate(startOfDay.add(const Duration(days: 1)));

      // 1. Wishes Sent (Success = true)
      final wishesQuery = firestore
          .collection('action_logs')
          .where('executed_by', isEqualTo: user.uid)
          .where('executed_at', isGreaterThanOrEqualTo: startTimestamp)
          .where('success', isEqualTo: true)
          .count();
      
      // 2. Total Events (Tasks due today)
      // Note: due_date is Timestamp in Firestore
      final tasksQuery = firestore
          .collection('tasks')
          .where('due_date', isGreaterThanOrEqualTo: startTimestamp)
          .where('due_date', isLessThan: nextDayTimestamp)
          // We can't easily filter by uid unless tasks have it. 
          // Assuming we rely on client-side filtering or tasks are global/assigned.
          // If tasks have 'constituent_id', we might not filter by user here if shared.
          .count();

      // 3. Calls Made
      final callsQuery = firestore
          .collection('action_logs')
          .where('executed_by', isEqualTo: user.uid)
          .where('executed_at', isGreaterThanOrEqualTo: startTimestamp)
          .where('action_type', isEqualTo: 'call')
          .count();

      // 4. SMS Sent
      final smsQuery = firestore
          .collection('action_logs')
          .where('executed_by', isEqualTo: user.uid)
          .where('executed_at', isGreaterThanOrEqualTo: startTimestamp)
          .where('action_type', isEqualTo: 'sms')
          .count();
          
      // 5. WhatsApp Sent
      final whatsappQuery = firestore
          .collection('action_logs')
          .where('executed_by', isEqualTo: user.uid)
          .where('executed_at', isGreaterThanOrEqualTo: startTimestamp)
          .where('action_type', isEqualTo: 'whatsapp')
          .count();

      // Execute all in parallel
      final results = await Future.wait([
        wishesQuery.get(),
        tasksQuery.get(),
        callsQuery.get(),
        smsQuery.get(),
        whatsappQuery.get(),
      ]);

      return Right(TodaySummaryStats(
        wishesSent: results[0].count ?? 0,
        totalEvents: results[1].count ?? 0,
        callsMade: results[2].count ?? 0,
        smsCount: results[3].count ?? 0,
        whatsappCount: results[4].count ?? 0,
      ));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
