import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/theme/app_theme.dart';

/// iOS 26 Liquid Glass Popover for Call Options
/// 
/// Implements Apple's Liquid Glass design principles:
/// - Translucent glass with optical blur properties
/// - Fluid spring-based animations
/// - Minimal custom backgrounds, relies on backdrop filter
/// - Dynamic adaptation with focus states
/// 
/// @changelog
/// - 2024-12-31: Initial implementation
/// - 2024-12-31: iOS 26 Liquid Glass redesign with fluid animations
class CallOptionsPopover {
  static OverlayEntry? _overlayEntry;
  
  /// Show the Liquid Glass popover with fluid animation
  static void show(
    BuildContext context,
    TapDownDetails details, {
    required String phoneNumber,
    String? constituentName,
    void Function(String actionType)? onCallComplete,
  }) {
    HapticFeedback.mediumImpact();
    
    // Remove any existing popover
    _overlayEntry?.remove();
    
    final overlay = Overlay.of(context);
    final screenSize = MediaQuery.of(context).size;
    
    // Position above the tap point
    double left = details.globalPosition.dx - 100;
    double top = details.globalPosition.dy - 190;
    
    // Keep within screen bounds
    left = left.clamp(16.0, screenSize.width - 216);
    top = top.clamp(60.0, screenSize.height - 250);
    
    _overlayEntry = OverlayEntry(
      builder: (context) => _LiquidGlassPopover(
        left: left,
        top: top,
        phoneNumber: phoneNumber,
        onCallComplete: onCallComplete,
        onDismiss: () {
          _overlayEntry?.remove();
          _overlayEntry = null;
        },
      ),
    );
    
    overlay.insert(_overlayEntry!);
  }
}

class _LiquidGlassPopover extends StatefulWidget {
  final double left;
  final double top;
  final String phoneNumber;
  final void Function(String actionType)? onCallComplete;
  final VoidCallback onDismiss;

  const _LiquidGlassPopover({
    required this.left,
    required this.top,
    required this.phoneNumber,
    required this.onDismiss,
    this.onCallComplete,
  });

  @override
  State<_LiquidGlassPopover> createState() => _LiquidGlassPopoverState();
}

class _LiquidGlassPopoverState extends State<_LiquidGlassPopover>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    
    // Fluid spring animation (iOS 26 style)
    _controller = AnimationController(
      duration: const Duration(milliseconds: 350),
      vsync: this,
    );
    
    // Scale from 0.8 to 1.0 with spring curve
    _scaleAnimation = Tween<double>(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutBack, // Spring-like overshoot
      ),
    );
    
    // Fade in
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
      ),
    );
    
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _dismiss() async {
    // Reverse animation before closing
    await _controller.reverse();
    widget.onDismiss();
  }

  String _formatPhoneNumber(String number) {
    String formatted = number.replaceAll(RegExp(r'[^\d]'), '');
    if (formatted.length == 10) {
      return '+91 ${formatted.substring(0, 5)} ${formatted.substring(5)}';
    }
    return number;
  }

  @override
  Widget build(BuildContext context) {
    final displayNumber = _formatPhoneNumber(widget.phoneNumber);
    
    return Stack(
      children: [
        // Tap-to-dismiss backdrop (invisible)
        Positioned.fill(
          child: GestureDetector(
            onTap: _dismiss,
            behavior: HitTestBehavior.opaque,
            child: Container(color: Colors.transparent),
          ),
        ),
        
        // Animated Liquid Glass popover
        Positioned(
          left: widget.left,
          top: widget.top,
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, child) => Transform.scale(
              scale: _scaleAnimation.value,
              alignment: Alignment.bottomCenter, // Scale from bottom (where icon is)
              child: Opacity(
                opacity: _fadeAnimation.value,
                child: child,
              ),
            ),
            child: _buildLiquidGlassCard(displayNumber),
          ),
        ),
      ],
    );
  }

  Widget _buildLiquidGlassCard(String displayNumber) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(22),
      child: BackdropFilter(
        // Match AppTheme.glassCard style (Dial-in Details look)
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          width: 220, // Slightly wider to match card feel
          decoration: BoxDecoration(
            // Explicitly matching AppTheme.glassCard gradient
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Colors.white,
                Colors.white,
                AppColors.primary.withOpacity(0.05),
              ],
              stops: const [0.0, 0.6, 1.0],
            ),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: AppColors.glassBorder,
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withOpacity(0.05),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
              BoxShadow(
                color: AppColors.cardShadow,
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),

          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header - minimal styling
              Padding(
                padding: const EdgeInsets.only(top: 14, bottom: 10),
                child: Text(
                  'Call',
                  style: TextStyle(
                    color: AppColors.textSecondary.withOpacity(0.7),
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    letterSpacing: 0.2,
                  ),
                ),
              ),
              
              // Subtle separator
              Container(
                height: 0.5,
                margin: const EdgeInsets.symmetric(horizontal: 0),
                color: Colors.black.withOpacity(0.06),
              ),
              
              // Mobile option
              _buildGlassOption(
                icon: Icons.phone_outlined,
                iconColor: AppColors.primary,
                label: 'Mobile',
                subtitle: displayNumber,
                onTap: () => _launchCellularCall(context),
              ),
              
              // Subtle separator
              Container(
                height: 0.5,
                margin: const EdgeInsets.symmetric(horizontal: 16),
                color: Colors.black.withOpacity(0.04),
              ),
              
              // WhatsApp option - use FontAwesome WhatsApp icon
              _buildGlassOptionWithFaIcon(
                icon: FontAwesomeIcons.whatsapp,
                iconColor: const Color(0xFF25D366),
                label: 'WhatsApp',
                subtitle: displayNumber,
                onTap: () => _launchWhatsAppCall(context),
              ),
              
              const SizedBox(height: 6),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGlassOption({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        splashColor: iconColor.withOpacity(0.1),
        highlightColor: iconColor.withOpacity(0.05),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Row(
            children: [
              // Minimal glass icon container
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  // Very subtle background
                  color: iconColor.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 18, color: iconColor),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: TextStyle(
                        color: AppColors.textSecondary.withOpacity(0.8),
                        fontSize: 12,
                        fontFamily: 'monospace',
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Build option with FontAwesome icon (for WhatsApp)
  Widget _buildGlassOptionWithFaIcon({
    required IconData icon,
    required Color iconColor,
    required String label,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        splashColor: iconColor.withOpacity(0.1),
        highlightColor: iconColor.withOpacity(0.05),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Row(
            children: [
              // Icon container with FontAwesome icon
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: iconColor.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: FaIcon(icon, size: 18, color: iconColor),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: TextStyle(
                        color: AppColors.textSecondary.withOpacity(0.8),
                        fontSize: 12,
                        fontFamily: 'monospace',
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _launchCellularCall(BuildContext context) async {
    _dismiss();
    
    final Uri launchUri = Uri(scheme: 'tel', path: widget.phoneNumber);
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
      widget.onCallComplete?.call('CALL'); // Cellular call action type
    } else {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not launch phone dialer')),
        );
      }
    }
  }

  Future<void> _launchWhatsAppCall(BuildContext context) async {
    _dismiss();
    
    // Format: Country Code + Number (No +)
    // wa.me requires clean digits only
    String cleanNumber = widget.phoneNumber.replaceAll(RegExp(r'[^\d]'), '');
    
    // Auto-prefix 91 (India) if 10 digits
    if (cleanNumber.length == 10) {
      cleanNumber = '91$cleanNumber';
    }
    
    // Use universal link which opens chat reliably
    // Users can then tap the call button in the chat
    // This avoids "Invalid Link" errors with deep links
    // Use native WhatsApp scheme to avoid Safari redirect
    // 'whatsapp://send' opens the chat. From there, user can tap Call.
    final Uri whatsappUri = Uri.parse('whatsapp://send?phone=$cleanNumber');

    try {
      // 1. Try Native Scheme (Most Reliable if installed)
      // ignoring canLaunchUrl which can be flaky
      bool launched = await launchUrl(
        whatsappUri,
        mode: LaunchMode.externalApplication,
      );

      // 2. Fallback to Web Universal Link if native failed
      if (!launched) {
        final Uri webUri = Uri.parse('https://wa.me/$cleanNumber');
        launched = await launchUrl(webUri, mode: LaunchMode.externalApplication);
      }
      
      // 3. Only mark as complete if one of them succeeded
      if (launched) {
        if (mounted) {
           // Overlay is already dismissed by _dismiss() at start
           widget.onCallComplete?.call('WHATSAPP_CALL');
        }
      } else {
        throw 'Could not launch WhatsApp';
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not open WhatsApp'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    }
  }
}
