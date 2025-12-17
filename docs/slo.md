# Service Level Objectives (SLOs)

> **Reference**: [system_architecture.md](file:///Users/abhijita/.gemini/antigravity/brain/c86d11ed-c9d1-415e-9973-a931d1c34c65/system_architecture.md)

---

## Executive Summary

This document defines Service Level Objectives (SLOs) for iConnect CRM to ensure reliability and user experience targets are met.

---

## SLO Definitions

### 1. Availability SLOs

| Service | Target | Measurement |
|---------|--------|-------------|
| **Web Portal** | 99.5% uptime | Vercel monitoring |
| **Mobile API** | 99.5% uptime | Firebase Functions health |
| **Firestore** | 99.99% (GCP SLA) | GCP Console |

### 2. Latency SLOs

| Endpoint | P50 | P95 | P99 |
|----------|-----|-----|-----|
| `/api/constituents` | <200ms | <500ms | <1s |
| `/api/tasks` | <150ms | <400ms | <800ms |
| `/api/settings` | <100ms | <300ms | <600ms |
| `dailyScan` (Cloud Function) | <5s | <10s | <30s |
| `createMeetingTicker` | <500ms | <1s | <2s |

### 3. Error Rate SLOs

| Service | Target | Alert Threshold |
|---------|--------|-----------------|
| Web Portal | <1% 5xx errors | >2% for 5m |
| Cloud Functions | <0.5% errors | >1% for 5m |
| Firestore Writes | <0.1% failures | >0.5% for 5m |

---

## Error Budgets

| Service | Monthly Budget | Calculation |
|---------|----------------|-------------|
| Web Portal | 3.6 hours downtime | 30d × 24h × 0.5% |
| Mobile API | 3.6 hours downtime | 30d × 24h × 0.5% |
| Cloud Functions | 2.16 hours errors | 30d × 24h × 0.3% |

---

## Monitoring & Alerting

### Firebase Console Alerts

```yaml
# functions/firebase.json (monitoring section)
{
  "monitoring": {
    "alerts": [
      {
        "name": "High Function Error Rate",
        "condition": "functions/execution_error_count > 10",
        "window": "5m",
        "channels": ["email", "slack"]
      },
      {
        "name": "High Latency - dailyScan",
        "condition": "functions/dailyScan/duration > 10000",
        "window": "5m",
        "channels": ["slack"]
      }
    ]
  }
}
```

### GCP Cloud Monitoring

1. **Dashboard**: Create Firestore + Functions dashboard
2. **Alerts**: Configure in Cloud Console → Monitoring → Alerting
3. **Log-Based Metrics**: Track authentication failures, permission denials

---

## Key Performance Indicators (KPIs)

| KPI | Current | Target | Priority |
|-----|---------|--------|----------|
| Login Success Rate | TBD | >99% | P0 |
| Task Completion Rate | TBD | >95% | P1 |
| Daily Active Users | TBD | N/A | Tracking |
| Constituent Data Accuracy | TBD | >99% | P1 |

---

## Load Testing Targets

| Flow | Concurrent Users | Max Response |
|------|------------------|--------------|
| Login + Task List | 50 | <2s |
| Constituent Search | 50 | <1s |
| dailyScan | 1 (cron) | <30s |
| Meeting Creation | 10 | <2s |

---

## Implementation Checklist

- [ ] Configure GCP Cloud Monitoring dashboard
- [ ] Set up Firebase Functions alerts
- [ ] Implement k6 load tests
- [ ] Create Vercel deployment alerts
- [ ] Document incident response runbook
