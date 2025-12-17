import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:iconnect_mobile/features/ticker/domain/entities/ticker.dart';
import 'package:iconnect_mobile/features/ticker/domain/repositories/ticker_repository.dart';
import 'package:iconnect_mobile/features/ticker/presentation/bloc/ticker_bloc.dart';
import 'package:mocktail/mocktail.dart';

class MockTickerRepository extends Mock implements TickerRepository {}

void main() {
  late MockTickerRepository mockRepository;

  setUp(() {
    mockRepository = MockTickerRepository();
  });

  group('TickerBloc', () {
    final tTicker = MeetingTicker(
      title: 'Test Meeting',
      startTime: DateTime(2025, 12, 12, 16, 30),
      meetUrl: 'https://meet.google.com/abc',
      status: 'scheduled',
    );

    test('initial state is TickerInitial', () {
      expect(
        TickerBloc(repository: mockRepository).state,
        equals(TickerInitial()),
      );
    });

    blocTest<TickerBloc, TickerState>(
      'emits [TickerActive] when repository stream emits a ticker',
      build: () {
        when(
          () => mockRepository.getActiveTicker(),
        ).thenAnswer((_) => Stream.value(tTicker));
        return TickerBloc(repository: mockRepository);
      },
      act: (bloc) => bloc.add(StartTickerListening()),
      expect: () => [TickerActive(tTicker)],
    );

    blocTest<TickerBloc, TickerState>(
      'emits [TickerEmpty] when repository stream emits null',
      build: () {
        when(
          () => mockRepository.getActiveTicker(),
        ).thenAnswer((_) => Stream.value(null));
        return TickerBloc(repository: mockRepository);
      },
      act: (bloc) => bloc.add(StartTickerListening()),
      expect: () => [TickerEmpty()],
    );
  });
}
