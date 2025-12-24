/// Synthetic Data Seed Script for Dharmasala Block
/// 
/// Generates test tasks for Dec 24-30, 2024 with varied Indian names A-Z
/// to verify alphabetical sorting and calendar time travel functionality.
/// 
/// Usage: Run this in Flutter app debug mode or adapt for Firestore CLI.
/// 
/// @changelog
/// - 2024-12-24: Initial script for Calendar Time Travel testing

import 'dart:math';

// Configuration
const String block = 'Dharmasala';
const List<String> gramPanchayats = ['Jaraka', 'Jenapur', 'Kotapur', 'Aruha', 'Chahata', 'Deoka'];
const int tasksPerDay = 15;

// Varied Indian names A-Z for sort verification
const List<String> names = [
  'Abhijeet Mohapatra',
  'Anil Pradhan', 
  'Biswajit Sahoo',
  'Chinmay Rath',
  'Debashish Nayak',
  'Deepak Behera',
  'Gyanendra Mishra',
  'Harish Panda',
  'Jagdish Dash',
  'Kamal Sahu',
  'Laxman Patra',
  'Manoj Swain',
  'Narayan Das',
  'Omkar Mohanty',
  'Prakash Jena',
  'Rajesh Kumar',
  'Sanjay Tripathy',
  'Tapan Rout',
  'Umesh Parida',
  'Vinod Nanda',
  'Yashwant Singh',
  'Zara Begum',
  'Anita Pattnaik',
  'Basanti Devi',
  'Chandramani Prusty',
  'Durga Prasad',
  'Fakir Mohan',
  'Gopal Chandra',
  'Hemant Sharma',
  'Iswar Chandra',
];

final List<String> eventTypes = ['BIRTHDAY', 'ANNIVERSARY'];

/// Generate seed data structure for Firestore
List<Map<String, dynamic>> generateSeedData() {
  final tasks = <Map<String, dynamic>>[];
  final random = Random(42); // Fixed seed for reproducibility
  
  // Generate for Dec 24-30, 2024
  for (int day = 24; day <= 30; day++) {
    final dueDate = DateTime(2024, 12, day);
    
    // Shuffle names for this day to test sorting
    final dayNames = List<String>.from(names)..shuffle(random);
    
    for (int i = 0; i < tasksPerDay && i < dayNames.length; i++) {
      final gp = gramPanchayats[random.nextInt(gramPanchayats.length)];
      final ward = (random.nextInt(15) + 1).toString().padLeft(2, '0');
      final mobile = '98765${random.nextInt(100000).toString().padLeft(5, '0')}';
      final type = eventTypes[random.nextInt(eventTypes.length)];
      
      tasks.add({
        'id': 'seed_${day}_$i',
        'constituent_name': dayNames[i],
        'name': dayNames[i], // Fallback field
        'mobile': mobile,
        'constituent_mobile': mobile,
        'ward': ward,
        'ward_number': ward,
        'block': block,
        'gram_panchayat': gp,
        'gp_ulb': gp,
        'type': type,
        'status': 'PENDING',
        'due_date': dueDate.toIso8601String(),
        'created_at': DateTime.now().toIso8601String(),
        'call_sent': false,
        'sms_sent': false,
        'whatsapp_sent': false,
      });
    }
  }
  
  return tasks;
}

/// Print seed data for manual inspection or Firestore import
void main() {
  final tasks = generateSeedData();
  
  print('=== Dharmasala Seed Data ===');
  print('Total tasks: ${tasks.length}');
  print('Date range: Dec 24-30, 2024');
  print('');
  
  // Group by date for verification
  final byDate = <String, List<Map<String, dynamic>>>{};
  for (final task in tasks) {
    final date = task['due_date'].toString().split('T')[0];
    byDate.putIfAbsent(date, () => []).add(task);
  }
  
  for (final entry in byDate.entries) {
    print('--- ${entry.key} (${entry.value.length} tasks) ---');
    // Print names to verify they're NOT sorted (seed is unsorted, app should sort)
    final names = entry.value.map((t) => t['constituent_name']).toList();
    print('Names (unsorted): ${names.take(5).join(', ')}...');
    print('');
  }
  
  print('');
  print('To import to Firestore:');
  print('1. Copy the generated JSON to Firebase Console > Firestore > Import');
  print('2. Or use firebase-admin SDK with the tasks array');
  print('');
  
  // Output as JSON for easy copy
  print('--- JSON Output (first 3 tasks) ---');
  for (int i = 0; i < 3 && i < tasks.length; i++) {
    print(tasks[i]);
  }
}
