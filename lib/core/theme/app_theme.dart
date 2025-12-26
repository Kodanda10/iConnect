/// iConnect Design System - White Theme with Green Liquid Glass
/// 
/// Clean white background with emerald green translucent splash effects.
/// Apple-inspired subtle liquid glass aesthetic.
/// 
/// @changelog
/// - 2024-12-18: Original dark theme
/// - 2025-12-26: Refactored to white theme with green liquid glass splash
/// - 2025-12-26: Centralized component themes (DatePicker, Dialog, FAB, etc.)
library;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Primary color palette - White theme with green accents
class AppColors {
  // Primary - Emerald Green
  static const Color primary = Color(0xFF10B981);       // Emerald 500
  static const Color primaryLight = Color(0xFF34D399);  // Emerald 400
  static const Color primaryDark = Color(0xFF059669);   // Emerald 600
  
  // Secondary - Teal accent
  static const Color secondary = Color(0xFF14B8A6);     // Teal 500
  static const Color secondaryLight = Color(0xFF2DD4BF);
  
  // Text Colors - Dark on light
  static const Color textPrimary = Color(0xFF1F2937);   // Gray 800
  static const Color textSecondary = Color(0xFF6B7280); // Gray 500
  static const Color textMuted = Color(0xFF9CA3AF);     // Gray 400
  static const Color textOnPrimary = Colors.white;
  
  // Background - Clean white/off-white
  static const Color bgPrimary = Color(0xFFFAFAFA);     // Near-white
  static const Color bgSecondary = Color(0xFFF3F4F6);   // Gray 100
  static const Color bgGradientStart = Color(0xFFFFFFFF); // Pure white
  static const Color bgGradientEnd = Color(0xFFF9FAFB);   // Gray 50
  
  // Liquid Glass Splash Effect - Green translucent
  static const Color glassSplash = Color(0x1A10B981);   // Green 10%
  static const Color glassBorder = Color(0x3310B981);   // Green 20%
  static const Color glassSurface = Color(0xFFFFFFFF);  // White surface
  static const Color glassSurfaceLight = Color(0xFFF9FAFB);
  static const Color cardShadow = Color(0x0D000000);    // Black 5%
  
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

/// Main app theme - White with green liquid glass
class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.bgPrimary,
      primaryColor: AppColors.primary,
      
      // Color Scheme
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        brightness: Brightness.light,
        primary: AppColors.primary,
        onPrimary: Colors.white,
        secondary: AppColors.secondary,
        onSecondary: Colors.white,
        surface: AppColors.glassSurface,
        onSurface: AppColors.textPrimary,
        error: AppColors.error,
        background: AppColors.bgPrimary,
        onBackground: AppColors.textPrimary,
      ),

      // Text Theme
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
        displayMedium: GoogleFonts.inter(fontSize: 28, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
        headlineLarge: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
        headlineMedium: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
        titleLarge: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
        titleMedium: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
        bodyLarge: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
        bodyMedium: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.textSecondary),
        bodySmall: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w400, color: AppColors.textMuted),
        labelLarge: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
      ),

      // Button Themes
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.lg)),
          elevation: 0,
          textStyle: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w700),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.textSecondary,
          side: const BorderSide(color: AppColors.glassBorder),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.lg)),
          textStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          textStyle: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600),
        ),
      ),

      // Floating Action Button Theme
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 4,
        shape: CircleBorder(),
      ),

      // Input Decoration Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.bgSecondary,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          borderSide: const BorderSide(color: AppColors.glassBorder),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),

      // Card Theme
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.xl)),
        color: AppColors.glassSurface,
        shadowColor: AppColors.cardShadow,
      ),

      // AppBar Theme
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

      // Date Picker Theme
      datePickerTheme: DatePickerThemeData(
        backgroundColor: Colors.white,
        headerBackgroundColor: AppColors.primary,
        headerForegroundColor: Colors.white,
        dayForegroundColor: MaterialStateProperty.all(AppColors.textPrimary),
        todayBackgroundColor: MaterialStateProperty.all(AppColors.primary.withOpacity(0.1)),
        todayForegroundColor: MaterialStateProperty.all(AppColors.primary),
        yearForegroundColor: MaterialStateProperty.all(AppColors.textPrimary),
        yearBackgroundColor: MaterialStateProperty.all(Colors.white),
        surfaceTintColor: Colors.transparent,
      ),
      


      // Bottom Sheet Theme
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.xl)),
        ),
      ),

      // Chip Theme
      chipTheme: ChipThemeData(
        backgroundColor: Colors.grey.withOpacity(0.05),
        disabledColor: Colors.grey.withOpacity(0.02),
        selectedColor: AppColors.primary.withOpacity(0.1),
        secondarySelectedColor: AppColors.primary.withOpacity(0.1),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        labelStyle: GoogleFonts.inter(color: AppColors.textPrimary),
        secondaryLabelStyle: GoogleFonts.inter(color: AppColors.primary, fontWeight: FontWeight.bold),
        brightness: Brightness.light,
        shape: RoundedRectangleBorder(
           borderRadius: BorderRadius.circular(50),
           side: const BorderSide(color: AppColors.glassBorder),
        ),
      ),
      
      // Icon Theme
      iconTheme: const IconThemeData(
        color: AppColors.textSecondary,
        size: 24,
      ),
    );
  }
  
  /// White gradient background
  static BoxDecoration get meshGradient => const BoxDecoration(
    gradient: LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [AppColors.bgGradientStart, AppColors.bgGradientEnd],
    ),
  );
  
  /// Liquid glass card with green splash effect
  static BoxDecoration glassCard({double opacity = 0.1}) => BoxDecoration(
    gradient: LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [
        Colors.white,
        Colors.white,
        AppColors.primary.withOpacity(0.05),
      ],
      stops: const [0.0, 0.6, 1.0],
    ),
    borderRadius: BorderRadius.circular(AppRadius.xl),
    border: Border.all(color: AppColors.glassBorder, width: 1),
    boxShadow: [
      BoxShadow(
        color: AppColors.primary.withOpacity(0.05),
        blurRadius: 24,
        offset: const Offset(0, 8),
      ),
      BoxShadow(
        color: AppColors.cardShadow,
        blurRadius: 4,
        offset: const Offset(0, 2),
      ),
    ],
  );
  
  /// Green splash effect decoration
  static BoxDecoration splashEffect({double intensity = 0.15}) => BoxDecoration(
    color: AppColors.primary.withOpacity(intensity),
    borderRadius: BorderRadius.circular(AppRadius.lg),
    border: Border.all(
      color: AppColors.primary.withOpacity(intensity * 2),
      width: 1,
    ),
  );
  
  /// Primary gradient
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.primary, AppColors.primaryLight],
  );
}
