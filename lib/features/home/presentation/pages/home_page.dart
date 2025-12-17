import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/glass_card.dart';
import '../../../../core/widgets/glass_pill.dart';
import '../../../meetings/presentation/bloc/meetings_bloc.dart';
import '../../../meetings/presentation/bloc/meetings_event.dart';
import '../../../report/presentation/bloc/report_bloc.dart';
import '../../../report/presentation/bloc/report_event.dart';
import '../../../meetings/presentation/widgets/meeting_tab.dart';
import '../../../report/presentation/widgets/report_tab.dart';
import 'package:iconnect_mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:iconnect_mobile/features/auth/presentation/bloc/auth_event.dart';
import 'package:iconnect_mobile/features/tasks/domain/entities/task.dart';
import 'package:iconnect_mobile/features/tasks/presentation/bloc/task_bloc.dart';
import 'package:iconnect_mobile/features/tasks/presentation/bloc/task_state.dart';
import 'package:iconnect_mobile/features/tasks/presentation/bloc/task_event.dart';
import 'package:iconnect_mobile/features/action/presentation/widgets/ai_greeting_sheet.dart';
import 'package:iconnect_mobile/features/settings/presentation/cubit/settings_cubit.dart';
import 'package:iconnect_mobile/features/settings/presentation/cubit/settings_state.dart';
import 'package:iconnect_mobile/features/settings/domain/entities/app_settings.dart';
import 'package:iconnect_mobile/features/tasks/presentation/widgets/shimmer_task_card.dart';

enum HomeTab { today, report, meeting }

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with TickerProviderStateMixin {
  // Config now from CMS via SettingsCubit
  // Removed: final String _appName = "AC Connect";
  // Removed: final String _leaderName = "Pranab Kumar Balabantaray";
  // Removed: final String? _headerImage = "...";

  // Filter State
  String _filterType = 'ALL'; // 'ALL', 'BIRTHDAY', 'ANNIVERSARY'
  HomeTab _selectedTab = HomeTab.today;

  late AnimationController _headerAnim;
  late Animation<double> _headerSlide;

  @override
  void initState() {
    super.initState();
    _headerAnim = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _headerSlide = Tween<double>(
      begin: -50,
      end: 0,
    ).animate(CurvedAnimation(parent: _headerAnim, curve: Curves.easeOutCubic));
    _headerAnim.forward();

    // Refresh tasks on load
    // SECURITY FIX (2025-12-17): Only seed demo data in debug mode
    if (const bool.fromEnvironment('dart.vm.product') == false) {
      _seedDemoData(); // Auto-seed for demo - DEBUG ONLY
    }
    context.read<TaskBloc>().add(LoadPendingTasks());
  }

  @override
  void dispose() {
    _headerAnim.dispose();
    super.dispose();
  }

  // --- Actions ---

  Future<bool> _launchPhone(String number) async {
    final uri = Uri.parse('tel:$number');
    if (await canLaunchUrl(uri)) {
      return launchUrl(uri);
    }
    return false;
  }

  void _launchSMS(String number, String message) async {
    final uri = Uri.parse('sms:$number?body=${Uri.encodeComponent(message)}');
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  void _launchWhatsApp(String number, String message) async {
    final cleanNumber = number.replaceAll(RegExp(r'[^0-9]'), '');
    final uri = Uri.parse(
      'https://wa.me/$cleanNumber?text=${Uri.encodeComponent(message)}',
    );
    if (await canLaunchUrl(uri))
      await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  void _signOut() {
    context.read<AuthBloc>().add(AuthLogoutRequested());
  }

  Future<void> _handleCall(EnrichedTask task) async {
    final number = task.mobile.trim();
    if (number.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No phone number available for this constituent.'),
        ),
      );
      return;
    }

    final launched = await _launchPhone(number);
    if (!launched || !mounted) return;

    final shouldMarkCalled = await showDialog<bool>(
      context: context,
      barrierColor: Colors.black.withOpacity(0.35),
      builder: (context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.symmetric(horizontal: 24),
          child: GlassCard(
            overlayGradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                const Color(0xFF00A896).withOpacity(0.18),
                AppColors.secondary.withOpacity(0.10),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Mark call as completed?',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'To keep reporting accurate, confirm once you’ve spoken.',
                  style: TextStyle(color: Colors.white.withOpacity(0.75)),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: TextButton(
                        onPressed: () => Navigator.of(context).pop(false),
                        style: TextButton.styleFrom(
                          foregroundColor: Colors.white.withOpacity(0.85),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppRadius.lg),
                          ),
                        ),
                        child: const Text('Not Yet'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton(
                        onPressed: () => Navigator.of(context).pop(true),
                        style: FilledButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppRadius.lg),
                          ),
                        ),
                        child: const Text('Mark as Called'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );

    if (shouldMarkCalled == true && mounted) {
      context.read<TaskBloc>().add(
        UpdateActionStatus(taskId: task.id, actionType: 'CALL'),
      );
    }
  }

  // --- Filtering ---

  List<EnrichedTask> _filterTasks(List<EnrichedTask> tasks) {
    return tasks.where((t) {
      // Type Filter (Today tab only)
      if (_filterType != 'ALL' && t.type != _filterType) return false;

      return true;
    }).toList();
  }

  int _getCount(List<EnrichedTask> tasks, String type) {
    if (type == 'ALL') return tasks.length;
    return tasks.where((t) => t.type == type).length;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor:
          Colors.transparent, // Background handled by mesh gradient
      body: Stack(
        children: [
          // Layer 1: Base Linear Gradient
          Container(decoration: AppTheme.meshGradient),

          // Layer 2: Top Center Emerald Glow (Radial)
          Positioned(
            top: -100,
            left: 0,
            right: 0,
            height: 500,
            child: Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.topCenter,
                  radius: 0.8,
                  colors: [
                    AppColors.primary.withOpacity(0.2), // Reduced opacity
                    Colors.transparent,
                  ],
                  stops: const [0.0, 1.0],
                ),
              ),
            ),
          ),

          // Layer 3: Bottom Right Amethyst Glow (Radial)
          Positioned(
            bottom: -100,
            right: -100,
            width: 400,
            height: 400,
            child: Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment.center,
                  radius: 0.8,
                  colors: [
                    AppColors.secondary.withOpacity(0.25),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Content
          Column(
            children: [
              // Custom Header Section
              _buildHeader(),

              // Ticker removed per user request - will add back later

              // Sub-filters only apply to Today tab
              if (_selectedTab == HomeTab.today) _buildSubFilters(),

              Expanded(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 250),
                  switchInCurve: Curves.easeOutCubic,
                  switchOutCurve: Curves.easeInCubic,
                  child: _selectedTab == HomeTab.today
                      ? BlocBuilder<TaskBloc, TaskState>(
                          key: const ValueKey('today'),
                          builder: (context, state) {
                            if (state is TaskLoading) {
                              return const ShimmerTaskList(itemCount: 3);
                            } else if (state is TaskError) {
                              return _buildErrorState(state.message);
                            } else if (state is TaskLoaded) {
                              final tasks = _filterTasks(state.tasks);
                              return RefreshIndicator(
                                color: AppColors.primary,
                                backgroundColor: Colors.white,
                                onRefresh: () async => context
                                    .read<TaskBloc>()
                                    .add(LoadPendingTasks()),
                                child: _buildTaskList(tasks),
                              );
                            }
                            return const SizedBox.shrink();
                          },
                        )
                      : _selectedTab == HomeTab.report
                      ? const ReportTab(key: ValueKey('report'))
                      : const MeetingTab(key: ValueKey('meeting')),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // --- Header Implementation ---

  Widget _buildHeader() {
    return BlocBuilder<SettingsCubit, SettingsState>(
      builder: (context, settingsState) {
        // Extract settings with defaults
        final settings = settingsState is SettingsLoaded
            ? settingsState.settings
            : AppSettings.defaults();

        final appName = settings.appName;
        final leaderName = settings.leaderName;
        final headerImageUrl = settings.headerImageUrl;

        return AnimatedBuilder(
          animation: _headerSlide,
          builder: (context, child) => Transform.translate(
            offset: Offset(0, _headerSlide.value),
            child: child,
          ),
          child: Container(
            height: 240, // Taller header to match screenshot
            width: double.infinity,
            clipBehavior: Clip.antiAlias,
            decoration: BoxDecoration(
              // Translucent dark teal for header to blend with mesh gradient
              color: const Color(0xFF134E4A).withOpacity(0.8),
              borderRadius: const BorderRadius.vertical(
                bottom: Radius.circular(32),
              ),
              border: Border(
                bottom: BorderSide(color: Colors.white.withOpacity(0.1)),
              ),
            ),
            child: Stack(
              children: [
                // Background Image (from CMS or placeholder)
                Positioned.fill(
                  child: headerImageUrl != null && headerImageUrl.isNotEmpty
                      ? Image.network(
                          headerImageUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              Container(color: const Color(0xFF134E4A)),
                        )
                      : Image.asset(
                          "assets/images/header_bg.png",
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) =>
                              Container(color: const Color(0xFF134E4A)),
                        ),
                ),

                // Gradient Overlay
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withOpacity(0.3),
                          Colors.transparent,
                          Colors.black.withOpacity(0.6),
                        ],
                      ),
                    ),
                  ),
                ),

                // Content
                SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24.0,
                      vertical: 16.0,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Top Row (Leader Info)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  appName,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 32,
                                    fontWeight: FontWeight.w900,
                                    height: 1.1,
                                    shadows: [
                                      Shadow(
                                        color: Colors.black45,
                                        blurRadius: 4,
                                        offset: Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Row(
                                  children: [
                                    Container(
                                      width: 10,
                                      height: 10,
                                      decoration: BoxDecoration(
                                        color: Colors.greenAccent[400],
                                        shape: BoxShape.circle,
                                        boxShadow: const [
                                          BoxShadow(
                                            color: Colors.green,
                                            blurRadius: 8,
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      leaderName,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w500,
                                        shadows: [
                                          Shadow(
                                            color: Colors.black45,
                                            blurRadius: 2,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),

                            // Logout Button (DP Removed)
                            InkWell(
                              onTap: _signOut,
                              borderRadius: BorderRadius.circular(50),
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.2),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.logout,
                                  color: Colors.white,
                                  size: 20,
                                ),
                              ),
                            ),
                          ],
                        ),

                        const Spacer(),

                        // Floating Glass Tab Bar (Pending / History)
                        GlassPill(
                          child: Row(
                            children: [
                              _buildMainTab(HomeTab.today, 'Today', true),
                              _buildMainTab(HomeTab.report, 'Report', false),
                              _buildMainTab(HomeTab.meeting, 'Meeting', false),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildMainTab(HomeTab tab, String label, bool showCount) {
    final bool isSelected = _selectedTab == tab;
    return Expanded(
      child: InkWell(
        onTap: () {
          setState(() {
            _selectedTab = tab;
          });
          // Dispatch appropriate BLoC event
          if (tab == HomeTab.today) {
            context.read<TaskBloc>().add(LoadPendingTasks());
          } else if (tab == HomeTab.report) {
            context.read<ReportBloc>().add(const LoadReport(days: 7));
          } else if (tab == HomeTab.meeting) {
            context.read<MeetingsBloc>().add(LoadActiveMeeting());
          }
        },
        borderRadius: BorderRadius.circular(AppRadius.full),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 240),
          curve: Curves.easeOutCubic,
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white.withOpacity(0.90) : null,
            gradient: isSelected
                ? LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.white.withOpacity(0.95),
                      Colors.white.withOpacity(0.82),
                    ],
                  )
                : null,
            borderRadius: BorderRadius.circular(AppRadius.full),
            border: Border.all(
              color: isSelected
                  ? AppColors.primary.withOpacity(0.25)
                  : Colors.transparent,
              width: 1,
            ),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: AppColors.primary.withOpacity(0.18),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                    BoxShadow(
                      color: Colors.black.withOpacity(0.08),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: isSelected
                      ? AppColors.textPrimary
                      : Colors.white.withOpacity(0.75),
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                ),
              ),
              if (showCount && _selectedTab == tab) ...[
                // We can fetch real count if possible, for now hardcode logic or leave implicit
                // const SizedBox(width: 8),
                // Container(
                //   padding: const EdgeInsets.all(4),
                //   decoration: const BoxDecoration(color: Color(0xFFCCFBF1), shape: BoxShape.circle),
                //   child: Text("8", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.teal[800])),
                // )
              ],
            ],
          ),
        ),
      ),
    );
  }

  // --- Sub Filters ---

  Widget _buildSubFilters() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      // Removed background decoration per user request
      child: BlocBuilder<TaskBloc, TaskState>(
        builder: (context, state) {
          int countAll = 0, countBirthday = 0, countAnniversary = 0;
          if (state is TaskLoaded) {
            final list = state.tasks
                .where((t) => t.status == 'PENDING')
                .toList(); // Only count pending for filters
            countAll = list.length;
            countBirthday = list.where((t) => t.type == 'BIRTHDAY').length;
            countAnniversary = list
                .where((t) => t.type == 'ANNIVERSARY')
                .length;
          }

          return Container(
            width: double.infinity,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // _buildFilterChip('ALL', 'All', null, countAll), // Removed per requirement
                _buildFilterChip(
                  'BIRTHDAY',
                  'Birthday',
                  Icons.card_giftcard,
                  countBirthday,
                ),
                const SizedBox(width: 8),
                _buildFilterChip(
                  'ANNIVERSARY',
                  'Anniversary',
                  Icons.favorite,
                  countAnniversary,
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildFilterChip(String key, String label, IconData? icon, int count) {
    final bool isSelected = _filterType == key;
    Color activeColor = Colors.teal;
    Color activeBg = Colors.teal[50]!;

    if (key == 'BIRTHDAY') {
      activeColor = Colors.pink;
      activeBg = Colors.pink[50]!;
    } else if (key == 'ANNIVERSARY') {
      activeColor = Colors.purple;
      activeBg = Colors.purple[50]!;
    }

    return GestureDetector(
      onTap: () {
        // Toggle Logic: If already selected, deselect (show all implicitly or empty).
        // Since "All" tab is removed, deselecting means no specific filter active (effectively All).
        setState(() {
          _filterType = isSelected ? 'ALL' : key;
          // Note: If 'ALL' is used as default state key when nothing is selected.
          // Or use null. Logic in _filterTasks handles 'ALL' or empty/null properly?
          // Existing _filterTasks usually checks if (type == 'BIRTHDAY') etc.
          // If type is 'ALL', it returns all.
        });
      },
      child: AnimatedScale(
        scale: isSelected ? 1.05 : 1.0,
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeOut,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(50),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeInOut,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: isSelected
                    ? activeColor.withOpacity(0.25)
                    : Colors.white.withOpacity(0.08),
                borderRadius: BorderRadius.circular(50),
                border: Border.all(
                  color: isSelected
                      ? activeColor.withOpacity(0.5)
                      : Colors.white.withOpacity(0.15),
                  width: 1,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: activeColor.withOpacity(0.25),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ]
                    : [],
              ),
              child: Row(
                children: [
                  if (icon != null) ...[
                    AnimatedSwitcher(
                      duration: const Duration(milliseconds: 200),
                      child: Icon(
                        icon,
                        key: ValueKey('$key-$isSelected'),
                        size: 14,
                        color: isSelected
                            ? activeColor
                            : Colors.white.withOpacity(0.6),
                      ),
                    ),
                    const SizedBox(width: 6),
                  ],
                  Text(
                    label.toUpperCase(),
                    style: TextStyle(
                      color: isSelected
                          ? Colors.white
                          : Colors.white.withOpacity(0.7),
                      fontSize: 11,
                      fontWeight: isSelected
                          ? FontWeight.w700
                          : FontWeight.w500,
                    ),
                  ),
                  if (count > 0) ...[
                    const SizedBox(width: 4),
                    Text(
                      "($count)",
                      style: TextStyle(
                        color: isSelected
                            ? Colors.white.withOpacity(0.9)
                            : Colors.white.withOpacity(0.5),
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  // --- Task List ---

  Widget _buildTaskList(List<EnrichedTask> tasks) {
    if (tasks.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.check_circle,
                size: 64,
                color: Colors.white.withOpacity(0.5),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'No pending tasks',
              style: TextStyle(
                color: Colors.white.withOpacity(0.8),
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(24),
      itemCount: tasks.length,
      separatorBuilder: (_, __) => const SizedBox(height: 16),
      itemBuilder: (context, index) {
        final task = tasks[index];
        return _buildTaskCard(task);
      },
    );
  }

  Widget _buildTaskCard(EnrichedTask task) {
    final bool isBirthday = task.type == 'BIRTHDAY';
    final Color typeColor = isBirthday ? Colors.pink : Colors.purple;
    final IconData typeIcon = isBirthday ? Icons.card_giftcard : Icons.favorite;

    return RepaintBoundary(
      child: GlassCard(
        blurSigma: 0,
        surfaceGradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white.withOpacity(0.12),
            Colors.white.withOpacity(0.06),
          ],
        ),
        borderRadius: BorderRadius.circular(AppRadius.xl),
        overlayGradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          stops: const [0.0, 0.35, 1.0],
          colors: [
            Colors.white.withOpacity(0.16),
            Colors.transparent,
            Colors.transparent,
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        typeColor.withOpacity(0.28),
                        Colors.white.withOpacity(0.10),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    border: Border.all(
                      color: typeColor.withOpacity(0.35),
                      width: 1,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: typeColor.withOpacity(0.4),
                        blurRadius: 12,
                      ),
                    ],
                  ),
                  child: Icon(typeIcon, color: typeColor, size: 24),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Row 1: Name + Ward (Top Right)
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Flexible(
                            child: Text(
                              task.name,
                              style: const TextStyle(
                                fontSize: 16, // Slightly smaller than 18 to fit
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: Colors.white.withOpacity(0.2),
                              ),
                            ),
                            child: Text(
                              "Ward ${task.ward}",
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 4),

                      // Row 2: Phone Number (Below Name)
                      Row(
                        children: [
                          Icon(
                            Icons.phone,
                            size: 12,
                            color: Colors.white.withOpacity(0.7),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            task.mobile.isNotEmpty ? task.mobile : "No Mobile",
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.white.withOpacity(0.8),
                              fontFamily: 'monospace',
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 4),

                      // Row 3: Block & GP
                      Row(
                        children: [
                          Icon(
                            Icons.location_city,
                            size: 12,
                            color: Colors.white.withOpacity(0.6),
                          ),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              "${task.block.isNotEmpty ? task.block : 'Block N/A'} • ${task.gramPanchayat.isNotEmpty ? task.gramPanchayat : 'GP N/A'}",
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.white.withOpacity(0.6),
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 4),

                      // Row 4: Date
                      Row(
                        children: [
                          Icon(
                            Icons.calendar_today,
                            size: 12,
                            color: Colors.white.withOpacity(0.6),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            DateFormat('dd MMM yyyy').format(task.dueDate),
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.white.withOpacity(0.6),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 20),

            // Action Buttons (Call, SMS, WhatsApp) - Liquid Glass Style with Status
            Row(
              children: [
                Expanded(
                  child: _buildLiquidGlassButton(
                    "Call",
                    Icons.call,
                    const Color(0xFF00A896),
                    task.callSent,
                    () => _handleCall(task),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildLiquidGlassButton(
                    "SMS",
                    Icons.message,
                    const Color(0xFF5E548E),
                    task.smsSent,
                    () => _openAiWizard(task, 'SMS'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildLiquidGlassButton(
                    "WhatsApp",
                    Icons.chat_bubble,
                    const Color(0xFF10B981),
                    task.whatsappSent,
                    () => _openAiWizard(task, 'WHATSAPP'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  /// Liquid Glass Button - Premium Glassmorphism style with completed state
  Widget _buildLiquidGlassButton(
    String label,
    IconData icon,
    Color iconColor,
    bool isCompleted,
    VoidCallback onTap,
  ) {
    // Grey out if action is completed
    final effectiveIconColor = isCompleted ? Colors.grey[400]! : iconColor;
    final effectiveTextColor = isCompleted ? Colors.grey[500]! : Colors.white;
    final effectiveBgOpacity = isCompleted ? 0.05 : 0.10;
    final effectiveLabel = isCompleted
        ? (label == 'Call'
              ? 'Called'
              : label == 'SMS'
              ? 'SMS Sent'
              : label == 'WhatsApp'
              ? 'WA Sent'
              : '$label Sent')
        : label;

    return Semantics(
      button: true,
      enabled: !isCompleted,
      label: effectiveLabel,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(50),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: isCompleted ? null : onTap,
            customBorder: const StadiumBorder(),
            splashColor: iconColor.withOpacity(0.18),
            highlightColor: Colors.white.withOpacity(0.04),
            child: Container(
              height: 40,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(effectiveBgOpacity),
                gradient: isCompleted
                    ? null
                    : LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.white.withOpacity(0.14),
                          Colors.white.withOpacity(0.06),
                        ],
                      ),
                borderRadius: BorderRadius.circular(50),
                border: Border.all(
                  color: isCompleted
                      ? Colors.grey.withOpacity(0.15)
                      : Colors.white.withOpacity(0.20),
                  width: 1,
                ),
                boxShadow: isCompleted
                    ? []
                    : [
                        BoxShadow(
                          color: iconColor.withOpacity(0.14),
                          blurRadius: 12,
                          offset: const Offset(0, 6),
                        ),
                      ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (isCompleted) ...[
                    Icon(Icons.check_circle, size: 14, color: Colors.grey[400]),
                    const SizedBox(width: 4),
                  ],
                  Icon(icon, size: 16, color: effectiveIconColor),
                  const SizedBox(width: 6),
                  Text(
                    effectiveLabel,
                    style: TextStyle(
                      color: effectiveTextColor,
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _openAiWizard(EnrichedTask task, String actionType) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => AiGreetingSheet(
        taskId: task.id,
        constituentName: task.name,
        type: task.type,
        mobile: task.mobile,
        actionType: actionType,
      ),
    );
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Text(message, style: const TextStyle(color: Colors.red)),
    );
  }

  Future<void> _seedDemoData() async {
    final firestore = FirebaseFirestore.instance;
    // 1. Seed Meeting (Conference Call)
    await firestore.collection('scheduled_meetings').doc('demo_meeting_1').set({
      'title': 'Conference Call • Dharmasala Block',
      'scheduled_time': Timestamp.fromDate(
        DateTime.now().add(const Duration(hours: 1)),
      ),
      'dial_in_number': '+918005551212',
      'access_code': '4567',
      'target_group': 'BLOCK',
      'target_id': 'Dharmasala',
      'created_at': FieldValue.serverTimestamp(),
    });

    // 2. Seed Tasks
    final batch = firestore.batch();

    // Birthday Task
    final taskRef1 = firestore.collection('tasks').doc('demo_task_1');
    batch.set(taskRef1, {
      'name': 'Ramesh Kumar',
      'constituentId': '',
      'ward': '12',
      'type': 'BIRTHDAY',
      'dueDate': Timestamp.fromDate(DateTime.now()), // Today
      'status': 'PENDING',
      'priority': 'HIGH',
      'createdAt': FieldValue.serverTimestamp(),
      'mobile': '9876543210',
      'block': 'Dharmasala',
      'gram_panchayat': 'Jaraka',
    });

    // Anniversary Task
    final taskRef2 = firestore.collection('tasks').doc('demo_task_2');
    batch.set(taskRef2, {
      'name': 'Sunita & Raj',
      'constituentId': '',
      'ward': '05',
      'type': 'ANNIVERSARY',
      'dueDate': Timestamp.fromDate(DateTime.now()), // Today
      'status': 'PENDING',
      'priority': 'MEDIUM',
      'createdAt': FieldValue.serverTimestamp(),
      'mobile': '9876543211',
      'block': 'Dharmasala',
      'gram_panchayat': 'Chahata',
    });

    await batch.commit();

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('✅ Demo Data Seeded! Refreshing...'),
        backgroundColor: Colors.green,
      ),
    );

    // Trigger Refresh
    if (context.mounted) {
      context.read<TaskBloc>().add(LoadPendingTasks());
    }
  }
}
