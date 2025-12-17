import 'package:dartz/dartz.dart' show Either;
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
    context.read<ReportBloc>().add(RefreshReport());
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
          const SliverPadding(
            padding: EdgeInsets.fromLTRB(24, 16, 24, 0),
            sliver: SliverToBoxAdapter(child: _HistoryHeader()),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(24, 14, 24, 0),
            sliver: SliverToBoxAdapter(
              child: _TodayOverviewCard(
                loading: _loadingToday,
                error: _todayError,
                stats: _todayStats,
                actions: _todayActions,
                onRetry: _loadToday,
              ),
            ),
          ),
          const SliverPadding(
            padding: EdgeInsets.fromLTRB(24, 16, 24, 10),
            sliver: SliverToBoxAdapter(child: _SectionTitle('Previous 7 Days')),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
            sliver: BlocBuilder<ReportBloc, ReportState>(
              builder: (context, state) {
                if (state is ReportLoading) {
                  return const SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.all(24),
                      child: Center(child: CircularProgressIndicator()),
                    ),
                  );
                }
                if (state is ReportError) {
                  return SliverToBoxAdapter(
                    child: GlassCard(
                      blurSigma: 0,
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
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
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
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    if (index >= items.length) {
                      return const Padding(
                        padding: EdgeInsets.symmetric(vertical: 16),
                        child: Center(child: CircularProgressIndicator()),
                      );
                    }
                    return _DayAccordionCard(summary: items[index]);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _HistoryHeader extends StatelessWidget {
  const _HistoryHeader();

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      blurSigma: 0,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      surfaceGradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Colors.white.withOpacity(0.14),
          Colors.white.withOpacity(0.08),
        ],
      ),
      overlayGradient: LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [Colors.white.withOpacity(0.06), Colors.transparent],
      ),
      child: const Center(
        child: Text(
          'History',
          style: TextStyle(
            color: Colors.white,
            fontSize: 16,
            fontWeight: FontWeight.w900,
          ),
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String text;

  const _SectionTitle(this.text);

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: const TextStyle(
        color: Colors.white,
        fontSize: 16,
        fontWeight: FontWeight.w900,
      ),
    );
  }
}

class _TodayOverviewCard extends StatelessWidget {
  final bool loading;
  final String? error;
  final TodaySummaryStats? stats;
  final List<ActionLog> actions;
  final VoidCallback onRetry;

  const _TodayOverviewCard({
    required this.loading,
    required this.error,
    required this.stats,
    required this.actions,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final safeStats =
        stats ??
        const TodaySummaryStats(
          wishesSent: 0,
          totalEvents: 0,
          callsMade: 0,
          smsCount: 0,
          whatsappCount: 0,
        );

    final hasError = error != null;
    final progress = safeStats.totalEvents <= 0
        ? 0.0
        : (safeStats.wishesSent / safeStats.totalEvents).clamp(0.0, 1.0);

    final sortedActions = actions.toList()
      ..sort((a, b) => a.executedAt.compareTo(b.executedAt));

    return GlassCard(
      blurSigma: 0,
      surfaceGradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Colors.white.withOpacity(0.12),
          Colors.white.withOpacity(0.06),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Today’s Overview',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.06),
              borderRadius: BorderRadius.circular(AppRadius.xl),
              border: Border.all(
                color: AppColors.primaryLight.withOpacity(0.65),
                width: 1.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primaryLight.withOpacity(0.18),
                  blurRadius: 22,
                ),
              ],
            ),
            child: loading
                ? const SizedBox(
                    height: 86,
                    child: Center(child: CircularProgressIndicator()),
                  )
                : hasError
                ? Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        error!,
                        style: TextStyle(color: Colors.white.withOpacity(0.8)),
                      ),
                      const SizedBox(height: 12),
                      FilledButton(
                        onPressed: onRetry,
                        style: FilledButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppRadius.lg),
                          ),
                        ),
                        child: const Text('Retry'),
                      ),
                    ],
                  )
                : Row(
                    children: [
                      Expanded(
                        child: _OverviewMetricCard(
                          title: 'Wishes Sent',
                          leadingIcons: const [
                            Icons.call,
                            Icons.message,
                            Icons.chat_bubble,
                          ],
                          value:
                              '${safeStats.wishesSent} / ${safeStats.totalEvents}',
                        ),
                      ),
                      const SizedBox(width: 12),
                      _ProgressRing(
                        value: progress,
                        color: AppColors.primaryLight,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _OverviewMetricCard(
                          title: 'Total Events',
                          leadingIcons: const [Icons.cake],
                          value: '${safeStats.totalEvents}',
                          alignRight: true,
                        ),
                      ),
                    ],
                  ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Actions Taken',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              if (!loading)
                Text(
                  '${actions.length}',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.70),
                    fontWeight: FontWeight.w900,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 10),
          if (loading)
            Text(
              'Loading…',
              style: TextStyle(color: Colors.white.withOpacity(0.7)),
            )
          else if (hasError)
            Text(
              'Unable to load actions for today.',
              style: TextStyle(color: Colors.white.withOpacity(0.75)),
            )
          else
            _TimelineList(actions: sortedActions),
        ],
      ),
    );
  }
}

class _OverviewMetricCard extends StatelessWidget {
  final String title;
  final List<IconData> leadingIcons;
  final String value;
  final bool alignRight;

  const _OverviewMetricCard({
    required this.title,
    required this.leadingIcons,
    required this.value,
    this.alignRight = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.10),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: Colors.white.withOpacity(0.16)),
      ),
      child: Column(
        crossAxisAlignment: alignRight
            ? CrossAxisAlignment.end
            : CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              color: Colors.white.withOpacity(0.80),
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 6,
            children: leadingIcons
                .map(
                  (i) =>
                      Icon(i, size: 16, color: Colors.white.withOpacity(0.85)),
                )
                .toList(),
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _ProgressRing extends StatelessWidget {
  final double value;
  final Color color;

  const _ProgressRing({required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 56,
      height: 56,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.08),
        borderRadius: BorderRadius.circular(AppRadius.full),
        border: Border.all(color: Colors.white.withOpacity(0.18)),
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          SizedBox(
            width: 42,
            height: 42,
            child: CircularProgressIndicator(
              value: value,
              strokeWidth: 5.5,
              backgroundColor: Colors.white.withOpacity(0.12),
              valueColor: AlwaysStoppedAnimation(color),
            ),
          ),
          Text(
            '${(value * 100).round()}%',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}

class _DayAccordionCard extends StatefulWidget {
  final DaySummary summary;

  const _DayAccordionCard({required this.summary});

  @override
  State<_DayAccordionCard> createState() => _DayAccordionCardState();
}

class _DayAccordionCardState extends State<_DayAccordionCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final isToday = DateUtils.isSameDay(widget.summary.date, DateTime.now());
    final isYesterday = DateUtils.isSameDay(
      widget.summary.date,
      DateTime.now().subtract(const Duration(days: 1)),
    );
    final dateStr = isToday
        ? 'Today, ${DateFormat('MMM d').format(widget.summary.date)}'
        : isYesterday
        ? 'Yesterday, ${DateFormat('MMM d').format(widget.summary.date)}'
        : DateFormat('EEE, MMM d').format(widget.summary.date);

    final sorted = widget.summary.actions.toList()
      ..sort((a, b) => a.executedAt.compareTo(b.executedAt));

    return GestureDetector(
      onTap: () => setState(() => _expanded = !_expanded),
      child: GlassCard(
        blurSigma: 0,
        padding: const EdgeInsets.all(14),
        surfaceGradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white.withOpacity(0.12),
            Colors.white.withOpacity(0.06),
          ],
        ),
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
                Icon(
                  _expanded ? Icons.expand_less : Icons.expand_more,
                  color: Colors.white.withOpacity(0.75),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              '${widget.summary.successCount} Wishes Sent • ${widget.summary.totalCount} Events',
              style: TextStyle(
                color: Colors.white.withOpacity(0.70),
                fontWeight: FontWeight.w700,
              ),
            ),
            if (_expanded) ...[
              const SizedBox(height: 12),
              _TimelineList(actions: sorted),
            ],
          ],
        ),
      ),
    );
  }
}

class _TimelineList extends StatelessWidget {
  final List<ActionLog> actions;

  const _TimelineList({required this.actions});

  @override
  Widget build(BuildContext context) {
    if (actions.isEmpty) {
      return Text(
        'No actions recorded',
        style: TextStyle(color: Colors.white.withOpacity(0.7)),
      );
    }

    return Column(
      children: [
        for (int i = 0; i < actions.length; i++)
          _TimelineRow(action: actions[i], isLast: i == actions.length - 1),
      ],
    );
  }
}

class _TimelineRow extends StatelessWidget {
  final ActionLog action;
  final bool isLast;

  const _TimelineRow({required this.action, required this.isLast});

  @override
  Widget build(BuildContext context) {
    final accent = switch (action.actionType) {
      ActionType.call => AppColors.primaryLight,
      ActionType.sms => AppColors.secondary,
      ActionType.whatsapp => AppColors.success,
    };
    final icon = switch (action.actionType) {
      ActionType.call => Icons.call,
      ActionType.sms => Icons.message,
      ActionType.whatsapp => Icons.chat_bubble,
    };
    final typeLabel = ActionLog.actionTypeToString(action.actionType);
    final time = DateFormat('hh:mm a').format(action.executedAt);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 42,
            child: Stack(
              alignment: Alignment.topCenter,
              children: [
                if (!isLast)
                  Positioned(
                    top: 34,
                    bottom: 0,
                    child: Container(
                      width: 2,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.18),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                Container(
                  width: 34,
                  height: 34,
                  decoration: BoxDecoration(
                    color: accent.withOpacity(0.20),
                    shape: BoxShape.circle,
                    border: Border.all(color: accent.withOpacity(0.40)),
                  ),
                  child: Icon(icon, size: 16, color: Colors.white),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '$time  -  ${action.constituentName}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  typeLabel,
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.72),
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
