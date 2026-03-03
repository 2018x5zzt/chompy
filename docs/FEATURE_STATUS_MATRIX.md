# Chompy Feature Status Matrix

Last updated: 2026-03-03 (CST)

This document tracks product capability progress (not internal task-plan progress).

## Capability Status

| Capability | Status | Current behavior | Gaps to production |
|---|---|---|---|
| Mobile app scaffold (Expo + navigation) | Implemented | Home/History screens and shared API layer compile and run | UI/UX polish, analytics, crash reporting |
| Backend scaffold (FastAPI + Docker) | Implemented | `/api/health`, `/api/images/upload`, `/api/diagnostics` available | auth, rate-limit, production hardening |
| Upload contract (`imageBase64 + contentType`) | Implemented | Frontend and backend both use JSON-only upload path | add versioned contract governance |
| API base URL environment injection | Implemented | mobile uses env-based base URL; no hardcoded localhost dependency | final production domains and secrets wiring |
| 400/413 client error branching | Implemented | client shows dedicated messages for payload invalid / payload too large | real-device runtime evidence collection |
| BLE scan/connect/disconnect app entry | In progress (development-ready) | app has runnable BLE service abstraction and screen controls | replace mock adapter with real BLE stack + permissions |
| Hardware image capture via BLE | Not implemented | no live camera payload from device yet | firmware protocol + BLE transfer + decode/retry |
| History data lifecycle | Not implemented | History screen exists but data flow is incomplete | backend history API + local cache + sync policy |
| Real LLM diagnostics workflow | Not implemented | diagnostics endpoint currently mock-style response path | model routing, prompt/guardrails, eval metrics |
| Server migration playbook | Implemented (runbook level) | migration checklist documented | execute rehearsal and capture evidence |

## Minimum Gate for "Initial Product" (P0)

The product can be considered initial-demo-ready when all gates below are met:

1. BLE real-device scan/connect/disconnect works on both iOS and Android test devices.
2. Hardware-captured image can be uploaded and diagnosed end-to-end.
3. At least one real-device 400 case and one 413 case are reproduced and logged with evidence.
4. Deployment rehearsal on target server succeeds with rollback test.

## Current Phase Summary

- Software path (upload + diagnosis API chain): available.
- Hardware path (device capture + BLE transfer): not yet integrated.
- Recommendation: prioritize BLE mainline + real-device validation before server migration cutover.
