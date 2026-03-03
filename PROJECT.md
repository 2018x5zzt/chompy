# Chompy - Smart Dental Health Monitor

## Overview

Chompy is a dental health monitoring system consisting of:

1. **Hardware Device** - A small intraoral camera that captures dental images
2. **Mobile App** - Connects to the device via Bluetooth, displays diagnostic results
3. **Backend Server** - Processes dental images using LLM-based vision workflow, returns health assessments

## Core Features

### Image Capture & Transfer
- BLE (Bluetooth Low Energy) connection between hardware device and mobile app
- Real-time image preview and capture
- Secure image upload to backend

### Dental Health Diagnostics (LLM-powered)
- **Cavity Detection** - Identify potential cavities, assess severity, recommend whether to visit a dentist
- **Wisdom Tooth Assessment** - Detect inflammation, gum issues, impaction status
- **Additional diagnostics** - TBD (plaque, gum disease, tooth wear, etc.)

### User Experience
- Simple scan → result workflow
- Clear, actionable health reports
- Historical tracking of dental health over time

## Architecture

```
┌──────────────┐     BLE      ┌──────────────┐    HTTPS    ┌──────────────┐
│   Hardware   │ ──────────── │  Mobile App  │ ──────────  │   Backend    │
│   Device     │   images     │  (Frontend)  │   upload    │   Server     │
│              │              │              │   ←results  │  (Docker)    │
└──────────────┘              └──────────────┘             └──────┬───────┘
                                                                  │
                                                           ┌──────┴───────┐
                                                           │  LLM Vision  │
                                                           │  Workflow    │
                                                           └──────────────┘
```

## Tech Stack (Proposed)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Mobile App | React Native + Expo | Cross-platform, strong BLE support (react-native-ble-plx) |
| Backend API | Python + FastAPI | ML/AI ecosystem, async support, Docker-friendly |
| LLM Integration | Multimodal model (GPT-4V / Claude Vision / open-source) | Dental image analysis |
| Database | PostgreSQL | Reliable, supports JSONB for flexible schemas |
| Image Storage | S3-compatible (MinIO for self-hosted) | Scalable blob storage |
| Deployment | Docker Compose → K8s ready | Easy local dev, production migration |

> **Note**: Tech stack decisions are pending. The above are recommendations to be confirmed.

## Agent Collaboration Rules

### Role Assignment

| Agent | Role | Responsibility |
|-------|------|---------------|
| **claude-1** (Foreman) | Orchestrator + Quality Gate | Task decomposition, routing, context management, code review, final decisions |
| **claude-2** (Peer) | Implementer | Code implementation (with Trellis spec injection), documentation, refactoring |
| **codex-1** (Peer) | Backend Expert | Backend analysis, API design, security audit, performance optimization |
| **gemini-1** (Peer) | Frontend Expert | Frontend analysis, UI/UX design, BLE interaction, accessibility |

### Why 4 Agents?

- **Trellis hook injection only works with Claude** — claude-2 receives full spec context during implementation
- **Foreman should orchestrate, not implement** — separation of concerns prevents context overload
- **Cross-model expertise** — Codex excels at backend/security, Gemini at frontend/UX
- **Parallel execution** — research + review can run on codex-1 and gemini-1 simultaneously

### 6-Phase Pipeline (CCG + Trellis + CCCC)

```
Phase 1: Research
  claude-1 decomposes requirements
  codex-1 + gemini-1 explore codebase in parallel

Phase 2: Planning
  claude-1 synthesizes plan → creates Trellis task + .jsonl context
  codex-1 reviews backend architecture → gemini-1 reviews frontend design

Phase 3: Implementation
  claude-2 implements with Trellis spec injection
  codex-1 / gemini-1 provide prototype references when needed

Phase 4: Review (Cross-Review)
  codex-1 reviews backend changes (security, performance, correctness)
  gemini-1 reviews frontend changes (accessibility, design, UX)

Phase 5: Fix
  claude-2 fixes issues from review feedback

Phase 6: Verify
  claude-1 final verification against acceptance criteria
```

### Task Routing

| Task Type | Detection | Primary Actor | Support |
|-----------|-----------|---------------|---------|
| Frontend/UI/BLE | Pages, components, styles, BLE | gemini-1 (analysis) → claude-2 (impl) | codex-1 reviews API contracts |
| Backend/API/ML | API, database, LLM workflow | codex-1 (analysis) → claude-2 (impl) | gemini-1 reviews API surface |
| Full-stack | Both frontend + backend | Decompose into subtasks | All actors involved |
| Architecture | System design, interfaces | claude-1 decides | codex-1 + gemini-1 consult |

### Quality Gates

1. **Requirements Gate**: Score 0-10 across clarity/scope/constraints — hard stop below 7
2. **Plan Approval**: User must confirm before implementation begins
3. **Cross-Review Gate**: codex-1 and gemini-1 review in parallel, Critical issues must be fixed
4. **Final Verification**: claude-1 checks against Trellis specs and acceptance criteria
5. **Record**: Session recorded via Trellis journal

### Communication Protocol

- All task assignments go through CCCC messaging (not direct file access)
- Peers report completion status and any blockers via CCCC messages
- Foreman makes all final decisions on conflicts
- Backend conflicts → trust Codex opinion
- Frontend conflicts → trust Gemini opinion
- Architecture conflicts → Claude decides

## Directory Structure (Planned)

```
chompy/
├── PROJECT.md              # This file (CCCC project context)
├── AGENTS.md               # Trellis agent instructions
├── .trellis/               # Trellis specs, tasks, workspace
├── mobile/                 # React Native mobile app
│   ├── src/
│   │   ├── screens/        # Screen components
│   │   ├── components/     # Reusable UI components
│   │   ├── services/       # BLE, API client
│   │   └── hooks/          # Custom hooks
│   └── package.json
├── backend/                # Python FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models
│   │   └── workflows/      # LLM processing pipelines
│   ├── Dockerfile
│   └── pyproject.toml
└── docker-compose.yml      # Local development stack
```

## Constraints

- Backend MUST be Docker-packaged for easy server migration
- Mobile app MUST support both iOS and Android
- LLM workflow MUST be modular (easy to swap models)
- All dental image data MUST be handled securely (HIPAA-aware design)
- Backend API MUST be stateless (horizontal scaling ready)
