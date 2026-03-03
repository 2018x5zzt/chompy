# Server Migration Runbook (Backend-Minimum)

Last updated: 2026-03-03 (CST)
Source baseline: backend clone review checklist, verified for current project shape.

## 1. Pre-Migration Freeze

1. Freeze release window and announce migration time.
2. Record current image tags/digests and `docker-compose.yml` version.
3. Confirm rollback owner and communication channel.

## 2. Backup Before Cutover

1. PostgreSQL logical backup.
2. MinIO object backup.
3. Backend uploads directory backup (`/app/app/data/uploads` equivalent persistent path).

## 3. Target Host Readiness

1. Verify Docker Engine + Compose plugin versions.
2. Check disk capacity and inode usage.
3. Check timezone/NTP consistency.
4. Set ulimit and kernel params required by containers.

## 4. Production Environment Variables

1. Validate `DATABASE_URL`.
2. Validate `S3_*` keys and bucket names.
3. Validate `CORS_ORIGINS` for production domains.
4. Validate `LLM_API_KEY` and secret handling.
5. Remove default/weak credentials.

## 5. Persistence and Data Paths

1. Ensure DB and object storage volumes are persistent.
2. Ensure backend uploads path is persistent and restored from backup.

## 6. Deployment Steps

1. Pre-pull images.
2. Start stack: `docker compose up -d`.
3. Check container health and dependency reachability.

## 7. Smoke Validation

1. `GET /api/health` returns 200.
2. `/docs` reachable.
3. `POST /api/images/upload` JSON contract success path returns 200.
4. Upload negative tests:
   - invalid payload -> 400
   - payload > 5 MiB -> 413
5. `POST /api/diagnostics` with uploaded image URL returns 200.

## 8. Monitoring Minimum Set

1. Container restarts and health status.
2. API 5xx rate.
3. P95 latency.
4. Disk usage for uploads, DB, object storage.
5. Alert routing to on-call channel.

## 9. Rollback Criteria and Procedure

Rollback triggers:
1. sustained 5xx increase,
2. severe latency regression,
3. contract smoke failure.

Rollback procedure:
1. Route traffic back to previous environment.
2. Stop new deployment.
3. Restore from migration snapshot if data divergence occurred.
4. Re-run smoke checks on rolled-back environment.

## 10. Evidence Collection (Required)

Capture for each run:
1. timestamped command logs,
2. health and smoke outputs,
3. rollback test result (if executed),
4. final go/no-go decision with owner sign-off.
