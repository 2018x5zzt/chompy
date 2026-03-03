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

Total in-scope files: **35**
Documented files: **35**
Coverage: **100%**

## 2. Documentation Sources Used

The following docs jointly provide coverage (single summary is no longer enough):
1. `README.md`
2. `docs/DEVELOPMENT_SUMMARY.md`
3. `docs/FEATURE_STATUS_MATRIX.md`
4. `docs/API_CONTRACT.md`
5. `docs/HARDWARE_INTEGRATION_AND_SELECTION.md`
6. `docs/SERVER_MIGRATION_RUNBOOK.md`

## 3. File-by-File Coverage

| # | File | Coverage location in docs |
|---|---|---|
| 1 | `README.md` | Project entry document (all sections) |
| 2 | `AGENTS.md` | `DEVELOPMENT_SUMMARY` section 3; `README` section 14 |
| 3 | `PROJECT.md` | `DEVELOPMENT_SUMMARY` section 1, 2; `README` section 14 |
| 4 | `docker-compose.yml` | `DEVELOPMENT_SUMMARY` section 2; `SERVER_MIGRATION_RUNBOOK` section 6; `README` section 6 |
| 5 | `backend/.env.example` | `SERVER_MIGRATION_RUNBOOK` section 4; `README` section 6 |
| 6 | `backend/Dockerfile` | `DEVELOPMENT_SUMMARY` section 2; `README` section 6 |
| 7 | `backend/README.md` | `DEVELOPMENT_SUMMARY` section 3 |
| 8 | `backend/pyproject.toml` | `DEVELOPMENT_SUMMARY` section 5; `README` section 10 |
| 9 | `backend/app/__init__.py` | `DEVELOPMENT_SUMMARY` section 4.2 |
| 10 | `backend/app/api/__init__.py` | `DEVELOPMENT_SUMMARY` section 4.2 |
| 11 | `backend/app/api/health.py` | `API_CONTRACT` `GET /api/health`; `README` section 8 |
| 12 | `backend/app/api/diagnostics.py` | `API_CONTRACT` `POST /api/diagnostics`; `DEVELOPMENT_SUMMARY` section 4.2 |
| 13 | `backend/app/api/images.py` | `API_CONTRACT` `POST /api/images/upload`; `DEVELOPMENT_SUMMARY` section 4.2 |
| 14 | `backend/app/config.py` | `DEVELOPMENT_SUMMARY` section 2, 4.2 |
| 15 | `backend/app/main.py` | `DEVELOPMENT_SUMMARY` section 4.2 |
| 16 | `backend/app/models/__init__.py` | `FEATURE_STATUS_MATRIX` (history/data model gap) |
| 17 | `backend/app/services/__init__.py` | `FEATURE_STATUS_MATRIX` (service/LLM gap) |
| 18 | `backend/app/workflows/__init__.py` | `FEATURE_STATUS_MATRIX` (LLM workflow not implemented) |
| 19 | `backend/tests/__init__.py` | `DEVELOPMENT_SUMMARY` section 5 |
| 20 | `backend/tests/test_app.py` | `DEVELOPMENT_SUMMARY` section 5; `README` section 10 |
| 21 | `mobile/App.tsx` | `DEVELOPMENT_SUMMARY` section 1 |
| 22 | `mobile/app.config.js` | `API_CONTRACT` base URL resolution; `DEVELOPMENT_SUMMARY` section 4.1; `README` section 7 |
| 23 | `mobile/app.json` | `DEVELOPMENT_SUMMARY` section 1 |
| 24 | `mobile/index.ts` | `DEVELOPMENT_SUMMARY` section 1 |
| 25 | `mobile/package.json` | `DEVELOPMENT_SUMMARY` section 1, 5; `README` section 6 |
| 26 | `mobile/tsconfig.json` | `DEVELOPMENT_SUMMARY` section 5 |
| 27 | `mobile/src/components/common/Button.tsx` | `DEVELOPMENT_SUMMARY` section 4.1 |
| 28 | `mobile/src/constants/index.ts` | `API_CONTRACT` base URL resolution; `DEVELOPMENT_SUMMARY` section 4.1 |
| 29 | `mobile/src/hooks/useApi.ts` | `DEVELOPMENT_SUMMARY` section 4.1 |
| 30 | `mobile/src/navigation/AppNavigator.tsx` | `DEVELOPMENT_SUMMARY` section 1 |
| 31 | `mobile/src/screens/HistoryScreen.tsx` | `FEATURE_STATUS_MATRIX` (History not implemented) |
| 32 | `mobile/src/screens/HomeScreen.tsx` | `FEATURE_STATUS_MATRIX`; `DEVELOPMENT_SUMMARY` section 4.1; `README` section 3 |
| 33 | `mobile/src/services/api.ts` | `API_CONTRACT`; `DEVELOPMENT_SUMMARY` section 4.1 |
| 34 | `mobile/src/services/ble.ts` | `FEATURE_STATUS_MATRIX`; `HARDWARE_INTEGRATION_AND_SELECTION`; `DEVELOPMENT_SUMMARY` section 4.1; `README` section 11 |
| 35 | `mobile/src/types/index.ts` | `API_CONTRACT`; `DEVELOPMENT_SUMMARY` section 4.1 |

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
  printf '%s\n' README.md AGENTS.md PROJECT.md docker-compose.yml backend/.env.example backend/Dockerfile backend/README.md backend/pyproject.toml mobile/App.tsx mobile/app.config.js mobile/app.json mobile/index.ts mobile/package.json mobile/tsconfig.json; \
  find backend/app backend/tests mobile/src -type f ! -path 'backend/app/data/uploads/*' | sort; \
} | sort -u | wc -l
```
