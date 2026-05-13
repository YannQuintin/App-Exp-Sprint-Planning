[README.md](https://github.com/user-attachments/files/27696888/README.md)
# Sprint Capacity Planner

A lightweight React tool for sprint planning ceremonies. Built for product owners and scrum masters who need to allocate team capacity across disciplines, assign support tasks, and track sprint-level commitments without the overhead of full project management tools.

Designed for teams working across multiple disciplines (Back-end, AdminUI, Android, iOS, QA) where a single ticket often requires work from several people.

## Quick Start

You need [Node.js](https://nodejs.org/) (v16+) installed.

### Option 1: Vite (recommended)

```bash
npm create vite@latest sprint-planner -- --template react
cd sprint-planner
cp /path/to/Sprint\ Capacity\ Planner.jsx src/App.jsx
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Option 2: Create React App

```bash
npx create-react-app sprint-planner
cd sprint-planner
cp /path/to/Sprint\ Capacity\ Planner.jsx src/App.jsx
```

In `src/App.jsx`, change the last line from:
```js
export default function SprintCapacityPlanner() {
```
No change needed -- the component already uses a default export.

In `src/index.js`, make sure it imports from `./App`:
```js
import App from './App';
```

Then:
```bash
npm start
```

Open `http://localhost:3000` in your browser.

## How It Works

The planner follows a simple capacity model:

```
Total days (10 per sprint) - Leave days - Support task points = Available capacity
```

Each team member starts with 10 days. Leave reduces total days. Support tasks (like regression or release management) are then deducted. What remains is available for ticket work.

Tickets can span multiple disciplines. A single ticket might need 3pts of Back-end work from Corina, 2pts of Android work from Anze, and 1pt of QA from Anna. The planner tracks all of this per person, per discipline, and per EPIC.

## Features

### Team Capacity Management
- Add, edit, and remove team members at any time
- Each person can belong to one or more disciplines (e.g., Back-end + AdminUI)
- Set available days per person (default 10, reduce for holidays/leave)
- Manage Leave panel to deduct holiday days from individual members

### Support Task Allocation
- Four default support task types: Release Management, Regression, Refinement, Support Onboarding
- Fully manageable: add, rename, remove task types, change default point costs
- Assign a person to each support task per sprint with overridable point costs
- Same task type can be assigned to multiple people (e.g., two people share Refinement)
- Support points auto-deduct from the assignee's available capacity
- New sprints pre-seed support tasks from the type list so you only need to fill in names

### Multi-Discipline Tickets
- Each ticket has checkboxes for the 5 disciplines: Back-end, AdminUI, Android, iOS, QA
- Enable a discipline, pick an assignee from that discipline's members, set the point estimate
- Disciplines with no team members are hidden automatically
- Total ticket points are summed across all enabled disciplines

### EPIC Tagging and Breakdown
- Create and manage EPIC tags (similar to labels)
- Tag each ticket with an EPIC
- Capacity by EPIC panel shows point allocation and percentage breakdown
- Quickly see how much of the sprint goes to "Fix the Basics" vs. "Search 2.0" vs. support work

### Dynamic Capacity Counters
- Overall sprint header: total assigned / total available, remaining points
- Discipline cards: per-discipline capacity bars (people count, available points, assigned, remaining)
- Individual load panel: per-person capacity bars with over-allocation warnings
- Color-coded bars: green (healthy), amber (>70%), red (>90% or over-allocated)
- Over-allocation banner names the people who are over capacity

### Sprint Confirmation
- "Planning Done" button (red, prominent) locks the sprint when ready
- Button is disabled until all tickets have at least one assignee and all support tasks are assigned
- Warnings shown for untagged tickets, unassigned tickets, and unassigned support tasks
- Triggers a celebration animation, then transitions to read-only Planned Sprint view

### Planned Sprint View (read-only)
- Summary header with total points, ticket count, team size, support points
- Team allocation grid: click any person to see their individual assignment sheet
- Full ticket table with assignees and point breakdown
- Support task summary panel
- "Edit Allocation" button to return to planning mode if changes are needed

### Individual Person View + PDF Export
- Click any team member to see their personal sprint sheet
- Shows: total days, support deduction, available capacity, assigned points, remaining
- Lists their support tasks and all assigned tickets
- "Export PDF" button opens a print-friendly version for screen sharing or printing

### Sprint History
- Navigate between sprints via the top nav bar
- Previous sprints are preserved with full data (team, tickets, support assignments)
- Includes two mock historical sprints (8.17, 8.18) as examples
- Starting a new sprint archives the current one into history

### Carry-Over
- When starting a new sprint, a modal shows all tickets from the previous sprint
- Select individual tickets or "Select All" to carry them into the new sprint
- Carried tickets are deep-copied (independent from the original sprint)
- New sprint inherits the team roster (with days reset to 10), EPICs, and pre-seeded support tasks

### Drag-and-Drop Reordering
- Grip handle on each ticket row for drag-and-drop
- Reorder tickets during planning to reflect priority
- Disabled in read-only Planned Sprint view

### Persistent Data (localStorage)
- All sprint data auto-saves to the browser's localStorage
- Survives page refreshes and browser restarts
- Stored under key `sprint-planner-v4`
- Opening the app restores the exact state you left off

## Disciplines

The planner supports 5 disciplines out of the box:

| Discipline | Abbreviation |
|-----------|-------------|
| Back-end  | BE          |
| AdminUI   | AUI         |
| Android   | And         |
| iOS       | iOS         |
| QA        | QA          |

A team member can belong to multiple disciplines. For example, a developer doing both Back-end and AdminUI work would appear in both discipline capacity cards, with their full capacity shown in each.

## Customization

### Changing disciplines
Edit the `DISCIPLINES` and `DS` constants at the top of the file:

```js
const DISCIPLINES = ["Back-end", "AdminUI", "Android", "iOS", "QA"];
const DS = { "Back-end": "BE", AdminUI: "AUI", Android: "And", iOS: "iOS", QA: "QA" };
```

### Changing colors
The Versuni brand palette is defined in the `V` object:

```js
const V = {
  deepBlue: "#003DA5",
  turquoise: "#00BCD4",
  teal: "#00D4C8",
  // ...
};
```

### Changing the default team
Edit the `DEFAULT_TEAM` array to match your actual team roster. This is only used when no localStorage data exists.

### Changing default support task types
Edit the `DEFAULT_SUPPORT_TYPES` array:

```js
const DEFAULT_SUPPORT_TYPES = [
  { id: "st1", name: "Release management", defaultPts: 2 },
  { id: "st2", name: "Regression", defaultPts: 2 },
  { id: "st3", name: "Refinement", defaultPts: 1 },
  { id: "st4", name: "Support Onboarding", defaultPts: 1 },
];
```

You can also manage these at runtime through the "Manage Types" button in the UI.

## Resetting Data

To clear all saved data and start fresh, open your browser's developer console and run:

```js
localStorage.removeItem("sprint-planner-v4");
```

Then refresh the page.

## Tech Stack

- React (hooks only, no class components)
- Zero external dependencies beyond React itself
- All styling is inline (no CSS files needed)
- HTML5 Drag and Drop API
- localStorage for persistence

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Requires JavaScript enabled and localStorage available.

## License

Internal tool. Not licensed for external distribution.
