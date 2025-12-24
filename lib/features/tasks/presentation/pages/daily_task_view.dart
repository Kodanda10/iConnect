import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/app_background.dart';
import '../../domain/entities/task.dart';
import '../bloc/task_bloc.dart';
import '../bloc/task_event.dart';
import '../bloc/task_state.dart';
import '../widgets/shimmer_task_card.dart';
import '../../../action/presentation/widgets/ai_greeting_sheet.dart';

/// Daily Task View - Shows tasks for a specific selected date
/// 
/// @changelog
/// - 2024-12-24: Initial implementation for Calendar "Time Travel" feature
class DailyTaskView extends StatefulWidget {
  final DateTime selectedDate;

  const DailyTaskView({super.key, required this.selectedDate});

  @override
  State<DailyTaskView> createState() => _DailyTaskViewState();
}

class _DailyTaskViewState extends State<DailyTaskView> {
  static const String leaderSignature = "\n\n- Pranab Balabantaray";

  @override
  void initState() {
    super.initState();
    // Load tasks for selected date
    context.read<TaskBloc>().add(LoadTasksForDate(widget.selectedDate));
  }

  String get _formattedDate {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final selected = DateTime(
      widget.selectedDate.year, 
      widget.selectedDate.month, 
      widget.selectedDate.day
    );
    
    if (selected == today) {
      return "Today, ${DateFormat('MMM dd').format(widget.selectedDate)}";
    } else if (selected == today.subtract(const Duration(days: 1))) {
      return "Yesterday, ${DateFormat('MMM dd').format(widget.selectedDate)}";
    } else if (selected == today.add(const Duration(days: 1))) {
      return "Tomorrow, ${DateFormat('MMM dd').format(widget.selectedDate)}";
    }
    return DateFormat('EEEE, MMM dd, yyyy').format(widget.selectedDate);
  }

  @override
  Widget build(BuildContext context) {
    return AppBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Tasks',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                _formattedDate,
                style: TextStyle(
                  color: Colors.white.withOpacity(0.7),
                  fontSize: 13,
                ),
              ),
            ],
          ),
        ),
        body: BlocBuilder<TaskBloc, TaskState>(
          builder: (context, state) {
            if (state is TaskLoading) {
              return const ShimmerTaskList(itemCount: 3);
            } else if (state is TaskError) {
              return _buildErrorState(state.message);
            } else if (state is TaskLoaded) {
              return RefreshIndicator(
                color: AppColors.primary,
                backgroundColor: Colors.white,
                onRefresh: () async {
                  context.read<TaskBloc>().add(LoadTasksForDate(widget.selectedDate));
                },
                child: _buildTaskList(state.tasks),
              );
            }
            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Text(message, style: const TextStyle(color: Colors.red)),
    );
  }

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
                Icons.event_available, 
                size: 64, 
                color: Colors.white.withOpacity(0.5)
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'No tasks for $_formattedDate',
              style: TextStyle(
                color: Colors.white.withOpacity(0.8), 
                fontSize: 16, 
                fontWeight: FontWeight.w500
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
      itemBuilder: (context, index) => _buildTaskCard(tasks[index]),
    );
  }

  Widget _buildTaskCard(EnrichedTask task) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(24),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
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
              // Caustic Light Overlay
              Positioned(
                top: 0, left: 0, right: 0, height: 60,
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
              // Content
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Name
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
                    // Mobile
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
                    // Address
                    Text(
                      "${task.block.isNotEmpty ? task.block : 'N/A'} > ${task.gramPanchayat.isNotEmpty ? task.gramPanchayat : 'N/A'} > Ward ${task.ward.isNotEmpty ? task.ward : 'N/A'}",
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white.withOpacity(0.5),
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Event Context
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
                    // Action Buttons
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildVerticalActionButton(
                          Icons.call, "Call", const Color(0xFF00A896), 
                          task.callSent, () => _launchPhone(task)
                        ),
                        _buildVerticalActionButton(
                          Icons.message, "SMS", Colors.purpleAccent, 
                          task.smsSent, () => _openAiWizard(task, 'SMS')
                        ),
                        _buildVerticalActionButton(
                          FontAwesomeIcons.whatsapp, "WhatsApp", const Color(0xFF25D366), 
                          task.whatsappSent, () => _openAiWizard(task, 'WHATSAPP')
                        ),
                      ],
                    )
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildVerticalActionButton(
    IconData icon, String label, Color color, bool isCompleted, VoidCallback onTap
  ) {
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
          Container(
            width: 50, height: 50,
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
    HapticFeedback.mediumImpact();
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

  Future<void> _launchPhone(EnrichedTask task) async {
    final number = task.mobile;
    if (number.isNotEmpty) {
      final Uri launchUri = Uri(scheme: 'tel', path: number);
      if (await canLaunchUrl(launchUri)) {
        await launchUrl(launchUri);
      }
    }
  }
}
