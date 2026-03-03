# T007 PRD: Trellis Context Realignment for #2/#3

## Goal

Align Trellis handoff context with active frontline work (#2/#3) so claude-2 receives accurate implementation context instead of stale bootstrap setup context.

## Scope

- #2: Mobile API base URL reachability via environment config.
- #3: Upload contract alignment and evidence flow.

## Required Context Files

- `mobile/src/services/api.ts`
- `mobile/src/constants/index.ts`
- `mobile/app.config.js`
- `backend/app/api/images.py`

## Acceptance Criteria

1. `.trellis/.current-task` points to this task directory.
2. `implement.jsonl`, `check.jsonl`, and `debug.jsonl` exist and are non-empty.
3. The four required context files are referenced in Trellis context artifacts.
4. `./.trellis/scripts/task.sh validate <task-dir>` passes.
