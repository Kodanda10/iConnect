import 'package:equatable/equatable.dart';

class AppSettings extends Equatable {
  final String appName;
  final String leaderName;
  final String? headerImageUrl;

  const AppSettings({
    required this.appName,
    required this.leaderName,
    this.headerImageUrl,
  });

  // Default factory
  factory AppSettings.defaults() {
    return const AppSettings(
      appName: 'AC Connect',
      leaderName: 'Pranab Kumar Balabantaray',
    );
  }

  @override
  List<Object?> get props => [appName, leaderName, headerImageUrl];
}
