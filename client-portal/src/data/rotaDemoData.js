// src/data/rotaDemoData.js

// ── Shift code definitions with colors ──────────────────────────────
export const SHIFT_CODES = {
  W:        { label: 'Work',          color: '#1B5E20', bg: '#E8F5E9' },
  R:        { label: 'Rest',          color: '#616161', bg: '#F5F5F5' },
  H:        { label: 'Holiday',       color: '#E65100', bg: '#FFF3E0' },
  A:        { label: 'Annual Leave',  color: '#4A148C', bg: '#F3E5F5' },
  S:        { label: 'Sick',          color: '#B71C1C', bg: '#FFEBEE' },
  SUS:      { label: 'Suspended',     color: '#C62828', bg: '#FFCDD2' },
  Office:   { label: 'Office',        color: '#0D47A1', bg: '#E3F2FD' },
  OfficeLD: { label: 'Office LD',     color: '#1565C0', bg: '#BBDEFB' },
  SB:       { label: 'Standby',       color: '#FF6F00', bg: '#FFF8E1' },
  SD:       { label: 'Same Day',      color: '#00695C', bg: '#E0F2F1' },
  Fleet:    { label: 'Fleet',         color: '#37474F', bg: '#ECEFF1' },
  MT:       { label: 'Meeting',       color: '#6A1B9A', bg: '#EDE7F6' },
  DR:       { label: 'DR',            color: '#4E342E', bg: '#EFEBE9' },
  C:        { label: 'C',             color: '#1A237E', bg: '#E8EAF6' },
  C2:       { label: 'C2',            color: '#283593', bg: '#C5CAE9' },
  NL3:      { label: 'NL3',           color: '#00838F', bg: '#E0F7FA' },
  '1P':     { label: '1P',            color: '#558B2F', bg: '#F1F8E9' },
  SWA:      { label: 'SWA',           color: '#AD1457', bg: '#FCE4EC' },
  DHW:      { label: 'DHW',           color: '#6D4C41', bg: '#D7CCC8' },
};

// Work-type codes that count toward weekly totals
const WORK_CODES = new Set(['W', 'Office', 'OfficeLD', 'SD', 'Fleet', 'SB', 'DR', 'C', 'C2', 'NL3', '1P', 'SWA', 'DHW', 'MT']);

export function countWorkDays(shifts) {
  return shifts.filter((c) => WORK_CODES.has(c)).length;
}

// ── Weeks (15 weeks: Dec 28 2025 → Apr 12 2026) ────────────────────
function pad(n) { return n < 10 ? '0' + n : String(n); }

function toLocalISO(dt) {
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

function buildWeeks() {
  const weeks = [];
  const start = new Date(2025, 11, 28); // Dec 28 2025 (Sunday)
  for (let w = 0; w < 15; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(start);
      dt.setDate(start.getDate() + w * 7 + d);
      days.push(toLocalISO(dt));
    }
    weeks.push({
      weekNumber: w + 1,
      startDate: days[0],
      endDate: days[6],
      days,
    });
  }
  return weeks;
}

export const ROTA_WEEKS = buildWeeks();

// ── Demo drivers ────────────────────────────────────────────────────
export const ROTA_DRIVERS = [
  { id: 1,  name: 'Amy Jones',        status: 'Full Time',   amazonId: 'AMZN001', phone: '+447700900111', left: 0 },
  { id: 2,  name: 'Ben Carter',       status: 'Full Time',   amazonId: 'AMZN002', phone: '+447700900112', left: 0 },
  { id: 3,  name: 'Cara Smith',       status: 'Part Time',   amazonId: 'AMZN003', phone: '+447700900113', left: 0 },
  { id: 4,  name: 'Dan Okafor',       status: 'Full Time',   amazonId: 'AMZN004', phone: '+447700900114', left: 0 },
  { id: 5,  name: 'Elena Rivera',     status: 'Lead Driver', amazonId: 'AMZN005', phone: '+447700900115', left: 0 },
  { id: 6,  name: 'Faisal Khan',      status: 'Full Time',   amazonId: 'AMZN006', phone: '+447700900116', left: 0 },
  { id: 7,  name: 'Grace Obi',        status: 'OSM',         amazonId: 'AMZN007', phone: '+447700900117', left: 0 },
  { id: 8,  name: 'Harry Nguyen',     status: 'Full Time',   amazonId: 'AMZN008', phone: '+447700900118', left: 0 },
  { id: 9,  name: 'Isla Brown',       status: 'Part Time',   amazonId: 'AMZN009', phone: '+447700900119', left: 0 },
  { id: 10, name: 'James Patel',      status: 'Full Time',   amazonId: 'AMZN010', phone: '+447700900120', left: 0 },
  { id: 11, name: 'Kira Mbeki',       status: 'Full Time',   amazonId: 'AMZN011', phone: '+447700900121', left: 0 },
  { id: 12, name: 'Liam O\'Brien',    status: 'Lead Driver', amazonId: 'AMZN012', phone: '+447700900122', left: 0 },
  { id: 13, name: 'Mia Zhang',        status: 'Full Time',   amazonId: 'AMZN013', phone: '+447700900123', left: 1 },
  { id: 14, name: 'Noah Wilson',      status: 'OSM',         amazonId: 'AMZN014', phone: '+447700900124', left: 0 },
  { id: 15, name: 'Olivia Fernandez', status: 'Part Time',   amazonId: 'AMZN015', phone: '+447700900125', left: 0 },
];

// ── Demo schedule ───────────────────────────────────────────────────
// Generates a deterministic schedule per driver per week
function generateSchedule() {
  const schedule = {};
  const codes = Object.keys(SHIFT_CODES);

  ROTA_DRIVERS.forEach((driver) => {
    ROTA_WEEKS.forEach((week) => {
      const key = `${driver.id}-${week.weekNumber}`;
      const shifts = [];

      for (let d = 0; d < 7; d++) {
        // Seed-based deterministic assignment
        const seed = driver.id * 7 + week.weekNumber * 3 + d;

        if (driver.status === 'Part Time') {
          // Part-timers work 3-4 days
          shifts.push(d >= 4 ? 'R' : (d === 3 && seed % 3 === 0 ? 'R' : 'W'));
        } else if (driver.left === 1) {
          // Left drivers show as inactive
          shifts.push(seed % 5 === 0 ? 'S' : 'R');
        } else {
          // Full-time pattern: typically 5 work days, 2 rest
          const dayType = seed % 10;
          if (d === 0 || d === 6) {
            // Weekends — more likely rest
            shifts.push(dayType < 6 ? 'R' : (dayType < 8 ? 'W' : 'SB'));
          } else if (dayType < 1) {
            shifts.push('H');
          } else if (dayType < 2) {
            shifts.push(['Office', 'MT', 'Fleet', 'SD'][seed % 4]);
          } else if (dayType < 3) {
            shifts.push('R');
          } else {
            shifts.push('W');
          }
        }
      }

      schedule[key] = shifts;
    });
  });

  return schedule;
}

export const ROTA_SCHEDULE = generateSchedule();
