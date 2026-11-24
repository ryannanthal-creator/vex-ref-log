# VEX Ref Log

A digital match anomaly log for VEX head referees, inspired by Referee FYI. It lists official events from VEX Events (events.vex.com) automatically, and also works for scrimmages, practice nights and league sessions that aren't listed there.

It is a single `index.html` plus a small `config.js`, a web app manifest, icons and a service worker, with no build step. Live site: <https://ryannanthal-creator.github.io/vex-ref-log/>

## Features

- **Matches** — alliance-colored match list with violation markers per team; open a match to see each team's history and log Minor, Major, Disabled or Note in one tap. Record Autonomous Bonus and AWP (V5RC / VEX U).
- **Entries** — team, match, outcome, cited rule(s), notes and referee name. Minor and Major entries require a rule number. "Match affecting" flag for Majors.
- **Repeat-Minor warnings** — flags 2+ Minors of the same rule in one match, or the same rule across 3+ matches, as a prompt to check that rule's violation notes.
- **Live match data** — for VEX Events events: field for each match with a remembered field filter, final scores as they're posted, an **Up next** banner for the next unscored match (on your field), and automatic refresh about every 90 seconds while the event is open, so elimination matches appear on their own after alliance selection.
- **Teams** — per-team totals, entries and scheduled matches; for VEX Events events also organization, location, robot name, grade, division rank and record (WP/AP/SP, or average score for VIQRC) and best skills scores, refreshed every 5 minutes. Sort by team number, rank or most flagged.
- **Event info** — venue, address, dates and event level.
- **Live sharing** — share an event with a code or invite link; every referee who joins sees each other's entries live, and the app shows who's on the event right now.
- **Log** — filter by outcome, rule, referee or text; sort by time, team or match; export CSV or a JSON backup; import a backup to merge.
- **Rules** — 2026–27 rule codes with short labels for V5RC and VEX U (Override) and VIQRC (Level Up), links to the official Q&A, and custom rule codes per event for mid-season manual updates.
- **Setup** — paste a team list and a match schedule (from a spreadsheet or Tournament Manager); commas, tabs or spaces all work.

## On your phone

On phones the tabs sit in a bar along the bottom, the **Log** button floats above it within thumb reach, and the entry form fills the screen with **Save** always visible, even with the keyboard open.

Add it to your home screen to use it like an app: in Safari, tap **Share → Add to Home Screen**; in Chrome on Android, tap **Install app** in the Event tab or the browser menu. Installed, it opens full screen and works with no signal (a service worker in `sw.js` keeps a copy of the app). Whenever you're online it loads the newest version automatically.

## Loading events from VEX Events

Open the event menu (tap the event name at the top). It lists this season's events automatically: happening now, the next 7 days, and the following weeks (from a few days ago through about 10 weeks ahead). Switch between V5RC, VEX U and VIQRC, search by name, city or SKU, and filter by state or region (remembered on the device). Tap an event to load its team list and match schedule; events with several divisions ask which division. Events you already loaded open instead of loading twice. The list is cached on the device for 6 hours; **Refresh list** fetches it again. **Enter a SKU instead** handles anything outside that window.

When no event is open (first use, or after deleting one), the app shows a **Find your event** screen with the same list, a box to join a shared event by code, and a way to set one up by hand.

**Update from VEX Events** in the Event tab pulls the latest teams and schedule later (for example once the schedule is posted, or after alliance selection) without touching logged entries.

- The site uses the VEX Events API token in `config.js` (`eventsToken`), so nobody has to enter one. That token is public: anyone can read it from the site or this repo. To replace it, request a new token at <https://events.vex.com/api/v2/accessRequest/create>, revoke the old one, and update `config.js`. Leave it empty to make each device enter its own.
- A token entered on a device is saved only in that browser's `localStorage`, takes priority over the built-in one, and is never stored in shared events or backups. Tokens are sent only to the VEX Events API (`https://events.vex.com/api/v2`).
- Requests go straight from the browser to VEX Events, so this works when the app is opened from GitHub Pages or as a local file. The claude.ai-hosted copy cannot reach other websites; load the event in a GitHub copy, export a backup, and import it there.
- If VEX Events does not accept requests from web pages, set a relay address under **Advanced** (for example a small serverless function that forwards requests to `https://events.vex.com/api/v2`).

Supported programs: V5RC, VEX U and VIQRC. SKUs look like `VE-V5-26-65904`; older `RE-` SKUs are accepted too.

## Live sharing setup (one time, about 5 minutes)

Live sharing on the GitHub Pages site uses a free Firebase project (Google's hosted database). Until it's set up, the Event tab says so and events stay on each device.

1. Go to <https://console.firebase.google.com>, choose **Create a project**, name it (for example `vex-ref-log`), and skip Google Analytics.
2. **Build → Authentication → Get started → Sign-in method → Anonymous → Enable → Save.**
3. **Build → Firestore Database → Create database**, pick a location near you, start in **production mode**.
4. In Firestore, open the **Rules** tab, replace everything with the contents of [`firestore.rules`](firestore.rules), and **Publish**.
5. **Authentication → Settings → Authorized domains → Add domain:** `ryannanthal-creator.github.io`.
6. **Project settings (gear) → General → Your apps → Web (`</>`)**, register an app (no hosting needed), and copy the `firebaseConfig` object it shows.
7. In `config.js`, replace `firebase: null` with that object, for example `firebase: { apiKey: "…", authDomain: "…", projectId: "…", appId: "…" }`, and commit. The site updates within a couple of minutes.

The Firebase web config is designed to be public. Access is controlled by `firestore.rules`: anyone signed in anonymously who knows an event's 8-character code can read and write that event, and nobody can list events, so codes can't be discovered. The free Spark plan (50,000 reads and 20,000 writes a day) is far more than a tournament needs.

**Using it:** open an event, go to the **Event** tab and choose **Share this event**. Send the code or **Copy invite link** to your other referees. They open the link, or choose **Join a shared event** in the event menu and type the code. Everyone's entries appear for everyone within a second or two, work offline, and catch up when the connection returns. **Leave on this device** removes it from one phone; **Delete this event** removes it for everyone.

## Storage

- **This device** — saved in the browser's `localStorage`. Works anywhere, including when hosted as a plain static page.
- **Shared live** — events shared with a code, stored in Firebase (see above) and cached on each device for offline use.
- **Shared / Only you** — available when the page runs as a claude.ai artifact, which provides a synced store (`window.claude.use("db")`). Shared events sync live between everyone the page is shared with; people with edit access can log entries.

Without Firebase set up, the GitHub Pages site keeps events on each device; use backup export/import to move logs between devices.

## Running

Open `index.html` in a browser, or serve the folder with any static host.

## Notes

Rule labels are short paraphrases to help find a rule; the official game manual and Q&A govern. Rule numbering reflects the manual updates published through version 2.0; add new or renumbered codes on the Rules tab.
