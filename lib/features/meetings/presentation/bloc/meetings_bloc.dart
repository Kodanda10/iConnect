/**
 * @file lib/features/meetings/presentation/bloc/meetings_bloc.dart
 * @description BLoC for managing meetings state (conference calls only)
 * @changelog
 * - 2025-12-17: Initial implementation (TDD GREEN phase)
 */

import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/repositories/meetings_repository.dart';
import 'meetings_event.dart';
import 'meetings_state.dart';

class MeetingsBloc extends Bloc<MeetingsEvent, MeetingsState> {
  final MeetingsRepository _repository;

  MeetingsBloc({required MeetingsRepository repository})
    : _repository = repository,
      super(MeetingsInitial()) {
    on<LoadActiveMeeting>(_onLoadActiveMeeting);
    on<RefreshMeeting>(_onRefreshMeeting);
  }

  Future<void> _onLoadActiveMeeting(
    LoadActiveMeeting event,
    Emitter<MeetingsState> emit,
  ) async {
    emit(MeetingsLoading());

    final result = await _repository.getActiveMeeting();

    result.fold(
      (failure) => emit(MeetingsError(failure.message)),
      (meeting) => emit(MeetingsLoaded(activeMeeting: meeting)),
    );
  }

  Future<void> _onRefreshMeeting(
    RefreshMeeting event,
    Emitter<MeetingsState> emit,
  ) async {
    add(LoadActiveMeeting());
  }
}
