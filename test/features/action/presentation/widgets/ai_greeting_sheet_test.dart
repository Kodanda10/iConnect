import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:iconnect_mobile/features/action/presentation/widgets/ai_greeting_sheet.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';
import 'package:url_launcher_platform_interface/url_launcher_platform_interface.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:iconnect_mobile/features/action/presentation/bloc/greeting_bloc.dart';
import 'package:iconnect_mobile/features/action/presentation/bloc/greeting_state.dart';
import 'package:iconnect_mobile/features/action/presentation/bloc/greeting_event.dart';

// Mock Bloc
class MockGreetingBloc extends MockBloc<GreetingEvent, GreetingState> implements GreetingBloc {}

// Mock Launcher
class MockUrlLauncher extends Fake with MockPlatformInterfaceMixin implements UrlLauncherPlatform {
  String? launchedUrl;
  PreferredLaunchMode? launchedMode;
  bool canLaunchResult = true;
  bool launchUrlResult = true;

  @override
  Future<bool> canLaunch(String url) async {
    if (url.startsWith('whatsapp://')) {
      return canLaunchResult;
    }
    return true; 
  }

  @override 
  Future<bool> launchUrl(String url, LaunchOptions options) async {
    launchedUrl = url;
    launchedMode = options.mode;
    return launchUrlResult;
  }
}

void main() {
  late MockUrlLauncher mockLauncher;
  late MockGreetingBloc mockGreetingBloc;

  setUp(() {
    mockLauncher = MockUrlLauncher();
    UrlLauncherPlatform.instance = mockLauncher;
    mockGreetingBloc = MockGreetingBloc();
    
    // Setup default state
    whenListen(
      mockGreetingBloc,
      Stream.fromIterable([GreetingInitial()]),
      initialState: GreetingInitial(),
    );
  });

  Future<void> pumpSheet(WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: BlocProvider<GreetingBloc>.value(
            value: mockGreetingBloc,
            child: const AiGreetingSheet(
              taskId: '123',
              constituentName: 'Test User',
              type: 'BIRTHDAY',
              mobile: '9876543210',
              actionType: 'WHATSAPP',
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();
  }

  testWidgets('WhatsApp Message: Launches native scheme if supported', (WidgetTester tester) async {
    mockLauncher.canLaunchResult = true;
    await pumpSheet(tester);

    // Enter text to enable send? No, text is prefilled.
    // Tap Send
    await tester.tap(find.textContaining('Send via WhatsApp'));
    await tester.pump(); 

    // Assert
    expect(mockLauncher.launchedUrl, startsWith('whatsapp://send'));
    expect(mockLauncher.launchedUrl, contains('9876543210')); 
    expect(mockLauncher.launchedMode, PreferredLaunchMode.externalApplication);
  });

  testWidgets('WhatsApp Message: Falls back to web if native scheme fails', (WidgetTester tester) async {
    mockLauncher.launchUrlResult = false; // Simulate native launch failure
    await pumpSheet(tester);

    await tester.tap(find.textContaining('Send via WhatsApp'));
    await tester.pumpAndSettle();

    // Assert
    expect(mockLauncher.launchedUrl, startsWith('https://wa.me/'));
    expect(mockLauncher.launchedUrl, contains('9876543210'));
    expect(mockLauncher.launchedMode, PreferredLaunchMode.externalApplication);
  });
}
