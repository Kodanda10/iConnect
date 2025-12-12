import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:url_launcher/url_launcher.dart';
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
    context.read<TaskBloc>().add(LoadPendingTasks());
  }

  @override
  void dispose() {
    _headerAnim.dispose();
    super.dispose();
  }

  // --- Actions ---

  void _launchPhone(String number) async {
    final uri = Uri.parse('tel:$number');
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  void _launchSMS(String number, String message) async {
    final uri = Uri.parse('sms:$number?body=${Uri.encodeComponent(message)}');
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  void _launchWhatsApp(String number, String message) async {
    final cleanNumber = number.replaceAll(RegExp(r'[^0-9]'), '');
    final uri = Uri.parse('https://wa.me/$cleanNumber?text=${Uri.encodeComponent(message)}');
    if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
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
    return Scaffold(
      backgroundColor: Colors.grey[50], // Light background matching React
      body: Column(
        children: [
          // Custom Header Section
          _buildHeader(),
          
          // Sub Filters (All / Birthday / Anniversary)
          _buildSubFilters(),
          
          // Task List
          Expanded(
            child: BlocBuilder<TaskBloc, TaskState>(
              builder: (context, state) {
                if (state is TaskLoading) {
                  return const Center(child: CircularProgressIndicator(color: Colors.teal));
                } else if (state is TaskError) {
                  return _buildErrorState(state.message);
                } else if (state is TaskLoaded) {
                  final tasks = _filterTasks(state.tasks);
                  // Quick hack: Calculate counts based on ALL loaded tasks
                  // In a real app, counts might come from metadata
                  return _buildTaskList(tasks);
                }
                return const SizedBox.shrink();
              },
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
            decoration: const BoxDecoration(
              color: Color(0xFF134E4A), // teal-900 equivalent
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(32)),
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
                      : Image.network(
                          "https://picsum.photos/seed/bg/800/600", // Fallback placeholder
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
                          _buildMainTab('PENDING', 'Pending', true),
                          _buildMainTab('COMPLETED', 'History', false),
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
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Colors.grey[100]!)),
      ),
      child: BlocBuilder<TaskBloc, TaskState>(
        builder: (context, state) {
          int countAll = 0, countBirthday = 0, countAnniversary = 0;
          if (state is TaskLoaded) {
             final list = state.tasks.where((t) => t.status == 'PENDING').toList(); // Only count pending for filters
             countAll = list.length;
             countBirthday = list.where((t) => t.type == 'BIRTHDAY').length;
             countAnniversary = list.where((t) => t.type == 'ANNIVERSARY').length;
          }

          return SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                _buildFilterChip('ALL', 'All', null, countAll),
                const SizedBox(width: 8),
                _buildFilterChip('BIRTHDAY', 'Birthdays', Icons.card_giftcard, countBirthday),
                const SizedBox(width: 8),
                _buildFilterChip('ANNIVERSARY', 'Anniversaries', Icons.favorite, countAnniversary),
              ],
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
       activeColor = Colors.purple;
       activeBg = Colors.purple[50]!;
    }

    return GestureDetector(
      onTap: () => setState(() => _filterType = key),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? activeBg : Colors.white,
          borderRadius: BorderRadius.circular(50),
          border: Border.all(
            color: isSelected ? activeColor.withOpacity(0.3) : Colors.grey[200]!,
          ),
        ),
        child: Row(
          children: [
            if (icon != null) ...[
              Icon(icon, size: 14, color: isSelected ? activeColor : Colors.grey[400]),
              const SizedBox(width: 6),
            ],
            Text(
              label.toUpperCase(),
              style: TextStyle(
                color: isSelected ? activeColor : Colors.grey[500],
                fontSize: 11,
                fontWeight: FontWeight.w800,
              ),
            ),
            if (count > 0) ...[
               const SizedBox(width: 4),
               Text(
                 "($count)",
                 style: TextStyle(
                   color: isSelected ? activeColor : Colors.grey[400],
                   fontSize: 11,
                   fontWeight: FontWeight.bold,
                 ),
               ),
            ]
          ],
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
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.check_circle, size: 64, color: Colors.grey[300]),
            ),
            const SizedBox(height: 16),
            Text(
              'No pending tasks',
              style: TextStyle(color: Colors.grey[500], fontSize: 16, fontWeight: FontWeight.w500),
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
    final Color typeBg = isBirthday ? Colors.pink[50]! : Colors.purple[50]!;
    final IconData typeIcon = isBirthday ? Icons.card_giftcard : Icons.favorite;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey[100]!),
        boxShadow: const [BoxShadow(color: Color.fromRGBO(0, 0, 0, 0.04), blurRadius: 16, offset: Offset(0, 4))],
      ),
      padding: const EdgeInsets.all(20),
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
                  color: typeBg,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(typeIcon, color: typeColor, size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                       mainAxisAlignment: MainAxisAlignment.spaceBetween,
                       children: [
                           Expanded(child: Text(
                             task.name,
                             style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF111827)),
                           )),
                           Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.grey[50],
                                border: Border.all(color: Colors.grey[200]!),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                "WARD ${task.ward}",
                                style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey[500]),
                              ),
                           ),
                       ],
                    ),
                    const SizedBox(height: 4),
                    const Row(
                       children: [
                           Icon(Icons.calendar_today, size: 12, color: Colors.grey),
                           SizedBox(width: 4),
                           Text("2025-12-12", style: TextStyle(fontSize: 12, color: Colors.grey)), // Placeholder date
                       ],
                    )
                  ],
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 8),

          // Address
          const Padding(
            padding: EdgeInsets.only(left: 64.0),
            child: Row(
               children: [
                  Icon(Icons.location_on, size: 12, color: Colors.grey),
                  SizedBox(width: 4),
                  Text("20, MG Road", style: TextStyle(color: Colors.grey, fontSize: 12)),
               ],
            ),
          ),
          
          const SizedBox(height: 20),
          
          // Action Buttons
          Row(
            children: [
              Expanded(child: _buildActionButton("Call", Icons.phone, Colors.grey[50]!, Colors.grey[700]!, () => _launchPhone(task.mobile))),
              const SizedBox(width: 8),
              Expanded(child: _buildActionButton("SMS", Icons.message, const Color(0xFFEFF6FF), Colors.blue[600]!, () => _openAiWizard(task, 'SMS'))),
              const SizedBox(width: 8),
              Expanded(child: _buildActionButton("WhatsApp", Icons.chat_bubble, const Color(0xFFECFDF5), const Color(0xFF10B981), () => _openAiWizard(task, 'WHATSAPP'))),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildActionButton(String label, IconData icon, Color bg, Color text, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 48,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: bg == Colors.grey[50] ? Colors.grey[200]! : Colors.transparent),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 16, color: text),
            const SizedBox(width: 8),
            Text(label, style: TextStyle(color: text, fontWeight: FontWeight.bold, fontSize: 13)),
          ],
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
    return Center(child: Text(message, style: const TextStyle(color: Colors.red)));
  }
}
