/**
 * Design Token Parity Test - Visual Fidelity Suite
 * 
 * @description Verifies Flutter AppColors/AppTheme match web globals.css tokens
 * @reference iconnect-web/src/app/globals.css
 * @changelog
 * - 2025-12-19: Initial implementation for QA Audit Suite 3
 */

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:iconnect_mobile/core/theme/app_theme.dart';

/// Web CSS token values extracted from globals.css
/// These serve as the "golden reference" for the Flutter "Digital Twin"
class WebCssTokens {
  // Primary Palette - Veridian Emerald (Web: --color-primary)
  static const int primary = 0xFF008F7A;
  static const int primaryLight = 0xFF00A896;
  static const int primaryDark = 0xFF006B5A;

  // Secondary Palette - Deep Amethyst (Web: --color-secondary)
  static const int secondary = 0xFF5E548E;
  static const int secondaryLight = 0xFF7B6FA6;

  // Background - Mesh Gradient (Web: --bg-gradient-start, --bg-gradient-end)
  static const int bgGradientStart = 0xFF0D3B2E;
  static const int bgGradientEnd = 0xFF2A2D4E;

  // Border Radius (Web: --radius-*)
  static const double radiusSm = 8.0;
  static const double radiusMd = 12.0;
  static const double radiusLg = 16.0;
  static const double radiusXl = 24.0;
  static const double radiusFull = 9999.0;

  // Spacing (Web: --space-*)
  static const double space1 = 4.0;
  static const double space2 = 8.0;
  static const double space3 = 12.0;
  static const double space4 = 16.0;
  static const double space5 = 20.0;
  static const double space6 = 24.0;
  static const double space8 = 32.0;

  // Status Colors
  static const int success = 0xFF10B981;
  static const int warning = 0xFFF59E0B;
  static const int error = 0xFFEF4444;
  static const int info = 0xFF3B82F6;
}

void main() {
  group('Design Token Parity - Flutter ↔ Web (globals.css)', () {
    group('Primary Palette', () {
      test('AppColors.primary matches Web --color-primary (#008F7A)', () {
        expect(AppColors.primary.value, equals(WebCssTokens.primary),
            reason: 'Flutter primary color must match Web --color-primary');
      });

      test('AppColors.primaryLight matches Web --color-primary-light (#00A896)', () {
        expect(AppColors.primaryLight.value, equals(WebCssTokens.primaryLight),
            reason: 'Flutter primaryLight must match Web --color-primary-light');
      });

      test('AppColors.primaryDark matches Web --color-primary-dark (#006B5A)', () {
        expect(AppColors.primaryDark.value, equals(WebCssTokens.primaryDark),
            reason: 'Flutter primaryDark must match Web --color-primary-dark');
      });
    });

    group('Secondary Palette', () {
      test('AppColors.secondary matches Web --color-secondary (#5E548E)', () {
        expect(AppColors.secondary.value, equals(WebCssTokens.secondary),
            reason: 'Flutter secondary must match Web --color-secondary');
      });

      test('AppColors.secondaryLight matches Web --color-secondary-light (#7B6FA6)', () {
        expect(AppColors.secondaryLight.value, equals(WebCssTokens.secondaryLight),
            reason: 'Flutter secondaryLight must match Web --color-secondary-light');
      });
    });

    group('Background Gradient', () {
      test('AppColors.bgGradientStart matches Web --bg-gradient-start (#0D3B2E)', () {
        expect(AppColors.bgGradientStart.value, equals(WebCssTokens.bgGradientStart),
            reason: 'Flutter bgGradientStart must match Web --bg-gradient-start');
      });

      test('AppColors.bgGradientEnd matches Web --bg-gradient-end (#2A2D4E)', () {
        expect(AppColors.bgGradientEnd.value, equals(WebCssTokens.bgGradientEnd),
            reason: 'Flutter bgGradientEnd must match Web --bg-gradient-end');
      });
    });

    group('Border Radius', () {
      test('AppRadius values match Web --radius-* tokens', () {
        expect(AppRadius.sm, equals(WebCssTokens.radiusSm), reason: 'radius-sm');
        expect(AppRadius.md, equals(WebCssTokens.radiusMd), reason: 'radius-md');
        expect(AppRadius.lg, equals(WebCssTokens.radiusLg), reason: 'radius-lg');
        expect(AppRadius.xl, equals(WebCssTokens.radiusXl), reason: 'radius-xl');
        expect(AppRadius.full, equals(WebCssTokens.radiusFull), reason: 'radius-full');
      });
    });

    group('Spacing', () {
      test('AppSpacing values align with Web --space-* tokens', () {
        expect(AppSpacing.xs, equals(WebCssTokens.space1), reason: 'space-1 / xs');
        expect(AppSpacing.sm, equals(WebCssTokens.space2), reason: 'space-2 / sm');
        expect(AppSpacing.md, equals(WebCssTokens.space3), reason: 'space-3 / md');
        expect(AppSpacing.lg, equals(WebCssTokens.space4), reason: 'space-4 / lg');
        expect(AppSpacing.xl, equals(WebCssTokens.space6), reason: 'space-6 / xl');
        expect(AppSpacing.xxl, equals(WebCssTokens.space8), reason: 'space-8 / xxl');
      });
    });

    group('Status Colors', () {
      test('AppColors.success matches Web Emerald 500 (#10B981)', () {
        expect(AppColors.success.value, equals(WebCssTokens.success));
      });

      test('AppColors.warning matches Web Amber 500 (#F59E0B)', () {
        expect(AppColors.warning.value, equals(WebCssTokens.warning));
      });

      test('AppColors.error matches Web Red 500 (#EF4444)', () {
        expect(AppColors.error.value, equals(WebCssTokens.error));
      });

      test('AppColors.info matches Web Blue 500 (#3B82F6)', () {
        expect(AppColors.info.value, equals(WebCssTokens.info));
      });
    });

    group('Theme Integration', () {
      testWidgets('AppTheme uses correct primary color in ColorScheme', (tester) async {
        final theme = AppTheme.lightTheme;
        expect(theme.colorScheme.primary.value, equals(WebCssTokens.primary),
            reason: 'Theme ColorScheme.primary must use AppColors.primary');
      });

      testWidgets('AppTheme uses correct secondary color in ColorScheme', (tester) async {
        final theme = AppTheme.lightTheme;
        expect(theme.colorScheme.secondary.value, equals(WebCssTokens.secondary),
            reason: 'Theme ColorScheme.secondary must use AppColors.secondary');
      });

      testWidgets('AppTheme uses Inter font family', (tester) async {
        final theme = AppTheme.lightTheme;
        // GoogleFonts.inter returns 'Inter' as the family
        expect(theme.textTheme.bodyLarge?.fontFamily, contains('Inter'));
      });
    });
  });
}
