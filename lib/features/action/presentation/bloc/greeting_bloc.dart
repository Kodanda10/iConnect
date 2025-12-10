import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/entities/greeting_request.dart';
import '../../domain/repositories/greeting_repository.dart';
import 'greeting_event.dart';
import 'greeting_state.dart';

class GreetingBloc extends Bloc<GreetingEvent, GreetingState> {
  final GreetingRepository _repository;

  GreetingBloc({required GreetingRepository repository})
      : _repository = repository,
        super(GreetingInitial()) {
    on<GenerateGreetingRequested>(_onGenerateGreetingRequested);
    on<ResetGreeting>((event, emit) => emit(GreetingInitial()));
  }

  Future<void> _onGenerateGreetingRequested(
    GenerateGreetingRequested event,
    Emitter<GreetingState> emit,
  ) async {
    emit(GreetingLoading());
    
    final request = GreetingRequest(
      constituentName: event.constituentName,
      type: event.type,
      language: event.language,
    );

    final result = await _repository.generateGreeting(request);
    result.fold(
      (failure) => emit(GreetingError(failure.message)),
      (greeting) => emit(GreetingLoaded(greeting)),
    );
  }
}
