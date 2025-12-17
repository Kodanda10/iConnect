import 'package:equatable/equatable.dart';

abstract class GreetingEvent extends Equatable {
  const GreetingEvent();
  @override
  List<Object?> get props => [];
}

class GenerateGreetingRequested extends GreetingEvent {
  final String constituentName;
  final String type;
  final String language;

  const GenerateGreetingRequested({
    required this.constituentName,
    required this.type,
    required this.language,
  });

  @override
  List<Object?> get props => [constituentName, type, language];
}

class ResetGreeting extends GreetingEvent {}
