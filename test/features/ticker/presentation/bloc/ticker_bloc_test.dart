import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:iconnect_mobile/features/ticker/domain/entities/ticker.dart';
import 'package:iconnect_mobile/features/ticker/domain/repositories/ticker_repository.dart';
import 'package:iconnect_mobile/features/ticker/presentation/bloc/ticker_bloc.dart';
import 'package:mocktail/mocktail.dart';

class MockTickerRepository extends Mock implements TickerRepository {}

void main() {
  late TickerBloc bloc;
  late MockTickerRepository mockRepository;

  setUp(() {
    mockRepository = MockTickerRepository();
    bloc = TickerBloc(repository: mockRepository);
  });

  group('TickerBloc', () {
    test('initial state is TickerInitial', () {
      expect(bloc.state, TickerInitial());
    });

    blocTest<TickerBloc, TickerState>(
      'emits [TickerActive] when repository emits valid ticker',
      build: () {
        when(() => mockRepository.getActiveTicker()).thenAnswer(
          (_) => Stream.value(
            MeetingTicker(
              title: 'Meeting',
              startTime: DateTime(
                2025,
              ), // Constant for validation but specific constructor is easier
              meetUrl: 'url',
              status: 'scheduled',
            ),
          ),
        );
        return bloc;
      },
      act: (bloc) => bloc.add(StartTickerListening()),
      expect: () => [
        isA<TickerActive>().having((s) => s.ticker.title, 'title', 'Meeting'),
      ],
    );

    blocTest<TickerBloc, TickerState>(
      'emits [TickerEmpty] when repository emits null',
      build: () {
        when(
          () => mockRepository.getActiveTicker(),
        ).thenAnswer((_) => Stream.value(null));
        return bloc;
      },
      act: (bloc) => bloc.add(StartTickerListening()),
      expect: () => [TickerEmpty()],
    );
  });
}
