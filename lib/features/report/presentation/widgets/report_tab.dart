import 'package:dartz/dartz.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/glass_card.dart';
import '../../../../injection_container.dart' as di;
import '../../domain/entities/action_log.dart';
import '../../domain/entities/day_summary.dart';
import '../../domain/repositories/report_repository.dart';
import '../bloc/report_bloc.dart';
import '../bloc/report_event.dart';
import '../bloc/report_state.dart';

class ReportTab extends StatefulWidget {
  const ReportTab({super.key});

  @override
  State<ReportTab> createState() => _ReportTabState();
}

class _ReportTabState extends State<ReportTab> {
  late final ScrollController _scrollController;

  TodaySummaryStats? _todayStats;
  List<ActionLog> _todayActions = const [];
  String? _todayError;
  bool _loadingToday = true;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController()..addListener(_onScroll);
    _loadToday();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    final pos = _scrollController.position;
    if (pos.pixels >= pos.maxScrollExtent - 240) {
      final reportState = context.read<ReportBloc>().state;
      if (reportState is ReportLoaded &&
          reportState.hasMore &&
          !reportState.loadingMore) {
        context.read<ReportBloc>().add(LoadMoreReport());
      }
    }
  }

  Future<void> _loadToday() async {
    setState(() {
      _loadingToday = true;
      _todayError = null;
    });

    final repo = di.sl<ReportRepository>();
    final now = DateTime.now();
    final startOfDay = DateTime(now.year, now.month, now.day);
    final endOfDay = DateTime(now.year, now.month, now.day, 23, 59, 59, 999);

    final results = await Future.wait([
      repo.getTodaySummary(),
      repo.getReportForDateRange(startOfDay, endOfDay),
    ]);

    final Either<Failure, TodaySummaryStats> statsEither =
        results[0] as Either<Failure, TodaySummaryStats>;
    final Either<Failure, List<DaySummary>> todayEither =
        results[1] as Either<Failure, List<DaySummary>>;

    statsEither.fold((l) => _todayError = l.message, (r) => _todayStats = r);

    todayEither.fold((l) => _todayError ??= l.message, (summaries) {
      final todayKey = startOfDay.toIso8601String().split('T')[0];
      final todaySummary = summaries
          .where((s) => s.date.toIso8601String().startsWith(todayKey))
          .toList();
      _todayActions = todaySummary.isNotEmpty
          ? todaySummary.first.actions
          : const [];
    });

    if (mounted) {
      setState(() {
        _loadingToday = false;
      });
    }
  }

  Future<void> _refreshAll() async {
    await _loadToday();
    context.read<ReportBloc>().add(const RefreshReport());
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      color: AppColors.primary,
      backgroundColor: Colors.white,
      onRefresh: _refreshAll,
      child: CustomScrollView(
        controller: _scrollController,
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
            sliver: SliverToBoxAdapter(child: _buildTodayCard()),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
            sliver: SliverToBoxAdapter(child: _buildTodayActions()),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
            sliver: BlocBuilder<ReportBloc, ReportState>(
              builder: (context, state) {
                if (state is ReportLoading) {
                  return const SliverToBoxAdapter(
                    child: Center(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: CircularProgressIndicator(),
                      ),
                    ),
                  );
                }
                if (state is ReportError) {
                  return SliverToBoxAdapter(
                    child: GlassCard(
                      overlayGradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          AppColors.error.withOpacity(0.18),
                          Colors.transparent,
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'History',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            state.message,
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.8),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }
                if (state is! ReportLoaded) {
                  return const SliverToBoxAdapter(child: SizedBox.shrink());
                }

                final items = state.daySummaries;
                return SliverList.separated(
                  itemCount: items.length + (state.loadingMore ? 1 : 0),
                  separatorBuilder: (_, __) => const SizedBox(height: 14),
                  itemBuilder: (context, index) {
                    if (index >= items.length) {
                      return const Padding(
                        padding: EdgeInsets.symmetric(vertical: 16),
                        child: Center(child: CircularProgressIndicator()),
                      );
                    }
                    return _DaySummaryCard(summary: items[index]);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTodayCard() {
    if (_loadingToday) {
      return const GlassCard(
        child: SizedBox(
          height: 92,
          child: Center(child: CircularProgressIndicator()),
        ),
      );
    }

    if (_todayError != null) {
      return GlassCard(
        overlayGradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [AppColors.error.withOpacity(0.18), Colors.transparent],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Today',
              style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _todayError!,
              style: TextStyle(color: Colors.white.withOpacity(0.8)),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: _loadToday,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                ),
              ),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    final stats =
        _todayStats ??
        const TodaySummaryStats(
          wishesSent: 0,
          totalEvents: 0,
          callsMade: 0,
          smsCount: 0,
          whatsappCount: 0,
        );

    return GlassCard(
      overlayGradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          AppColors.primary.withOpacity(0.18),
          AppColors.secondary.withOpacity(0.12),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Today',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _MetricTile(
                  label: 'Wishes Sent',
                  value: '${stats.wishesSent}',
                  accent: AppColors.primary,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _MetricTile(
                  label: 'Total Events',
                  value: '${stats.totalEvents}',
                  accent: AppColors.secondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _MiniChip(
                icon: Icons.call,
                label: 'Call',
                value: stats.callsMade,
                color: AppColors.primaryLight,
              ),
              _MiniChip(
                icon: Icons.message,
                label: 'SMS',
                value: stats.smsCount,
                color: AppColors.secondary,
              ),
              _MiniChip(
                icon: Icons.chat_bubble,
                label: 'WhatsApp',
                value: stats.whatsappCount,
                color: AppColors.success,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTodayActions() {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      blurSigma: 0,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Actions Taken',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              if (!_loadingToday)
                Text(
                  '${_todayActions.length}',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.75),
                    fontWeight: FontWeight.w800,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),
          if (_loadingToday)
            Text(
              'Loading…',
              style: TextStyle(color: Colors.white.withOpacity(0.7)),
            )
          else if (_todayActions.isEmpty)
            Text(
              'No wishes sent yet today',
              style: TextStyle(
                color: Colors.white.withOpacity(0.7),
                height: 1.35,
              ),
            )
          else
            ..._todayActions.map((a) => _ActionRow(action: a)),
        ],
      ),
    );
  }
}

class _MetricTile extends StatelessWidget {
  final String label;
  final String value;
  final Color accent;

  const _MetricTile({
    required this.label,
    required this.value,
    required this.accent,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.10),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: Colors.white.withOpacity(0.14)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Colors.white.withOpacity(0.75),
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w900,
              shadows: [
                Shadow(color: accent.withOpacity(0.25), blurRadius: 10),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _MiniChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final int value;
  final Color color;

  const _MiniChip({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.18),
        borderRadius: BorderRadius.circular(AppRadius.full),
        border: Border.all(color: color.withOpacity(0.35)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.white),
          const SizedBox(width: 8),
          Text(
            '$label • $value',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionRow extends StatelessWidget {
  final ActionLog action;

  const _ActionRow({required this.action});

  @override
  Widget build(BuildContext context) {
    final time = DateFormat('jm').format(action.executedAt);
    final typeLabel = ActionLog.actionTypeToString(action.actionType);
    final icon = switch (action.actionType) {
      ActionType.call => Icons.call,
      ActionType.sms => Icons.message,
      ActionType.whatsapp => Icons.chat_bubble,
    };
    final accent = switch (action.actionType) {
      ActionType.call => AppColors.primaryLight,
      ActionType.sms => AppColors.secondary,
      ActionType.whatsapp => AppColors.success,
    };

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: accent.withOpacity(0.18),
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(color: accent.withOpacity(0.35)),
            ),
            child: Icon(icon, size: 16, color: Colors.white),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              '${action.constituentName} — $typeLabel',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 13,
                fontWeight: FontWeight.w700,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 10),
          Text(
            time,
            style: TextStyle(
              color: Colors.white.withOpacity(0.65),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _DaySummaryCard extends StatefulWidget {
  final DaySummary summary;

  const _DaySummaryCard({required this.summary});

  @override
  State<_DaySummaryCard> createState() => _DaySummaryCardState();
}

class _DaySummaryCardState extends State<_DaySummaryCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final dateStr = DateFormat('EEE, dd MMM').format(widget.summary.date);
    final calls = widget.summary.actions
        .where((a) => a.actionType == ActionType.call)
        .length;
    final sms = widget.summary.actions
        .where((a) => a.actionType == ActionType.sms)
        .length;
    final wa = widget.summary.actions
        .where((a) => a.actionType == ActionType.whatsapp)
        .length;
    return GestureDetector(
      onTap: () => setState(() => _expanded = !_expanded),
      child: GlassCard(
        padding: const EdgeInsets.all(16),
        blurSigma: 0,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    dateStr,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                Text(
                  '${widget.summary.successCount}/${widget.summary.totalCount}',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.8),
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(width: 8),
                Icon(
                  _expanded ? Icons.expand_less : Icons.expand_more,
                  color: Colors.white.withOpacity(0.7),
                ),
              ],
            ),
            const SizedBox(height: 10),
            if (_expanded)
              Column(
                children: widget.summary.actions
                    .map((a) => _ActionRow(action: a))
                    .toList(),
              )
            else
              Text(
                'Call $calls · SMS $sms · WA $wa',
                style: TextStyle(color: Colors.white.withOpacity(0.7)),
              ),
          ],
        ),
      ),
    );
  }
}
