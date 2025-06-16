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

## Phase 4 – UI Enhancements: Rationale & Chat Overlay
## Phase 4 – UI Enhancements: Rationale, Chat Demo & Layout
- Embedded the Survey Methodology Framework and rationale field into the generateBranchingSurvey prompt and stub.
- Simplified info icon to an inline brand‑blue “ⓘ” in each node header.
- Questions laid out in a horizontal row; explanation messages stacked to the right of their question.
- Spacing constants (baseX, questionXStep, childXOffset, childYStep) tuned for generous gaps.
- Conditional MiniMap display when node count exceeds threshold.
- ChatOverlay demo with styled chat bubbles (grey for bot, brand‑blue for user) and brand‑blue MC/Submit buttons.
- Entry node flanking the left, thank_you node flanking the right for complete flow.

**Status:** _complete_

---
---
*Last updated: 2025-06-17*
