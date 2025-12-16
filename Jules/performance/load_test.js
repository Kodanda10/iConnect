import http from 'k6/http';
import { check, sleep } from 'k6';

// K6 Load Test Script for Cloud Functions
// Run with: k6 run load_test.js

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users
    { duration: '30s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
  },
};

const BASE_URL = 'https://asia-south1-your-project-id.cloudfunctions.net';

export default function () {
  const payload = JSON.stringify({
    data: {
      constituentName: 'Load Test User',
      type: 'BIRTHDAY',
      language: 'ENGLISH'
    }
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(`${BASE_URL}/generateGreeting`, payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response has greeting': (r) => r.body.includes('greeting'),
  });

  sleep(1);
}
