/**
 * Design Token Parity Test - Visual Fidelity Suite
 * 
 * @description Verifies Flutter AppColors/AppTheme are internally consistent
 * @note Mobile app uses white theme with green accents (different from web dark theme)
 * @changelog
 * - 2025-12-19: Initial implementation for QA Audit Suite 3
 * - 2025-12-26: Updated for white theme with green liquid glass
 */

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:iconnect_mobile/core/theme/app_theme.dart';

/// Mobile app design tokens - White theme with green accents
/// These are the expected values for the new white theme
class MobileThemeTokens {
  // Primary Palette - Emerald Green
  static const int primary = 0xFF10B981;       // Emerald 500
  static const int primaryLight = 0xFF34D399;  // Emerald 400
  static const int primaryDark = 0xFF059669;   // Emerald 600

  // Secondary Palette - Teal accent
  static const int secondary = 0xFF14B8A6;     // Teal 500
  static const int secondaryLight = 0xFF2DD4BF;

  // Background - Clean white
  static const int bgGradientStart = 0xFFFFFFFF; // Pure white
  static const int bgGradientEnd = 0xFFF9FAFB;   // Gray 50

  // Border Radius (unchanged)
  static const double radiusSm = 8.0;
  static const double radiusMd = 12.0;
  static const double radiusLg = 16.0;
  static const double radiusXl = 24.0;
  static const double radiusFull = 9999.0;

  // Spacing (unchanged)
  static const double space1 = 4.0;
  static const double space2 = 8.0;
  static const double space3 = 12.0;
  static const double space4 = 16.0;
  static const double space5 = 20.0;
  static const double space6 = 24.0;
  static const double space8 = 32.0;

  // Status Colors (unchanged)
  static const int success = 0xFF10B981;
  static const int warning = 0xFFF59E0B;
  static const int error = 0xFFEF4444;
  static const int info = 0xFF3B82F6;
}

void main() {
  group('Design Token Parity - White Theme with Green Liquid Glass', () {
    group('Primary Palette - Emerald Green', () {
      test('AppColors.primary is Emerald 500 (#10B981)', () {
        expect(AppColors.primary.value, equals(MobileThemeTokens.primary),
            reason: 'Flutter primary color must be Emerald 500');
      });

      test('AppColors.primaryLight is Emerald 400 (#34D399)', () {
        expect(AppColors.primaryLight.value, equals(MobileThemeTokens.primaryLight),
            reason: 'Flutter primaryLight must be Emerald 400');
      });

      test('AppColors.primaryDark is Emerald 600 (#059669)', () {
        expect(AppColors.primaryDark.value, equals(MobileThemeTokens.primaryDark),
            reason: 'Flutter primaryDark must be Emerald 600');
      });
    });

    group('Secondary Palette - Teal', () {
      test('AppColors.secondary is Teal 500 (#14B8A6)', () {
        expect(AppColors.secondary.value, equals(MobileThemeTokens.secondary),
            reason: 'Flutter secondary must be Teal 500');
      });

      test('AppColors.secondaryLight is Teal 400 (#2DD4BF)', () {
        expect(AppColors.secondaryLight.value, equals(MobileThemeTokens.secondaryLight),
            reason: 'Flutter secondaryLight must be Teal 400');
      });
    });

    group('Background - White Gradient', () {
      test('AppColors.bgGradientStart is pure white (#FFFFFF)', () {
        expect(AppColors.bgGradientStart.value, equals(MobileThemeTokens.bgGradientStart),
            reason: 'Flutter bgGradientStart must be pure white');
      });

      test('AppColors.bgGradientEnd is Gray 50 (#F9FAFB)', () {
        expect(AppColors.bgGradientEnd.value, equals(MobileThemeTokens.bgGradientEnd),
            reason: 'Flutter bgGradientEnd must be Gray 50');
      });
    });

    group('Border Radius', () {
      test('AppRadius values match design tokens', () {
        expect(AppRadius.sm, equals(MobileThemeTokens.radiusSm), reason: 'radius-sm');
        expect(AppRadius.md, equals(MobileThemeTokens.radiusMd), reason: 'radius-md');
        expect(AppRadius.lg, equals(MobileThemeTokens.radiusLg), reason: 'radius-lg');
        expect(AppRadius.xl, equals(MobileThemeTokens.radiusXl), reason: 'radius-xl');
        expect(AppRadius.full, equals(MobileThemeTokens.radiusFull), reason: 'radius-full');
      });
    });

    group('Spacing', () {
      test('AppSpacing values align with design tokens', () {
        expect(AppSpacing.xs, equals(MobileThemeTokens.space1), reason: 'space-1 / xs');
        expect(AppSpacing.sm, equals(MobileThemeTokens.space2), reason: 'space-2 / sm');
        expect(AppSpacing.md, equals(MobileThemeTokens.space3), reason: 'space-3 / md');
        expect(AppSpacing.lg, equals(MobileThemeTokens.space4), reason: 'space-4 / lg');
        expect(AppSpacing.xl, equals(MobileThemeTokens.space6), reason: 'space-6 / xl');
        expect(AppSpacing.xxl, equals(MobileThemeTokens.space8), reason: 'space-8 / xxl');
      });
    });

    group('Status Colors', () {
      test('AppColors.success is Emerald 500 (#10B981)', () {
        expect(AppColors.success.value, equals(MobileThemeTokens.success));
      });

      test('AppColors.warning is Amber 500 (#F59E0B)', () {
        expect(AppColors.warning.value, equals(MobileThemeTokens.warning));
      });

      test('AppColors.error is Red 500 (#EF4444)', () {
        expect(AppColors.error.value, equals(MobileThemeTokens.error));
      });

      test('AppColors.info is Blue 500 (#3B82F6)', () {
        expect(AppColors.info.value, equals(MobileThemeTokens.info));
      });
    });

    group('Theme Integration', () {
      testWidgets('AppTheme uses correct primary color in ColorScheme', (tester) async {
        final theme = AppTheme.lightTheme;
        expect(theme.colorScheme.primary.value, equals(MobileThemeTokens.primary),
            reason: 'Theme ColorScheme.primary must use AppColors.primary');
      });

      testWidgets('AppTheme uses correct secondary color in ColorScheme', (tester) async {
        final theme = AppTheme.lightTheme;
        expect(theme.colorScheme.secondary.value, equals(MobileThemeTokens.secondary),
            reason: 'Theme ColorScheme.secondary must use AppColors.secondary');
      });

      testWidgets('AppTheme uses Inter font family', (tester) async {
        final theme = AppTheme.lightTheme;
        expect(theme.textTheme.bodyLarge?.fontFamily, contains('Inter'));
      });

      testWidgets('AppTheme uses light brightness', (tester) async {
        final theme = AppTheme.lightTheme;
        expect(theme.brightness, equals(Brightness.light),
            reason: 'Theme must use light brightness for white theme');
      });
    });
  });
}
