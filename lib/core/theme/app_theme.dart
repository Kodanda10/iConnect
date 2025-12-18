/// iConnect Design System - Emerald Amethyst Glass Theme
/// 
/// This file contains the complete design system for Flutter,
/// matching the web portal's Emerald/Amethyst Glass theme.
/// 
/// @changelog
/// - 2024-12-18: Refactored for Deep Veridian theme parity
library;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Primary Emerald color palette
class AppColors {
  // Primary - Veridian Emerald
  static const Color primary = Color(0xFF008F7A);
  static const Color primaryLight = Color(0xFF00A896);
  static const Color primaryDark = Color(0xFF006B5A);
  
  // Secondary - Deep Amethyst
  static const Color secondary = Color(0xFF5E548E);
  static const Color secondaryLight = Color(0xFF7B6FA6);
  
  // Text Colors
  static const Color textPrimary = Color(0xFFFFFFFF); // White for Dark Theme
  static const Color textSecondary = Color(0xFF94A3B8); // Slate 400
  static const Color textMuted = Color(0xFF64748B); // Slate 500
  static const Color textOnDark = Colors.white;
  
  // Background - Mesh Gradient colors (Matches Web globals.css)
  static const Color bgGradientStart = Color(0xFF0D3B2E); // Web: --bg-gradient-start
  static const Color bgGradientEnd = Color(0xFF2A2D4E);   // Web: --bg-gradient-end
  
  // Glass Surface (Smoked)
  static const Color glassSurface = Color(0x66000000); // Black 40%
  static const Color glassBorder = Color(0x4DFFFFFF); // White 30%
  static const Color glassSurfaceLight = Color(0xCCFFFFFF); 
  
  // Status Colors
  static const Color success = Color(0xFF10B981); // Emerald 500
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);
  
  // Task Type Colors
  static const Color birthday = Color(0xFFEC4899); // Pink
  static const Color anniversary = Color(0xFF8B5CF6); // Purple
}

/// Border radius constants
class AppRadius {
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 24.0;
  static const double full = 9999.0;
}

/// Spacing constants
class AppSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 24.0;
  static const double xxl = 32.0;
}

/// Main app theme
class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark, // Force Dark Mode
      scaffoldBackgroundColor: AppColors.bgGradientEnd,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        brightness: Brightness.dark,
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surface: AppColors.glassSurface,
        error: AppColors.error,
      ),
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.inter(
          fontSize: 32,
          fontWeight: FontWeight.w800, // ExtraBold
          color: AppColors.textPrimary,
        ),
        displayMedium: GoogleFonts.inter(
          fontSize: 28,
          fontWeight: FontWeight.w800, // ExtraBold
          color: AppColors.textPrimary,
        ),
        headlineLarge: GoogleFonts.inter(
          fontSize: 24,
          fontWeight: FontWeight.w700, // Bold
          color: AppColors.textPrimary,
        ),
        headlineMedium: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.w700, // Bold
          color: AppColors.textPrimary,
        ),
        titleLarge: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.w600, // SemiBold
          color: AppColors.textPrimary,
        ),
        titleMedium: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w600, // SemiBold
          color: AppColors.textPrimary,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 16,
          fontWeight: FontWeight.w600, // SemiBold for Premium feel
          color: AppColors.textPrimary,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w400, // Regular
          color: AppColors.textSecondary,
        ),
        bodySmall: GoogleFonts.inter(
          fontSize: 12,
          fontWeight: FontWeight.w400,
          color: AppColors.textMuted,
        ),
        labelLarge: GoogleFonts.inter(
          fontSize: 14,
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
        ),
      ),
      // Overridden by PrimaryButton usually, but keep fallback
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.lg),
          ),
          elevation: 4,
          textStyle: GoogleFonts.inter(
            fontSize: 16,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white.withOpacity(0.1),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          borderSide: const BorderSide(color: AppColors.glassBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          borderSide: BorderSide(color: Colors.white.withOpacity(0.2)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.xl),
        ),
        color: AppColors.glassSurface,
      ),
      appBarTheme: AppBarTheme(
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: AppColors.textPrimary,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
        ),
      ),
    );
  }
  
  /// Mesh gradient background decoration (Legacy helper, use AppBackground widget)
  static BoxDecoration get meshGradient => const BoxDecoration(
    gradient: LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [AppColors.bgGradientStart, AppColors.bgGradientEnd],
    ),
  );
  
  /// Glass card decoration (Smoked)
  static BoxDecoration glassCard({double opacity = 0.4}) => BoxDecoration(
    color: Colors.black.withOpacity(opacity),
    borderRadius: BorderRadius.circular(AppRadius.xl),
    border: Border.all(color: Colors.white.withOpacity(0.3), width: 0.5),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.2),
        blurRadius: 32,
        offset: const Offset(0, 8),
      ),
    ],
  );
  
  /// Primary gradient
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.primary, AppColors.primaryLight],
  );
}
