# Documentation Coverage Matrix (100% In-Scope)

Last updated: 2026-03-03 (CST)

## 1. Coverage Definition

In-scope files are project-owned runtime source and key configuration files for:
- backend runtime
- mobile runtime
- deployment/runtime configuration
- agent onboarding context

Excluded from in-scope counting:
- vendor/cache/generated outputs
- runtime upload artifacts

Total in-scope files: **34**
Documented files: **34**
Coverage: **100%**

## 2. Documentation Sources Used

The following docs jointly provide coverage (single summary is no longer enough):
1. `docs/DEVELOPMENT_SUMMARY.md`
2. `docs/FEATURE_STATUS_MATRIX.md`
3. `docs/API_CONTRACT.md`
4. `docs/HARDWARE_INTEGRATION_AND_SELECTION.md`
5. `docs/SERVER_MIGRATION_RUNBOOK.md`

## 3. File-by-File Coverage

| # | File | Coverage location in docs |
|---|---|---|
| 1 | `AGENTS.md` | `DEVELOPMENT_SUMMARY` section 3 |
| 2 | `PROJECT.md` | `DEVELOPMENT_SUMMARY` section 1, 2 |
| 3 | `docker-compose.yml` | `DEVELOPMENT_SUMMARY` section 2; `SERVER_MIGRATION_RUNBOOK` section 6 |
| 4 | `backend/.env.example` | `SERVER_MIGRATION_RUNBOOK` section 4 |
| 5 | `backend/Dockerfile` | `DEVELOPMENT_SUMMARY` section 2 |
| 6 | `backend/README.md` | `DEVELOPMENT_SUMMARY` section 3 |
| 7 | `backend/pyproject.toml` | `DEVELOPMENT_SUMMARY` section 5 |
| 8 | `backend/app/__init__.py` | `DEVELOPMENT_SUMMARY` section 4.2 |
| 9 | `backend/app/api/__init__.py` | `DEVELOPMENT_SUMMARY` section 4.2 |
| 10 | `backend/app/api/health.py` | `API_CONTRACT` `GET /api/health` |
| 11 | `backend/app/api/diagnostics.py` | `API_CONTRACT` `POST /api/diagnostics`; `DEVELOPMENT_SUMMARY` section 4.2 |
| 12 | `backend/app/api/images.py` | `API_CONTRACT` `POST /api/images/upload`; `DEVELOPMENT_SUMMARY` section 4.2 |
| 13 | `backend/app/config.py` | `DEVELOPMENT_SUMMARY` section 2, 4.2 |
| 14 | `backend/app/main.py` | `DEVELOPMENT_SUMMARY` section 4.2 |
| 15 | `backend/app/models/__init__.py` | `FEATURE_STATUS_MATRIX` (history/data model gap) |
| 16 | `backend/app/services/__init__.py` | `FEATURE_STATUS_MATRIX` (service/LLM gap) |
| 17 | `backend/app/workflows/__init__.py` | `FEATURE_STATUS_MATRIX` (LLM workflow not implemented) |
| 18 | `backend/tests/__init__.py` | `DEVELOPMENT_SUMMARY` section 5 |
| 19 | `backend/tests/test_app.py` | `DEVELOPMENT_SUMMARY` section 5 |
| 20 | `mobile/App.tsx` | `DEVELOPMENT_SUMMARY` section 1 |
| 21 | `mobile/app.config.js` | `API_CONTRACT` base URL resolution; `DEVELOPMENT_SUMMARY` section 4.1 |
| 22 | `mobile/app.json` | `DEVELOPMENT_SUMMARY` section 1 |
| 23 | `mobile/index.ts` | `DEVELOPMENT_SUMMARY` section 1 |
| 24 | `mobile/package.json` | `DEVELOPMENT_SUMMARY` section 1, 5 |
| 25 | `mobile/tsconfig.json` | `DEVELOPMENT_SUMMARY` section 5 |
| 26 | `mobile/src/components/common/Button.tsx` | `DEVELOPMENT_SUMMARY` section 4.1 |
| 27 | `mobile/src/constants/index.ts` | `API_CONTRACT` base URL resolution; `DEVELOPMENT_SUMMARY` section 4.1 |
| 28 | `mobile/src/hooks/useApi.ts` | `DEVELOPMENT_SUMMARY` section 4.1 |
| 29 | `mobile/src/navigation/AppNavigator.tsx` | `DEVELOPMENT_SUMMARY` section 1 |
| 30 | `mobile/src/screens/HistoryScreen.tsx` | `FEATURE_STATUS_MATRIX` (History not implemented) |
| 31 | `mobile/src/screens/HomeScreen.tsx` | `FEATURE_STATUS_MATRIX`; `DEVELOPMENT_SUMMARY` section 4.1 |
| 32 | `mobile/src/services/api.ts` | `API_CONTRACT`; `DEVELOPMENT_SUMMARY` section 4.1 |
| 33 | `mobile/src/services/ble.ts` | `FEATURE_STATUS_MATRIX`; `HARDWARE_INTEGRATION_AND_SELECTION`; `DEVELOPMENT_SUMMARY` section 4.1 |
| 34 | `mobile/src/types/index.ts` | `API_CONTRACT`; `DEVELOPMENT_SUMMARY` section 4.1 |

## 4. Out-of-Scope Paths

Excluded from coverage computation:
- `mobile/node_modules/**`
- `backend/.venv/**`
- `backend/.mypy_cache/**`
- `backend/.ruff_cache/**`
- `backend/.pytest_cache/**`
- `backend/app/data/uploads/**`

## 5. Recompute Method

Use this command to recompute in-scope file count:

```bash
{ \
  printf '%s\n' AGENTS.md PROJECT.md docker-compose.yml backend/.env.example backend/Dockerfile backend/README.md backend/pyproject.toml mobile/App.tsx mobile/app.config.js mobile/app.json mobile/index.ts mobile/package.json mobile/tsconfig.json; \
  find backend/app backend/tests mobile/src -type f ! -path 'backend/app/data/uploads/*' | sort; \
} | sort -u | wc -l
```
