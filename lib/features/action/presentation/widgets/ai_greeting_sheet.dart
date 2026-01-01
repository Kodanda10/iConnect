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

/// @file lib/features/action/presentation/widgets/ai_greeting_sheet.dart
/// @description AI Greeting Message Wizard with white glassmorphism theme
/// @changelog
/// - 2024-12-17: Initial implementation
/// - 2025-12-18: Upgraded to dark glassmorphism theme (deprecated)
/// - 2025-12-26: Migrated to White Theme (White/Green Glass)

class AiGreetingSheet extends StatefulWidget {
  final String taskId;
  final String constituentName;
  final String type;
  final String mobile;
  final String actionType; // 'WHATSAPP' or 'SMS'
  final String? leaderName; // Leader's name for signature

  const AiGreetingSheet({
    super.key,
    required this.taskId,
    required this.constituentName,
    required this.type,
    required this.mobile,
    required this.actionType,
    this.leaderName,
  });

  @override
  State<AiGreetingSheet> createState() => _AiGreetingSheetState();
}

class _AiGreetingSheetState extends State<AiGreetingSheet> {
  String _language = 'Odia'; // Default to Odia
  final List<String> _languages = ['Odia', 'English', 'Hindi'];
  
  final TextEditingController _messageController = TextEditingController();
  bool _hasGenerated = false;

  @override
  void initState() {
    super.initState();
    // Pre-draft message with constituent name and leader signature
    _prefillMessage();
  }

  void _prefillMessage() {
    final name = widget.constituentName;
    final leaderSig = widget.leaderName != null 
        ? '\n\nଶୁଭେଚ୍ଛା ସହ,\n${widget.leaderName}'
        : '';
    
    String message;
    if (widget.type == 'BIRTHDAY') {
      // Odia Birthday message
      message = '''ପ୍ରିୟ $name,

ଆପଣଙ୍କୁ ଜନ୍ମଦିନର ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା! 🎂 

ଆପଣଙ୍କ ଜୀବନ ସୁଖ, ସମୃଦ୍ଧି ଏବଂ ସଫଳତାରେ ଭରପୂର ହେଉ। ଭଗବାନ ଆପଣଙ୍କୁ ସୁସ୍ଥ ଓ ଦୀର୍ଘାୟୁ କରନ୍ତୁ।$leaderSig''';
    } else {
      // Odia Anniversary message
      message = '''ପ୍ରିୟ $name,

ଆପଣଙ୍କ ବିବାହ ବାର୍ଷିକୀ ଅବସରରେ ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା! 💕

ଆପଣଙ୍କ ଦାମ୍ପତ୍ୟ ଜୀବନ ସୁଖ, ଶାନ୍ତି ଓ ସମୃଦ୍ଧିରେ ପରିପୂର୍ଣ୍ଣ ହେଉ।$leaderSig''';
    }
    
    _messageController.text = message;
    setState(() => _hasGenerated = true);
  }

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

  /// Regenerate message when language changes - show pre-drafted message immediately
  void _regenerateForLanguage(String language) {
    final name = widget.constituentName;
    final leaderSig = widget.leaderName ?? '';
    
    String message;
    if (widget.type == 'BIRTHDAY') {
      switch (language) {
        case 'English':
          message = '''Dear $name,

Wishing you a very Happy Birthday! 🎂

May your life be filled with happiness, prosperity and success. May God bless you with good health and long life.${leaderSig.isNotEmpty ? '\n\nWith warm regards,\n$leaderSig' : ''}''';
          break;
        case 'Hindi':
          message = '''प्रिय $name,

आपको जन्मदिन की हार्दिक शुभकामनाएं! 🎂

आपका जीवन सुख, समृद्धि और सफलता से भरपूर हो। भगवान आपको स्वस्थ और दीर्घायु करें।${leaderSig.isNotEmpty ? '\n\nशुभकामनाओं सहित,\n$leaderSig' : ''}''';
          break;
        default: // Odia
          message = '''ପ୍ରିୟ $name,

ଆପଣଙ୍କୁ ଜନ୍ମଦିନର ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା! 🎂 

ଆପଣଙ୍କ ଜୀବନ ସୁଖ, ସମୃଦ୍ଧି ଏବଂ ସଫଳତାରେ ଭରପୂର ହେଉ। ଭଗବାନ ଆପଣଙ୍କୁ ସୁସ୍ଥ ଓ ଦୀର୍ଘାୟୁ କରନ୍ତୁ।${leaderSig.isNotEmpty ? '\n\nଶୁଭେଚ୍ଛା ସହ,\n$leaderSig' : ''}''';
      }
    } else {
      // Anniversary
      switch (language) {
        case 'English':
          message = '''Dear $name,

Wishing you a very Happy Anniversary! 💕

May your married life be filled with happiness, peace and prosperity.${leaderSig.isNotEmpty ? '\n\nWith warm regards,\n$leaderSig' : ''}''';
          break;
        case 'Hindi':
          message = '''प्रिय $name,

आपको शादी की वार्षिकी की हार्दिक शुभकामनाएं! 💕

आपका दाम्पत्य जीवन सुख, शांति और समृद्धि से भरपूर हो।${leaderSig.isNotEmpty ? '\n\nशुभकामनाओं सहित,\n$leaderSig' : ''}''';
          break;
        default: // Odia
          message = '''ପ୍ରିୟ $name,

ଆପଣଙ୍କ ବିବାହ ବାର୍ଷିକୀ ଅବସରରେ ହାର୍ଦ୍ଦିକ ଶୁଭେଚ୍ଛା! 💕

ଆପଣଙ୍କ ଦାମ୍ପତ୍ୟ ଜୀବନ ସୁଖ, ଶାନ୍ତି ଓ ସମୃଦ୍ଧିରେ ପରିପୂର୍ଣ୍ଣ ହେଉ।${leaderSig.isNotEmpty ? '\n\nଶୁଭେଚ୍ଛା ସହ,\n$leaderSig' : ''}''';
      }
    }
    
    _messageController.text = message;
    setState(() => _hasGenerated = true);
  }

  void _send() async {
    final message = _messageController.text;
    if (message.isEmpty) return;

    const String leaderSignature = "\n\n- Pranab Balabantaray";
    final fullMessage = "$message$leaderSignature";
    
    // 1. Launch App
    if (widget.actionType == 'WHATSAPP') {
      final cleanNumber = widget.mobile.replaceAll(RegExp(r'\D'), '');
      final nativeUri = Uri.parse('whatsapp://send?phone=$cleanNumber&text=${Uri.encodeComponent(fullMessage)}');
      
      // Try Native Launch
      bool launched = await launchUrl(nativeUri, mode: LaunchMode.externalApplication);
      
      if (!launched) {
        // Fallback to Web
        final webUri = Uri.parse('https://wa.me/$cleanNumber?text=${Uri.encodeComponent(fullMessage)}');
        launched = await launchUrl(webUri, mode: LaunchMode.externalApplication);
      }
      
      if (!launched) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Could not open WhatsApp')),
            );
          }
          return; // Do not pop
      }
    } else {
      final cleanNumber = widget.mobile.replaceAll(RegExp(r'\D'), '');
      final uri = Uri.parse('sms:$cleanNumber?body=${Uri.encodeComponent(fullMessage)}');
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    }
    
    // 2. Pop the sheet and return true to trigger Outcome Dialog in parent
    if (mounted) {
      Navigator.pop(context, true);
    }
  }
  
  @override
  Widget build(BuildContext context) {
    // White Theme Implementation
    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 16, sigmaY: 16),
        child: Container(
          padding: EdgeInsets.only(
            top: 24,
            left: 24,
            right: 24,
            bottom: MediaQuery.of(context).viewInsets.bottom + 24,
          ),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 24, offset: const Offset(0, -4))],
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
                    color: Colors.grey.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.secondary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.secondary.withOpacity(0.2)),
                    ),
                    child: Icon(
                      widget.actionType == 'WHATSAPP' ? Icons.chat_bubble : Icons.message,
                      color: AppColors.secondary,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${widget.type == "BIRTHDAY" ? "Birthday" : "Anniversary"} Greetings',
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.bold,
                            fontSize: 20,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'For ${widget.constituentName}',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              
              // Language Toggle
              _buildDropdown(
                value: _language,
                items: _languages,
                icon: Icons.language,
                onChanged: (val) {
                  setState(() => _language = val!);
                  _regenerateForLanguage(val!);
                },
              ),
              const SizedBox(height: 24),
              
              // Helper: "Generate" button if not yet generated
              if (!_hasGenerated)
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(0.3),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ElevatedButton.icon(
                    onPressed: _generate,
                    icon: const Icon(Icons.auto_awesome, color: Colors.white),
                    label: const Text('Generate with AI', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      padding: const EdgeInsets.symmetric(vertical: 18),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                  ),
                ),

              // Content Area (Bloc Consumer)
              BlocConsumer<GreetingBloc, GreetingState>(
                listener: (context, state) {
                  if (state is GreetingLoaded) {
                    // Add leader signature to generated greeting
                    final signature = widget.leaderName != null 
                        ? '\n\nWith warm regards,\n${widget.leaderName}'
                        : '';
                    _messageController.text = state.greeting + signature;
                    setState(() => _hasGenerated = true);
                  }
                },
                builder: (context, state) {
                  if (state is GreetingLoading) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 32),
                      child: Center(
                        child: Column(
                          children: [
                            const CircularProgressIndicator(color: AppColors.primary),
                            const SizedBox(height: 16),
                            Text(
                              'Crafting personalized message...',
                              style: TextStyle(color: AppColors.textSecondary),
                            ),
                          ],
                        ),
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
                            color: Colors.grey.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.glassBorder),
                          ),
                          child: TextField(
                            controller: _messageController,
                            maxLines: 5,
                            style: const TextStyle(color: AppColors.textPrimary, fontSize: 15, height: 1.5),
                            decoration: InputDecoration(
                              border: InputBorder.none,
                              hintText: 'Message will appear here...',
                              hintStyle: TextStyle(color: AppColors.textSecondary.withOpacity(0.5)),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            IconButton(
                              onPressed: _generate, 
                              icon: Icon(Icons.refresh, color: AppColors.primary),
                              tooltip: 'Regenerate',
                            ),
                            const Spacer(),
                            IconButton(
                              onPressed: () {
                                 Clipboard.setData(ClipboardData(text: _messageController.text));
                                 ScaffoldMessenger.of(context).showSnackBar(
                                   SnackBar(
                                     content: const Text('Copied!'),
                                     backgroundColor: AppColors.primary,
                                   ),
                                 );
                              },
                              icon: Icon(Icons.copy, color: AppColors.textSecondary),
                              tooltip: 'Copy',
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Container(
                          decoration: BoxDecoration(
                            color: widget.actionType == 'WHATSAPP' 
                                ? const Color(0xFF25D366)
                                : Colors.blue.shade600,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: (widget.actionType == 'WHATSAPP' 
                                    ? const Color(0xFF25D366) 
                                    : Colors.blue).withOpacity(0.3),
                                blurRadius: 16,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: ElevatedButton.icon(
                            onPressed: _send,
                            icon: Icon(
                              widget.actionType == 'WHATSAPP' ? Icons.send : Icons.sms, 
                              color: Colors.white,
                            ),
                            label: Text(
                              'Send via ${widget.actionType == 'WHATSAPP' ? 'WhatsApp' : 'SMS'}',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              padding: const EdgeInsets.symmetric(vertical: 18),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
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
        ),
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
        color: Colors.grey.withOpacity(0.05),
        borderRadius: BorderRadius.circular(50),
        border: Border.all(color: AppColors.glassBorder),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          icon: Icon(icon, color: AppColors.textSecondary, size: 18),
          dropdownColor: Colors.white,
          style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 14),
          items: items.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }
}
