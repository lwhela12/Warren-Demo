# Branching Project Progress

This document tracks the rollout of branching survey functionality. It lists the three planned phases and notes current status.

## Phase 1 – Core Branching Survey Creation
- Replace the linear survey builder with a branching builder.
- Wizard calls `/api/survey/branching` to create an initial graph.
- New `BranchingGraphView` component visualises and edits the graph.
- Surveys can be saved via `PUT /api/survey/branching/:id`.

**Status:** _complete_

## Phase 2 – Student-Facing Branching Survey
- Student flow fetches first node via `/api/survey/branching/:id/start`.
- After each answer, POST to `/api/survey/branching/:id/next` to get the next node.
- Ends when a terminal node is reached and responses are submitted.

**Status:** _complete_

## Phase 3 – Integration and UI Polish
- Routing updates to use the new builder from the dashboard.
- Results view handles branching surveys.
- UI refinements: drag‑and‑drop nodes, editing controls, etc.

**Status:** _complete_

---
*Last updated: 2025-06-14

