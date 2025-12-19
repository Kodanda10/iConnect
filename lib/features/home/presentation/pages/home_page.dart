import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // For HapticFeedback
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:intl/intl.dart';

import '../../../../core/theme/app_theme.dart';
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
import 'dart:ui';
import 'package:iconnect_mobile/features/tasks/presentation/widgets/shimmer_task_card.dart';
import 'package:iconnect_mobile/features/ticker/presentation/widgets/liquid_ticker_widget.dart';
import 'package:iconnect_mobile/features/report/presentation/bloc/report_bloc.dart';
import 'package:iconnect_mobile/features/report/presentation/bloc/report_event.dart';
import 'package:iconnect_mobile/features/report/presentation/bloc/report_state.dart';
import 'package:iconnect_mobile/features/report/presentation/widgets/action_timeline_card.dart';
import 'package:iconnect_mobile/features/report/presentation/widgets/animated_count_up.dart';
import 'package:iconnect_mobile/features/report/presentation/widgets/parallax_scroll_view.dart';
import 'package:iconnect_mobile/features/report/domain/entities/day_summary.dart';
import 'package:iconnect_mobile/features/report/domain/entities/action_log.dart';
import 'package:iconnect_mobile/core/widgets/app_background.dart';
import 'package:iconnect_mobile/core/widgets/glass_container.dart';
import 'package:iconnect_mobile/core/widgets/primary_button.dart';

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
  String _filterStatus = 'PENDING'; // 'PENDING' or 'COMPLETED' (History)
  String _filterType = 'ALL'; // 'ALL', 'BIRTHDAY', 'ANNIVERSARY'
  
  late AnimationController _headerAnim;
  late Animation<double> _headerSlide;

  @override
  void initState() {
    super.initState();
    _headerAnim = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _headerSlide = Tween<double>(begin: -50, end: 0).animate(
      CurvedAnimation(parent: _headerAnim, curve: Curves.easeOutCubic),
    );
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



  void _showActionOutcomeDialog(EnrichedTask task, String actionType) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Dialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header - Simplified to "Status"
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Status',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(ctx),
                    icon: const Icon(Icons.close, color: Colors.grey),
                  ),
                ],
              ),
              // Constituent Name (2 lines max, centered)
              const SizedBox(height: 8),
              Text(
                task.name,
                maxLines: 2,
                textAlign: TextAlign.center,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Color(0xFF00A896),
                  fontWeight: FontWeight.w600,
                  fontSize: 20,
                ),
              ),
              const SizedBox(height: 16),
              
              // Action Summary
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                ),
                child: Row(
                  children: [
                    Icon(
                      actionType == 'CALL' ? Icons.phone_callback : Icons.message, 
                      color: Colors.grey
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'Action taken: $actionType',
                      style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              
              // Connected/Sent Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                  // Mark action as sent/called
                  context.read<TaskBloc>().add(UpdateActionStatus(
                    taskId: task.id,
                    actionType: actionType,
                  ));
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('$actionType recorded!'),
                      backgroundColor: Colors.teal,
                    ),
                  );
                },
                icon: const Icon(Icons.check, color: Colors.white),
                label: Text(
                  actionType == 'CALL' ? 'Mark as Called' : 'Mark as Sent', 
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)
                ),
              ),
              ),
              const SizedBox(height: 12),
              
              // No Answer / Reschedule Row
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red[400],
                        side: BorderSide(color: Colors.red[200]!),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        Navigator.pop(ctx);
                      },
                      child: const Text('No Answer'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white.withOpacity(0.7),
                        side: BorderSide(color: Colors.white.withOpacity(0.3)),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        Navigator.pop(ctx);
                      },
                      child: const Text('Reschedule'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Define the Signature Constant
  static const String leaderSignature = "\n\n- Pranab Balabantaray";

  void _launchSMS(String number, String baseMessage) async {
    final fullMessage = "$baseMessage$leaderSignature";
    final cleanPhone = number.replaceAll(RegExp(r'\D'), '');
    final uri = Uri.parse('sms:$cleanPhone?body=${Uri.encodeComponent(fullMessage)}');
    
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _launchWhatsApp(String number, String baseMessage) async {
    final fullMessage = "$baseMessage$leaderSignature";
    final cleanPhone = number.replaceAll(RegExp(r'\D'), '');
    
    final uri = Uri.parse('whatsapp://send?phone=$cleanPhone&text=${Uri.encodeComponent(fullMessage)}');
    
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
        // Fallback or error handling
        if (mounted) {
             ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('WhatsApp not installed')),
              );
        }
    }
  }

  void _signOut() {
    context.read<AuthBloc>().add(AuthLogoutRequested());
  }

  // --- Filtering ---

  List<EnrichedTask> _filterTasks(List<EnrichedTask> tasks) {
    return tasks.where((t) {
      // 1. Status Filter
      // Note: Backend might define status differently. 
      // Assuming 'PENDING' maps to pending list.
      // For 'COMPLETED' (History), we might need a separate query, 
      // but for now let's just filter locally if we have them, or show empty.
      if (_filterStatus == 'PENDING' && t.status != 'PENDING') return false;
      if (_filterStatus == 'COMPLETED' && t.status != 'COMPLETED') return false;

      // 2. Type Filter
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
    return AppBackground(
      child: Column(
        children: [
            // Custom Header Section
            _buildHeader(),
            
            // Sub Filters (hide for Meeting and Report tabs)
          if (_filterStatus != 'MEETING' && _filterStatus != 'COMPLETED')
            _buildSubFilters(),
            
            // Main Content Area - IndexedStack for Persistence (Fix Tab Flash)
            Expanded(
              child: IndexedStack(
                index: _filterStatus == 'MEETING' ? 2 : (_filterStatus == 'COMPLETED' ? 1 : 0),
                children: [
                  // Index 0: PENDING (Home)
                  BlocBuilder<TaskBloc, TaskState>(
                      builder: (context, state) {
                        if (state is TaskLoading) {
                          return const ShimmerTaskList(itemCount: 3);
                        } else if (state is TaskError) {
                          return _buildErrorState(state.message);
                        } else if (state is TaskLoaded) {
                          final tasks = state.tasks.where((t) => t.status == 'PENDING').toList();
                          return RefreshIndicator(
                            color: AppColors.primary,
                            backgroundColor: Colors.white,
                            onRefresh: () async {
                              context.read<TaskBloc>().add(LoadPendingTasks());
                            },
                            child: _buildTaskList(tasks),
                          );
                        }
                        return const SizedBox.shrink();
                      },
                    ),

                  // Index 1: COMPLETED (Report)
                  _buildReportTab(),

                  // Index 2: MEETING
                  _buildMeetingTab(),
                ],
              ),
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
              borderRadius: const BorderRadius.vertical(bottom: Radius.circular(32)),
              border: Border(bottom: BorderSide(color: Colors.white.withOpacity(0.1))),
            ),
            child: Stack(
              children: [
                // Background Image (from CMS or placeholder)
                Positioned.fill(
                  child: headerImageUrl != null && headerImageUrl.isNotEmpty
                      ? Image.network(
                          headerImageUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(color: const Color(0xFF134E4A)),
                        )
                      : Image.asset(
                          "assets/images/header_bg.png",
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(color: const Color(0xFF134E4A)),
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
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
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
                                 shadows: [Shadow(color: Colors.black45, blurRadius: 4, offset: Offset(0, 2))],
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
                                     boxShadow: const [BoxShadow(color: Colors.green, blurRadius: 8)]
                                   ),
                                 ),
                                 const SizedBox(width: 8),
                                 Text(
                                   leaderName,
                                   style: const TextStyle(
                                     color: Colors.white,
                                     fontSize: 14, 
                                     fontWeight: FontWeight.w500,
                                     shadows: [Shadow(color: Colors.black45, blurRadius: 2)],
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
                             child: const Icon(Icons.logout, color: Colors.white, size: 20),
                           ),
                         ),
                      ],
                    ),
                    
                    const Spacer(),

                    // Floating Glass Tab Bar (Pending / History)
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(50),
                        border: Border.all(color: Colors.white.withOpacity(0.2)),
                        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 10, offset: Offset(0, 4))],
                      ),
                      child: Row(
                        children: [
                          _buildMainTab('PENDING', 'Today', true),
                          _buildMainTab('COMPLETED', 'Report', false),
                          _buildMainTab('MEETING', 'Meeting', false),
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

  Widget _buildMainTab(String key, String label, bool showCount) {
    final bool isSelected = _filterStatus == key;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            _filterStatus = key;
          });
          // Dispatch appropriate BLoC event
          if (key == 'PENDING') {
            context.read<TaskBloc>().add(LoadPendingTasks());
          } else if (key == 'COMPLETED') {
            context.read<ReportBloc>().add(const LoadReport(days: 7));
          } else {
            // Meeting (TickerBloc usually handles or we just show)
          }
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(50),
            boxShadow: isSelected ? [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4)] : [],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                label,
                style: TextStyle(
                  color: isSelected ? const Color(0xFF134E4A) : Colors.white70,
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                ),
              ),
              if (showCount && _filterStatus == key) ...[
                 // We can fetch real count if possible, for now hardcode logic or leave implicit
                 // const SizedBox(width: 8),
                 // Container(
                 //   padding: const EdgeInsets.all(4),
                 //   decoration: const BoxDecoration(color: Color(0xFFCCFBF1), shape: BoxShape.circle),
                 //   child: Text("8", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.teal[800])),
                 // )
              ]
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
             final list = state.tasks.where((t) => t.status == 'PENDING').toList(); // Only count pending for filters
             countAll = list.length;
             countBirthday = list.where((t) => t.type == 'BIRTHDAY').length;
             countAnniversary = list.where((t) => t.type == 'ANNIVERSARY').length;
          }

          return SizedBox(
            width: double.infinity,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // _buildFilterChip('ALL', 'All', null, countAll), // Removed per requirement
                  _buildFilterChip('BIRTHDAY', 'Birthday', Icons.card_giftcard, countBirthday),
                  const SizedBox(width: 8),
                  _buildFilterChip('ANNIVERSARY', 'Anniversary', Icons.favorite, countAnniversary),
                ],
              ),
            ),
          );
        }
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
       activeColor = Colors.purpleAccent;
       activeBg = Colors.purpleAccent.withOpacity(0.1);
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
                    ? [BoxShadow(color: activeColor.withOpacity(0.25), blurRadius: 12, offset: const Offset(0, 4))]
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
                        color: isSelected ? activeColor : Colors.white.withOpacity(0.6),
                      ),
                    ),
                    const SizedBox(width: 6),
                  ],
                  Text(
                    label.toUpperCase(),
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.white.withOpacity(0.7),
                      fontSize: 11,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    ),
                  ),
                  if (count > 0) ...[
                     const SizedBox(width: 4),
                     Text(
                       "($count)",
                       style: TextStyle(
                         color: isSelected ? Colors.white.withOpacity(0.9) : Colors.white.withOpacity(0.5),
                         fontSize: 10,
                         fontWeight: FontWeight.w600,
                       ),
                     ),
                  ]
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }


  // --- Meeting Tab ---
  
  Widget _buildMeetingTab() {
    // Get current user's UID for ticker lookup
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      return _buildNoMeetingState();
    }
    
    return StreamBuilder<DocumentSnapshot>(
      stream: FirebaseFirestore.instance
          .collection('active_tickers')
          .doc(user.uid)
          .snapshots(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: Colors.white));
        }
        
        if (!snapshot.hasData || !snapshot.data!.exists) {
          return _buildNoMeetingState();
        }
        
        final data = snapshot.data!.data() as Map<String, dynamic>;
        return _buildMeetingCard(data);
      },
    );
  }
  
  // --- Report Tab ---
  
  // --- Report Tab ---
  
  Widget _buildReportTab() {
    return BlocBuilder<ReportBloc, ReportState>(
      builder: (context, state) {
        if (state is ReportLoading) {
           return const Center(child: CircularProgressIndicator(color: Colors.white));
        }

        if (state is ReportLoaded) {
            final now = DateTime.now();
            final todayKey = DateFormat('yyyy-MM-dd').format(now);
            
            DaySummary? todaySummary;
            try {
              todaySummary = state.daySummaries.firstWhere(
                (s) => DateFormat('yyyy-MM-dd').format(s.date) == todayKey,
              );
            } catch (e) {
              todaySummary = null; 
            }
            
            final todayActions = todaySummary?.actions ?? [];
            final previousDays = state.daySummaries.where(
               (s) => DateFormat('yyyy-MM-dd').format(s.date) != todayKey
            ).toList();

            // Ultra-minimal layout: Just ListView with cards (no complex nesting)
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Overview Card (restored)
                BlocBuilder<TaskBloc, TaskState>(
                  builder: (context, taskState) {
                    final todayTaskCount = taskState is TaskLoaded 
                        ? taskState.tasks.where((t) => t.status == 'PENDING').length 
                        : 0;
                    return _buildReportStatsFromActions(todayActions, todayTaskCount: todayTaskCount);
                  },
                ),
                const SizedBox(height: 24),
                
                // Today's Tasks Title
                const Text(
                  "TODAY'S TASKS",
                  style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                ),
                const SizedBox(height: 12),
                
                // Today's Actions
                if (todayActions.isNotEmpty)
                  ActionTimelineCard(
                    actions: todayActions,
                    initiallyExpanded: true,
                    title: const SizedBox.shrink(),
                  )
                else
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 20),
                    child: Text("No tasks completed today", style: TextStyle(color: Colors.white30)),
                  ),
                
                const SizedBox(height: 32),
                
                // Previous Days Title
                const Text(
                  'PREVIOUS 7 DAYS',
                  style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1.2),
                ),
                const SizedBox(height: 16),
                
                // Previous Days
                if (previousDays.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 20),
                    child: Text("No previous history available", style: TextStyle(color: Colors.white30)),
                  )
                else
                  ...previousDays.map((day) => Padding(
                    padding: const EdgeInsets.only(bottom: 12.0),
                    child: ActionTimelineCard(
                      key: ValueKey(day.date),
                      actions: day.actions,
                      initiallyExpanded: false,
                      title: _buildHistoryTitle(day),
                    ),
                  )),
              ],
            );
        }
        
        if (state is ReportError) {
          return Center(child: Text(state.message, style: const TextStyle(color: Colors.red)));
        }
        
        return const SizedBox.shrink();
      },
    );
  }

  Widget _buildReportStatsFromActions(List<ActionLog> actions, {int todayTaskCount = 0}) {
    // Compute stats from today's actions
    final calls = actions.where((a) => a.actionType == ActionType.call).length;
    final wishesSent = actions.where((a) => a.success).length;
    // Use actual task count from TaskBloc instead of hardcoded value
    final totalEvents = todayTaskCount > 0 ? todayTaskCount : (actions.isNotEmpty ? actions.length : 0);
    final progress = totalEvents > 0 ? (wishesSent / totalEvents).clamp(0.0, 1.0) : 0.0;
    
    return AnimatedCardEntry(
      delay: const Duration(milliseconds: 100),
      duration: const Duration(milliseconds: 500),
      child: GlassContainer(
        borderRadius: 20,
        padding: const EdgeInsets.all(20),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Today's Overview",
                style: TextStyle(
                  color: Colors.white.withOpacity(0.9),
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  // Wishes Sent + Progress Ring
                  Expanded(
                    flex: 2,
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Wishes Sent',
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.6),
                                  fontSize: 12,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Icon(Icons.call, color: Colors.green, size: 16),
                                  const SizedBox(width: 4),
                                  Icon(Icons.chat_bubble, color: Colors.purple[300], size: 16),
                                  const SizedBox(width: 4),
                                  Icon(Icons.message, color: Colors.teal, size: 16),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  AnimatedCountUp(
                                    end: wishesSent,
                                    duration: const Duration(milliseconds: 1200),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    ' / $totalEvents',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const Spacer(),
                          // Animated Progress Ring
                          AnimatedProgressRing(
                            progress: progress,
                            duration: const Duration(milliseconds: 1500),
                            color: const Color(0xFF00A896),
                            backgroundColor: Colors.white.withOpacity(0.1),
                            strokeWidth: 6,
                            child: AnimatedCountUp(
                              end: (progress * 100).toInt(),
                              duration: const Duration(milliseconds: 1200),
                              suffix: '%',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.8),
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Total Events
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Total Events',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.6),
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(Icons.cake, color: Colors.purple[300], size: 24),
                              const SizedBox(width: 8),
                              Expanded(
                                child: FittedBox(
                                  alignment: Alignment.centerLeft,
                                  fit: BoxFit.scaleDown,
                                  child: AnimatedCountUp(
                                    end: totalEvents,
                                    duration: const Duration(milliseconds: 1200),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
      ),
    );
  }

  Widget _buildHistoryTitle(DaySummary day) {
    // Basic date formatting, could be enhanced for 'Yesterday'
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final date = DateTime(day.date.year, day.date.month, day.date.day);
    
    String dateStr = DateFormat('EEEE, dd MMM').format(day.date);
    if (date == today.subtract(const Duration(days: 1))) {
      dateStr = "Yesterday, ${DateFormat('MMM dd').format(day.date)}";
    }

    final wishesSent = day.actions.where((a) => a.success).length; // Approximating wishes
    final totalEvents = day.actions.length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          dateStr,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          "$wishesSent Wishes Sent • $totalEvents Events",
          style: TextStyle(
            color: Colors.white.withOpacity(0.5),
            fontSize: 12,
          ),
        ),
      ],
    );
  }




  List<Widget> _buildGroupedTimeline(List<EnrichedTask> tasks) {
    // Group tasks by date
    Map<String, List<EnrichedTask>> grouped = {};
    for (var task in tasks) {
      final dateStr = DateFormat('EEEE, dd MMM').format(task.dueDate);
      grouped.putIfAbsent(dateStr, () => []).add(task);
    }

    List<Widget> items = [];
    grouped.forEach((date, dayTasks) {
      items.add(_buildDailyDetailHeader(date, dayTasks));
      items.add(const SizedBox(height: 12));
      for (var task in dayTasks) {
        items.add(Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: _buildTaskCard(task),
        ));
      }
      items.add(const SizedBox(height: 24));
    });
    return items;
  }

  Widget _buildDailyDetailHeader(String date, List<EnrichedTask> tasks) {
    final wishesSent = tasks.where((t) => t.callSent || t.smsSent || t.whatsappSent).length;
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.15),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            date,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
          ),
          Text(
            "$wishesSent Wishes Sent / ${tasks.length} Total",
            style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 12, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _buildReportStats(List<EnrichedTask> tasks) {
    final calls = tasks.where((t) => t.callSent).length;
    final chats = tasks.where((t) => t.smsSent || t.whatsappSent).length;
    final totalWishes = tasks.where((t) => t.callSent || t.smsSent || t.whatsappSent).length;
    
    return Row(
      children: [
        Expanded(child: _buildStatCard('Calls', calls.toString(), Icons.call, Colors.tealAccent)),
        const SizedBox(width: 12),
        Expanded(child: _buildStatCard('Chat', chats.toString(), Icons.chat_bubble, Colors.purpleAccent)),
        const SizedBox(width: 12),
        Expanded(child: _buildStatCard('Performance', "${totalWishes == 0 ? 0 : (totalWishes / tasks.length * 100).toInt()}%", Icons.trending_up, Colors.orangeAccent)),
      ],
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    // Determine colors based on selection state or other logic if needed
    final effectiveIconColor = color; // Or based on isSelected
    final effectiveTextColor = Colors.white; // Or based on isSelected

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.08),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
          ),
          Text(
            label,
            style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyHistory() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.1), style: BorderStyle.solid),
      ),
      child: Column(
        children: [
          Icon(Icons.history, color: Colors.white24, size: 48),
          const SizedBox(height: 16),
          const Text('No completed tasks yet', style: TextStyle(color: Colors.white38)),
        ],
      ),
    );
  }
  
  Widget _buildNoMeetingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: Icon(Icons.event_busy, size: 64, color: Colors.white.withOpacity(0.3)),
          ),
          const SizedBox(height: 24),
          const Text(
            'No meetings scheduled',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Active conference calls will appear here\nwhen scheduled via the dashboard.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white.withOpacity(0.5),
              fontSize: 14,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
  
  Widget _buildMeetingCard(Map<String, dynamic> data) {
    final title = data['title'] ?? 'Conference Call';
    final dialInNumber = data['dialInNumber'] ?? '';
    final accessCode = data['accessCode'] ?? '';
    final startTime = data['startTime'];
    final targetAudience = data['targetAudience'] ?? 'ALL';
    
    // Parse start time
    String formattedTime = 'Scheduled';
    if (startTime != null) {
      final DateTime dt = startTime is Timestamp 
          ? startTime.toDate() 
          : DateTime.parse(startTime.toString());
      formattedTime = DateFormat('MMM d, yyyy • h:mm a').format(dt);
    }
    
    return Padding(
      padding: const EdgeInsets.all(24),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.white.withOpacity(0.2)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.15),
                  blurRadius: 32,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Status Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.green.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 8, height: 8,
                          decoration: BoxDecoration(
                            color: Colors.greenAccent,
                            shape: BoxShape.circle,
                            boxShadow: [BoxShadow(color: Colors.green, blurRadius: 6)],
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'SCHEDULED',
                          style: TextStyle(
                            color: Colors.greenAccent,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Title
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  
                  const SizedBox(height: 8),
                  
                  // Time
                  Row(
                    children: [
                      Icon(Icons.access_time, size: 16, color: Colors.white.withOpacity(0.6)),
                      const SizedBox(width: 6),
                      Text(
                        formattedTime,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.8),
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 4),
                  
                  // Target Audience
                  Row(
                    children: [
                      Icon(Icons.group, size: 16, color: Colors.white.withOpacity(0.6)),
                      const SizedBox(width: 6),
                      Text(
                        'Target: $targetAudience',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.6),
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 20),
                  
                  // Dial-in Details Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withOpacity(0.1)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'DIAL-IN DETAILS',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.5),
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 1,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Icon(Icons.phone, size: 18, color: Colors.tealAccent),
                            const SizedBox(width: 10),
                            Expanded(
                              child: SingleChildScrollView(
                                scrollDirection: Axis.horizontal,
                                child: Text(
                                  dialInNumber,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(Icons.dialpad, size: 18, color: Colors.tealAccent),
                            const SizedBox(width: 10),
                            Expanded(
                              child: SingleChildScrollView(
                                scrollDirection: Axis.horizontal,
                                child: Text(
                                  'Access Code: $accessCode',
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.9),
                                    fontSize: 14,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                                   const SizedBox(height: 24),
                  
                  // Join Call Button (Vibrant & Animated Style)
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(50),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.4),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: ElevatedButton.icon(
                      onPressed: () => _launchPhone(dialInNumber),
                      icon: const Icon(Icons.call, size: 24),
                      label: const Text(
                        'JOIN CALL NOW',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, letterSpacing: 1),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 20),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(50),
                        ),
                        elevation: 0,
                      ),
                    ),
                  ),
                ],
              ),
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
              child: Icon(Icons.check_circle, size: 64, color: Colors.white.withOpacity(0.5)),
            ),
            const SizedBox(height: 16),
            Text(
              'No pending tasks',
              style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 16, fontWeight: FontWeight.w500),
            ),
          ],
        ),
      );
    }

    // Filter Logic
    final visibleList = tasks.where((t) {
       if (_filterType == 'BIRTHDAY') return t.type == 'BIRTHDAY'; // Assuming 'type' field holds this
       if (_filterType == 'ANNIVERSARY') return t.type == 'ANNIVERSARY';
       return true;
    }).toList();

    if (visibleList.isEmpty) {
      return Center(
         child: Text(
           "No ${_filterType == 'ALL' ? 'pending' : _filterType.toLowerCase()} tasks", 
           style: TextStyle(color: Colors.white.withOpacity(0.5))
         )
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.only(top: 80, bottom: 20, left: 24, right: 24),
      itemCount: visibleList.length,
      separatorBuilder: (_, __) => const SizedBox(height: 16),
      itemBuilder: (context, index) {
        final task = visibleList[index];
        // Staggered Animation: 50ms delay per item
        return AnimatedCardEntry(
          delay: Duration(milliseconds: 50 * index),
          duration: const Duration(milliseconds: 400),
          slideOffset: 30,
          child: _buildTaskCard(task),
        );
      },
    );
  }

  Widget _buildTaskCard(EnrichedTask task) {

    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12), // Match web's 12px blur
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.08),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: Colors.white.withOpacity(0.25)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.12),
                blurRadius: 32,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Stack(
            children: [
              // Caustic Light Overlay (top-left glow)
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                height: 60,
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.white.withOpacity(0.15),
                        Colors.transparent,
                      ],
                    ),
                  ),
                ),
              ),
              // Inner Content
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Row A: Name (Full Width, Bold 18, White)
            Text(
              task.name,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
              overflow: TextOverflow.ellipsis,
              maxLines: 1,
            ),
            
            const SizedBox(height: 8),
            
            // Row B: Mobile
            Row(
              children: [
                Icon(Icons.call, size: 14, color: Colors.white.withOpacity(0.6)),
                const SizedBox(width: 6),
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
            
            const SizedBox(height: 6),
            
            // Row C: Address (Block > GP > Ward)
            Text(
              "${task.block.isNotEmpty ? task.block : 'N/A'} > ${task.gramPanchayat.isNotEmpty ? task.gramPanchayat : 'N/A'} > Ward ${task.ward.isNotEmpty ? task.ward : 'N/A'}",
              style: TextStyle(
                fontSize: 12,
                color: Colors.white.withOpacity(0.5),
              ),
            ),
            
            const SizedBox(height: 8),
            
            // Row D: Event Context (Small Icon + Date)
            Row(
              children: [
                Icon(
                  task.type == 'BIRTHDAY' ? Icons.cake : Icons.favorite,
                  color: task.type == 'BIRTHDAY' ? Colors.pink : Colors.purple,
                  size: 16,
                ),
                const SizedBox(width: 6),
                Text(
                  DateFormat('dd MMM yyyy').format(task.dueDate),
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          
            const SizedBox(height: 16),
          
            // Row E: Action Buttons (Call, SMS, WhatsApp)
            Row(
              children: [
                  Expanded(child: _buildLiquidGlassButton("Call", Icons.call, const Color(0xFF00A896), task.callSent, () => _launchPhone(task))),
                  const SizedBox(width: 10),
                  Expanded(child: _buildLiquidGlassButton("SMS", Icons.message, Colors.purpleAccent, task.smsSent, () => _openAiWizard(task, 'SMS'))),
                  const SizedBox(width: 10),
                  Expanded(child: _buildLiquidGlassButton("WhatsApp", FontAwesomeIcons.whatsapp, const Color(0xFF25D366), task.whatsappSent, () => _openAiWizard(task, 'WHATSAPP'))),
              ],
            )
          ],
        ),
              ), // End Padding
            ], // End Stack children
          ), // End Stack
    ),
  ),
);
  }

  /// Liquid Glass Button - Premium Glassmorphism style with completed state
  Widget _buildLiquidGlassButton(String label, IconData icon, Color iconColor, bool isCompleted, VoidCallback onTap) {
    // Grey out if action is completed
    final effectiveIconColor = isCompleted ? Colors.grey[400]! : iconColor;
    final effectiveTextColor = isCompleted ? Colors.grey[500]! : Colors.white;
    final effectiveBgOpacity = isCompleted ? 0.05 : 0.10;
    
    return GestureDetector(
      onTap: isCompleted ? null : () {
        HapticFeedback.lightImpact(); // Premium tactile feedback
        onTap();
      },
      child: ClipRRect(
        borderRadius: BorderRadius.circular(50),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(effectiveBgOpacity),
              borderRadius: BorderRadius.circular(50),
              border: Border.all(
                color: isCompleted 
                    ? Colors.grey.withOpacity(0.15) 
                    : Colors.white.withOpacity(0.20), 
                width: 1,
              ),
              boxShadow: isCompleted ? [] : [
                BoxShadow(
                  color: iconColor.withOpacity(0.15),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 6),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.max,
                children: [
                  Icon(icon, size: 14, color: effectiveIconColor),
                  const SizedBox(width: 4),
                  Flexible(
                    child: Text(
                      label,
                      style: TextStyle(
                        color: effectiveTextColor, 
                        fontWeight: FontWeight.w600, 
                        fontSize: 13,
                      ),
                      overflow: TextOverflow.ellipsis,
                      maxLines: 1,
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

  /// Vertical Action Button - Icon with glow on top, small text below
  Widget _buildVerticalActionButton(IconData icon, String label, Color color, bool isCompleted, VoidCallback onTap) {
    final effectiveColor = isCompleted ? Colors.grey[400]! : color;
    final effectiveTextColor = isCompleted ? Colors.grey[500]! : Colors.white.withOpacity(0.7);
    
    return GestureDetector(
      onTap: isCompleted ? null : () {
        HapticFeedback.lightImpact();
        onTap();
      },
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Glowing Icon Container
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: effectiveColor.withOpacity(0.15),
              border: Border.all(color: effectiveColor.withOpacity(0.3), width: 1.5),
              boxShadow: isCompleted ? [] : [
                BoxShadow(
                  color: effectiveColor.withOpacity(0.4),
                  blurRadius: 12,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Icon(icon, color: effectiveColor, size: 22),
          ),
          const SizedBox(height: 6),
          // Label Text (small, like Block > GP > Ward)
          Text(
            label,
            style: TextStyle(
              color: effectiveTextColor,
              fontSize: 11,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  void _openAiWizard(EnrichedTask task, String actionType) {
    HapticFeedback.mediumImpact(); // Haptic feedback on modal open
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      // Spring physics curve matching Web's cubic-bezier(0.2, 0.8, 0.2, 1)
      transitionAnimationController: AnimationController(
        duration: const Duration(milliseconds: 400),
        vsync: this,
      )..addStatusListener((status) {
        if (status == AnimationStatus.dismissed) {
          // Clean up handled by Flutter
        }
      }),
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
    return Center(child: Text(message, style: const TextStyle(color: Colors.red)));
  }

  Future<void> _seedDemoData() async {
    final firestore = FirebaseFirestore.instance;
    final uid = FirebaseAuth.instance.currentUser?.uid ?? 'leader_pranab'; 
    
    // 1. Seed Ticker
    await firestore.collection('active_tickers').doc(uid).set({
      'title': 'Shri Pranab Balabantaray Dharmasla Block-Level Meeting',
      'startTime': Timestamp.fromDate(DateTime.now().add(const Duration(minutes: 30))),
      'meetUrl': 'https://meet.google.com/abc-defg-hij',
      'status': 'scheduled',
      'createdAt': FieldValue.serverTimestamp(),
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
    
    if (!mounted) return;
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('✅ Demo Data Seeded! Refreshing...'),
        backgroundColor: Colors.green,
      ),
    );
    
    // Trigger Refresh
    context.read<TaskBloc>().add(LoadPendingTasks());
  }

  Future<void> _launchPhone(dynamic target) async {
    String? number;
    if (target is String) {
      number = target;
    } else if (target is EnrichedTask) {
      number = target.mobile;
    }
    
    if (number != null && number.isNotEmpty) {
      final Uri launchUri = Uri(scheme: 'tel', path: number);
      if (await canLaunchUrl(launchUri)) {
        await launchUrl(launchUri);
        
        // If it's a task, show the outcome dialog after a brief delay
        if (target is EnrichedTask) {
           await Future.delayed(const Duration(milliseconds: 500));
           if (mounted) {
             _showActionOutcomeDialog(target, 'CALL');
           }
        }
        
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not launch dialer for $number')),
        );
      }
    } else {
       if (!mounted) return;
       ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No phone number available')),
        );
    }
  }
}
