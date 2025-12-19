/// Login Page for iConnect Mobile
/// 
/// Glassmorphism design with email/password authentication.
/// 
/// @changelog
/// - 2024-12-18: Theme Mirroring Update (Deep Veridian + Smoked Glass)
library;

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/app_background.dart';
import '../../../../core/widgets/glass_container.dart';
import '../../../../core/widgets/glass_text_field.dart';
import '../../../../core/widgets/primary_button.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  
  @override
  void dispose() {
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
    return AppBackground(
      child: BlocListener<AuthBloc, AuthState>(
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
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo
                // Logo
                // Logo
                ClipRRect(
                  borderRadius: BorderRadius.circular(AppRadius.xl),
                  child: Image.asset(
                    'assets/images/app_icon_final.png',
                    width: 80,
                    height: 80,
                    fit: BoxFit.cover,
                  ),
                ).animate().fade(duration: 600.ms).scale(delay: 200.ms),
                
                const SizedBox(height: 24),
                
                // Title
                Text(
                  'iConnect',
                  style: Theme.of(context).textTheme.displayMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    letterSpacing: -0.5,
                  ),
                ).animate().fade(delay: 300.ms).slideY(begin: 0.2),
                
                const SizedBox(height: 48),
                
                // Glass Card Form
                GlassContainer(
                  borderRadius: AppRadius.xl,
                  padding: const EdgeInsets.all(24),
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
                        GlassTextField(
                          controller: _emailController,
                          hintText: 'Email address',
                          prefixIcon: const Icon(Icons.email_outlined),
                          keyboardType: TextInputType.emailAddress,
                        ),
                        const SizedBox(height: 16),
                        
                        // Password Field
                        GlassTextField(
                          controller: _passwordController,
                          hintText: 'Password',
                          prefixIcon: const Icon(Icons.lock_outline),
                          obscureText: true,
                        ),
                        const SizedBox(height: 24),
                        
                        // Sign In Button
                        BlocBuilder<AuthBloc, AuthState>(
                          builder: (context, state) {
                            return PrimaryButton(
                              label: 'Sign In',
                              isLoading: state is AuthLoading,
                              onPressed: _onSignInPressed,
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ).animate().fade().slideY(begin: 0.2, end: 0, delay: 300.ms),
                
                const SizedBox(height: 24),
                Text(
                  '© 2024 iConnect CRM',
                  style: TextStyle(
                    color: Colors.white.withOpacity(0.3),
                    fontSize: 12,
                  ),
                ).animate().fade(delay: 500.ms),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
