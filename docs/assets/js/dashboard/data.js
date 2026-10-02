/* ============================================================
   Demo dataset
   Real airline names, fictional flight numbers and times at a
   fictional hub. Times follow the real operational sequence:
   ETA (aircraft in) -> Sealing & Loading -> Truck departure -> ETD.
   ============================================================ */

export const EVENT_TYPES = {
  eta:   { key: 'eta',   label: 'ETA',       long: 'ETA Arrival',       color: '#4dffb4' },
  seal:  { key: 'seal',  label: 'Sealing',   long: 'Sealing & Loading', color: '#ffaa44' },
  truck: { key: 'truck', label: 'Truck Dep', long: 'Truck Departure',   color: '#ff6b6b' },
  etd:   { key: 'etd',   label: 'ETD',       long: 'ETD Departure',     color: '#66aaff' },
};

export const AIRLINES = [
  { code: 'EK', name: 'Emirates',          color: '#e31837' },
  { code: 'QR', name: 'Qatar Airways',     color: '#b03a72' },
  { code: 'ET', name: 'Ethiopian',         color: '#2fa35a' },
  { code: 'KQ', name: 'Kenya Airways',     color: '#e0702b' },
  { code: 'TK', name: 'Turkish Airlines',  color: '#c9a227' },
  { code: 'AF', name: 'Air France',        color: '#3d7be0' },
  { code: 'LH', name: 'Lufthansa',         color: '#8a63d2' },
  { code: 'BA', name: 'British Airways',   color: '#5f86c2' },
  { code: 'WB', name: 'RwandAir',          color: '#1fa9cf' },
  { code: 'MS', name: 'EgyptAir',          color: '#c23b3b' },
  { code: 'AT', name: 'Royal Air Maroc',   color: '#d0453a' },
  { code: 'MK', name: 'Air Mauritius',     color: '#1a9a86' },
];

const byCode = Object.fromEntries(AIRLINES.map((a) => [a.code, a]));

/* Day patterns are relative to the demo day: index 0 = today, 1 = tomorrow, ...
   '1111111' = daily. Every flight below operates today. */
const RAW = [
  // code, flight,   meal,      meals, ETD,     turnaround (min, ETA = ETD - turnaround), days
  ['AT', 'AT 571',  'halal',   168, '04:50', 90,  '1011010'],
  ['ET', 'ET 805',  'halal',   214, '06:15', 90,  '1111111'],
  ['KQ', 'KQ 432',  'western', 186, '07:05', 90,  '1111111'],
  ['MK', 'MK 846',  'western', 232, '07:40', 150, '1010101'],
  ['EK', 'EK 214',  'halal',   486, '09:20', 150, '1111111'],
  ['WB', 'WB 117',  'western', 142, '09:55', 90,  '1101101'],
  ['QR', 'QR 1371', 'halal',   398, '10:40', 120, '1111111'],
  ['TK', 'TK 619',  'halal',   344, '11:25', 120, '1111111'],
  ['MS', 'MS 842',  'halal',   176, '11:50', 90,  '1010110'],
  ['ET', 'ET 809',  'halal',   268, '12:30', 90,  '1111111'],
  ['LH', 'LH 548',  'western', 372, '12:55', 150, '1111111'],
  ['EK', 'EK 218',  'halal',   512, '13:35', 150, '1111111'],
  ['AF', 'AF 996',  'western', 336, '13:50', 120, '1111111'],
  ['BA', 'BA 058',  'western', 304, '14:20', 120, '1111111'],
  ['KQ', 'KQ 436',  'western', 198, '14:45', 90,  '1110111'],
  ['QR', 'QR 1375', 'halal',   402, '15:30', 120, '1111111'],
  ['WB', 'WB 121',  'western', 128, '16:05', 90,  '1011011'],
  ['MK', 'MK 850',  'western', 244, '16:40', 120, '1101010'],
  ['TK', 'TK 623',  'halal',   352, '17:20', 120, '1111111'],
  ['ET', 'ET 813',  'halal',   236, '18:05', 90,  '1111111'],
  ['EK', 'EK 222',  'halal',   498, '18:45', 150, '1111111'],
  ['AT', 'AT 575',  'halal',   172, '19:30', 90,  '1100110'],
  ['LH', 'LH 552',  'western', 366, '20:15', 150, '1111111'],
  ['AF', 'AF 990',  'western', 328, '21:10', 120, '1111111'],
  ['BA', 'BA 062',  'western', 296, '21:45', 120, '1111111'],
  ['QR', 'QR 1379', 'halal',   410, '22:30', 120, '1111111'],
  ['MS', 'MS 846',  'halal',   182, '23:15', 90,  '1111100'],
  ['EK', 'EK 226',  'halal',   520, '23:50', 150, '1111111'],
];

/* Offsets before ETD used across the operation (minutes). */
const SEAL_BEFORE_ETD = 170;
const TRUCK_BEFORE_ETD = 115;

export const t2m = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
export const m2t = (m) => {
  const v = ((Math.floor(m) % 1440) + 1440) % 1440;
  return String(Math.floor(v / 60)).padStart(2, '0') + ':' + String(v % 60).padStart(2, '0');
};

export const FLIGHTS = RAW.map(([code, flight, mealType, meals, etd, turn, days], i) => {
  const etdM = t2m(etd);
  return {
    id: 'f' + i,
    airline: byCode[code].name,
    color: byCode[code].color,
    flight,
    mealType,
    meals,
    eta: m2t(etdM - turn),
    sealing: m2t(etdM - SEAL_BEFORE_ETD),
    truck: m2t(etdM - TRUCK_BEFORE_ETD),
    etd,
    days, // relative pattern, index 0 = today
  };
});

/* Production "Box Time" slots: when meal boxes must be ready.
   Early flights (ETD before 10:00) are produced the day before (D-1),
   so today's grid shows tomorrow's early boxes in the afternoon. */
export const PROD_SLOTS = FLIGHTS.map((f) => {
  const etdM = t2m(f.etd);
  if (etdM < 600) return { flightId: f.id, flight: f.flight, airline: f.airline, color: f.color, day: 'D-1', time: m2t(etdM + 600) };
  return { flightId: f.id, flight: f.flight, airline: f.airline, color: f.color, day: 'D', time: m2t(t2m(f.sealing) - 180) };
}).sort((a, b) => t2m(a.time) - t2m(b.time));

/* Flatten flights into timeline events. */
export function buildEvents(flights = FLIGHTS) {
  const evs = [];
  for (const f of flights) {
    evs.push({ key: f.id + '_eta', type: 'eta', time: f.eta, f });
    evs.push({ key: f.id + '_seal', type: 'seal', time: f.sealing, f });
    evs.push({ key: f.id + '_truck', type: 'truck', time: f.truck, f });
    evs.push({ key: f.id + '_etd', type: 'etd', time: f.etd, f });
  }
  return evs.map((e) => ({ ...e, mins: t2m(e.time) })).sort((a, b) => a.mins - b.mins);
}

export const EVENTS = buildEvents();
export const findFlight = (id) => FLIGHTS.find((f) => f.id === id);
