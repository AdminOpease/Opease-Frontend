# Plan: Add Station field to Manage Fleet

## Context
- Depots (stations) are defined in AppStore: `['Heathrow', 'Greenwich', 'Battersea']`
- VAN_FLEET currently only has `{ reg, make }` — no station field
- The depot selector exists in the Vans page header but doesn't filter anything yet
- The Manage Fleet dialog needs a Station column so vans can be organized by station

## Changes

### 1. Add `station` field to VAN_FLEET demo data (`vansDemoData.js`)
- Distribute the 65 vans across the 3 stations (Heathrow, Greenwich, Battersea) round-robin style
- Each van gets a `station` property

### 2. Update fleet state initialization (`Vans.jsx`)
- Include `station` from demo data in the fleet state: `{ ...v, id, doNotUse, reason, station: v.station }`

### 3. Update Manage Fleet dialog (`Vans.jsx`)
- Add a **Station filter dropdown** above the fleet table (next to the search input) to filter by station
- Add **Station column** to the fleet table header and body rows
- In edit mode: add a station dropdown selector
- In add-van mode: add a station dropdown selector (default to first depot)
- Update `filteredFleetDialog` to also filter by selected station
- Update search to also match station name

### 4. Update van picker popover
- When a depot is selected in the main page header, filter the van picker to show only vans from that station (+ "All Depots" shows all)

### 5. Update fleet legend subtitle
- Show station breakdown in the dialog subtitle

No changes needed to drivers or the main table — this is focused on the fleet/van side.
