import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:iconnect_mobile/features/tasks/presentation/widgets/call_options_sheet.dart';
import 'package:plugin_platform_interface/plugin_platform_interface.dart';
import 'package:url_launcher_platform_interface/url_launcher_platform_interface.dart';
import 'package:url_launcher/url_launcher.dart';

// 1. Mock the Platform Interface
class MockUrlLauncher extends Fake with MockPlatformInterfaceMixin implements UrlLauncherPlatform {
  String? launchedUrl;
  PreferredLaunchMode? launchedMode;
  bool canLaunchResult = true;
  bool launchUrlResult = true;
  String? canLaunchQuery;

  @override
  Future<bool> canLaunch(String url) async {
    canLaunchQuery = url;
    // Simulate "whatsapp://" checks returning boolean based on test setup
    if (url.startsWith('whatsapp://')) {
      return canLaunchResult;
    }
    return true; // Always allow web links
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

  setUp(() {
    mockLauncher = MockUrlLauncher();
    UrlLauncherPlatform.instance = mockLauncher;
  });

  // Helper widget to pump the sheet
  Future<void> pumpSheet(WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Builder(
            builder: (context) => ElevatedButton(
              onPressed: () {
                CallOptionsPopover.show(
                  context,
                  TapDownDetails(globalPosition: Offset.zero),
                  phoneNumber: '9876543210',
                  constituentName: 'Test User',
                  onCallComplete: (_) {},
                );
              },
              child: const Text('Show Sheet'),
            ),
          ),
        ),
      ),
    );
    await tester.tap(find.text('Show Sheet'));
    await tester.pumpAndSettle();
  }

  testWidgets('WhatsApp Call: Launches native scheme if supported', (WidgetTester tester) async {
    // Arrange: Native checks pass
    mockLauncher.canLaunchResult = true;

    await pumpSheet(tester);

    // Act: Tap WhatsApp
    await tester.tap(find.text('WhatsApp'));
    await tester.pump(); // Start async
    await tester.pump(); // Complete async

    // Assert
    // Should verify it tried whatsapp:// first
    expect(mockLauncher.launchedUrl, startsWith('whatsapp://send'));
    expect(mockLauncher.launchedUrl, contains('919876543210')); // 91 prefixed
    expect(mockLauncher.launchedMode, PreferredLaunchMode.externalApplication);
  });

  testWidgets('WhatsApp Call: Falls back to web if native scheme fails', (WidgetTester tester) async {
    // Arrange: Native checks fail (simulating not installed or restricted)
    mockLauncher.canLaunchResult = false;
    mockLauncher.launchUrlResult = false;

    await pumpSheet(tester);

    // Act
    await tester.tap(find.text('WhatsApp'));
    await tester.pump();
    await tester.pump();

    // Assert
    // Should verify it fell back to wa.me
    expect(mockLauncher.launchedUrl, startsWith('https://wa.me/'));
    expect(mockLauncher.launchedUrl, contains('919876543210'));
    expect(mockLauncher.launchedMode, PreferredLaunchMode.externalApplication);
  });
}
