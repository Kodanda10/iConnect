import 'package:flutter/material.dart';

/// Animated count-up widget that animates from 0 to target value
/// Used in Report page's "Today's Overview" card for dynamic feel
class AnimatedCountUp extends StatefulWidget {
  final int end;
  final Duration duration;
  final TextStyle? style;
  final String? suffix;

  const AnimatedCountUp({
    super.key,
    required this.end,
    this.duration = const Duration(milliseconds: 1200),
    this.style,
    this.suffix,
  });

  @override
  State<AnimatedCountUp> createState() => _AnimatedCountUpState();
}

class _AnimatedCountUpState extends State<AnimatedCountUp>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(duration: widget.duration, vsync: this);
    _animation = Tween<double>(begin: 0, end: widget.end.toDouble()).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );
    _controller.forward();
  }

  @override
  void didUpdateWidget(AnimatedCountUp oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.end != widget.end) {
      _animation = Tween<double>(
        begin: _animation.value,
        end: widget.end.toDouble(),
      ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));
      _controller.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Text(
          '${_animation.value.toInt()}${widget.suffix ?? ''}',
          style: widget.style,
        );
      },
    );
  }
}

/// Animated progress ring with smooth fill animation
class AnimatedProgressRing extends StatefulWidget {
  final double progress;
  final Duration duration;
  final Color color;
  final Color backgroundColor;
  final double strokeWidth;
  final Widget? child;

  const AnimatedProgressRing({
    super.key,
    required this.progress,
    this.duration = const Duration(milliseconds: 1500),
    this.color = const Color(0xFF00A896),
    this.backgroundColor = const Color(0x1AFFFFFF),
    this.strokeWidth = 6,
    this.child,
  });

  @override
  State<AnimatedProgressRing> createState() => _AnimatedProgressRingState();
}

class _AnimatedProgressRingState extends State<AnimatedProgressRing>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(duration: widget.duration, vsync: this);
    _animation = Tween<double>(begin: 0, end: widget.progress).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );
    _controller.forward();
  }

  @override
  void didUpdateWidget(AnimatedProgressRing oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.progress != widget.progress) {
      _animation = Tween<double>(
        begin: _animation.value,
        end: widget.progress,
      ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));
      _controller.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 56,
              height: 56,
              child: CircularProgressIndicator(
                value: _animation.value.clamp(0.0, 1.0),
                strokeWidth: widget.strokeWidth,
                backgroundColor: widget.backgroundColor,
                valueColor: AlwaysStoppedAnimation<Color>(widget.color),
              ),
            ),
            if (widget.child != null) widget.child!,
          ],
        );
      },
    );
  }
}
