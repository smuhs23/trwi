# TRGI course content implementation plan

Goal: Turn all supplied TRGI document groups into sourced, short practice quests, retaining the player's completed introduction and rewards.
Architecture: Append versioned JSON quest packs to the existing campaign. Draft course content can schedule practice but cannot establish professionally verified mastery. Add optional mini lessons, due-topic mission suggestions, source coverage and honest missing-content notices.
Tech stack: Existing React/TypeScript/Vite/IndexedDB.
Constraints: No original PDFs, names or source scans in public repository. Preserve existing quest IDs and rewards. No claim of exhaustive exam coverage or fachliche Freigabe. TRWI requires missing source materials.

- [x] Audit 32 PDFs, author original questions for all 8 module groups, supplemental documents and final exercise, record page references and gaps.
- [x] Add lesson UI, course statuses, adaptive repetition without misrepresenting mastery; test demo migration, draft learning, reward deduplication.
- [x] Integrate packs, content validation tests (unique IDs, answer correctness structure, source pages and lessons), dynamic campaign counts and topic route.
- [x] Review uncertain/conflicting content, test production build and browser campaign, publish private Site and update GitHub.
