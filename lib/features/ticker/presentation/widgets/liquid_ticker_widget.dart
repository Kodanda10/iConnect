import 'dart:io';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/theme/app_theme.dart';
import '../bloc/ticker_bloc.dart';
import '../../domain/entities/ticker.dart';

class LiquidTickerWidget extends StatefulWidget {
  const LiquidTickerWidget({super.key});

  @override
  State<LiquidTickerWidget> createState() => _LiquidTickerWidgetState();
}

class _LiquidTickerWidgetState extends State<LiquidTickerWidget> with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  late ScrollController _scrollController;
  
  @override
  void initState() {
    super.initState();
    // Pulse animation for the "Live" indicator
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
    
    _pulseAnimation = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _scrollController = ScrollController();
    
    // Start marquee effect after build
    WidgetsBinding.instance.addPostFrameCallback((_) => _startMarquee());
  }

  void _startMarquee() async {
    if (!mounted) return;
    try {
      while (_scrollController.hasClients) {
        await Future.delayed(const Duration(seconds: 2));
        if (!_scrollController.hasClients) break;
        await _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(seconds: 10),
          curve: Curves.linear,
        );
        if (!_scrollController.hasClients) break;
        await Future.delayed(const Duration(seconds: 1));
        if (!_scrollController.hasClients) break;
        _scrollController.jumpTo(0);
      }
    } catch (e) {
      // Ignore scroll interruptions
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _launchMeeting(MeetingTicker ticker) async {
    if (ticker.meetingType == 'CONFERENCE_CALL') {
      // Auto-Dialer Logic: tel:<number>,<code >#
      // Comma (,) adds a 2-second pause per comma on most phones
      final dialUri = Uri.parse("tel:${ticker.dialInNumber},${ticker.accessCode}#");
      if (await canLaunchUrl(dialUri)) {
        await launchUrl(dialUri);
      }
    } else {
      // Valid Video URL
      if (ticker.meetUrl.isEmpty) return;
      final uri = Uri.parse(ticker.meetUrl);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<TickerBloc, TickerState>(
      builder: (context, state) {
        final isActive = state is TickerActive;
        // Use AnimatedSize for the Slide-Down / Collapse effect
        return AnimatedSize(
          duration: const Duration(milliseconds: 600),
          curve: Curves.elasticOut, // Spring Bounce effect
          child: !isActive
              ? const SizedBox.shrink()
              : Builder(builder: (context) {
                  final ticker = (state as TickerActive).ticker;
                  final timeStr = DateFormat('jm').format(ticker.startTime);
                  
                  final isAudio = ticker.meetingType == 'CONFERENCE_CALL';
                  final themeColor = isAudio ? Colors.purple : AppColors.primary;
                  final icon = isAudio ? Icons.phone_in_talk : Icons.videocam;
                  final actionIcon = isAudio ? Icons.call : Icons.play_arrow_rounded;

                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(50),
                      // Liquid Glass effect
                      color: Colors.white.withOpacity(0.12),
                      border: Border.all(color: Colors.white.withOpacity(0.3)),
                      boxShadow: [
                        BoxShadow(
                          color: themeColor.withOpacity(0.15),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(50),
                      child: BackdropFilter(
                        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
                          child: Row(
                            children: [
                              // Left Indicator (Live Pulse)
                              AnimatedBuilder(
                                animation: _pulseAnimation,
                                builder: (context, child) => Transform.scale(
                                  scale: _pulseAnimation.value,
                                  child: child,
                                ),
                                child: Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    color: themeColor,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(icon, color: Colors.white, size: 20),
                                ),
                              ),
                              
                              const SizedBox(width: 12),
                              
                              // Scrolling Text Content
                              Expanded(
                                child: SizedBox(
                                  height: 20,
                                  child: ListView(
                                    controller: _scrollController,
                                    scrollDirection: Axis.horizontal,
                                    children: [
                                      Text(
                                        "📢 ${ticker.title}  •  🗓️ Today at $timeStr  •  ",
                                        style: const TextStyle(
                                          color: AppColors.textPrimary,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      Text(
                                        isAudio 
                                            ? "Tap to JOIN AUDIO BRIDGE (Dialing: ${ticker.dialInNumber}, Code: ${ticker.accessCode}#)"
                                            : "Click to JOIN MEETING (URL is copied)",
                                        style: TextStyle(
                                          color: themeColor.withOpacity(0.8),
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      // Buffer space for marquee loop
                                      const SizedBox(width: 50), 
                                    ],
                                  ),
                                ),
                              ),
                              
                              const SizedBox(width: 12),

                              // Right Action Button (FAB Style)
                              InkWell(
                                onTap: () => _launchMeeting(ticker),
                                borderRadius: BorderRadius.circular(30),
                                child: Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    color: isAudio ? AppColors.secondary : AppColors.secondary, // Keep consistent or swap
                                    shape: BoxShape.circle, // FAB Style
                                    boxShadow: [
                                      BoxShadow(
                                        color: AppColors.secondary.withOpacity(0.4),
                                        blurRadius: 8,
                                        offset: const Offset(0, 2),
                                      )
                                    ],
                                  ),
                                  child: Icon(actionIcon, color: Colors.white, size: 24),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                }),
        );
      },
    );
  }
}


