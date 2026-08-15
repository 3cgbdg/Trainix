# Metric and status dictionary

| Term | Display rule | Comparison | Empty state |
| --- | --- | --- | --- |
| Current weight | Latest recorded weight with selected unit | Difference from previous measurement | Ask the user to add a measurement |
| Weight change | Current minus baseline for selected range | Signed value and date range | Do not display zero as missing data |
| BMI | One decimal place | Show range context, not a body-value verdict | Explain that height and weight are required |
| Body fat | Percentage with one decimal place | Previous valid scan in selected range | Mark as estimated when AI-derived |
| Workout streak | Consecutive completed workout days | Longest streak as supporting context | Show `0 days`, not an empty card |
| Calories | Consumed / daily target in kcal | Percentage of target | Explain that a nutrition plan is required |
| Macros | Consumed / target in grams | Percentage of target | Preserve individual protein, carbs, and fat states |
| Hydration | Logged / target in ml or L | Percentage of target | Offer a clear Log water action |

## Status language

- Use `Upcoming`, `In progress`, `Completed`, `Skipped`, and `Missed` consistently.
- Never communicate status by color alone.
- Avoid judgmental labels for body measurements.
- Distinguish `Measured`, `Estimated`, and `User provided` values in Body Scan results.
