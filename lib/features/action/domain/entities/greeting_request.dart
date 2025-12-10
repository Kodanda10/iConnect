import 'package:equatable/equatable.dart';

class GreetingRequest extends Equatable {
  final String constituentName;
  final String type; // BIRTHDAY, ANNIVERSARY
  final String language; // English, Hindi, Odia
  final String? tone;

  const GreetingRequest({
    required this.constituentName,
    required this.type,
    required this.language,
    this.tone,
  });

  Map<String, dynamic> toJson() {
    return {
      'constituentName': constituentName,
      'type': type,
      'language': language,
      'tone': tone,
    };
  }

  @override
  List<Object?> get props => [constituentName, type, language, tone];
}
