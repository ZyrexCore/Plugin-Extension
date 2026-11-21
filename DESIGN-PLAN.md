# PRINTLOG — Visual Planning & UX Blueprint

**Project:** PRINTLOG — Printing Work Tracker  
**Planning checkpoint:** 21 November 2026  
**Status:** Visual direction and first-version screen map

## 1. Product goal

Give a print-shop operator one quick place to record:
- what was worked on each day;
- which jobs were finished;
- which jobs are still pending;
- which paper/materials were used or sent for printing, including GSM, quantity, size, supplier/printer, and job purpose.

The app should feel like a practical production desk: fast to update during a busy workday, clear at a glance, and comfortable on both desktop and mobile.

## 2. Visual direction

Use a calm print-workspace look rather than a generic admin template.

| Token | Value | Use |
|---|---|---|
| Charcoal green | `#20271f` | Sidebar and strong surfaces |
| Forest green | `#456b36` | Primary actions and active states |
| Soft lime | `#d9f17b` | Highlights and small accents |
| Warm off-white | `#f4f5f1` | App background |
| White | `#ffffff` | Cards and forms |
| Muted grey-green | `#7d8579` | Secondary labels |

- Typography: Manrope for readable UI; DM Mono for dates, labels, counts, and production metadata.
- Components: rounded 8–12px cards, thin borders, compact labels, generous click targets.
- Tone: clean, workshop-like, confident, and not overly decorative.

## 3. Main dashboard — visual map

```text
┌──────────────────────┬──────────────────────────────────────────────────────┐
│ PRINTLOG             │  OVERVIEW                         DATE   EXPORT      │
│ PRODUCTION DESK      ├──────────────────────────────────────────────────────┤
│                      │  YOUR WORK, IN ONE PLACE                            │
│ WORKSPACE            │  Make every print day count.                         │
│  ▦ Overview          │  Track jobs, finished work and paper used.           │
│  ☷ Work & tasks      ├────────────┬────────────┬────────────┬────────────────┤
│  ▤ Paper & materials│ OPEN TASKS │ FINISHED   │ WORKED ON │ MATERIALS      │
│  ◷ Daily history     │     06     │ TODAY  04  │ TODAY  03 │ ENTRIES   18   │
│                      ├────────────────────────────┬─────────────────────────┤
│                      │ TODAY'S PRODUCTION         │ NEXT UP                 │
│                      │ Work log                   │ Pending work            │
│                      │ [Add today's update...]    │ ○ Banner print          │
│                      │ + Add note                 │ ○ 500 invitation cards  │
│                      │ • Customer artwork checked │ ○ Lamination job        │
│                      ├────────────────────────────┴─────────────────────────┤
│                      │ PAPER STOCK ACTIVITY                                  │
│                      │ Date | GSM | Qty | Size | Printer | Job              │
│ SAVED ON THIS DEVICE │                                                      │
└──────────────────────┴──────────────────────────────────────────────────────┘
```

The dashboard should answer three questions immediately:
1. What is still open?
2. What was completed today?
3. What material was recorded most recently?

## 4. Core screens

### Overview
- Four compact production counters.
- Quick-add daily work note.
- Short pending-work list with a clear route to the full task screen.
- Latest material entries.

### Work & tasks
- Two clear columns: **In progress / pending** and **Finished**.
- New job form with title and optional details.
- One-tap completion control.
- Daily work-update list kept separate from job completion, because a work note is not always a finished job.
- Carried-forward tasks receive a small **CARRIED** label and retain their original creation date.

### Paper & materials
- Fast form for paper name/GSM, quantity, unit, size, supplier/printer, and job purpose.
- Common presets: 300, 250, 200, 170, 150, 130, 120, 100, and 80 GSM; allow a custom paper name.
- Searchable or filterable material history is a good next enhancement once the basic register is stable.

### Daily history
- Group records by date.
- Keep work updates, jobs started, jobs finished, and material entries visually distinct.
- Search by date, job name, or paper type.
- Preserve the original start date even when a pending job is carried forward.

## 5. Key behaviour and data rules

- A pending task moves forward when the app opens on a later date.
- Carry-forward updates the task's active date; it must **not** create a second task.
- The original creation date stays unchanged for history.
- Completing a carried task updates that same record.
- A daily work note is independent of a task and should never silently mark a task complete.
- Material records need their own date and must remain visible in historical records.
- Empty states should explain what to do next rather than look like errors.

## 6. Mobile layout

- Convert the desktop sidebar into a compact, horizontally scrollable navigation strip.
- Stack dashboard cards in two columns, then stack content panels vertically.
- Keep forms single-column where labels or fields would become cramped.
- Make task completion controls and primary buttons easy to tap.
- Tables may scroll horizontally; do not make the entire page wider than the screen.

## 7. Suggested build sequence

1. **Polish the current screens:** check spacing, empty states, form validation, and mobile tap targets.
2. **Improve history:** make it easy to distinguish jobs started on a date from jobs completed on that date, including jobs completed days later.
3. **Add filters:** date range, GSM/paper type, supplier/printer, and job purpose.
4. **Add safer backup handling:** export plus a clear import/restore flow with a confirmation step.
5. **Team/cloud phase (later):** decide whether multiple people need shared live records before choosing a hosted database and authentication model.

## 8. Current first-version limitation

The current version stores records in the browser's local storage. That is suitable for a single device/browser prototype, but it does not synchronize records across different devices or team members. Do not describe it as a shared team database until cloud storage and user access are implemented.

## 9. Review checklist for the group

- [ ] Is the dashboard understandable in under 10 seconds?
- [ ] Are daily work notes and finished jobs clearly different?
- [ ] Does a pending job carry forward without duplication?
- [ ] Can the team record custom paper types and units?
- [ ] Is the mobile task-completion flow comfortable?
- [ ] Is local-only storage acceptable for the first test, or is shared access required before launch?
