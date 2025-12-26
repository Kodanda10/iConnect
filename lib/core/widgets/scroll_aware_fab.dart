import 'dart:async';
import 'package:flutter/material.dart';

/// Scroll-aware wrapper that hides/shows its child based on scroll activity
/// 
/// Uses Apple-inspired animation curves:
/// - Quick slide out on scroll (200ms, easeInCubic)
/// - Spring slide in after idle (300ms, easeOutBack)
/// 
/// @changelog
/// - 2025-12-26: Initial implementation for auto-hiding FAB
class ScrollAwareFab extends StatefulWidget {
  final Widget child;
  final ScrollController? scrollController;
  final Duration hideDuration;
  final Duration showDuration;
  final Duration idleDelay;
  final Curve hideAnimation;
  final Curve showAnimation;
  final Offset slideOffset;

  const ScrollAwareFab({
    super.key,
    required this.child,
    this.scrollController,
    this.hideDuration = const Duration(milliseconds: 200),
    this.showDuration = const Duration(milliseconds: 300),
    this.idleDelay = const Duration(milliseconds: 500),
    this.hideAnimation = Curves.easeInCubic,
    this.showAnimation = Curves.easeOutBack,
    this.slideOffset = const Offset(1.5, 0), // Slide right
  });

  @override
  State<ScrollAwareFab> createState() => _ScrollAwareFabState();
}

class _ScrollAwareFabState extends State<ScrollAwareFab>
    with SingleTickerProviderStateMixin {
  bool _isVisible = true;
  Timer? _idleTimer;
  ScrollController? _controller;

  @override
  void initState() {
    super.initState();
    _controller = widget.scrollController;
    _controller?.addListener(_onScroll);
  }

  @override
  void didUpdateWidget(ScrollAwareFab oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.scrollController != widget.scrollController) {
      _controller?.removeListener(_onScroll);
      _controller = widget.scrollController;
      _controller?.addListener(_onScroll);
    }
  }

  @override
  void dispose() {
    _idleTimer?.cancel();
    _controller?.removeListener(_onScroll);
    super.dispose();
  }

  void _onScroll() {
    // Hide immediately when scrolling
    if (_isVisible) {
      setState(() => _isVisible = false);
    }

    // Reset idle timer
    _idleTimer?.cancel();
    _idleTimer = Timer(widget.idleDelay, () {
      if (mounted) {
        setState(() => _isVisible = true);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedSlide(
      offset: _isVisible ? Offset.zero : widget.slideOffset,
      duration: _isVisible ? widget.showDuration : widget.hideDuration,
      curve: _isVisible ? widget.showAnimation : widget.hideAnimation,
      child: AnimatedOpacity(
        opacity: _isVisible ? 1.0 : 0.0,
        duration: _isVisible ? widget.showDuration : widget.hideDuration,
        curve: _isVisible ? widget.showAnimation : widget.hideAnimation,
        child: widget.child,
      ),
    );
  }
}

/// A wrapper that listens to scroll notifications from descendants
/// and passes them to ScrollAwareFab
class ScrollAwareFabWithListener extends StatefulWidget {
  final Widget child;
  final Duration idleDelay;
  final Widget Function(bool isScrolling) fabBuilder;

  const ScrollAwareFabWithListener({
    super.key,
    required this.child,
    required this.fabBuilder,
    this.idleDelay = const Duration(milliseconds: 500),
  });

  @override
  State<ScrollAwareFabWithListener> createState() =>
      _ScrollAwareFabWithListenerState();
}

class _ScrollAwareFabWithListenerState
    extends State<ScrollAwareFabWithListener> {
  bool _isScrolling = false;
  Timer? _idleTimer;

  @override
  void dispose() {
    _idleTimer?.cancel();
    super.dispose();
  }

  bool _handleScrollNotification(ScrollNotification notification) {
    // Only handle scrollable widgets (ListView, CustomScrollView, etc)
    if (notification.depth == 0) {
      if (notification is ScrollStartNotification) {
        if (!_isScrolling) {
          setState(() => _isScrolling = true);
        }
        _idleTimer?.cancel();
      } else if (notification is ScrollUpdateNotification) {
        // Only react to actual scroll movement (not just touch)
        if ((notification.scrollDelta ?? 0).abs() > 0.5) {
          if (!_isScrolling) {
            setState(() => _isScrolling = true);
          }
          _idleTimer?.cancel();
        }
      } else if (notification is ScrollEndNotification) {
        _idleTimer?.cancel();
        _idleTimer = Timer(widget.idleDelay, () {
          if (mounted) {
            setState(() => _isScrolling = false);
          }
        });
      }
    }
    return false; // Allow notification to continue bubbling
  }

  @override
  Widget build(BuildContext context) {
    return NotificationListener<ScrollNotification>(
      onNotification: _handleScrollNotification,
      child: Stack(
        children: [
          widget.child,
          Positioned(
            right: 16,
            bottom: 80,
            child: AnimatedSlide(
              offset: _isScrolling ? const Offset(1.5, 0) : Offset.zero,
              duration: Duration(milliseconds: _isScrolling ? 200 : 300),
              curve: _isScrolling ? Curves.easeInCubic : Curves.easeOutBack,
              child: AnimatedOpacity(
                opacity: _isScrolling ? 0.0 : 1.0,
                duration: Duration(milliseconds: _isScrolling ? 200 : 300),
                curve: _isScrolling ? Curves.easeInCubic : Curves.easeOutBack,
                child: widget.fabBuilder(_isScrolling),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

