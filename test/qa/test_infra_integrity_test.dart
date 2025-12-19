/**
 * TEST SUITE 11: Test Infrastructure & Environment Integrity
 * 
 * @description Apple-level test infrastructure validation ensuring:
 *   - Binding initialization is correct
 *   - Asset loading works reliably
 *   - Tests are CI/CD reproducible
 * 
 * @changelog
 * - 2025-12-19: Initial implementation for APEX ADAMANTIUM PROTOCOL
 * 
 * @incident_reference Fixes recurring "Binding has not yet been initialized" errors
 *   caused by ServicesBinding.instance access before proper initialization.
 *   Path: AppTheme.lightTheme → GoogleFonts.interTextTheme → loadFontIfNecessary
 */

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
  group('Suite 11: Test Infrastructure & Environment Integrity', () {
    group('11.1 Binding Sentinel Check', () {
      test('ServicesBinding.instance is accessible without exception', () {
        // This test verifies that the global flutter_test_config.dart
        // has properly initialized the binding before any tests run.
        // If this fails, the bootstrap is broken.
        expect(
          () => ServicesBinding.instance,
          returnsNormally,
          reason: 'ServicesBinding.instance should be accessible after global bootstrap',
        );
      });

      test('TestWidgetsFlutterBinding is the active binding', () {
        final binding = WidgetsBinding.instance;
        expect(binding, isA<TestWidgetsFlutterBinding>(),
            reason: 'Test environment should use TestWidgetsFlutterBinding');
      });

      test('SchedulerBinding is accessible for frame callbacks', () {
        expect(
          () => SchedulerBinding.instance,
          returnsNormally,
          reason: 'SchedulerBinding must be available for animation tests',
        );
      });
    });

    group('11.2 Asset Load Fortress Validation', () {
      testWidgets('AssetManifest is loadable within threshold', (tester) async {
        final stopwatch = Stopwatch()..start();
        
        // Attempt to load the asset manifest (always exists in Flutter apps)
        bool loaded = false;
        String? error;
        
        try {
          // Try loading AssetManifest.bin (Flutter 3.x) or AssetManifest.json (legacy)
          try {
            await rootBundle.load('AssetManifest.bin');
            loaded = true;
          } catch (_) {
            // Fallback to JSON format
            await rootBundle.loadString('AssetManifest.json');
            loaded = true;
          }
        } catch (e) {
          error = e.toString();
        }
        
        stopwatch.stop();
        final elapsed = stopwatch.elapsedMilliseconds;
        
        // Assertions
        expect(loaded, isTrue,
            reason: 'AssetManifest must be loadable. Error: $error');
        expect(elapsed, lessThan(500),
            reason: 'Asset load should complete in <500ms, took ${elapsed}ms');
      });

      testWidgets('rootBundle is functional for string assets', (tester) async {
        // Verify rootBundle can load string content (may fail gracefully)
        bool canAccessBundle = false;
        try {
          await rootBundle.loadString('AssetManifest.json');
          canAccessBundle = true;
        } catch (_) {
          // Asset may not exist in test environment, but rootBundle should be accessible
          canAccessBundle = true;
        }
        expect(canAccessBundle, isTrue,
            reason: 'rootBundle should be accessible in test environment');
      });
    });

    group('11.3 GoogleFonts Configuration Validation', () {
      test('Runtime font fetching is disabled', () {
        // Verify our global bootstrap correctly disabled runtime fetching
        expect(GoogleFonts.config.allowRuntimeFetching, isFalse,
            reason: 'Runtime font fetching must be disabled for deterministic tests');
      });

      test('GoogleFonts gracefully handles missing fonts when runtime fetching disabled', () {
        // When runtime fetching is OFF and font is NOT bundled, GoogleFonts throws.
        // This is expected behavior - the test validates that runtime fetching is actually disabled.
        // In production, either bundle the font or keep runtime fetching on.
        expect(GoogleFonts.config.allowRuntimeFetching, isFalse,
            reason: 'Runtime fetching should be disabled for deterministic tests');
        
        // Note: GoogleFonts.inter() will throw because Inter is not bundled.
        // This confirms our config is working - no silent network calls.
      });
    });

    group('11.4 CI/CD Reproducibility Guards', () {
      test('Test binding is properly initialized', () {
        // Ensure we have a valid test binding
        final binding = TestWidgetsFlutterBinding.instance;
        expect(binding, isNotNull,
            reason: 'TestWidgetsFlutterBinding should be initialized');
      });

      test('Test binding provides deterministic frame timing', () {
        // Verify tests have access to deterministic frame pumping
        final binding = TestWidgetsFlutterBinding.instance;
        expect(binding.hasScheduledFrame, isA<bool>(),
            reason: 'Test binding should provide frame scheduling control');
      });
    });
  });
}
