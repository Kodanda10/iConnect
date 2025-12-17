import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/theme/app_theme.dart';
import '../bloc/greeting_bloc.dart';
import '../bloc/greeting_event.dart';
import '../bloc/greeting_state.dart';

import '../../../tasks/presentation/bloc/task_bloc.dart';
import '../../../tasks/presentation/bloc/task_event.dart';

class AiGreetingSheet extends StatefulWidget {
  final String taskId;
  final String constituentName;
  final String type;
  final String mobile;
  final String actionType; // 'WHATSAPP' or 'SMS'

  const AiGreetingSheet({
    super.key,
    required this.taskId,
    required this.constituentName,
    required this.type,
    required this.mobile,
    required this.actionType,
  });

  @override
  State<AiGreetingSheet> createState() => _AiGreetingSheetState();
}

class _AiGreetingSheetState extends State<AiGreetingSheet> {
  String _language = 'English';
  final List<String> _languages = ['English', 'Hindi', 'Odia'];

  String _tone = 'Warm';
  final List<String> _tones = ['Warm', 'Formal', 'Excited'];

  final TextEditingController _messageController = TextEditingController();
  bool _hasGenerated = false;

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  void _generate() {
    context.read<GreetingBloc>().add(
      GenerateGreetingRequested(
        constituentName: widget.constituentName,
        type: widget.type,
        language: _language,
      ),
    );
  }

  void _send() async {
    final message = _messageController.text;
    if (message.isEmpty) return;

    // 1. Launch App
    if (widget.actionType == 'WHATSAPP') {
      final cleanNumber = widget.mobile.replaceAll(RegExp(r'[^0-9]'), '');
      final uri = Uri.parse(
        'https://wa.me/$cleanNumber?text=${Uri.encodeComponent(message)}',
      );
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } else {
      final uri = Uri.parse(
        'sms:${widget.mobile}?body=${Uri.encodeComponent(message)}',
      );
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      }
    }

    // 2. Show Verification Dialog (after a short delay to simulate return)
    if (mounted) {
      _showCompletionDialog();
    }
  }

  void _showCompletionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      'Outcome for ${widget.constituentName}?',
                      style: const TextStyle(
                        color: Color(0xFF111827),
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(ctx),
                    icon: const Icon(Icons.close, color: Colors.grey),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Action Summary
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[50],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.person_outline, color: Colors.grey),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Action taken: ${widget.actionType}',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 12,
                          ),
                        ),
                        Text(
                          widget.constituentName,
                          style: const TextStyle(
                            color: Color(0xFF00A896),
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Connected/Sent Button
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: () {
                  // Mark action as sent
                  context.read<TaskBloc>().add(
                    UpdateActionStatus(
                      taskId: widget.taskId,
                      actionType: widget.actionType,
                    ),
                  );
                  Navigator.pop(ctx);
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Action recorded!'),
                      backgroundColor: Colors.teal,
                    ),
                  );
                },
                icon: const Icon(Icons.check, color: Colors.white),
                label: const Text(
                  'Connected / Sent',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
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
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: () {
                        Navigator.pop(ctx);
                        Navigator.pop(context);
                        // Keep pending, no status update
                      },
                      child: const Text('No Answer'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.grey[600],
                        side: BorderSide(color: Colors.grey[300]!),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: () {
                        Navigator.pop(ctx);
                        Navigator.pop(context);
                        // TODO: Implement reschedule logic
                      },
                      icon: const Icon(Icons.schedule, size: 18),
                      label: const Text('Reschedule'),
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

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        top: 24,
        left: 24,
        right: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: Colors.black26,
            blurRadius: 24,
            offset: Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Handle
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF134E4A).withOpacity(0.05),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Icon(
                  widget.actionType == 'WHATSAPP'
                      ? Icons.chat_bubble
                      : Icons.message,
                  color: const Color(0xFF134E4A),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'AI Message Wizard',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: const Color(0xFF111827),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Drafting for ${widget.constituentName}',
                      style: TextStyle(color: Colors.grey[500]),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Controls (Language & Tone)
          Row(
            children: [
              Expanded(
                child: _buildDropdown(
                  value: _language,
                  items: _languages,
                  icon: Icons.language,
                  onChanged: (val) => setState(() => _language = val!),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildDropdown(
                  value: _tone,
                  items: _tones,
                  icon: Icons.tune,
                  onChanged: (val) => setState(() => _tone = val!),
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Helper: "Generate" button if not yet generated
          if (!_hasGenerated)
            ElevatedButton.icon(
              onPressed: _generate,
              icon: const Icon(Icons.auto_awesome, color: Colors.white),
              label: const Text(
                'Generate with AI',
                style: TextStyle(color: Colors.white),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF134E4A),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),

          // Content Area (Bloc Consumer)
          BlocConsumer<GreetingBloc, GreetingState>(
            listener: (context, state) {
              if (state is GreetingLoaded) {
                _messageController.text = state.greeting;
                setState(() => _hasGenerated = true);
              }
            },
            builder: (context, state) {
              if (state is GreetingLoading) {
                return const Padding(
                  padding: EdgeInsets.symmetric(vertical: 32),
                  child: Center(
                    child: CircularProgressIndicator(color: Color(0xFF134E4A)),
                  ),
                );
              }

              if (_hasGenerated || state is GreetingLoaded) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(top: 16),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.grey[50],
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey[200]!),
                      ),
                      child: TextField(
                        controller: _messageController,
                        maxLines: 4,
                        style: const TextStyle(
                          color: Color(0xFF111827),
                          fontSize: 16,
                        ),
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          hintText: 'Message will appear here...',
                          hintStyle: TextStyle(color: Colors.grey[400]),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        IconButton(
                          onPressed: _generate,
                          icon: Icon(Icons.refresh, color: Colors.grey[600]),
                          tooltip: 'Regenerate',
                        ),
                        const Spacer(),
                        IconButton(
                          onPressed: () {
                            Clipboard.setData(
                              ClipboardData(text: _messageController.text),
                            );
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Copied!')),
                            );
                          },
                          icon: Icon(Icons.copy, color: Colors.grey[600]),
                          tooltip: 'Copy',
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: _send,
                      icon: Icon(
                        widget.actionType == 'WHATSAPP'
                            ? Icons.send
                            : Icons.sms,
                        color: Colors.white,
                      ),
                      label: Text(
                        'Send via ${widget.actionType == 'WHATSAPP' ? 'WhatsApp' : 'SMS'}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: widget.actionType == 'WHATSAPP'
                            ? const Color(0xFF10B981)
                            : Colors.blue[600],
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                    ),
                  ],
                );
              }

              return const SizedBox.shrink();
            },
          ),

          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildDropdown({
    required String value,
    required List<String> items,
    required IconData icon,
    required Function(String?) onChanged,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(50),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          icon: Icon(icon, color: Colors.grey[400], size: 16),
          dropdownColor: Colors.white,
          style: const TextStyle(
            color: Color(0xFF111827),
            fontWeight: FontWeight.bold,
            fontSize: 13,
          ),
          items: items
              .map((e) => DropdownMenuItem(value: e, child: Text(e)))
              .toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }
}
