/**
 * @file iconnect-web/performance/load-test.js
 * @description k6 Load Testing Script for iConnect CRM
 * @changelog
 * - 2025-12-17: Initial implementation for P2 Reliability
 *
 * Run with: k6 run performance/load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const taskListDuration = new Trend('task_list_duration');

// Test configuration
export const options = {
    stages: [
        { duration: '30s', target: 10 },  // Ramp up to 10 users
        { duration: '1m', target: 50 },   // Stay at 50 users
        { duration: '30s', target: 0 },   // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
        http_req_failed: ['rate<0.01'],   // Less than 1% failure rate
        errors: ['rate<0.05'],            // Custom error rate under 5%
    },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
    group('Login Flow', () => {
        const loginStart = new Date();

        // Note: This is a mock - actual Firebase Auth would require SDK
        const loginRes = http.get(`${BASE_URL}/login`);

        loginDuration.add(new Date() - loginStart);

        const loginSuccess = check(loginRes, {
            'login page loads': (r) => r.status === 200,
            'login page has form': (r) => r.body.includes('Sign in'),
        });

        errorRate.add(!loginSuccess);
    });

    sleep(1);

    group('Task List API', () => {
        const taskStart = new Date();

        // Mock API call - in production this would hit actual endpoints
        const taskRes = http.get(`${BASE_URL}/api/tasks?limit=50`, {
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${authToken}` - would need real auth
            },
        });

        taskListDuration.add(new Date() - taskStart);

        const taskSuccess = check(taskRes, {
            'tasks endpoint responds': (r) => r.status === 200 || r.status === 401,
            'response time acceptable': (r) => r.timings.duration < 500,
        });

        errorRate.add(!taskSuccess);
    });

    sleep(1);

    group('Constituent Search', () => {
        const searchRes = http.get(`${BASE_URL}/api/constituents?search=test&limit=20`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        check(searchRes, {
            'search endpoint responds': (r) => r.status === 200 || r.status === 401,
            'search < 1s': (r) => r.timings.duration < 1000,
        });
    });

    sleep(2);
}

export function handleSummary(data) {
    return {
        'performance/load-test-results.json': JSON.stringify(data, null, 2),
    };
}
