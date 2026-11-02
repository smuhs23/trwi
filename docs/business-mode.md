# Business mode

The city map and garage turn course practice into a small workshop business. Four selectable districts contain twelve customer cases, each with five existing source-linked course questions. They are practice scenarios, not official examinations or a simulation of the confirmed examination format.

Nine purchases include the original three upgrades, three vehicles, a mobile test kit, a planning office and a warehouse. Ownership unlocks jobs; the free course route remains independent. The first customer pays 40 marks, while the first vehicle costs 80; course missions provide the remaining marks. All purchases are reachable from one-time course and job rewards, verified automatically.

A job pays 120 XP and 40 marks once after at least four of five answers are correct without hints. Failed attempts cost nothing and show a correction/retry result. Replays remain free but cannot generate infinite income. Job completion is separate from linear course completion and therefore does not corrupt route/import invariants.

All 168 course choice questions have four options; the four ordering tasks retain their existing steps. Added alternatives preserve question IDs, correct keys, sources and goals. Course-1 to business-1 migration preserves balances, purchased items, completed missions and learning history; stale sessions are restarted.

Validation: 30 automated logic/storage/content/component tests pass. Nine Chromium browser scenarios pass (one mobile overflow found with nine upgrade icons, fixed with wrapping, then that scenario rerun successfully). Business map screenshot inspected at 390px. Existing course full-run test passes; real-device Safari remains untested. Bounded independent code review checked retries, payment deduplication, purchase gates, persistence and affordability; its learning-history migration finding was fixed with a regression test.
