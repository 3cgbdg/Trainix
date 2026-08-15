# Trainix v2 route map

## Primary destinations

- `/today` — daily command center and default authenticated landing page.
- `/workout-plan` — Plan destination during migration; owns workout schedule and links to nutrition.
- `/nutrition-plan` — retained deep link until Plan is unified.
- `/ai-analysis` — Body Scan destination; URL retained for compatibility.
- `/progress` — trends, milestones, measurements, and progress photos.
- `/profile` — identity, goals, preferences, security, and data controls.

## Compatibility

- `/` redirects to `/today`.
- `/dashboard` remains available during the Today migration.
- `/workout/:id` and completion deep links remain unchanged.
- Existing auth URLs remain unchanged.

## Navigation rule

Top-level destinations are always visible. Missing prerequisites are explained inside the destination with a useful empty state; navigation is never silently disabled.
