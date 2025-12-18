import 'package:flutter/material.dart';

/// Staggered list animation wrapper that animates children sliding in from the right
/// with a subtle bounce effect, simulating a conveyor belt or timeline reveal
class StaggeredListAnimation extends StatefulWidget {
  final List<Widget> children;
  final Duration staggerDelay;
  final Duration itemDuration;
  final Axis direction;
  final double slideOffset;

  const StaggeredListAnimation({
    super.key,
    required this.children,
    this.staggerDelay = const Duration(milliseconds: 80),
    this.itemDuration = const Duration(milliseconds: 400),
    this.direction = Axis.horizontal,
    this.slideOffset = 50.0,
  });

  @override
  State<StaggeredListAnimation> createState() => _StaggeredListAnimationState();
}

class _StaggeredListAnimationState extends State<StaggeredListAnimation>
    with TickerProviderStateMixin {
  late List<AnimationController> _controllers;
  late List<Animation<double>> _slideAnimations;
  late List<Animation<double>> _fadeAnimations;
  late List<Animation<double>> _scaleAnimations;

  @override
  void initState() {
    super.initState();
    _initAnimations();
    _startAnimations();
  }

  void _initAnimations() {
    _controllers = List.generate(
      widget.children.length,
      (index) => AnimationController(
        duration: widget.itemDuration,
        vsync: this,
      ),
    );

    _slideAnimations = _controllers.map((controller) {
      return Tween<double>(begin: widget.slideOffset, end: 0).animate(
        CurvedAnimation(parent: controller, curve: Curves.easeOutBack),
      );
    }).toList();

    _fadeAnimations = _controllers.map((controller) {
      return Tween<double>(begin: 0, end: 1).animate(
        CurvedAnimation(parent: controller, curve: Curves.easeOut),
      );
    }).toList();

    _scaleAnimations = _controllers.map((controller) {
      return Tween<double>(begin: 0.8, end: 1).animate(
        CurvedAnimation(parent: controller, curve: Curves.easeOutBack),
      );
    }).toList();
  }

  void _startAnimations() async {
    for (int i = 0; i < _controllers.length; i++) {
      await Future.delayed(widget.staggerDelay);
      if (mounted) {
        _controllers[i].forward();
      }
    }
  }

  @override
  void didUpdateWidget(StaggeredListAnimation oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.children.length != widget.children.length) {
      // Dispose old controllers
      for (final controller in _controllers) {
        controller.dispose();
      }
      _initAnimations();
      _startAnimations();
    }
  }

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(widget.children.length, (index) {
        return AnimatedBuilder(
          animation: _controllers[index],
          builder: (context, child) {
            final slideValue = _slideAnimations[index].value;
            final fadeValue = _fadeAnimations[index].value;
            final scaleValue = _scaleAnimations[index].value;

            return Transform.translate(
              offset: widget.direction == Axis.horizontal
                  ? Offset(slideValue, 0)
                  : Offset(0, slideValue),
              child: Opacity(
                opacity: fadeValue.clamp(0.0, 1.0),
                child: Transform.scale(
                  scale: scaleValue,
                  child: widget.children[index],
                ),
              ),
            );
          },
        );
      }),
    );
  }
}

/// Interactive icon with micro-animation feedback
/// Provides ring/jiggle/glow effects when tapped
class AnimatedActionIcon extends StatefulWidget {
  final IconData icon;
  final Color color;
  final VoidCallback? onTap;
  final double size;
  final String tooltip;

  const AnimatedActionIcon({
    super.key,
    required this.icon,
    required this.color,
    this.onTap,
    this.size = 28,
    this.tooltip = '',
  });

  @override
  State<AnimatedActionIcon> createState() => _AnimatedActionIconState();
}

class _AnimatedActionIconState extends State<AnimatedActionIcon>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _rotationAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.3), weight: 50),
      TweenSequenceItem(tween: Tween(begin: 1.3, end: 1.0), weight: 50),
    ]).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));

    _rotationAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0, end: 0.1), weight: 25),
      TweenSequenceItem(tween: Tween(begin: 0.1, end: -0.1), weight: 25),
      TweenSequenceItem(tween: Tween(begin: -0.1, end: 0.05), weight: 25),
      TweenSequenceItem(tween: Tween(begin: 0.05, end: 0), weight: 25),
    ]).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleTap() {
    _controller.forward(from: 0);
    widget.onTap?.call();
  }

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: widget.tooltip,
      child: GestureDetector(
        onTap: _handleTap,
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Transform.scale(
              scale: _scaleAnimation.value,
              child: Transform.rotate(
                angle: _rotationAnimation.value,
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    boxShadow: _controller.isAnimating
                        ? [
                            BoxShadow(
                              color: widget.color.withOpacity(0.5),
                              blurRadius: 12,
                              spreadRadius: 2,
                            ),
                          ]
                        : null,
                  ),
                  child: Icon(
                    widget.icon,
                    color: widget.color,
                    size: widget.size,
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
