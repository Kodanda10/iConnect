import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:iconnect_mobile/features/ticker/domain/entities/ticker.dart';
import 'package:iconnect_mobile/features/ticker/presentation/bloc/ticker_bloc.dart';
import 'package:iconnect_mobile/features/ticker/presentation/widgets/liquid_ticker_widget.dart';
import 'package:mocktail/mocktail.dart';

class MockTickerBloc extends MockBloc<TickerEvent, TickerState> implements TickerBloc {}

void main() {
  late MockTickerBloc mockBloc;

  setUp(() {
    mockBloc = MockTickerBloc();
  });

  Widget createWidgetUnderTest() {
    return MaterialApp(
      home: Scaffold(
        body: BlocProvider<TickerBloc>.value(
          value: mockBloc,
          child: const LiquidTickerWidget(),
        ),
      ),
    );
  }

  testWidgets('renders nothing when state is TickerEmpty', (tester) async {
    when(() => mockBloc.state).thenReturn(TickerEmpty());

    await tester.pumpWidget(createWidgetUnderTest());
    await tester.pump(); // Build
    // Do not use pumpAndSettle due to infinite animation loop in background
    // The widget renders SizedBox, so scroll controller has no clients, loop should exit after first delay.

    expect(find.byType(Container), findsNothing); 
    expect(find.byIcon(Icons.videocam), findsNothing);
  });

  testWidgets('renders ticker content when state is TickerActive', (tester) async {
    // Provide a valid ticker
    final ticker = MeetingTicker(
      title: 'Test Meeting',
      startTime: DateTime.now(),
      meetUrl: 'https://example.com',
      status: 'scheduled',
    );

    when(() => mockBloc.state).thenReturn(TickerActive(ticker));

    await tester.pumpWidget(createWidgetUnderTest());
    await tester.pump(); // Trigger build
    
    // Advance time for AnimatedSize (600ms)
    await tester.pump(const Duration(milliseconds: 600)); 

    expect(find.textContaining('Test Meeting'), findsOneWidget);
    expect(find.byIcon(Icons.videocam), findsOneWidget);
    expect(find.byIcon(Icons.play_arrow_rounded), findsOneWidget);
    
    // Cleanup: Trigger dispose and flush pending timers
    await tester.pumpWidget(const SizedBox());
    // Marquee has a 2-second delay, so we pump >2s to let it fire and exit
    await tester.pump(const Duration(seconds: 3));
  });
}
