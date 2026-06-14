---
name: get-card-data
description: Scrape card data from cardsTable.html and update src/data/cards.json
---

# Get Card Data

Scrapes yellow/red card data from `cardsTable.html` (a table pasted from ESPN's World Cup discipline stats) and updates `src/data/cards.json`.

## How to use

Run this skill when the user provides an updated `cardsTable.html` file.

## Steps

1. Read `cardsTable.html` from `.opencode/skills/get-card-data/references/cardsTable.html`.

2. Parse each `<tr>` in `<tbody class="Table__TBODY">`:
   - Team name: text inside the `<a>` tag in the 2nd `<td>`
   - Yellow cards: text inside the `<span class="tar">` in the 4th `<td>`
   - Red cards: text inside the `<span class="tar">` in the 5th `<td>`

3. Map table team names to `cards.json` keys using this mapping:
   - `Czechia` → `Czech Republic`
   - `Congo DR` → `Democratic Republic of the Congo`
   - `Bosnia-Herzegovina` → `Bosnia and Herzegovina`
   - `Türkiye` → `Turkey`
   - All other team names match the `cards.json` keys as-is

4. For teams where the games played column is `"-"` (dash), set yellow/red to `0`.

5. Read `src/data/cards.json`. For each team in the table, set:
   - `yellow`: parsed integer, `0` if dash
   - `red`: parsed integer, `0` if dash

6. Write the updated data back to `src/data/cards.json`.

## Notes

- `cards.json` keys match the `name_en` field from the World Cup API (see `nameMapping.json` for reference).
