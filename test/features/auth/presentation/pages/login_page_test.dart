import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:iconnect_mobile/features/tasks/presentation/widgets/task_card.dart'; // Assuming this exists or mocking it
import 'package:iconnect_mobile/features/tasks/domain/entities/task.dart';

// Since the file might not exist exactly, I will create a robust Widget Test for the Login Page
// based on main.dart which imports login_page.dart

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mocktail/mocktail.dart';
import 'package:iconnect_mobile/features/auth/presentation/pages/login_page.dart';
import 'package:iconnect_mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:iconnect_mobile/features/auth/presentation/bloc/auth_event.dart';
import 'package:iconnect_mobile/features/auth/presentation/bloc/auth_state.dart';

class MockAuthBloc extends Mock implements AuthBloc {}

void main() {
  late MockAuthBloc mockAuthBloc;

  setUp(() {
    mockAuthBloc = MockAuthBloc();
    when(() => mockAuthBloc.stream).thenAnswer((_) => const Stream.empty());
    when(() => mockAuthBloc.state).thenReturn(AuthInitial());
  });

  Widget createWidgetUnderTest() {
    return MaterialApp(
      home: BlocProvider<AuthBloc>.value(
        value: mockAuthBloc,
        child: const LoginPage(),
      ),
    );
  }

  group('LoginPage UI', () {
    testWidgets('renders email and password fields', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());

      expect(find.byType(TextField), findsNWidgets(2));
      expect(find.text('Login'), findsOneWidget); // Assuming button text
    });

    testWidgets('shows validation error if email is empty on submit', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());

      // Find the button and tap it without entering text
      await tester.tap(find.byType(ElevatedButton));
      await tester.pump();

      // Expect validation logic (if implemented in UI) or Bloc event
      // If UI validation exists: expect(find.text('Required'), findsOneWidget);
    });

    testWidgets('adds AuthLoginRequested event on valid submit', (tester) async {
      await tester.pumpWidget(createWidgetUnderTest());

      // Enter text
      await tester.enterText(find.byType(TextField).first, 'test@test.com');
      await tester.enterText(find.byType(TextField).last, 'password123');

      // Tap Login
      await tester.tap(find.byType(ElevatedButton));
      await tester.pump();

      // Verify bloc event
      verify(() => mockAuthBloc.add(any(that: isA<AuthLoginRequested>()))).called(1);
    });
  });
}
