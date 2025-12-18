import 'package:flutter/material.dart';

/// Ink drop / wave transition effect for segmented control tabs
/// Provides a liquid-like ripple animation when a new tab is selected
class InkDropSegmentedControl extends StatefulWidget {
  final List<String> segments;
  final int selectedIndex;
  final ValueChanged<int> onSelected;
  final Color selectedColor;
  final Color unselectedColor;
  final Color inkColor;
  final double borderRadius;

  const InkDropSegmentedControl({
    super.key,
    required this.segments,
    required this.selectedIndex,
    required this.onSelected,
    this.selectedColor = Colors.white,
    this.unselectedColor = const Color(0x80FFFFFF),
    this.inkColor = const Color(0xFF00A896),
    this.borderRadius = 30,
  });

  @override
  State<InkDropSegmentedControl> createState() => _InkDropSegmentedControlState();
}

class _InkDropSegmentedControlState extends State<InkDropSegmentedControl>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _inkAnimation;
  int _previousIndex = 0;
  Offset? _tapPosition;

  @override
  void initState() {
    super.initState();
    _previousIndex = widget.selectedIndex;
    _controller = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    _inkAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
    );
  }

  @override
  void didUpdateWidget(InkDropSegmentedControl oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.selectedIndex != widget.selectedIndex) {
      _previousIndex = oldWidget.selectedIndex;
      _controller.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleTap(int index, Offset tapPosition) {
    if (index != widget.selectedIndex) {
      setState(() {
        _tapPosition = tapPosition;
      });
      widget.onSelected(index);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(widget.borderRadius),
        border: Border.all(
          color: Colors.white.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(widget.borderRadius),
        child: Stack(
          children: [
            // Animated selection indicator with ink drop effect
            AnimatedBuilder(
              animation: _inkAnimation,
              builder: (context, child) {
                return LayoutBuilder(
                  builder: (context, constraints) {
                    final itemWidth = constraints.maxWidth / widget.segments.length;
                    final targetX = widget.selectedIndex * itemWidth;
                    
                    // Calculate position with animation
                    final currentX = _previousIndex * itemWidth +
                        (_inkAnimation.value * (targetX - _previousIndex * itemWidth));

                    return Transform.translate(
                      offset: Offset(currentX, 0),
                      child: Container(
                        width: itemWidth,
                        height: 48,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(widget.borderRadius - 2),
                          boxShadow: [
                            BoxShadow(
                              color: widget.inkColor.withOpacity(0.3 * _inkAnimation.value),
                              blurRadius: 12,
                              spreadRadius: 1,
                            ),
                          ],
                        ),
                        // Wave effect overlay
                        child: AnimatedOpacity(
                          duration: const Duration(milliseconds: 200),
                          opacity: _controller.isAnimating ? 0.3 : 0,
                          child: Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(widget.borderRadius),
                              gradient: RadialGradient(
                                center: Alignment.center,
                                radius: _inkAnimation.value * 1.5,
                                colors: [
                                  widget.inkColor.withOpacity(0.5),
                                  widget.inkColor.withOpacity(0),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
            // Segment buttons
            Row(
              children: List.generate(widget.segments.length, (index) {
                final isSelected = index == widget.selectedIndex;
                return Expanded(
                  child: GestureDetector(
                    onTapUp: (details) => _handleTap(index, details.localPosition),
                    child: Container(
                      height: 48,
                      alignment: Alignment.center,
                      child: AnimatedDefaultTextStyle(
                        duration: const Duration(milliseconds: 200),
                        style: TextStyle(
                          color: isSelected ? widget.selectedColor : widget.unselectedColor,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                          fontSize: 14,
                        ),
                        child: Text(widget.segments[index]),
                      ),
                    ),
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }
}
