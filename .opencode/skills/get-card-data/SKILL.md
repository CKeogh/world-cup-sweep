---
name: get-card-data
description: Scrape card data from cardsTable.html and update src/data/cards.json
---

# Get Card Data

Scrapes yellow/red card data from `cardsTable.html` (a table pasted from ESPN's World Cup discipline stats) and updates `src/data/cards.json`.

## How to use

Run this skill when the user provides an updated `cardsTable.html` file.

## Steps

1. Read `cardsTable.html` from the project root.

2. Parse each `<tr>` in `<tbody class="Table__TBODY">`:
   - Rank: text content of the 1st `<td>` (e.g. `"1"`, `"2"`, or empty)
   - Team name: text inside the `<a>` tag in the 2nd `<td>`
   - Yellow cards: text inside the `<span class="tar">` in the 4th `<td>`
   - Red cards: text inside the `<span class="tar">` in the 5th `<td>`
   - Points: text inside the `<span class="tar">` in the 6th `<td>`

3. Map table team names to `cards.json` keys using this mapping:
   - `Czechia` → `Czech Republic`
   - All other team names match the `cards.json` keys as-is

4. For teams where any value is `"-"` (dash), set `rank` and `points` to `null` (the team hasn't played yet). Keep yellow/red as `0`.

5. Read `src/data/cards.json`. For each team in the table, set:
   - `rank`: the numeric rank value, or `null` if no data
   - `yellow`: parsed integer, `0` if dash
   - `red`: parsed integer, `0` if dash
   - `points`: the numeric points value, or `null` if no data

6. Write the updated data back to `src/data/cards.json`.

## Notes

- The PTS column = yellow + (red × 3) — but we store the actual points value directly.
- `cards.json` keys match the `name_en` field from the World Cup API (see `nameMapping.json` for reference).
- Only teams with a numeric rank are in the bad boy race. The bad boy winner is the team with the lowest rank number (i.e., the most discipline points).
