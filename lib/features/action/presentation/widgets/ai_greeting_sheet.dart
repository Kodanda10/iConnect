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
      final uri = Uri.parse('https://wa.me/$cleanNumber?text=${Uri.encodeComponent(message)}');
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } else {
      final uri = Uri.parse('sms:${widget.mobile}?body=${Uri.encodeComponent(message)}');
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri);
      }
    }
    
    // 2. Show Verification Dialog (after a short delay to simulate return)
    if (mounted) {
      // Close sheet first? No, maybe keep it open or show dialog on top.
      // Better to check "Did you send it?"
      _showCompletionDialog();
    }
  }
  
  void _showCompletionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white.withOpacity(0.9),
        title: const Text('Task Completion', style: TextStyle(color: AppColors.primaryText)),
        content: Text('Did you successfully send the ${widget.type.toLowerCase()} wish to ${widget.constituentName}?'),
        actions: [
          TextButton(
            onPressed: () { 
              Navigator.pop(ctx); // Close dialog
            },
            child: const Text('No, keep pending', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () {
              // Mark Done
              context.read<TaskBloc>().add(UpdateTaskStatus(
                taskId: widget.taskId,
                status: 'COMPLETED',
              ));
              Navigator.pop(ctx); // Close dialog
              Navigator.pop(context); // Close sheet
              
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Task marked as completed!'),
                  backgroundColor: AppColors.success,
                ),
              );
            },
            child: const Text('Yes, Mark Done', style: TextStyle(color: Colors.white)),
          ),
        ],
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
      decoration: BoxDecoration(
        color: AppColors.bgGradientStart, // Fallback
        image: const DecorationImage(
          image: AssetImage('assets/images/mesh_bg.png'), // If we had one, but we use code gradient
          fit: BoxFit.cover,
        ),
        gradient: AppTheme.secondaryGradient, // Using secondary for action sheet
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
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
                color: Colors.white.withOpacity(0.3),
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
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                ),
                child: Icon(
                  widget.actionType == 'WHATSAPP' ? Icons.chat_bubble : Icons.message,
                  color: Colors.white,
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
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      'Drafting for ${widget.constituentName}',
                      style: TextStyle(color: Colors.white.withOpacity(0.7)),
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
              label: const Text('Generate with AI', style: TextStyle(color: Colors.white)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.lg)),
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
                  child: Center(child: CircularProgressIndicator(color: Colors.white)),
                );
              }
              
              if (_hasGenerated || state is GreetingLoaded) {
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (_hasGenerated && state is! GreetingLoaded) ...[
                       // Keep showing text box even if we reset state (though we don't reset here)
                    ],
                    
                    Container(
                      margin: const EdgeInsets.only(top: 16),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(AppRadius.lg),
                        border: Border.all(color: Colors.white.withOpacity(0.2)),
                      ),
                      child: TextField(
                        controller: _messageController,
                        maxLines: 4,
                        style: const TextStyle(color: Colors.white, fontSize: 16),
                        decoration: const InputDecoration(
                          border: InputBorder.none,
                          hintText: 'Message will appear here...',
                          hintStyle: TextStyle(color: Colors.white30),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        IconButton(
                          onPressed: _generate, 
                          icon: const Icon(Icons.refresh, color: Colors.white70),
                          tooltip: 'Regenerate',
                        ),
                        const Spacer(),
                        IconButton(
                          onPressed: () {
                             Clipboard.setData(ClipboardData(text: _messageController.text));
                             ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Copied!')));
                          },
                          icon: const Icon(Icons.copy, color: Colors.white70),
                          tooltip: 'Copy',
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: _send,
                      icon: Icon(
                        widget.actionType == 'WHATSAPP' ? Icons.send : Icons.sms, 
                        color: AppColors.primary
                      ),
                      label: Text(
                        'Send via ${widget.actionType == 'WHATSAPP' ? 'WhatsApp' : 'SMS'}',
                        style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.lg)),
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
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: Colors.white.withOpacity(0.2)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          icon: Icon(icon, color: Colors.white70, size: 20),
          dropdownColor: AppColors.secondary,
          style: const TextStyle(color: Colors.white),
          items: items.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }
}
