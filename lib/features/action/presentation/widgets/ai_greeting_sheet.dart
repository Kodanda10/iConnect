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
/// @description AI Greeting Message Wizard with glassmorphism theme
/// @changelog
/// - 2024-12-17: Initial implementation
/// - 2025-12-18: Upgraded to dark glassmorphism theme to match portal

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

  // Theme colors matching portal
  static const Color _primaryTeal = Color(0xFF134E4A);
  static const Color _accentTeal = Color(0xFF00A896);
  static const Color _darkBg = Color(0xFF0D1117);
  static const Color _cardBg = Color(0xFF161B22);

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
      final uri = Uri.parse('whatsapp://send?phone=$cleanNumber&text=${Uri.encodeComponent(fullMessage)}');
      
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
         if (mounted) {
           ScaffoldMessenger.of(context).showSnackBar(
             const SnackBar(content: Text('WhatsApp not installed')),
           );
         }
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
  
  void _showCompletionDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Dialog(
        backgroundColor: _cardBg,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.08),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white.withOpacity(0.15)),
              ),
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
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(ctx),
                        icon: Icon(Icons.close, color: Colors.white.withOpacity(0.6)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Action Summary
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: _primaryTeal.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: _accentTeal.withOpacity(0.3)),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.person_outline, color: _accentTeal),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Action taken: ${widget.actionType}',
                                style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12),
                              ),
                              Text(
                                widget.constituentName,
                                style: const TextStyle(
                                  color: _accentTeal,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 16,
                                ),
                                overflow: TextOverflow.ellipsis,
                                maxLines: 1,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Connected/Sent Button
                  Container(
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF10B981), Color(0xFF059669)],
                      ),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF10B981).withOpacity(0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        // Mark action as sent
                        context.read<TaskBloc>().add(UpdateActionStatus(
                          taskId: widget.taskId,
                          actionType: widget.actionType,
                        ));
                        Navigator.pop(ctx);
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: const Text('Action recorded!'),
                            backgroundColor: _accentTeal,
                          ),
                        );
                      },
                      icon: const Icon(Icons.check, color: Colors.white),
                      label: const Text('Mark as Sent', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(height: 12),
                  
                  // No Answer only for CALL (not SMS/WhatsApp)
                  if (widget.actionType == 'CALL')
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.red[300],
                              side: BorderSide(color: Colors.red.withOpacity(0.3)),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
                              foregroundColor: Colors.white.withOpacity(0.7),
                              side: BorderSide(color: Colors.white.withOpacity(0.2)),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            onPressed: () {
                              Navigator.pop(ctx);
                              Navigator.pop(context);
                              // Remind Later - keeps button active, no status update
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: const Text('Will remind you later'),
                                  backgroundColor: Colors.orange[700],
                                ),
                              );
                            },
                            icon: const Icon(Icons.notifications_active, size: 18),
                            label: const Text('Remind Later'),
                          ),
                        ),
                      ],
                    )
                  else
                    // For SMS/WhatsApp - only show Remind Later
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white.withOpacity(0.7),
                        side: BorderSide(color: Colors.white.withOpacity(0.2)),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        Navigator.pop(ctx);
                        Navigator.pop(context);
                        // Remind Later - keeps button active, no status update
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: const Text('Will remind you later'),
                            backgroundColor: Colors.orange[700],
                          ),
                        );
                      },
                      icon: const Icon(Icons.notifications_active, size: 18),
                      label: const Text('Remind Later'),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Dark glassmorphism theme matching web portal
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
            // Dark gradient background matching portal
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                const Color(0xFF0D3333).withOpacity(0.95),
                const Color(0xFF0A1A1A).withOpacity(0.98),
              ],
            ),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            border: Border.all(color: Colors.white.withOpacity(0.1)),
            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.4), blurRadius: 24, offset: const Offset(0, -4))],
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
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 24),
              
              // Header with glassmorphism
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          _accentTeal.withOpacity(0.3),
                          _accentTeal.withOpacity(0.1),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: _accentTeal.withOpacity(0.3)),
                      boxShadow: [
                        BoxShadow(
                          color: _accentTeal.withOpacity(0.2),
                          blurRadius: 12,
                        ),
                      ],
                    ),
                    child: Icon(
                      widget.actionType == 'WHATSAPP' ? Icons.chat_bubble : Icons.message,
                      color: _accentTeal,
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
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 20,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'For ${widget.constituentName}',
                          style: TextStyle(color: _accentTeal.withOpacity(0.8), fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              
              // Language Toggle Only
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
                    gradient: const LinearGradient(
                      colors: [_primaryTeal, Color(0xFF0D3D3D)],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: _primaryTeal.withOpacity(0.3),
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
                            const CircularProgressIndicator(color: _accentTeal),
                            const SizedBox(height: 16),
                            Text(
                              'Crafting personalized message...',
                              style: TextStyle(color: Colors.white.withOpacity(0.6)),
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
                            color: Colors.white.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.white.withOpacity(0.1)),
                          ),
                          child: TextField(
                            controller: _messageController,
                            maxLines: 5,
                            style: const TextStyle(color: Colors.white, fontSize: 15, height: 1.5),
                            decoration: InputDecoration(
                              border: InputBorder.none,
                              hintText: 'Message will appear here...',
                              hintStyle: TextStyle(color: Colors.white.withOpacity(0.3)),
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            IconButton(
                              onPressed: _generate, 
                              icon: Icon(Icons.refresh, color: _accentTeal),
                              tooltip: 'Regenerate',
                            ),
                            const Spacer(),
                            IconButton(
                              onPressed: () {
                                 Clipboard.setData(ClipboardData(text: _messageController.text));
                                 ScaffoldMessenger.of(context).showSnackBar(
                                   SnackBar(
                                     content: const Text('Copied!'),
                                     backgroundColor: _accentTeal,
                                   ),
                                 );
                              },
                              icon: Icon(Icons.copy, color: Colors.white.withOpacity(0.6)),
                              tooltip: 'Copy',
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: widget.actionType == 'WHATSAPP' 
                                  ? [const Color(0xFF25D366), const Color(0xFF128C7E)]
                                  : [Colors.blue.shade600, Colors.blue.shade800],
                            ),
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
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(50),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          icon: Icon(icon, color: _accentTeal, size: 18),
          dropdownColor: _cardBg,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
          items: items.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }
}
