import 'dart:async';
import 'package:flutter/material.dart';
import 'package:iconnect_mobile/features/report/domain/entities/action_log.dart';
import 'package:intl/intl.dart';
import '../../../../core/widgets/glass_container.dart';

class ActionTimelineCard extends StatefulWidget {
  final List<ActionLog> actions;
  final Widget title;
  final bool initiallyExpanded;

  const ActionTimelineCard({
    super.key,
    required this.actions,
    required this.title,
    this.initiallyExpanded = true,
  });

  @override
  State<ActionTimelineCard> createState() => _ActionTimelineCardState();
}

class _ActionTimelineCardState extends State<ActionTimelineCard>
    with TickerProviderStateMixin {
  late ScrollController _scrollController;
  Timer? _delayTimer;  // Timer for initial 2-second delay
  Timer? _scrollTimer; // Timer for periodic scrolling

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    
    // Start auto-scroll if expanded and has data
    if (widget.initiallyExpanded && widget.actions.isNotEmpty) {
      _startAutoScroll();
    }
  }

  void _startAutoScroll() {
    // Cancel any existing timers first
    _delayTimer?.cancel();
    _scrollTimer?.cancel();
    
    // Conveyor Belt Engine: Auto-start after 2-second delay
    // Using Timer instead of Future.delayed for proper cancellation
    _delayTimer = Timer(const Duration(seconds: 2), () {
      if (!mounted) return;
      
      // Move 1 pixel every 50ms (Slow & Steady, Assembly Line)
      const Duration interval = Duration(milliseconds: 50);
      _scrollTimer = Timer.periodic(interval, (timer) {
        if (!mounted) {
          timer.cancel();
          return;
        }
        if (_scrollController.hasClients) {
          // Calculate new position
          double newOffset = _scrollController.offset + 1.0;
          
          // Infinite Loop Illusion: Reset if we hit the limit
          if (newOffset >= _scrollController.position.maxScrollExtent) {
            _scrollController.jumpTo(0.0);
          } else {
             // Use jumpTo for strict linear movement without animation interpolation fighting
             _scrollController.jumpTo(newOffset);
          }
        }
      });
    });
  }

  @override
  void didUpdateWidget(ActionTimelineCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.actions.length != widget.actions.length) {
      _delayTimer?.cancel();
      _scrollTimer?.cancel();
      // Restart engine if data refreshes
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (widget.initiallyExpanded && widget.actions.isNotEmpty) {
           _startAutoScroll();
        }
      });
    }
  }

  @override
  void dispose() {
    _delayTimer?.cancel();
    _scrollTimer?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.actions.isEmpty) {
      if (widget.initiallyExpanded) {
         return GlassContainer(
          borderRadius: 24,
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildSimpleHeader(),
              const SizedBox(height: 24),
              Center(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: Text(
                    "No actions taken yet.",
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.5),
                      fontSize: 14,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      } else {
        return const SizedBox.shrink();
      }
    }

    return GlassContainer(
      borderRadius: 24,
      padding: EdgeInsets.zero, // ExpansionTile handles padding
      child: Theme(
        data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
        child: ExpansionTile(
          initiallyExpanded: widget.initiallyExpanded,
          tilePadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          childrenPadding: const EdgeInsets.only(bottom: 16),
          iconColor: Colors.white54,
          collapsedIconColor: Colors.white54,
          title: widget.title,
          children: [
            // Simple static list - NO animation, NO infinite scroll
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: widget.actions.asMap().entries.map((entry) {
                  final index = entry.key;
                  final action = entry.value;
                  final isLast = index == widget.actions.length - 1;
                  return _buildTimelineItem(action, isLast);
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSimpleHeader() {
    // Fallback wrapper if title is complex
    return DefaultTextStyle(
       style: TextStyle(
          color: Colors.white.withOpacity(0.9),
          fontSize: 18,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
       ),
       child: widget.title,
    );
  }

  Widget _buildTimelineItem(ActionLog action, bool isLast) {
    final timeStr = DateFormat('h:mm a').format(action.executedAt);
    final iconData = _getIconForType(action.actionType);
    final color = _getColorForType(action.actionType);

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Timeline Line & Icon
          SizedBox(
            width: 72, 
            child: Stack(
              alignment: Alignment.topCenter,
              children: [
                if (!isLast)
                  Positioned(
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: Container(
                        width: 2,
                        color: Colors.white.withOpacity(0.1),
                      ),
                    ),
                  ),
                Container(
                  margin: const EdgeInsets.only(top: 0, bottom: 24),
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        color.withOpacity(0.9),
                        color.withOpacity(0.6),
                      ],
                    ),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Colors.white.withOpacity(0.2),
                      width: 1,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: color.withOpacity(0.25),
                        blurRadius: 12,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Icon(iconData, color: Colors.white, size: 18),
                ),
              ],
            ),
          ),
          
          // Content - Vertical Layout
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(top: 0, bottom: 32, right: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Line 1: Full Name (Bold, Full Width)
                  Text(
                    action.constituentName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  // Line 2: Time (Small, Grey)
                  Text(
                    timeStr,
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.5),
                      fontSize: 12,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                  const SizedBox(height: 4),
                  // Line 3: Action Status (Colored)
                  Text(
                    action.messagePreview ?? _getDefaultText(action.actionType),
                    style: TextStyle(
                      color: color.withOpacity(0.8),
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  IconData _getIconForType(ActionType type) {
    switch (type) {
      case ActionType.call:
        return Icons.call;
      case ActionType.sms:
        return Icons.message;
      case ActionType.whatsapp:
        return Icons.chat_bubble;
    }
  }

  Color _getColorForType(ActionType type) {
    switch (type) {
      case ActionType.call:
        return Colors.green;
      case ActionType.sms:
        return Colors.purpleAccent;
      case ActionType.whatsapp:
        return Colors.teal;
    }
  }

  String _getDefaultText(ActionType type) {
    switch (type) {
      case ActionType.call:
        return 'Called';
      case ActionType.sms:
        return 'SMS Sent';
      case ActionType.whatsapp:
        return 'WhatsApp Sent';
    }
  }
}
