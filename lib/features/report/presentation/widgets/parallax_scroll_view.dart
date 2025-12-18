import 'package:flutter/material.dart';
import 'dart:ui';

/// Parallax scroll wrapper that creates liquid glass 3D depth effect
/// Background elements shift at different speeds than foreground content
class ParallaxScrollView extends StatefulWidget {
  final List<Widget> children;
  final double parallaxFactor;
  final Widget? backgroundWidget;
  final EdgeInsetsGeometry padding;

  const ParallaxScrollView({
    super.key,
    required this.children,
    this.parallaxFactor = 0.3,
    this.backgroundWidget,
    this.padding = const EdgeInsets.all(24),
  });

  @override
  State<ParallaxScrollView> createState() => _ParallaxScrollViewState();
}

class _ParallaxScrollViewState extends State<ParallaxScrollView> {
  final ScrollController _scrollController = ScrollController();
  double _scrollOffset = 0;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    setState(() {
      _scrollOffset = _scrollController.offset;
    });
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Parallax background with blur shift
        if (widget.backgroundWidget != null)
          Transform.translate(
            offset: Offset(0, -_scrollOffset * widget.parallaxFactor),
            child: widget.backgroundWidget,
          ),
        // Foreground content
        ListView(
          controller: _scrollController,
          padding: widget.padding,
          children: widget.children.map((child) {
            return _ParallaxChild(
              scrollOffset: _scrollOffset,
              parallaxFactor: widget.parallaxFactor,
              child: child,
            );
          }).toList(),
        ),
      ],
    );
  }
}

class _ParallaxChild extends StatelessWidget {
  final double scrollOffset;
  final double parallaxFactor;
  final Widget child;

  const _ParallaxChild({
    required this.scrollOffset,
    required this.parallaxFactor,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    // Subtle 3D tilt effect based on scroll position
    final tiltAngle = (scrollOffset * 0.0005).clamp(-0.02, 0.02);
    
    return Transform(
      transform: Matrix4.identity()
        ..setEntry(3, 2, 0.001) // Perspective
        ..rotateX(tiltAngle),
      alignment: Alignment.center,
      child: child,
    );
  }
}

/// Animated card entry widget that fades and slides in when visible
class AnimatedCardEntry extends StatefulWidget {
  final Widget child;
  final Duration delay;
  final Duration duration;
  final Axis slideDirection;
  final double slideOffset;

  const AnimatedCardEntry({
    super.key,
    required this.child,
    this.delay = Duration.zero,
    this.duration = const Duration(milliseconds: 500),
    this.slideDirection = Axis.vertical,
    this.slideOffset = 30,
  });

  @override
  State<AnimatedCardEntry> createState() => _AnimatedCardEntryState();
}

class _AnimatedCardEntryState extends State<AnimatedCardEntry>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: widget.duration,
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );

    final beginOffset = widget.slideDirection == Axis.vertical
        ? Offset(0, widget.slideOffset)
        : Offset(widget.slideOffset, 0);

    _slideAnimation = Tween<Offset>(begin: beginOffset, end: Offset.zero).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );

    Future.delayed(widget.delay, () {
      if (mounted) {
        _controller.forward();
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.translate(
          offset: _slideAnimation.value,
          child: Opacity(
            opacity: _fadeAnimation.value.clamp(0.0, 1.0),
            child: widget.child,
          ),
        );
      },
    );
  }
}
