import 'package:equatable/equatable.dart';

class AuthUser extends Equatable {
  final String id;
  final String email;
  final String? name;
  final String role; // 'STAFF' or 'LEADER'

  const AuthUser({
    required this.id,
    required this.email,
    this.name,
    this.role = 'STAFF',
  });

  @override
  List<Object?> get props => [id, email, name, role];
}
