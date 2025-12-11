/// Login Page for iConnect Mobile
/// 
/// Glassmorphism design with email/password authentication.
/// 
/// @changelog
/// - 2024-12-11: Initial implementation
library;

import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_theme.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  
  late AnimationController _animController;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animController, curve: Curves.easeOut),
    );
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.2),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _animController, curve: Curves.easeOutCubic));
    
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _onSignInPressed() {
    if (_formKey.currentState!.validate()) {
      context.read<AuthBloc>().add(
        AuthLoginRequested(
          email: _emailController.text.trim(),
          password: _passwordController.text,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColors.error,
              ),
            );
          }
        },
        child: Container(
          decoration: AppTheme.meshGradient,
          child: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: FadeTransition(
                  opacity: _fadeAnim,
                  child: SlideTransition(
                    position: _slideAnim,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Logo
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            gradient: AppTheme.primaryGradient,
                            borderRadius: BorderRadius.circular(AppRadius.xl),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withOpacity(0.4),
                                blurRadius: 24,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.hub_outlined,
                            size: 40,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 24),
                        
                        // Title
                        Text(
                          'iConnect',
                          style: Theme.of(context).textTheme.displayMedium?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Constituent Relationship Management',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.white.withOpacity(0.6),
                          ),
                        ),
                        const SizedBox(height: 48),
                        
                        // Glass Card Form
                        ClipRRect(
                          borderRadius: BorderRadius.circular(AppRadius.xl),
                          child: BackdropFilter(
                            filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                            child: Container(
                              padding: const EdgeInsets.all(24),
                              decoration: AppTheme.glassCard(),
                              child: Form(
                                key: _formKey,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                  children: [
                                    Text(
                                      'Sign In',
                                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                        color: Colors.white,
                                      ),
                                    ),
                                    const SizedBox(height: 24),
                                    
                                    // Email Field
                                    TextFormField(
                                      controller: _emailController,
                                      keyboardType: TextInputType.emailAddress,
                                      style: const TextStyle(color: Colors.white),
                                      decoration: InputDecoration(
                                        hintText: 'Email address',
                                        hintStyle: TextStyle(color: Colors.white.withOpacity(0.4)),
                                        prefixIcon: Icon(Icons.email_outlined, color: Colors.white.withOpacity(0.6)),
                                      ),
                                      validator: (value) {
                                        if (value == null || value.isEmpty) {
                                          return 'Email is required';
                                        }
                                        return null;
                                      },
                                    ),
                                    const SizedBox(height: 16),
                                    
                                    // Password Field
                                    TextFormField(
                                      controller: _passwordController,
                                      obscureText: true,
                                      style: const TextStyle(color: Colors.white),
                                      decoration: InputDecoration(
                                        hintText: 'Password',
                                        hintStyle: TextStyle(color: Colors.white.withOpacity(0.4)),
                                        prefixIcon: Icon(Icons.lock_outline, color: Colors.white.withOpacity(0.6)),
                                      ),
                                      validator: (value) {
                                        if (value == null || value.isEmpty) {
                                          return 'Password is required';
                                        }
                                        return null;
                                      },
                                    ),
                                    const SizedBox(height: 24),
                                                                        
                                    // Sign In Button
                                    BlocBuilder<AuthBloc, AuthState>(
                                      builder: (context, state) {
                                        return Container(
                                          height: 56,
                                          decoration: BoxDecoration(
                                            gradient: AppTheme.primaryGradient,
                                            borderRadius: BorderRadius.circular(AppRadius.lg),
                                            boxShadow: [
                                              BoxShadow(
                                                color: AppColors.primary.withOpacity(0.4),
                                                blurRadius: 16,
                                                offset: const Offset(0, 4),
                                              ),
                                            ],
                                          ),
                                          child: ElevatedButton(
                                            onPressed: state is AuthLoading ? null : _onSignInPressed,
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: Colors.transparent,
                                              shadowColor: Colors.transparent,
                                              shape: RoundedRectangleBorder(
                                                borderRadius: BorderRadius.circular(AppRadius.lg),
                                              ),
                                            ),
                                            child: state is AuthLoading
                                              ? const SizedBox(
                                                  width: 24,
                                                  height: 24,
                                                  child: CircularProgressIndicator(
                                                    strokeWidth: 2,
                                                    color: Colors.white,
                                                  ),
                                                )
                                              : const Text(
                                                  'Sign In',
                                                  style: TextStyle(
                                                    fontSize: 16,
                                                    fontWeight: FontWeight.w700,
                                                    color: Colors.white,
                                                  ),
                                                ),
                                          ),
                                        );
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ),
                        
                        const SizedBox(height: 24),
                        Text(
                          '© 2024 iConnect CRM',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.3),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
