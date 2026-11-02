# Graphical workshop world

The default home is a 2.5D illustrated workshop yard. Building controls open contextual upgrade dialogs; the three purchased vehicles appear in their parking bays. The customer marker shows available contracts and opens a brief before acceptance. A running mission can be resumed directly from home.

Navigation: Betrieb (home), Stadt (all customer contracts), Lernen (free course path), Shop (all upgrades). XP opens progress; the header gear opens settings. The change preserves the game schema and content version, all purchases, balances, and in-progress answers.

Generated project artwork is under `public/art`, optimized to WebP with alpha on vehicles. These assets are explicitly precached by the PWA service worker and resolve against Vite BASE_URL. Building upgrades show owned flags/counts; they do not replace the background illustration with construction stages.

Validation: 30 unit/content/storage tests; 10 browser scenarios including full course completion, recovery/import, mission resume, purchasing vehicles, dialog focus and Escape, persistence, and offline art. The existing 8 scenarios passed in the full run; the two adjusted scenarios (new navigation notice timing and a valid earned-balance fixture) passed in the targeted rerun. Mobile screenshots are in docs/screenshots/world-mobile.png and world-upgraded-mobile.png.
