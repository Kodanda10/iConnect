/**
 * Flutter Test Global Bootstrap Configuration
 * 
 * @description Global test setup that runs before ALL test files. Ensures:
 *   - TestWidgetsFlutterBinding is initialized
 *   - GoogleFonts runtime fetching is disabled (deterministic tests)
 *   - Asset loading is available from test startup
 * 
 * @changelog
 * - 2025-12-19: Initial implementation to fix "Binding has not yet been initialized" errors
 * 
 * @reference https://api.flutter.dev/flutter/flutter_test/flutter_test-library.html
 */

import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

/// Global test configuration function that Flutter test framework calls
/// before running any test file in the `test/` directory.
/// 
/// This ensures deterministic test behavior across all environments (local, CI).
Future<void> testExecutable(FutureOr<void> Function() testMain) async {
  // 1. Ensure binding is initialized BEFORE any test code runs
  TestWidgetsFlutterBinding.ensureInitialized();
  
  // 2. Disable runtime font fetching to prevent:
  //    - Network dependency in tests
  //    - Flaky tests due to download timing
  //    - CI failures in offline/sandboxed environments
  GoogleFonts.config.allowRuntimeFetching = false;
  
  // 3. Execute the actual test main function
  await testMain();
}
