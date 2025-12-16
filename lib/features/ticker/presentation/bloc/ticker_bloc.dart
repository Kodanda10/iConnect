import 'package:bloc/bloc.dart';
import 'package:equatable/equatable.dart';
import '../../domain/entities/ticker.dart';
import '../../domain/repositories/ticker_repository.dart';
import 'dart:async';

// Events
abstract class TickerEvent extends Equatable {
  const TickerEvent();
  @override
  List<Object?> get props => [];
}

class StartTickerListening extends TickerEvent {}
class _TickerUpdated extends TickerEvent {
  final MeetingTicker? ticker;
  const _TickerUpdated(this.ticker);
  @override
  List<Object?> get props => [ticker];
}

// States
abstract class TickerState extends Equatable {
  const TickerState();
  @override
  List<Object?> get props => [];
}

class TickerInitial extends TickerState {}
class TickerEmpty extends TickerState {}
class TickerActive extends TickerState {
  final MeetingTicker ticker;
  const TickerActive(this.ticker);
  @override
  List<Object?> get props => [ticker];
}

// Bloc
class TickerBloc extends Bloc<TickerEvent, TickerState> {
  final TickerRepository _repository;
  StreamSubscription? _subscription;

  TickerBloc({required TickerRepository repository})
      : _repository = repository,
        super(TickerInitial()) {
    on<StartTickerListening>(_onStartListening);
    on<_TickerUpdated>(_onTickerUpdated);
  }

  void _onStartListening(StartTickerListening event, Emitter<TickerState> emit) {
    _subscription?.cancel();
    _subscription = _repository.getActiveTicker().listen(
      (ticker) => add(_TickerUpdated(ticker)),
      onError: (_) => add(const _TickerUpdated(null)), // Handle error by hiding ticker
    );
  }

  void _onTickerUpdated(_TickerUpdated event, Emitter<TickerState> emit) {
    if (event.ticker != null) {
      emit(TickerActive(event.ticker!));
    } else {
      emit(TickerEmpty());
    }
  }

  @override
  Future<void> close() {
    _subscription?.cancel();
    return super.close();
  }
}
