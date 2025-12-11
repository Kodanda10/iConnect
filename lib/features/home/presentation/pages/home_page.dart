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

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with TickerProviderStateMixin {
  String _filter = 'ALL';
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

  void _launchPhone(String number) async {
    final uri = Uri.parse('tel:$number');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  void _launchSMS(String number, String message) async {
    final uri = Uri.parse('sms:$number?body=${Uri.encodeComponent(message)}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  void _launchWhatsApp(String number, String message) async {
    final cleanNumber = number.replaceAll(RegExp(r'[^0-9]'), '');
    final uri = Uri.parse('https://wa.me/$cleanNumber?text=${Uri.encodeComponent(message)}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _signOut() {
    context.read<AuthBloc>().add(AuthLogoutRequested());
  }

  List<EnrichedTask> _filterTasks(List<EnrichedTask> tasks) {
    if (_filter == 'ALL') return tasks;
    return tasks.where((t) => t.type == _filter).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: AppTheme.meshGradient,
        child: SafeArea(
          child: Column(
            children: [
              // Animated Header
              AnimatedBuilder(
                animation: _headerSlide,
                builder: (context, child) => Transform.translate(
                  offset: Offset(0, _headerSlide.value),
                  child: child,
                ),
                child: _buildHeader(),
              ),
              
              // Filter Chips
              _buildFilters(),
              
              // Task List
              Expanded(
                child: BlocBuilder<TaskBloc, TaskState>(
                  builder: (context, state) {
                    if (state is TaskLoading) {
                      return const Center(
                        child: CircularProgressIndicator(color: Colors.white),
                      );
                    } else if (state is TaskError) {
                      return Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.error_outline, color: AppColors.error, size: 48),
                            const SizedBox(height: 16),
                            Text(
                              state.message,
                              style: const TextStyle(color: Colors.white),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      );
                    } else if (state is TaskLoaded) {
                      return _buildTaskList(state.tasks);
                    }
                    return const SizedBox.shrink();
                  },
                ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: Container(
        decoration: BoxDecoration(
          gradient: AppTheme.secondaryGradient,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          boxShadow: [
            BoxShadow(
              color: AppColors.secondary.withOpacity(0.4),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: FloatingActionButton(
          onPressed: () {
            // Batch action sheet
            _showBatchActionSheet();
          },
          backgroundColor: Colors.transparent,
          elevation: 0,
          child: const Icon(Icons.send_rounded, color: Colors.white),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          // Profile/Logo
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              gradient: AppTheme.primaryGradient,
              borderRadius: BorderRadius.circular(AppRadius.md),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.4),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Icon(Icons.hub_outlined, color: Colors.white, size: 24),
          ),
          const SizedBox(width: 16),
          
          // Title
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'iConnect',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                Row(
                  children: [
                    Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppColors.success,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Leader Mode',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.6),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Sign Out
          IconButton(
            onPressed: _signOut,
            icon: Icon(Icons.logout_rounded, color: Colors.white.withOpacity(0.7)),
          ),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          _buildFilterChip('ALL', 'All'),
          const SizedBox(width: 8),
          _buildFilterChip('BIRTHDAY', 'Birthdays', icon: Icons.cake_outlined),
          const SizedBox(width: 8),
          _buildFilterChip('ANNIVERSARY', 'Anniversaries', icon: Icons.favorite_outline),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String value, String label, {IconData? icon}) {
    final isSelected = _filter == value;
    return GestureDetector(
      onTap: () => setState(() => _filter = value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          gradient: isSelected ? AppTheme.primaryGradient : null,
          color: isSelected ? null : Colors.white.withOpacity(0.1),
          borderRadius: BorderRadius.circular(AppRadius.full),
          border: Border.all(
            color: isSelected ? Colors.transparent : Colors.white.withOpacity(0.2),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 16, color: Colors.white),
              const SizedBox(width: 6),
            ],
            Text(
              label,
              style: TextStyle(
                color: Colors.white,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskList(List<EnrichedTask> allTasks) {
    final tasks = _filterTasks(allTasks);
    
    if (tasks.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.check_circle_outline, size: 64, color: Colors.white.withOpacity(0.2)),
            const SizedBox(height: 16),
            Text(
              'No pending tasks',
              style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 16),
            ),
          ],
        ),
      );
    }
    
    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: tasks.length,
      itemBuilder: (context, index) {
        final task = tasks[index];
        return TweenAnimationBuilder<double>(
          tween: Tween(begin: 0, end: 1),
          duration: Duration(milliseconds: 300 + (index * 100)),
          curve: Curves.easeOutCubic,
          builder: (context, value, child) {
            return Opacity(
              opacity: value,
              child: Transform.translate(
                offset: Offset(0, 20 * (1 - value)),
                child: child,
              ),
            );
          },
          child: _buildTaskCard(task),
        );
      },
    );
  }

  Widget _buildTaskCard(EnrichedTask task) {
    final isBirthday = task.type == 'BIRTHDAY';
    final isToday = DateFormat('yyyy-MM-dd').format(task.dueDate) == DateFormat('yyyy-MM-dd').format(DateTime.now());
    final dateStr = isToday ? 'Today' : DateFormat('MMM d').format(task.dueDate);
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppRadius.xl),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: AppTheme.glassCard(opacity: 0.15),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    // Type Icon
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: (isBirthday ? AppColors.birthday : AppColors.anniversary)
                            .withOpacity(0.2),
                        borderRadius: BorderRadius.circular(AppRadius.md),
                      ),
                      child: Icon(
                        isBirthday ? Icons.cake_outlined : Icons.favorite_outline,
                        color: isBirthday ? AppColors.birthday : AppColors.anniversary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    
                    // Name & Details
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            task.name,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Ward ${task.ward} • $dateStr',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.5),
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                    
                    // Due Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: isToday
                            ? AppColors.warning.withOpacity(0.2)
                            : Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(AppRadius.full),
                      ),
                      child: Text(
                        dateStr,
                        style: TextStyle(
                          color: isToday
                              ? AppColors.warning
                              : Colors.white.withOpacity(0.6),
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 16),
                
                // Action Buttons
                Row(
                  children: [
                    Expanded(
                      child: _buildActionButton(
                        'Call',
                        Icons.phone_outlined,
                        Colors.white.withOpacity(0.1),
                        Colors.white,
                        () => _launchPhone(task.mobile),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildActionButton(
                        'SMS',
                        Icons.message_outlined,
                        Colors.blue.withOpacity(0.2),
                        Colors.blue,
                        () => _openAiWizard(task, 'SMS'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildActionButton(
                        'WhatsApp',
                        Icons.chat_bubble_outline,
                        Colors.green.withOpacity(0.2),
                        Colors.green,
                        () => _openAiWizard(task, 'WHATSAPP'),
                      ),
                    ),
                  ],
                ),
              ],
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

  Widget _buildActionButton(
    String label,
    IconData icon,
    Color bgColor,
    Color iconColor,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(AppRadius.md),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 16, color: iconColor),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: iconColor,
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Simplified batch show
  void _showBatchActionSheet() {
    // ... same as before
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.bgGradientStart,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.3),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Batch Actions',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(color: Colors.white),
            ),
            const SizedBox(height: 8),
            Text(
              'Send greetings to all pending tasks',
              style: TextStyle(color: Colors.white.withOpacity(0.5)),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: _buildBatchButton('WhatsApp All', Icons.chat_bubble_outline, AppColors.success),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildBatchButton('SMS All', Icons.message_outlined, Colors.blue),
                ),
              ],
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildBatchButton(String label, IconData icon, Color color) {
    return Container(
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(AppRadius.lg),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          onTap: () => Navigator.pop(context),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, color: color),
                const SizedBox(width: 8),
                Text(
                  label,
                  style: TextStyle(color: color, fontWeight: FontWeight.w700),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
