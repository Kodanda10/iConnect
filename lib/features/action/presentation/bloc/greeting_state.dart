import 'package:equatable/equatable.dart';

abstract class GreetingState extends Equatable {
  const GreetingState();
  @override
  List<Object?> get props => [];
}

class GreetingInitial extends GreetingState {}

class GreetingLoading extends GreetingState {}

class GreetingLoaded extends GreetingState {
  final String greeting;
  const GreetingLoaded(this.greeting);
  @override
  List<Object?> get props => [greeting];
}

class GreetingError extends GreetingState {
  final String message;
  const GreetingError(this.message);
  @override
  List<Object?> get props => [message];
}
