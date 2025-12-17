import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../core/widgets/glass_card.dart';
import '../../domain/entities/scheduled_meeting.dart';
import '../bloc/meetings_bloc.dart';
import '../bloc/meetings_event.dart';
import '../bloc/meetings_state.dart';

class MeetingTab extends StatelessWidget {
  const MeetingTab({super.key});

  Future<void> _refresh(BuildContext context) async {
    context.read<MeetingsBloc>().add(RefreshMeeting());
  }

  Future<void> _dialConferenceCall(
    String dialInNumber,
    String accessCode,
  ) async {
    if (dialInNumber.isEmpty) return;
    final sanitized = dialInNumber.replaceAll(' ', '');
    final uri = Uri.parse('tel:$sanitized,${accessCode}#');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      color: AppColors.primary,
      backgroundColor: Colors.white,
      onRefresh: () => _refresh(context),
      child: BlocBuilder<MeetingsBloc, MeetingsState>(
        builder: (context, state) {
          if (state is MeetingsLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state is MeetingsError) {
            return ListView(
              padding: const EdgeInsets.all(24),
              children: [
                GlassCard(
                  overlayGradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      AppColors.error.withOpacity(0.18),
                      Colors.transparent,
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Meeting',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        state.message,
                        style: TextStyle(color: Colors.white.withOpacity(0.8)),
                      ),
                      const SizedBox(height: 16),
                      FilledButton(
                        onPressed: () => _refresh(context),
                        style: FilledButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppRadius.lg),
                          ),
                        ),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              ],
            );
          }

          final meeting = state is MeetingsLoaded ? state.activeMeeting : null;

          if (meeting == null) {
            return ListView(
              padding: const EdgeInsets.all(24),
              children: [
                const SizedBox(height: 16),
                GlassCard(
                  surfaceGradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.white.withOpacity(0.12),
                      Colors.white.withOpacity(0.06),
                    ],
                  ),
                  overlayGradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColors.secondary.withOpacity(0.12),
                      AppColors.primary.withOpacity(0.08),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Conference Call',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'No conference call scheduled',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            );
          }

          final dateStr = DateFormat(
            'dd MMM yyyy',
          ).format(meeting.scheduledTime);
          final timeStr = DateFormat('jm').format(meeting.scheduledTime);
          final groupLabel = switch (meeting.targetGroup) {
            TargetGroup.assembly => 'Assembly',
            TargetGroup.block => 'Block',
            TargetGroup.gp => 'GP',
          };

          return ListView(
            padding: const EdgeInsets.all(24),
            children: [
              GlassCard(
                overlayGradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColors.secondary.withOpacity(0.18),
                    AppColors.primary.withOpacity(0.10),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      meeting.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: [
                        _InfoChip(icon: Icons.calendar_today, text: dateStr),
                        _InfoChip(icon: Icons.schedule, text: timeStr),
                        _InfoChip(
                          icon: Icons.groups_2,
                          text: '$groupLabel • ${meeting.targetId}',
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    if (meeting.description != null &&
                        meeting.description!.trim().isNotEmpty) ...[
                      Text(
                        meeting.description!,
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.75),
                          height: 1.35,
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],
                    Row(
                      children: [
                        Expanded(
                          child: FilledButton.icon(
                            onPressed: () => _dialConferenceCall(
                              meeting.dialInNumber,
                              meeting.accessCode,
                            ),
                            style: FilledButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(
                                  AppRadius.lg,
                                ),
                              ),
                              padding: const EdgeInsets.symmetric(vertical: 14),
                            ),
                            icon: const Icon(
                              Icons.phone_in_talk,
                              color: Colors.white,
                            ),
                            label: const Text('Join Call'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      'Dial: ${meeting.dialInNumber}   Code: ${meeting.accessCode}#',
                      style: TextStyle(
                        color: Colors.white.withOpacity(0.7),
                        fontFamily: 'monospace',
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String text;

  const _InfoChip({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white.withOpacity(0.14),
            Colors.white.withOpacity(0.06),
          ],
        ),
        borderRadius: BorderRadius.circular(AppRadius.full),
        border: Border.all(color: Colors.white.withOpacity(0.22)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.white.withOpacity(0.85)),
          const SizedBox(width: 8),
          Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
