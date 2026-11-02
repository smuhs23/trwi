# LernQuest PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Deliver a playable offline quest campaign with persistent workshop rewards.
**Architecture:** React UI consumes a pure state reducer and versioned demo content. IndexedDB stores the whole validated game snapshot atomically; a generated service worker caches the static app.
**Tech Stack:** React, TypeScript, Vite, vite-plugin-pwa, Zod, Vitest, Playwright.
**Spec:** ../specs/2026-11-02-lernquest-design.md (approved in conversation).

## Global Constraints

- Four normal quests and one boss; 20–25 original demo tasks; demo tasks never count toward mastery.
- Normal first completion: 100 XP / 20 marks; boss: 200 / 40; upgrades cost 20 / 40 / 60.
- Player level is 1 + floor(XP / 200). No punitive streaks, timers or paywalls.
- Local storage only, export/import, offline after first load, configurable base path.
- No uploaded course files or personal data in the repository.

## Review Focus

- Reload and duplicate clicks must not duplicate rewards or purchases (task 1).
- Invalid imports and unavailable storage must not overwrite progress silently (task 2).
- Hints, same-day repeats and demo questions must not produce false mastery (task 1).
- Changed content versions must not strand an unfinished round (task 2).
- Narrow screens, keyboard controls and offline reload must remain usable (task 3).

### Task 1: Content and game rules

**Files:** src/game/{types,content,engine}.ts, src/game/engine.test.ts, package.json, tsconfig.json.
**Interfaces:** initialState(): GameState; reduceGame(state, action): GameState; evaluate(question, answer): boolean; getDue(state, now): string[].
- [x] Write tests: completing q1 yields 100 XP / 20 marks once; locked q2 cannot start; purchases cannot overdraw; boss yields 200 / 40; full campaign earns 600 / 120.
- [x] Tests for wrong/hinted/demo answers, separate-day variant mastery, due scheduling and duplicate answer events.
- [x] Run tests and observe missing implementation; implement typed content, answer validation and reducer; rerun to green.
- [x] Commit a tested game domain and 22 demo tasks.

### Task 2: Persistence and recovery

**Files:** src/game/{storage,validation}.ts, src/game/storage.test.ts.
**Interfaces:** loadGame(): Promise<GameState>; saveGame(state): Promise<void>; parseImport(text): GameState; reconcile(state): GameState.
- [x] Test roundtrip through IndexedDB, invalid/oversized imports, future schema rejection, negative currency, duplicate reward IDs, stale content recovery and storage failure propagation.
- [x] Implement strict schema and semantic validation; transactional save; migration and safe stale-session reset.
- [x] Run full unit suite to green and commit.

### Task 3: Playable responsive PWA

**Files:** src/{App,main}.tsx, src/components/{Icon,WorkshopArt,QuestPlayer}.tsx, src/style.css, vite.config.ts, public/icons/*, index.html, tests/app.spec.ts, playwright.config.ts.
**Consumes:** domain actions/state and persistence API from tasks 1–2.
- [x] Write browser tests for starting a mission, persisted answers/hints after reload, completing five missions and buying all upgrades, invalid import preview, keyboard order controls, 390px viewport, and offline navigation.
- [x] Run against empty app to observe intended missing-UI failure.
- [x] Build map, workshop, mission player, results, mastery overview and settings; accessible controls and reduced-motion mode.
- [x] Register prompt-based service worker and defer activation during sessions; create original SVG workshop and app icons.
- [x] Run unit tests, typecheck, production build, browser tests and visually inspect desktop/mobile screenshots.
- [x] Commit app, updated README and verification report; request independent whole-branch review; fix important findings and rerun affected checks.
- [ ] Push feature branch and open reviewable PR. Publishing/merging remains separate.

## Execution record

Native implementation selected as a routine execution choice under the user's approval. Existing fresh clone on feat/lernquest-pwa provides isolation. Dependencies between tasks use the shared typed state/actions; no conflicting interfaces found. Initial repository contains documentation only, so no baseline test suite exists.

Task 1: complete; 7 domain tests RED→GREEN.
Task 2: complete; 7 initial persistence/recovery tests RED→GREEN, later review regression raises suite to 15.
Task 3: complete locally; 7 browser scenarios passed after review fixes. See ../../verification.md for exact scope and limitations.
