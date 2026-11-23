# VEX Ref Log

A digital match anomaly log for VEX head referees, inspired by Referee FYI, that works for any event — tournaments, scrimmages, practice nights and league sessions — with no RobotEvents listing required.

It is a single self-contained `index.html` with no build step.

## Features

- **Matches** — alliance-colored match list with violation markers per team; open a match to see each team's history and log Minor, Major, Disabled or Note in one tap. Record Autonomous Bonus and AWP (V5RC / VEX U).
- **Entries** — team, match, outcome, cited rule(s), notes and referee name. Minor and Major entries require a rule number. "Match affecting" flag for Majors.
- **Repeat-Minor warnings** — flags 2+ Minors of the same rule in one match, or the same rule across 3+ matches, as a prompt to check that rule's violation notes.
- **Teams** — per-team totals, entries and scheduled matches.
- **Log** — filter by outcome, rule, referee or text; sort by time, team or match; export CSV or a JSON backup; import a backup to merge.
- **Rules** — 2026–27 rule codes with short labels for V5RC and VEX U (Override) and VIQRC (Level Up), links to the official Q&A, and custom rule codes per event for mid-season manual updates.
- **Setup** — paste a team list and a match schedule (from a spreadsheet or Tournament Manager); commas, tabs or spaces all work.

## Storage

- **This device** — saved in the browser's `localStorage`. Works anywhere, including when hosted as a plain static page.
- **Shared / Only you** — available when the page runs as a claude.ai artifact, which provides a synced store (`window.claude.use("db")`). Shared events sync live between everyone the page is shared with; people with edit access can log entries.

When hosted elsewhere (for example GitHub Pages), the app runs in device-only mode; use backup export/import to move logs between devices.

## Running

Open `index.html` in a browser, or serve the folder with any static host.

## Notes

Rule labels are short paraphrases to help find a rule; the official game manual and Q&A govern. Rule numbering reflects the manual updates published through version 2.0; add new or renumbered codes on the Rules tab.
