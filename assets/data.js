/* Diamond Group – fictional demonstration data.
 * Every page reads from this one model, so figures reconcile across screens.
 * All cash movements are dated events; balances, forecasts, receivables and
 * commitments are all derived from the same list of events.
 */
(function (root) {
  'use strict';

  // ---------- date helpers (whole days since 1970, UTC) ----------
  const DAY = 86400000;
  const D = (y, m, d) => Math.round(Date.UTC(y, m - 1, d) / DAY);
  const toDate = n => new Date(n * DAY);
  const dow = n => toDate(n).getUTCDay();
  const iso = n => toDate(n).toISOString().slice(0, 10);
  const ymKey = n => iso(n).slice(0, 7);
  const parts = n => { const t = toDate(n); return [t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate()]; };
  const HOLIDAYS = new Set([
    D(2025, 12, 25), D(2025, 12, 26), D(2026, 1, 1), D(2026, 4, 3), D(2026, 4, 6), D(2026, 5, 4), D(2026, 5, 25),
    D(2026, 8, 31), D(2026, 12, 25), D(2026, 12, 28), D(2027, 1, 1), D(2027, 3, 26), D(2027, 3, 29), D(2027, 5, 3), D(2027, 5, 31)
  ]);
  const isWork = n => dow(n) !== 0 && dow(n) !== 6 && !HOLIDAYS.has(n);
  const workFwd = n => { while (!isWork(n)) n++; return n; };
  const workBack = n => { while (!isWork(n)) n--; return n; };
  const lastWorkday = (y, m) => workBack(D(y, m + 1, 0));
  const eomPlus = (n, k) => { const [y, m] = parts(n); return D(y, m + 1 + k, 0); }; // end of month k months after n's month

  const AS_AT = D(2026, 12, 4);
  const START = D(2025, 12, 1);
  const END = D(2027, 5, 31);
  const HIST_START = D(2025, 7, 1);

  // ---------- seeded random ----------
  let seed = 20261125;
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const R = (a, b) => a + (b - a) * rnd();
  const RI = (a, b) => Math.floor(R(a, b + 1));
  const pick = a => a[Math.floor(rnd() * a.length)];
  const round = (v, s = 1) => Math.round(v / s) * s;
  const pois = lambda => { let L = Math.exp(-lambda), k = 0, p = 1; do { k++; p *= rnd(); } while (p > L); return k - 1; };

  // ---------- months ----------
  const MONTHS = [];
  for (let i = 0; i < 18; i++) {
    const s = D(2025, 12 + i, 1), e = D(2025, 13 + i, 0);
    const [y, m] = parts(s);
    MONTHS.push({
      i, key: ymKey(s), start: s, end: e, y, m,
      label: toDate(s).toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' }) + ' ' + String(y).slice(2),
      long: toDate(s).toLocaleString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }),
      actual: e <= AS_AT || s <= AS_AT,
      partial: s <= AS_AT && e > AS_AT
    });
  }

  // ---------- businesses ----------
  const BUSINESSES = [
    {
      id: 'dge', name: 'Diamond Green Energy', short: 'Green Energy', tagline: 'Solar PV & battery storage',
      colour: '#1FA67A', soft: '#E3F6EF', logo: 'assets/dge-logo.svg',
      remoteLogo: 'https://diamondgreen.energy/app/themes/diamond-green/resources/images/diamond-logo.svg',
      sub: 'green energy', buffer: 110000, target: 312380,
      banks: [{ bank: 'Lloyds Bank', name: 'Business Current', mask: '4417', share: 0.86 }, { bank: 'Lloyds Bank', name: 'Business Instant Access', mask: '8820', share: 0.14 }]
    },
    {
      id: 'climate', name: 'Diamond Climate', short: 'Climate', tagline: 'Heat pumps, air con, boilers & heating',
      colour: '#2B7BD0', soft: '#E4EFFA', logo: 'assets/climate-logo.svg', sub: 'climate', buffer: 40000, target: 21940,
      banks: [{ bank: 'Lloyds Bank', name: 'Business Current', mask: '2093', share: 1 }]
    },
    {
      id: 'ppm', name: 'Diamond PPM', short: 'PPM', tagline: 'Servicing, maintenance & repairs',
      colour: '#D4732A', soft: '#FBEDE2', logo: 'assets/ppm-logo.svg', sub: 'ppm', buffer: 50000, target: 91260,
      banks: [{ bank: 'NatWest', name: 'Business Current', mask: '5562', share: 0.93 }, { bank: 'GoCardless', name: 'Direct Debit clearing', mask: 'DD01', share: 0.07 }]
    }
  ];
  const BIZ = Object.fromEntries(BUSINESSES.map(b => [b.id, b]));
  const GROUP_BUFFER = 200000; // about one month of wages + PAYE across the group

  // ---------- customers ----------
  const FIRST = ['James', 'Clare', 'Mark', 'Helen', 'David', 'Sarah', 'Tom', 'Priya', 'Raj', 'Graham', 'Fiona', 'Paul', 'Karen', 'Steve', 'Julie', 'Andrew', 'Nicola', 'Richard', 'Emma', 'Gareth', 'Louise', 'Neil', 'Joanne', 'Simon', 'Rachel', 'Martin', 'Amanda', 'Chris', 'Lisa', 'Peter', 'Hannah', 'Ian', 'Debbie', 'Kevin', 'Sophie', 'Gary', 'Michelle', 'Dean', 'Zoe', 'Rob', 'Kate', 'Lee', 'Tracey', 'Jon', 'Alison', 'Matt', 'Claire', 'Darren', 'Vicky', 'Adam', 'Natalie', 'Phil', 'Joanna', 'Colin', 'Sue', 'Barry', 'Margaret', 'Keith', 'Yvonne', 'Tomasz', 'Agnieszka', 'Aisha', 'Mohammed', 'Chloe', 'Callum', 'Bethany', 'Ollie', 'Freya'];
  const LAST = ['Hollis', 'Barker', 'Whitfield', 'Patel', "O'Connor", 'Kowalski', 'Harrington', 'Gale', 'Pennington', 'Hussain', 'Lambert', 'Cartwright', 'Davies', 'Fletcher', 'Marsh', 'Okafor', 'Thornton', 'Bridger', 'Sutherland', 'Webb', 'Ashdown', 'McLean', 'Grant', 'Fraser', 'Sinclair', 'Norris', 'Reeves', 'Chapman', 'Cooke', 'Doyle', 'Ellis', 'Foster', 'Gibbs', 'Hale', 'Ingram', 'Jarvis', 'Kerr', 'Lowe', 'Mason', 'Nash', 'Oakley', 'Pike', 'Quinn', 'Rowe', 'Shaw', 'Tucker', 'Vaughan', 'Wade', 'Yates', 'Ahmed', 'Singh', 'Nowak', 'Bennett', 'Crawford', 'Dunn', 'Everett', 'Goddard', 'Hammond', 'Langley', 'Morley', 'Penfold', 'Russell', 'Stokes', 'Turnbull', 'Whitlock', 'Abbott', 'Blake', 'Coleman', 'Dawson', 'Fenwick', 'Gilbert', 'Holloway', 'Kemp', 'Lister', 'Mercer', 'Newman', 'Osborne', 'Palmer', 'Ridley', 'Sharp', 'Tilbury', 'Upton', 'Warner'];
  const TOWNS = [
    ['Alverstoke, Gosport', 'PO12', 9, ['Anglesey Road', 'Little Anglesey Road', 'Jellicoe Avenue', 'Clayhall Road', 'Western Way', 'The Avenue', 'Village Road', 'Crescent Road']],
    ['Gosport', 'PO12', 12, ['Brockhurst Road', 'Forton Road', 'Bury Road', 'Stoke Road', 'Elson Road', 'Privett Road', 'Fort Road', "Ann's Hill Road"]],
    ['Lee-on-the-Solent', 'PO13', 9, ['Marine Parade West', 'Manor Way', 'Milvil Road', 'Elmore Avenue', 'Russell Road', 'Portsmouth Road', 'Cambridge Road']],
    ['Stubbington', 'PO14', 7, ['Stubbington Lane', 'Mays Lane', 'Bells Lane', 'Cuckoo Lane', 'Ranvilles Lane', 'Gosport Road']],
    ['Fareham', 'PO16', 10, ['Highlands Road', 'Gudge Heath Lane', 'Kiln Road', 'Wickham Road', 'Paxton Road', 'Uplands Crescent']],
    ['Titchfield', 'PO14', 4, ['South Street', 'West Street', 'Coach Hill', 'Southampton Hill']],
    ['Portchester', 'PO16', 6, ['Castle Street', 'White Hart Lane', 'Westlands Grove', 'Cornaway Lane', 'Hospital Lane']],
    ['Locks Heath', 'SO31', 6, ['Locks Road', 'Abshot Road', 'Church Road', 'Fleet End Road', 'Hunts Pond Road']],
    ['Warsash', 'SO31', 4, ['Brook Lane', 'Warsash Road', 'Newtown Road', 'Shore Road']],
    ['Southsea', 'PO4', 6, ['Craneswater Park', 'Festing Grove', 'Eastern Parade', 'Lennox Road South', "St Ronan's Road"]],
    ['Havant', 'PO9', 4, ['Emsworth Road', 'Bosmere Gardens', 'Park Road North', 'Grove Road']],
    ['Waterlooville', 'PO7', 4, ['London Road', 'Stakes Hill Road', 'Hart Plain Avenue', 'Milton Road']],
    ['Hayling Island', 'PO11', 3, ['Sea Front', 'Manor Road', 'Southwood Road', 'Staunton Avenue']],
    ['Whiteley', 'PO15', 4, ['Yew Tree Drive', 'Rookery Avenue', 'Bluebell Way']],
    ['Wickham', 'PO17', 2, ['Fareham Road', 'Southwick Road', 'Mill Lane']],
    ['Emsworth', 'PO10', 2, ['Bath Road', 'Havant Road', 'Victoria Road']],
    ['Hedge End', 'SO30', 3, ["St John's Road", 'Lower Northam Road', 'Woodhouse Lane']],
    ["Bishop's Waltham", 'SO32', 2, ['Free Street', 'Hoe Road', 'Winchester Road']]
  ];
  const TOWN_W = TOWNS.reduce((s, t) => s + t[2], 0);
  const pickTown = () => { let r = rnd() * TOWN_W; for (const t of TOWNS) { r -= t[2]; if (r <= 0) return t; } return TOWNS[0]; };
  const PC_L = 'ABDEFGHJLNPQRSTUWXYZ';
  const postcode = out => `${out} ${RI(1, 9)}${pick(PC_L.split(''))}${pick(PC_L.split(''))}`;
  const SOURCES = ['Checkatrade', 'Google search', 'Referral', 'Trustpilot', 'Repeat customer', 'Facebook', 'Van signage'];

  const customers = [];
  const CUST = {};
  let custSeq = 10380;
  function addCustomer(c) {
    c.id = c.id || 'C-' + (custSeq++);
    c.jobs = []; c.plans = c.plans || []; c.history = c.history || [];
    customers.push(c); CUST[c.id] = c; return c;
  }
  function newDomestic() {
    const t = pickTown();
    const last = pick(LAST), f1 = pick(FIRST);
    const couple = rnd() < 0.42;
    const name = couple ? `${f1} & ${pick(FIRST.filter(x => x !== f1))} ${last}` : `${f1} ${last}`;
    return addCustomer({
      name, type: 'Domestic', address: `${RI(1, 148)} ${pick(t[3])}`, town: t[0], postcode: postcode(t[1]),
      phone: `07700 900${String(RI(0, 999)).padStart(3, '0')}`,
      email: `${f1.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, '').slice(0, 3)}•••@${pick(['gmail.com', 'outlook.com', 'btinternet.com', 'icloud.com'])}`,
      source: pick(SOURCES)
    });
  }
  const COMMERCIAL = [
    ['Solent Marine Engineering Ltd', 'Gosport', 'PO12', 'Unit 3, Quay Lane'],
    ['Meon Valley Cold Stores Ltd', 'Wickham', 'PO17', 'Mayles Lane Farm'],
    ['Fareham Self Storage Ltd', 'Fareham', 'PO16', 'Newgate Lane'],
    ['Portchester Veterinary Group', 'Portchester', 'PO16', '41 West Street'],
    ['Stubbington Dental Practice', 'Stubbington', 'PO14', '12 The Green'],
    ['Bridgemary Motor Works Ltd', 'Gosport', 'PO13', 'Wych Lane'],
    ['Whiteley Logistics Hub Ltd', 'Whiteley', 'PO15', 'Unit 7, Fulmar Drive'],
    ['Haslar Boatworks Ltd', 'Gosport', 'PO12', 'Haslar Road']
  ];
  let comIdx = 0;
  function newCommercial() {
    const c = COMMERCIAL[comIdx++ % COMMERCIAL.length];
    return addCustomer({ name: c[0], type: 'Commercial', address: c[3], town: c[1], postcode: postcode(c[2]), phone: `01329 ${RI(200, 899)}${RI(100, 999)}`, email: `accounts@•••.co.uk`, source: pick(['Referral', 'Tender', 'LinkedIn', 'Repeat customer']) });
  }

  // ---------- suppliers ----------
  const SUP = {
    solarBos: ['Midsummer Wholesale', 'CEF (City Electrical Factors)', 'Edmundson Electrical'],
    inverter: ['Segen Ltd', 'Midsummer Wholesale'],
    scaffold: ['Solent Access Scaffolding Ltd', 'Meon Scaffold Services', 'Harbour Scaffolding Ltd'],
    heating: ['Plumb Center', 'City Plumbing', "Graham Plumbers' Merchant"],
    ac: ['Climate Center', 'Climate Center', 'Refrigeration Wholesalers Ltd'],
    elec: ['Solent Electrical Contractors Ltd', 'Hamble Electrical Services'],
    parts: ['City Plumbing', 'Plumb Center', 'Plumbase']
  };

  // ---------- bulk stock lots ----------
  // pays: [date, fraction]. delivered: date units become available.
  const lots = [
    { id: 'LOT-2511-P', biz: 'dge', sku: 'panel', item: 'AIKO Neostar 2P 475W panels', supplier: 'Midsummer Wholesale', units: 1008, unitCost: 78.4, ordered: D(2025, 10, 20), delivered: D(2025, 11, 28), pays: [[D(2025, 10, 22), 0.3], [D(2025, 12, 12), 0.7]] },
    { id: 'LOT-2511-B', biz: 'dge', sku: 'battery', item: 'Sigenergy SigenStor 8 kWh battery modules', supplier: 'Segen Ltd', units: 48, unitCost: 2980, ordered: D(2025, 10, 6), delivered: D(2025, 11, 14), pays: [[D(2025, 12, 15), 1]] },
    { id: 'LOT-2603-P', biz: 'dge', sku: 'panel', item: 'AIKO Neostar 2P 475W panels (container)', supplier: 'Segen Ltd', units: 1512, unitCost: 76.1, ordered: D(2026, 2, 16), delivered: D(2026, 3, 27), pays: [[D(2026, 2, 18), 0.3], [D(2026, 4, 10), 0.7]] },
    { id: 'LOT-2603-B', biz: 'dge', sku: 'battery', item: 'Sigenergy SigenStor 8 kWh battery modules', supplier: 'Segen Ltd', units: 72, unitCost: 2940, ordered: D(2026, 2, 2), delivered: D(2026, 3, 6), pays: [[D(2026, 4, 7), 0.5], [D(2026, 5, 7), 0.5]] },
    { id: 'LOT-2607-P', biz: 'dge', sku: 'panel', item: 'AIKO Neostar 2P 475W panels (container)', supplier: 'Midsummer Wholesale', units: 1512, unitCost: 74.8, ordered: D(2026, 6, 8), delivered: D(2026, 7, 17), pays: [[D(2026, 6, 10), 0.3], [D(2026, 7, 31), 0.7]] },
    { id: 'LOT-2607-B', biz: 'dge', sku: 'battery', item: 'Sigenergy SigenStor 8 kWh battery modules', supplier: 'Segen Ltd', units: 72, unitCost: 2890, ordered: D(2026, 6, 1), delivered: D(2026, 7, 3), pays: [[D(2026, 8, 3), 0.5], [D(2026, 9, 3), 0.5]] },
    { id: 'LOT-2610-B', biz: 'dge', sku: 'battery', item: 'Sigenergy SigenStor 8 kWh battery modules', supplier: 'Segen Ltd', units: 48, unitCost: 2870, ordered: D(2026, 9, 7), delivered: D(2026, 10, 9), pays: [[D(2026, 11, 9), 1]] },
    { id: 'LOT-2701-P', biz: 'dge', sku: 'panel', item: 'AIKO Neostar 2P 480W panels (container)', supplier: 'Segen Ltd', units: 1512, unitCost: 72.9, ordered: D(2026, 11, 2), delivered: D(2027, 1, 8), pays: [[D(2026, 11, 4), 0.3], [D(2027, 1, 15), 0.7]] },
    { id: 'LOT-2702-B', biz: 'dge', sku: 'battery', item: 'Sigenergy SigenStor 8 kWh battery modules', supplier: 'Segen Ltd', units: 64, unitCost: 2850, ordered: D(2026, 11, 16), delivered: D(2027, 1, 29), pays: [[D(2027, 2, 26), 1]] },
    { id: 'LOT-2511-W', biz: 'climate', sku: 'boiler', item: 'Worcester Bosch Greenstar 4000 30kW combi', supplier: 'City Plumbing', units: 40, unitCost: 1145, ordered: D(2025, 11, 3), delivered: D(2025, 11, 24), pays: [[D(2025, 12, 31), 1]] },
    { id: 'LOT-2601-H', biz: 'climate', sku: 'ashp', item: 'Mitsubishi Ecodan 8.5kW air source heat pumps', supplier: 'Plumb Center', units: 20, unitCost: 3360, ordered: D(2025, 12, 15), delivered: D(2026, 1, 20), pays: [[D(2026, 2, 19), 1]] },
    { id: 'LOT-2605-W', biz: 'climate', sku: 'boiler', item: 'Worcester Bosch Greenstar 4000 30kW combi', supplier: 'City Plumbing', units: 40, unitCost: 1160, ordered: D(2026, 4, 27), delivered: D(2026, 5, 15), pays: [[D(2026, 6, 15), 1]] },
    { id: 'LOT-2606-H', biz: 'climate', sku: 'ashp', item: 'Daikin Altherma 3 R 8kW air source heat pumps', supplier: 'City Plumbing', units: 24, unitCost: 3420, ordered: D(2026, 5, 18), delivered: D(2026, 6, 12), pays: [[D(2026, 7, 13), 1]] },
    { id: 'LOT-2609-W', biz: 'climate', sku: 'boiler', item: 'Worcester Bosch Greenstar 4000 30kW combi', supplier: 'City Plumbing', units: 48, unitCost: 1150, ordered: D(2026, 8, 24), delivered: D(2026, 9, 18), pays: [[D(2026, 10, 19), 1]] },
    { id: 'LOT-2610-H', biz: 'climate', sku: 'ashp', item: 'Mitsubishi Ecodan 8.5kW air source heat pumps', supplier: 'Plumb Center', units: 20, unitCost: 3310, ordered: D(2026, 9, 7), delivered: D(2026, 10, 21), pays: [[D(2026, 11, 20), 1]] },
    { id: 'LOT-2701-H', biz: 'climate', sku: 'ashp', item: 'Mitsubishi Ecodan 8.5kW air source heat pumps', supplier: 'Plumb Center', units: 24, unitCost: 3280, ordered: D(2026, 11, 9), delivered: D(2027, 1, 22), pays: [[D(2027, 2, 5), 1]] }
  ];
  lots.forEach(l => { l.value = round(l.units * l.unitCost, 0.01); l.draws = []; l.remaining = l.units; });
  const SPOT_COST = { panel: 84, battery: 3240, ashp: 3690, boiler: 1265 };
  const SKU_LABEL = { panel: 'Solar panels', battery: 'Battery modules', ashp: 'Heat pumps', boiler: 'Combi boilers' };

  // ---------- jobs ----------
  const TYPES = {
    'Solar PV': { biz: 'dge', min: 6200, max: 10800, lead: [35, 115], plan: [0.25, 0.25, 0.5] },
    'Solar PV + Battery': { biz: 'dge', min: 11800, max: 19600, lead: [45, 140], plan: [0.25, 0.25, 0.5] },
    'Battery Storage': { biz: 'dge', min: 5400, max: 9600, lead: [21, 65], plan: [0.25, 0.25, 0.5] },
    'Commercial Solar PV': { biz: 'dge', min: 34000, max: 118000, lead: [95, 185], plan: [0.25, 0.25, 0.5] },
    'Air Source Heat Pump': { biz: 'climate', min: 9800, max: 16400, lead: [40, 125], plan: [0.25, 0.25, 0.5] },
    'Boiler Installation': { biz: 'climate', min: 2850, max: 5400, lead: [7, 28], plan: [0.25, 0, 0.75] },
    'Air Conditioning': { biz: 'climate', min: 2400, max: 9800, lead: [14, 45], plan: [0.25, 0, 0.75] },
    'Heating System Upgrade': { biz: 'climate', min: 3400, max: 8600, lead: [21, 60], plan: [0.25, 0, 0.75] }
  };
  const VAT_ZERO = new Set(['Solar PV', 'Solar PV + Battery', 'Battery Storage', 'Commercial Solar PV', 'Air Source Heat Pump']);
  const SEASON = {
    dge: [0.55, 0.7, 0.85, 1.1, 1.25, 1.3, 1.25, 1.15, 1.0, 1.05, 0.95, 0.8],   // Jan..Dec
    hp: [1.05, 1.0, 1.0, 0.9, 0.8, 0.7, 0.7, 0.8, 1.05, 1.25, 1.3, 0.9],
    boiler: [1.3, 1.1, 0.9, 0.8, 0.7, 0.65, 0.7, 0.8, 1.0, 1.3, 1.45, 1.1],
    ac: [0.4, 0.4, 0.6, 0.9, 1.4, 1.9, 2.0, 1.6, 1.0, 0.6, 0.5, 0.4]
  };
  const BASE = {
    'Solar PV': [7.2, 'dge'], 'Solar PV + Battery': [8.4, 'dge'], 'Battery Storage': [4.6, 'dge'], 'Commercial Solar PV': [0.45, 'dge'],
    'Air Source Heat Pump': [4.7, 'hp'], 'Boiler Installation': [7.4, 'boiler'], 'Air Conditioning': [3.2, 'ac'], 'Heating System Upgrade': [1.8, 'boiler']
  };

  const jobs = [];
  const JOB = {};
  const seq = { dge: 3021, climate: 1104, ppm: 20817 };
  const PREFIX = { dge: 'DGE', climate: 'DCL', ppm: 'PPM' };

  // winter / Christmas scheduling rules
  function scheduleInstall(type, sale, lead) {
    let d = sale + lead;
    const [y, m, dd] = parts(d);
    if ((m === 12 && dd >= 19) || (m === 1 && dd <= 4)) d = D(m === 12 ? y + 1 : y, 1, 5 + RI(0, 6));
    // solar crews slow down in deep winter: push ~40% of Dec/Jan roof jobs
    if (TYPES[type].biz === 'dge' && type !== 'Battery Storage') {
      const mm = parts(d)[1];
      if ((mm === 12 || mm === 1) && rnd() < 0.4) d += RI(18, 35);
    }
    return workFwd(d);
  }
  function payDelay(kind) {
    const r = rnd();
    if (kind === 'deposit') return RI(0, 4);
    if (kind === 'commercial') return r < 0.5 ? RI(18, 32) : r < 0.85 ? RI(33, 50) : RI(51, 80);
    if (r < 0.55) return RI(0, 7);
    if (r < 0.8) return RI(8, 21);
    if (r < 0.92) return RI(22, 45);
    return RI(46, 110);
  }

  function makeJob(type, sale, opt = {}) {
    const T = TYPES[type];
    const biz = T.biz;
    const value = opt.value || round(R(T.min, T.max), type === 'Commercial Solar PV' ? 50 : 10);
    const lead = opt.lead || RI(T.lead[0], T.lead[1]);
    const install = opt.install || scheduleInstall(type, sale, lead);
    const cust = opt.customer || (type === 'Commercial Solar PV' ? newCommercial() : newDomestic());
    const id = `${PREFIX[biz]}-${seq[biz]++}`;
    const job = { id, biz, type, customerId: cust.id, customer: cust.name, town: cust.town, value, sale, install, pipeline: !!opt.pipeline, stages: [], costs: [], draws: [] };
    // spec
    if (biz === 'dge') {
      if (type === 'Solar PV') job.panels = RI(10, 18);
      if (type === 'Solar PV + Battery') { job.panels = RI(10, 20); job.batteries = rnd() < 0.55 ? 1 : 2; }
      if (type === 'Battery Storage') job.batteries = rnd() < 0.6 ? 1 : 2;
      if (type === 'Commercial Solar PV') job.panels = round(value / 470, 1);
      if (job.panels) job.kwp = round(job.panels * 0.475, 0.01);
    } else {
      if (type === 'Air Source Heat Pump') job.hp = 1;
      if (type === 'Boiler Installation') job.boiler = 1;
    }
    // stage payments
    const commercial = type === 'Commercial Solar PV';
    const [p1, p2, p3] = T.plan;
    const preInv = workFwd(sale + RI(10, 32));
    const stages = [];
    stages.push({ stage: 'Deposit', pct: p1, inv: sale, due: sale + 3, kind: 'deposit' });
    if (p2) stages.push({ stage: 'Pre-order', pct: p2, inv: Math.min(preInv, install - 7), due: Math.min(preInv, install - 7) + 7, kind: 'pre' });
    stages.push({ stage: 'Completion', pct: p3, inv: install, due: install + (commercial ? 30 : 14), kind: 'completion' });
    let allocated = 0;
    stages.forEach((s, i) => {
      s.amount = i === stages.length - 1 ? round(value - allocated, 0.01) : round(value * s.pct, 0.01);
      allocated += s.amount;
      const delay = s.kind === 'deposit' ? payDelay('deposit') : commercial ? payDelay('commercial') : s.kind === 'pre' ? RI(1, 10) : payDelay();
      s.paid = workFwd(s.inv + delay);
    });
    job.stages = stages;
    // per-job purchases
    const poDate = p2 ? stages[1].inv + RI(1, 4) : workFwd(sale + RI(5, 12));
    const cost = (desc, supplier, amount, raised, due, kind = 'Materials') => job.costs.push({ desc, supplier, amount: round(amount, 0.01), raised, due: workFwd(due), kind });
    if (type === 'Solar PV' || type === 'Solar PV + Battery') {
      cost(type === 'Solar PV' ? 'String inverter, optimisers & isolators' : 'Hybrid inverter, gateway & isolators', pick(SUP.inverter), type === 'Solar PV' ? R(620, 980) : R(1050, 1480), poDate, eomPlus(poDate, 1));
      cost('Mounting rails, hooks, cabling & sundries', pick(SUP.solarBos), R(480, 820), poDate, eomPlus(poDate, 1));
      cost('Scaffold erect & strike', pick(SUP.scaffold), R(720, 1050), install - 2, install + 30, 'Subcontract');
    } else if (type === 'Battery Storage') {
      cost('Battery inverter & gateway', pick(SUP.inverter), R(900, 1250), poDate, eomPlus(poDate, 1));
      cost('Cabling, isolators & sundries', pick(SUP.solarBos), R(180, 320), poDate, eomPlus(poDate, 1));
    } else if (type === 'Commercial Solar PV') {
      cost('Three-phase inverters & monitoring', pick(SUP.inverter), value * R(0.08, 0.11), poDate, eomPlus(poDate, 1));
      cost('Mounting system, DC/AC cabling & switchgear', pick(SUP.solarBos), value * R(0.07, 0.09), poDate, eomPlus(poDate, 1));
      cost('Access equipment & edge protection', pick(SUP.scaffold), value * R(0.035, 0.05), install - 5, install + 30, 'Subcontract');
      cost('G99 DNO application & commissioning', 'Hamble Electrical Services', R(1400, 2600), sale + 20, sale + 50, 'Subcontract');
    } else if (type === 'Air Source Heat Pump') {
      cost('Cylinder, radiators, pipework & controls', pick(SUP.heating), R(1850, 3400), poDate, eomPlus(poDate, 1));
      cost('Electrical supply & isolation', pick(SUP.elec), R(380, 640), install, install + 14, 'Subcontract');
    } else if (type === 'Boiler Installation') {
      cost('Flue, filter, controls & fittings', pick(SUP.heating), R(240, 520), install - 4, eomPlus(install, 1));
    } else if (type === 'Air Conditioning') {
      cost('Split units, line sets & condensate pumps', pick(SUP.ac), value * R(0.34, 0.42), poDate, eomPlus(poDate, 1));
    } else if (type === 'Heating System Upgrade') {
      cost('Radiators, valves, pipework & cylinder', pick(SUP.heating), value * R(0.3, 0.38), poDate, eomPlus(poDate, 1));
    }
    jobs.push(job); JOB[id] = job; cust.jobs.push(id);
    return job;
  }

  // ---- featured CRM customers (multi-service) ----
  function featured(c) { c.featured = true; return addCustomer(c); }
  const F = {};
  F.pennington = featured({ id: 'C-10021', name: 'Helen & Mark Pennington', type: 'Domestic', address: '14 Anglesey Road', town: 'Alverstoke, Gosport', postcode: 'PO12 2DX', phone: '07700 900418', email: 'helen.penn•••@gmail.com', source: 'Referral', since: 2019, rating: 5,
    history: [{ date: D(2019, 3, 14), biz: 'climate', service: 'Boiler Installation', value: 2840, note: 'Worcester Bosch Greenstar 30i – installed by Diamond Gas & Heating' }],
    plans: [{ plan: 'Boiler Care', from: D(2019, 4, 1), to: D(2026, 6, 30) }, { plan: 'Solar & Battery Care', from: D(2026, 1, 1) }, { plan: 'Heat Pump Care', from: D(2026, 7, 1) }] });
  F.okafor = featured({ id: 'C-10087', name: 'David Okafor', type: 'Domestic', address: '7 Milvil Road', town: 'Lee-on-the-Solent', postcode: 'PO13 9LU', phone: '07700 900263', email: 'd.okafor•••@outlook.com', source: 'Checkatrade', since: 2023, rating: 5,
    history: [{ date: D(2024, 5, 22), biz: 'dge', service: 'Solar PV', value: 8950, note: '14 × 430W panels, 6.02 kWp' }],
    plans: [{ plan: 'Boiler Care', from: D(2023, 10, 1) }, { plan: 'Solar & Battery Care', from: D(2024, 6, 1) }] });
  F.whitfield = featured({ id: 'C-10154', name: 'Sarah & Tom Whitfield', type: 'Domestic', address: '22 Fleet End Road', town: 'Locks Heath', postcode: 'SO31 9JH', phone: '07700 900571', email: 'sarah.whit•••@icloud.com', source: 'Google search', since: 2025, rating: 5,
    plans: [{ plan: 'Heating Care Plus', from: D(2026, 2, 1) }] });
  F.harbourside = featured({ id: 'C-10003', name: 'Harbourside Lettings Ltd', type: 'Landlord', address: '3 High Street', town: 'Gosport', postcode: 'PO12 1DS', phone: '023 9258 0144', email: 'maintenance@•••lettings.co.uk', source: 'Tender', since: 2021, rating: 4,
    history: [{ date: D(2023, 9, 1), biz: 'ppm', service: 'Landlord PPM contract', value: 61200, note: 'Contract years 2021–2024 (gas safety, servicing, call-outs)' }] });
  F.anchorage = featured({ id: 'C-10009', name: 'Anchorage Care Homes Ltd', type: 'Commercial', address: 'Anchorage House, Highlands Road', town: 'Fareham', postcode: 'PO15 6HN', phone: '01329 552210', email: 'facilities@•••carehomes.co.uk', source: 'Referral', since: 2022, rating: 5,
    history: [{ date: D(2023, 4, 1), biz: 'ppm', service: 'Commercial PPM contract', value: 54200, note: 'Contract years 2022–2025' }] });
  F.patel = featured({ id: 'C-10233', name: 'Priya & Raj Patel', type: 'Domestic', address: '41 Mays Lane', town: 'Stubbington', postcode: 'PO14 2EW', phone: '07700 900819', email: 'priya.pat•••@gmail.com', source: 'Trustpilot', since: 2026, rating: 5,
    plans: [{ plan: 'Solar & Battery Care', from: D(2026, 6, 1) }] });
  F.lowe = featured({ id: 'C-10061', name: 'Graham Lowe', type: 'Domestic', address: '9 Coach Hill', town: 'Titchfield', postcode: 'PO14 4DU', phone: '07700 900137', email: 'g.lowe•••@btinternet.com', source: 'Repeat customer', since: 2021, rating: 4,
    history: [{ date: D(2022, 1, 18), biz: 'climate', service: 'Boiler Installation', value: 3180, note: 'Vaillant ecoTEC plus 832 – Diamond Gas & Heating' }],
    plans: [{ plan: 'Boiler Care', from: D(2022, 2, 1) }, { plan: 'Solar & Battery Care', from: D(2026, 7, 1) }] });
  F.marsh = featured({ id: 'C-10119', name: 'Fiona Marsh', type: 'Domestic', address: '6 Craneswater Park', town: 'Southsea', postcode: 'PO4 0NU', phone: '07700 900692', email: 'fiona.mar•••@gmail.com', source: 'Google search', since: 2024, rating: 5,
    history: [{ date: D(2024, 7, 9), biz: 'climate', service: 'Air Conditioning', value: 4260, note: 'Mitsubishi MSZ-AP35 to home office' }],
    plans: [{ plan: 'Heat Pump Care', from: D(2026, 3, 1) }] });

  // featured jobs (fixed values / dates)
  makeJob('Solar PV + Battery', D(2025, 9, 18), { customer: F.pennington, value: 17460, install: D(2025, 12, 9) });
  makeJob('Air Source Heat Pump', D(2026, 3, 4), { customer: F.pennington, value: 14280, install: D(2026, 6, 16) });
  makeJob('Battery Storage', D(2026, 10, 12), { customer: F.okafor, value: 7980, install: D(2026, 12, 3) });
  makeJob('Boiler Installation', D(2026, 1, 12), { customer: F.whitfield, value: 3960, install: D(2026, 1, 27) });
  makeJob('Air Conditioning', D(2026, 5, 18), { customer: F.whitfield, value: 5480, install: D(2026, 6, 22) });
  [D(2026, 1, 20), D(2026, 3, 9), D(2026, 5, 11), D(2026, 8, 3), D(2026, 10, 19), D(2026, 11, 16)].forEach((d, i) =>
    makeJob('Boiler Installation', d, { customer: F.harbourside, value: [3420, 3380, 3510, 3460, 3540, 3490][i], install: workFwd(d + 12) }));
  makeJob('Commercial Solar PV', D(2026, 7, 20), { customer: F.anchorage, value: 71800, install: D(2026, 12, 14) });
  makeJob('Air Conditioning', D(2026, 4, 27), { customer: F.anchorage, value: 8940, install: D(2026, 5, 26) });
  makeJob('Solar PV + Battery', D(2026, 4, 8), { customer: F.patel, value: 15950, install: D(2026, 5, 28) });
  makeJob('Air Source Heat Pump', D(2026, 10, 27), { customer: F.patel, value: 13640, install: D(2027, 1, 19) });
  makeJob('Solar PV', D(2026, 5, 6), { customer: F.lowe, value: 8420, install: D(2026, 6, 30) });
  makeJob('Air Source Heat Pump', D(2026, 2, 2), { customer: F.marsh, value: 12880, install: D(2026, 3, 24) });

  // ---- generated jobs: contracted (sold up to as-at) and pipeline (expected new sales) ----
  const salesStart = D(2025, 7, 1);
  const salesEnd = D(2027, 4, 30);
  for (let mStart = salesStart; mStart <= salesEnd;) {
    const [y, m] = parts(mStart);
    const mEnd = D(y, m + 1, 0);
    Object.entries(BASE).forEach(([type, [base, season]]) => {
      const lambda = base * SEASON[season][m - 1] * (mStart >= D(2026, 1, 1) ? 1.06 : 1); // modest growth in 2026
      const n = pois(lambda);
      for (let k = 0; k < n; k++) {
        const sale = workFwd(mStart + RI(0, mEnd - mStart));
        if (sale > mEnd) continue;
        const pipeline = sale > AS_AT;
        makeJob(type, sale, { pipeline });
      }
    });
    mStart = mEnd + 1;
  }
  // drop jobs entirely finished before the window
  for (let i = jobs.length - 1; i >= 0; i--) {
    const j = jobs[i];
    const lastEvent = Math.max(...j.stages.map(s => s.paid), ...j.costs.map(c => c.due), j.install);
    if (lastEvent < START && !CUST[j.customerId].featured) { jobs.splice(i, 1); delete JOB[j.id]; const c = CUST[j.customerId]; c.jobs = c.jobs.filter(x => x !== j.id); }
  }
  jobs.sort((a, b) => a.sale - b.sale);

  // ---- stock consumption (FIFO by install date) ----
  const byInstall = jobs.slice().sort((a, b) => a.install - b.install);
  function draw(job, sku, units) {
    let need = units;
    for (const lot of lots) {
      if (lot.sku !== sku || lot.biz !== job.biz || lot.delivered > job.install || lot.remaining <= 0) continue;
      const take = Math.min(need, lot.remaining);
      lot.remaining -= take; need -= take;
      lot.draws.push({ job: job.id, date: job.install, units: take, pipeline: job.pipeline });
      job.draws.push({ lot: lot.id, sku, units: take, value: round(take * lot.unitCost, 0.01) });
      if (!need) break;
    }
    if (need > 0) {
      const cost = need * SPOT_COST[sku];
      job.costs.push({ desc: `Spot purchase – ${need} × ${SKU_LABEL[sku].toLowerCase()} (bulk stock exhausted)`, supplier: sku === 'panel' || sku === 'battery' ? 'Midsummer Wholesale' : 'Plumb Center', amount: round(cost, 0.01), raised: job.install - 6, due: workFwd(eomPlus(job.install, 1)), kind: 'Materials', spot: true });
      job.spot = (job.spot || 0) + need;
    }
  }
  byInstall.forEach(j => {
    if (j.install < D(2025, 11, 14)) return; // pre-window installs used older stock
    if (j.panels) draw(j, 'panel', j.panels);
    if (j.batteries) draw(j, 'battery', j.batteries);
    if (j.hp) draw(j, 'ashp', 1);
    if (j.boiler) draw(j, 'boiler', 1);
  });

  // a realistic tail of slow payers on recent completions
  const slowPool = jobs.filter(j => !j.pipeline && j.biz !== 'ppm' && j.install >= D(2026, 8, 20) && j.install <= D(2026, 10, 30) && !CUST[j.customerId].featured)
    .sort((a, b) => b.value - a.value);
  [slowPool[0], slowPool[2], ...slowPool.filter((_, i) => i % 8 === 5).slice(0, 8)].filter(Boolean).forEach(j => {
    const s = j.stages[j.stages.length - 1];
    s.paid = workFwd(AS_AT + RI(9, 38));
    j.slow = true;
  });

  // ---------- cash flow events ----------
  const flows = [];
  let fseq = 1;
  function inflow(biz, date, amount, cat, o) {
    if (date < START || date > END || !amount) return;
    flows.push(Object.assign({ id: fseq++, biz, date, amount: round(amount, 0.01), dir: 1, cat }, o));
  }
  function outflow(biz, date, amount, cat, o) {
    if (date < START || date > END || !amount) return;
    flows.push(Object.assign({ id: fseq++, biz, date, amount: round(amount, 0.01), dir: -1, cat }, o));
  }

  // job receipts & costs
  let invSeq = { dge: 24410, climate: 8120, ppm: 51200 };
  jobs.forEach(j => {
    j.stages.forEach(s => {
      s.invNo = s.inv <= AS_AT || j.pipeline ? `INV-${PREFIX[j.biz]}-${invSeq[j.biz]++}` : null;
      let state;
      if (j.pipeline) state = 'pipeline';
      else if (s.paid <= AS_AT) state = 'received';
      else if (s.inv <= AS_AT) state = 'invoiced';
      else state = 'forecast';
      s.state = state;
      if (state === 'invoiced') s.overdue = Math.max(0, AS_AT - s.due);
      inflow(j.biz, s.paid, s.amount, 'Customer receipts', { state, party: j.customer, ref: j.id, job: j.id, desc: `${s.stage} ${Math.round(s.pct * 100)}% – ${j.type}`, inv: s.inv, due: s.due, invNo: s.invNo, zero: VAT_ZERO.has(j.type) });
    });
    j.costs.forEach(c => {
      let state;
      if (c.due <= AS_AT) state = 'paid';
      else if (j.pipeline) state = 'planned';
      else if (c.raised <= AS_AT) state = 'committed';
      else state = 'planned';
      c.state = state;
      outflow(j.biz, c.due, c.amount, c.kind, { state, party: c.supplier, ref: j.id, job: j.id, desc: c.desc, raised: c.raised });
    });
  });

  // bulk lots
  lots.forEach(l => {
    l.payments = l.pays.map(([d, f]) => ({ date: d, amount: round(l.value * f, 0.01), state: d <= AS_AT ? 'paid' : 'committed' }));
    l.payments.forEach(p => outflow(l.biz, p.date, p.amount, 'Bulk stock', { state: p.state, party: l.supplier, ref: l.id, lot: l.id, desc: `${l.item} – ${l.units.toLocaleString('en-GB')} units`, raised: l.ordered }));
  });

  // ---------- PPM: plans, contracts, reactive work ----------
  const PLANS = [
    { plan: 'Boiler Care', price: 14.5, from: 1418, to: 1602 },
    { plan: 'Heating Care Plus', price: 21.0, from: 516, to: 604 },
    { plan: 'Heat Pump Care', price: 24.5, from: 92, to: 188 },
    { plan: 'Solar & Battery Care', price: 9.5, from: 214, to: 436 }
  ];
  const planMonths = [];
  MONTHS.forEach((mo, i) => {
    const f = i / 17;
    const counts = PLANS.map(p => Math.round(p.from + (p.to - p.from) * Math.pow(f, 0.95) + (i ? RI(-4, 4) : 0)));
    const gross = PLANS.reduce((s, p, k) => s + counts[k] * p.price, 0);
    const collected = gross * (1 - 0.014); // failed collections
    const fee = collected * 0.01 + counts.reduce((a, b) => a + b, 0) * 0.2 * 0.1;
    const date = workFwd(workFwd(mo.start) + 4); // GoCardless payout
    planMonths.push({ key: mo.key, counts, gross: round(gross, 0.01), collected: round(collected, 0.01) });
    inflow('ppm', date, collected, 'Service plans (Direct Debit)', { state: date <= AS_AT ? 'received' : 'forecast', party: 'GoCardless payout', ref: `DD-${mo.key}`, desc: `${counts.reduce((a, b) => a + b, 0).toLocaleString('en-GB')} plan holders – monthly collection`, recurring: true });
    outflow('ppm', date, fee, 'Overheads', { state: date <= AS_AT ? 'paid' : 'committed', party: 'GoCardless', ref: `DD-${mo.key}`, desc: 'Direct Debit collection fees' });
  });

  const CONTRACTS = [
    { customer: F.harbourside, desc: 'Landlord PPM – 124 units (CP12, servicing, call-outs)', annual: 38400, startM: 1, lateness: 'late' },
    { customer: F.anchorage, desc: 'Commercial PPM – 3 care homes (boilers, AC, legionella)', annual: 21600, startM: 2, lateness: 'ok' },
    { name: 'Meon Lettings Ltd', town: 'Fareham', desc: 'Landlord PPM – 86 units', annual: 24900, startM: 3, lateness: 'ok' },
    { name: 'Solent Coast Holiday Park Ltd', town: 'Hayling Island', desc: 'Site PPM – 42 lodges & clubhouse plant', annual: 17800, startM: 1, lateness: 'late' },
    { name: 'Brockhurst Business Centre', town: 'Gosport', desc: 'Commercial PPM – heating & AC plant', annual: 12600, startM: 2, lateness: 'ok' },
    { name: 'Hamble Point Apartments Management Co', town: 'Warsash', desc: 'Communal boiler plant & 48 flats', annual: 15400, startM: 3, lateness: 'very' },
    { name: 'Portchester Dental Care', town: 'Portchester', desc: 'AC & heating PPM – 2 surgeries', annual: 4200, startM: 1, lateness: 'ok' },
    { name: 'Waterside Nursery Group', town: 'Fareham', desc: 'PPM – 3 nursery sites', annual: 9600, startM: 2, lateness: 'ok' },
    { name: 'The Crescent Residents Management Co', town: 'Alverstoke, Gosport', desc: 'Communal heating PPM', annual: 7800, startM: 3, lateness: 'late' },
    { name: 'Stokes Bay Sailing Club', town: 'Gosport', desc: 'Clubhouse heating, hot water & AC', annual: 3600, startM: 1, lateness: 'ok' },
    { name: 'Lee Point Residents Association', town: 'Lee-on-the-Solent', desc: 'Communal boiler PPM – 36 flats', annual: 8400, startM: 2, lateness: 'ok' },
    { name: 'Fareham Self Storage Ltd', town: 'Fareham', desc: 'Office HVAC PPM', annual: 3000, startM: 3, lateness: 'ok' }
  ];
  const contracts = CONTRACTS.map((c, k) => {
    const cust = c.customer || addCustomer({ name: c.name, type: c.desc.startsWith('Landlord') ? 'Landlord' : 'Commercial', address: '', town: c.town, postcode: postcode('PO1' + RI(2, 6)), phone: `01329 ${RI(200, 899)}${RI(100, 999)}`, email: 'accounts@•••.co.uk', source: 'Tender' });
    const con = { id: `CON-${String(301 + k)}`, customerId: cust.id, customer: cust.name, desc: c.desc, annual: c.annual, quarterly: round(c.annual / 4, 0.01), invoices: [] };
    for (let q = 0; q < 8; q++) {
      const inv = workFwd(D(2025, 11 + c.startM + q * 3, 1));
      if (inv > END) break;
      const delay = c.lateness === 'very' ? RI(48, 85) : c.lateness === 'late' ? RI(30, 58) : RI(14, 32);
      const paid = workFwd(inv + delay);
      const state = paid <= AS_AT ? 'received' : inv <= AS_AT ? 'invoiced' : 'forecast';
      const invNo = inv <= AS_AT ? `INV-PPM-${invSeq.ppm++}` : null;
      con.invoices.push({ inv, due: inv + 30, paid, state, amount: con.quarterly, invNo });
      inflow('ppm', paid, con.quarterly, 'PPM contracts', { state, party: cust.name, ref: con.id, desc: `${c.desc} – quarterly in advance`, inv, due: inv + 30, invNo, contract: con.id, recurring: true });
    }
    cust.contracts = (cust.contracts || []).concat(con.id);
    return con;
  });

  // reactive / one-off PPM work: individual jobs up to as-at, run-rate forecast after
  const PPM_TYPES = [
    { type: 'Boiler Service', w: 26, min: 96, max: 110 },
    { type: 'Heat Pump Service', w: 6, min: 145, max: 165 },
    { type: 'Gas Safety Certificate (CP12)', w: 16, min: 72, max: 85 },
    { type: 'Boiler Repair', w: 30, min: 125, max: 640 },
    { type: 'Heating Repair', w: 12, min: 110, max: 480 },
    { type: 'AC Service / Repair', w: 6, min: 140, max: 520 },
    { type: 'Solar & Battery Health Check', w: 4, min: 95, max: 140 }
  ];
  const PPM_W = PPM_TYPES.reduce((s, t) => s + t.w, 0);
  const pickPpm = () => { let r = rnd() * PPM_W; for (const t of PPM_TYPES) { r -= t.w; if (r <= 0) return t; } return PPM_TYPES[0]; };
  const ppmSeason = [1.35, 1.2, 1.0, 0.85, 0.75, 0.7, 0.75, 0.8, 0.95, 1.15, 1.3, 1.4];
  const reactiveByMonth = {};
  for (let d = START; d <= END; d++) {
    if (!isWork(d)) continue;
    const m = parts(d)[1];
    if (d <= AS_AT) {
      const n = pois(4.7 * ppmSeason[m - 1]);
      for (let k = 0; k < n; k++) {
        const t = pickPpm();
        const cust = rnd() < 0.18 && customers.length > 40 ? pick(customers.filter(c => c.type === 'Domestic')) : newDomestic();
        const value = round(R(t.min, t.max), t.max > 200 ? 5 : 1);
        const card = rnd() < 0.72;
        const paid = card ? d : workFwd(d + payDelay());
        const id = `PPM-${seq.ppm++}`;
        const job = { id, biz: 'ppm', type: t.type, customerId: cust.id, customer: cust.name, town: cust.town, value, sale: d, install: d, pipeline: false, stages: [], costs: [], draws: [] };
        const state = paid <= AS_AT ? 'received' : 'invoiced';
        const invNo = `INV-PPM-${invSeq.ppm++}`;
        job.stages.push({ stage: card ? 'Paid on completion (card)' : 'Invoice on completion', pct: 1, amount: value, inv: d, due: d + 14, paid, state, invNo, overdue: state === 'invoiced' ? Math.max(0, AS_AT - (d + 14)) : 0, kind: 'completion' });
        jobs.push(job); JOB[id] = job; cust.jobs.push(id);
        inflow('ppm', paid, value, 'Customer receipts', { state, party: cust.name, ref: id, job: id, desc: t.type, inv: d, due: d + 14, invNo });
        const k2 = ymKey(d); reactiveByMonth[k2] = (reactiveByMonth[k2] || 0) + value;
      }
    } else {
      const v = 4.7 * ppmSeason[m - 1] * 214 * R(0.9, 1.1);
      inflow('ppm', d, v, 'Customer receipts', { state: 'pipeline', party: 'Reactive & one-off work (run-rate)', ref: 'RUN-RATE', desc: 'Services, repairs & certificates – forecast from 12-month run-rate' });
      const k2 = ymKey(d); reactiveByMonth[k2] = (reactiveByMonth[k2] || 0) + v;
    }
  }
  // featured customer PPM visits (ensure visible history)
  [[F.pennington, 'Heat Pump Service', D(2026, 10, 14), 0], [F.pennington, 'Boiler Service', D(2025, 12, 4), 0], [F.okafor, 'Boiler Service', D(2026, 9, 22), 0], [F.okafor, 'Solar & Battery Health Check', D(2026, 4, 15), 0],
   [F.whitfield, 'Heating Repair', D(2026, 10, 30), 186], [F.lowe, 'Boiler Repair', D(2026, 2, 11), 245], [F.lowe, 'Boiler Service', D(2026, 9, 3), 0], [F.marsh, 'Heat Pump Service', D(2026, 9, 18), 0],
   [F.harbourside, 'Boiler Repair', D(2026, 11, 18), 412], [F.patel, 'Solar & Battery Health Check', D(2026, 11, 10), 0]].forEach(([c, type, d, v]) => {
    const id = `PPM-${seq.ppm++}`;
    const value = v; // £0 = covered by plan
    const job = { id, biz: 'ppm', type, customerId: c.id, customer: c.name, town: c.town, value, sale: d, install: d, pipeline: false, stages: [], costs: [], draws: [], covered: !v };
    if (v) {
      const paid = c.type === 'Domestic' ? d : workFwd(d + 30);
      const state = paid <= AS_AT ? 'received' : 'invoiced';
      const invNo = `INV-PPM-${invSeq.ppm++}`;
      job.stages.push({ stage: 'Invoice on completion', pct: 1, amount: v, inv: d, due: d + 14, paid, state, invNo, overdue: 0, kind: 'completion' });
      inflow('ppm', paid, v, 'Customer receipts', { state, party: c.name, ref: id, job: id, desc: type, inv: d, due: d + 14, invNo });
    }
    jobs.push(job); JOB[id] = job; c.jobs.push(id);
  });

  // PPM parts: merchant statements, paid end of following month
  MONTHS.forEach(mo => {
    const react = reactiveByMonth[mo.key] || 0;
    const amt = react * 0.27 + 1850 + R(-250, 250);
    const due = workBack(eomPlus(mo.start, 1));
    const sup = pick(SUP.parts);
    outflow('ppm', due, amt, 'Materials', { state: due <= AS_AT ? 'paid' : mo.end <= AS_AT || mo.partial ? 'committed' : 'planned', party: sup, ref: `STMT-${mo.key}`, desc: `Parts & consumables – ${mo.long} account statement` });
  });

  // ---------- overheads ----------
  const OH = {
    dge: { payroll: 76000, staff: 29, paye: 0.44, vans: ['Lex Autolease', 5940, 9], fuel: 3600, mkt: [['Google Ads', 5400, 3], ['Checkatrade', 1150, 10], ['Trustpilot', 640, 12]], ins: 2150, sw: 1480, util: 1150, rent: 13500 },
    climate: { payroll: 43500, staff: 17, paye: 0.42, vans: ['Arval UK', 3150, 5], fuel: 1850, mkt: [['Google Ads', 2600, 3], ['Checkatrade', 780, 10]], ins: 1050, sw: 690, util: 0, rent: 0 },
    ppm: { payroll: 33600, staff: 16, paye: 0.41, vans: ['Lex Autolease', 6380, 11], fuel: 3900, mkt: [['Google Ads', 900, 3]], ins: 820, sw: 640, util: 0, rent: 0 }
  };
  const ohState = d => d <= AS_AT ? 'paid' : 'committed';
  Object.entries(OH).forEach(([biz, o]) => {
    MONTHS.forEach((mo, i) => {
      const [y, m] = [mo.y, mo.m];
      const growth = 1 + i * 0.004;
      let pay = o.payroll * growth * R(0.985, 1.015);
      if (m === 12) pay += o.staff * 250; // Christmas bonus
      const payDay = lastWorkday(y, m);
      outflow(biz, payDay, pay, 'Payroll', { state: ohState(payDay), party: `Staff payroll (${o.staff} employees)`, ref: `PAY-${mo.key}`, desc: `Net wages – ${mo.long}` });
      const payeDay = workBack(D(y, m + 1, 22));
      outflow(biz, payeDay, pay * o.paye, 'PAYE, NIC & pension', { state: ohState(payeDay), party: 'HMRC / NEST', ref: `PAYE-${mo.key}`, desc: `PAYE, employer NIC & pension – ${mo.long} payroll` });
      const d1 = workFwd(mo.start);
      outflow(biz, d1, o.vans[1], 'Vehicles & fuel', { state: ohState(d1), party: o.vans[0], ref: `VAN-${mo.key}`, desc: `Van leases – ${o.vans[2]} vehicles` });
      const d15 = workFwd(D(y, m, 15));
      outflow(biz, d15, o.fuel * R(0.9, 1.1), 'Vehicles & fuel', { state: ohState(d15), party: 'Allstar fuel cards', ref: `FUEL-${mo.key}`, desc: 'Fuel card statement' });
      o.mkt.forEach(([p, a, dd]) => { const d = workFwd(D(y, m, dd)); outflow(biz, d, a * R(0.92, 1.08), 'Marketing', { state: ohState(d), party: p, ref: `MKT-${mo.key}`, desc: p === 'Google Ads' ? 'Search advertising' : 'Lead generation & reviews membership' }); });
      outflow(biz, d1, o.ins, 'Overheads', { state: ohState(d1), party: 'Towergate Insurance', ref: `INS-${mo.key}`, desc: 'Public & employer liability, fleet & contract works' });
      const d5 = workFwd(D(y, m, 5));
      outflow(biz, d5, o.sw, 'Overheads', { state: ohState(d5), party: 'Software & subscriptions', ref: `SW-${mo.key}`, desc: 'Accounts, design & job management software' });
      if (o.util) { const d20 = workFwd(D(y, m, 20)); outflow(biz, d20, o.util * R(0.85, 1.2), 'Overheads', { state: ohState(d20), party: 'Utilities & telecoms', ref: `UT-${mo.key}`, desc: 'Electricity, water, phones & broadband – Apex Centre' }); }
    });
    if (o.rent) [D(2025, 12, 25), D(2026, 3, 25), D(2026, 6, 24), D(2026, 9, 29), D(2026, 12, 25), D(2027, 3, 25)].forEach(d => {
      const pd = workBack(d);
      outflow(biz, pd, o.rent, 'Premises', { state: ohState(pd), party: 'Speedfields Park Estates', ref: 'RENT', desc: 'Quarterly rent in advance – Unit 4 Apex Centre' });
    });
  });
  // financing: growth loan and dividends to the holding company
  MONTHS.forEach(mo => {
    const d = workFwd(D(mo.y, mo.m, 18));
    outflow('dge', d, 4850, 'Loans & dividends', { state: ohState(d), party: 'Funding Circle', ref: 'LOAN-FC-2024', desc: 'Growth loan repayment (60 months, from Mar 2024)' });
    const d2 = workFwd(D(mo.y, mo.m, 12));
    outflow('climate', d2, 1620, 'Loans & dividends', { state: ohState(d2), party: 'Lloyds Bank', ref: 'LOAN-LB-2025', desc: 'Van & equipment loan repayment' });
  });
  [[D(2025, 12, 19), 'paid'], [D(2026, 3, 31), 'paid'], [D(2026, 6, 30), 'paid'], [D(2026, 9, 30), 'paid']].forEach(([d, st], i) =>
    outflow('dge', d, i < 4 ? 30000 : 60000, 'Loans & dividends', { state: st, party: 'Diamond Holding Group Ltd', ref: `DIV-${iso(d).slice(0, 7)}`, desc: st === 'planned' ? 'Planned interim dividend to holding company (board approval pending)' : 'Interim dividend to holding company', dividend: true }));
  // annual items
  outflow('dge', D(2026, 1, 2), 38200, 'Corporation tax', { state: 'paid', party: 'HMRC', ref: 'CT-FY25', desc: 'Corporation tax – year ended 31 Mar 2025' });
  outflow('dge', D(2027, 1, 4), 46800, 'Corporation tax', { state: 'committed', party: 'HMRC', ref: 'CT-FY26', desc: 'Corporation tax – year ended 31 Mar 2026' });
  outflow('climate', D(2026, 4, 14), 2380, 'Overheads', { state: 'paid', party: 'MCS / Gas Safe / F-Gas', ref: 'ACCRED-26', desc: 'Annual accreditation renewals' });
  outflow('climate', D(2027, 4, 14), 2450, 'Overheads', { state: 'committed', party: 'MCS / Gas Safe / F-Gas', ref: 'ACCRED-27', desc: 'Annual accreditation renewals' });
  outflow('dge', D(2026, 3, 16), 3100, 'Overheads', { state: 'paid', party: 'MCS / NAPIT / RECC', ref: 'ACCRED-26', desc: 'Annual accreditation renewals' });
  outflow('dge', D(2027, 3, 15), 3200, 'Overheads', { state: 'committed', party: 'MCS / NAPIT / RECC', ref: 'ACCRED-27', desc: 'Annual accreditation renewals' });

  // ---------- VAT ----------
  const INPUT_CATS = new Set(['Materials', 'Bulk stock', 'Subcontract', 'Vehicles & fuel', 'Premises', 'Marketing', 'Overheads']);
  function vatQuarter(biz, qStart, qEnd, payDate, label, fixed) {
    const inQ = flows.filter(f => f.biz === biz && f.date >= qStart && f.date <= qEnd && f.cat !== 'VAT');
    const span = (Math.min(qEnd, END) - Math.max(qStart, START) + 1);
    const scale = (qEnd - qStart + 1) / Math.max(1, span);
    let out = 0, inp = 0;
    inQ.forEach(f => {
      if (f.dir === 1 && !f.zero) out += f.amount / 6;
      if (f.dir === -1 && INPUT_CATS.has(f.cat)) inp += f.amount / 6 * (f.cat === 'Vehicles & fuel' ? 0.5 : 1);
    });
    // quarters that began before the data window use the filed return figure
    const net = fixed !== undefined ? fixed : round((out - inp) * scale, 0.01);
    const [py, pm] = parts(payDate);
    if (net >= 0) outflow(biz, payDate, net, 'VAT', { state: payDate <= AS_AT ? 'paid' : 'committed', party: 'HMRC', ref: `VAT-${label}`, desc: `VAT return – quarter to ${label}`, due: D(py, pm, 7) });
    else inflow(biz, payDate, -net, 'VAT refund', { state: payDate <= AS_AT ? 'received' : 'forecast', party: 'HMRC', ref: `VAT-${label}`, desc: `VAT repayment – quarter to ${label} (zero-rated energy-saving installs)` });
  }
  // DGE: repayment trader (zero-rated solar & batteries), quarters to Mar/Jun/Sep/Dec
  [[D(2025, 10, 1), D(2025, 12, 31), D(2026, 1, 27), 'Dec 2025', -81240.55], [D(2026, 1, 1), D(2026, 3, 31), D(2026, 4, 28), 'Mar 2026'], [D(2026, 4, 1), D(2026, 6, 30), D(2026, 7, 27), 'Jun 2026'],
   [D(2026, 7, 1), D(2026, 9, 30), D(2026, 10, 27), 'Sep 2026'], [D(2026, 10, 1), D(2026, 12, 31), D(2027, 1, 27), 'Dec 2026'], [D(2027, 1, 1), D(2027, 3, 31), D(2027, 4, 27), 'Mar 2027']]
    .forEach(q => vatQuarter('dge', ...q));
  // Climate: quarters to Dec/Mar/Jun/Sep, paid 7th of second month
  [[D(2025, 10, 1), D(2025, 12, 31), D(2026, 2, 6), 'Dec 2025', 4182.4], [D(2026, 1, 1), D(2026, 3, 31), D(2026, 5, 7), 'Mar 2026'], [D(2026, 4, 1), D(2026, 6, 30), D(2026, 8, 7), 'Jun 2026'],
   [D(2026, 7, 1), D(2026, 9, 30), D(2026, 11, 6), 'Sep 2026'], [D(2026, 10, 1), D(2026, 12, 31), D(2027, 2, 5), 'Dec 2026'], [D(2027, 1, 1), D(2027, 3, 31), D(2027, 5, 7), 'Mar 2027']]
    .forEach(q => vatQuarter('climate', ...q));
  // PPM: calendar quarters, paid by the 7th of the second month
  [[D(2025, 10, 1), D(2025, 12, 31), D(2026, 2, 6), 'Dec 2025', 30850.2], [D(2026, 1, 1), D(2026, 3, 31), D(2026, 5, 7), 'Mar 2026'], [D(2026, 4, 1), D(2026, 6, 30), D(2026, 8, 7), 'Jun 2026'],
   [D(2026, 7, 1), D(2026, 9, 30), D(2026, 11, 6), 'Sep 2026'], [D(2026, 10, 1), D(2026, 12, 31), D(2027, 2, 5), 'Dec 2026'], [D(2027, 1, 1), D(2027, 3, 31), D(2027, 5, 7), 'Mar 2027']]
    .forEach(q => vatQuarter('ppm', ...q));

  flows.sort((a, b) => a.date - b.date || b.dir - a.dir);

  // ---------- opening balances so that today's balance matches the bank feed ----------
  const opening = {};
  BUSINESSES.forEach(b => {
    const net = flows.filter(f => f.biz === b.id && f.date <= AS_AT).reduce((s, f) => s + f.dir * f.amount, 0);
    opening[b.id] = round(b.target - net, 0.01);
  });

  // ---------- query API ----------
  const STATES_IN = ['received', 'invoiced', 'forecast', 'pipeline'];
  const STATES_OUT = ['paid', 'committed', 'planned'];
  const STATE_LABEL = {
    received: 'Cash received', invoiced: 'Invoiced – awaiting payment', forecast: 'Forecast – contracted', pipeline: 'Forecast – new sales',
    paid: 'Paid (actual spend)', committed: 'Committed spend', planned: 'Planned spend (not yet ordered)'
  };
  const bizList = f => (!f || f === 'all') ? BUSINESSES.map(b => b.id) : [f];

  /** Scenario-adjusted flows. opts: {pipeline, delay, defer:Set(lotIds)} */
  function scenarioFlows(filter, opts = {}) {
    const ids = new Set(bizList(filter));
    const pipe = opts.pipeline !== false;
    const delay = opts.delay || 0;
    const defer = opts.defer || new Set();
    const out = [];
    for (const f of flows) {
      if (!ids.has(f.biz)) continue;
      if (!pipe && (f.state === 'pipeline' || (f.state === 'planned' && f.job && JOB[f.job] && JOB[f.job].pipeline))) continue;
      let date = f.date;
      if (delay && f.dir === 1 && (f.state === 'invoiced' || f.state === 'forecast' || f.state === 'pipeline') && f.cat !== 'VAT refund' && !(f.recurring && f.cat === 'Service plans (Direct Debit)')) date = Math.max(date, AS_AT + 1) + delay;
      if (f.lot && defer.has(f.lot) && f.date > AS_AT) date = f.date + 56;
      if (f.state === 'invoiced' && date <= AS_AT) date = AS_AT + 1;
      if (date > END) continue;
      out.push(date === f.date ? f : Object.assign({}, f, { date }));
    }
    return out.sort((a, b) => a.date - b.date);
  }

  function openingFor(filter) { return bizList(filter).reduce((s, b) => s + opening[b], 0); }

  /** daily closing balances START..END */
  function daily(filter, opts) {
    const fl = scenarioFlows(filter, opts);
    const days = END - START + 1;
    const bal = new Float64Array(days);
    let run = openingFor(filter), k = 0;
    for (let d = 0; d < days; d++) {
      const day = START + d;
      while (k < fl.length && fl[k].date === day) { run += fl[k].dir * fl[k].amount; k++; }
      bal[d] = run;
    }
    return { start: START, bal, at: day => bal[Math.min(Math.max(day - START, 0), days - 1)] };
  }

  const CAT_ORDER_OUT = ['Materials', 'Bulk stock', 'Subcontract', 'Payroll', 'PAYE, NIC & pension', 'VAT', 'Corporation tax', 'Vehicles & fuel', 'Premises', 'Marketing', 'Overheads', 'Loans & dividends'];
  const CAT_ORDER_IN = ['Customer receipts', 'Service plans (Direct Debit)', 'PPM contracts', 'VAT refund'];

  function monthly(filter, opts) {
    const fl = scenarioFlows(filter, opts);
    const dl = daily(filter, opts);
    let open = openingFor(filter);
    return MONTHS.map(mo => {
      const r = { ...mo, open, in: {}, out: {}, inCat: {}, outCat: {}, totalIn: 0, totalOut: 0 };
      STATES_IN.forEach(s => r.in[s] = 0); STATES_OUT.forEach(s => r.out[s] = 0);
      fl.forEach(f => {
        if (f.date < mo.start || f.date > mo.end) return;
        if (f.dir === 1) { r.in[f.state] += f.amount; r.inCat[f.cat] = (r.inCat[f.cat] || 0) + f.amount; r.totalIn += f.amount; }
        else { r.out[f.state] += f.amount; r.outCat[f.cat] = (r.outCat[f.cat] || 0) + f.amount; r.totalOut += f.amount; }
      });
      r.net = r.totalIn - r.totalOut;
      r.close = open + r.net;
      let lo = Infinity, loDay = mo.start;
      for (let d = mo.start; d <= mo.end; d++) { const v = dl.at(d); if (v < lo) { lo = v; loDay = d; } }
      r.low = lo; r.lowDay = loDay;
      open = r.close;
      return r;
    });
  }

  function balanceToday(filter) { return daily(filter).at(AS_AT); }

  function receivables(filter) {
    const ids = new Set(bizList(filter));
    return flows.filter(f => f.dir === 1 && f.state === 'invoiced' && ids.has(f.biz)).map(f => ({ ...f, overdue: Math.max(0, AS_AT - f.due) }));
  }
  function ageing(filter) {
    const buckets = [['Not yet due', 0, 0], ['1–30 days', 1, 30], ['31–60 days', 31, 60], ['61–90 days', 61, 90], ['90+ days', 91, 9999]];
    const rec = receivables(filter);
    return buckets.map(([label, a, b]) => {
      const rows = rec.filter(r => r.overdue >= a && r.overdue <= b);
      const byBiz = {}; BUSINESSES.forEach(x => byBiz[x.id] = rows.filter(r => r.biz === x.id).reduce((s, r) => s + r.amount, 0));
      return { label, total: rows.reduce((s, r) => s + r.amount, 0), count: rows.length, byBiz };
    });
  }
  function commitments(filter, horizonDays = 9999) {
    const ids = new Set(bizList(filter));
    return flows.filter(f => f.dir === -1 && f.state === 'committed' && ids.has(f.biz) && f.date <= AS_AT + horizonDays);
  }
  function sumBy(arr, fn) { return arr.reduce((s, x) => s + fn(x), 0); }

  /** lowest projected point after today, and first breach of zero / buffer */
  function outlook(filter, opts) {
    const dl = daily(filter, opts);
    const buffer = (!filter || filter === 'all') ? GROUP_BUFFER : BIZ[filter].buffer;
    let lo = Infinity, loDay = AS_AT, firstNeg = null, firstBuf = null, negDays = 0;
    for (let d = AS_AT + 1; d <= END; d++) {
      const v = dl.at(d);
      if (v < lo) { lo = v; loDay = d; }
      if (v < 0) { negDays++; if (firstNeg === null) firstNeg = d; }
      if (v < buffer && firstBuf === null) firstBuf = d;
    }
    // safe to withdraw today = headroom above the buffer at the lowest projected point
    const headroom = lo - buffer;
    const safe = Math.max(0, Math.floor(headroom / 1000) * 1000);
    return { low: lo, lowDay: loDay, firstNeg, firstBuf, negDays, buffer, end: dl.at(END), today: dl.at(AS_AT), headroom, safe };
  }

  /** the big one-off payments between today and the lowest point (what causes the dip) */
  function dipDrivers(filter, n = 4) {
    const o = outlook(filter);
    const ids = bizList(filter);
    const what = x => x.lot ? lots.find(l => l.id === x.lot).item.replace(/ \(container\)/, '') : x.desc.split(' – ')[0];
    return flows.filter(x => x.dir === -1 && x.date > AS_AT && x.date <= o.lowDay && ids.includes(x.biz) && x.amount >= 20000 && x.cat !== 'Payroll' && x.cat !== 'PAYE, NIC & pension')
      .sort((a, b) => b.amount - a.amount).slice(0, n).sort((a, b) => a.date - b.date)
      .map(x => ({ date: x.date, biz: x.biz, party: x.party, what: what(x), amount: x.amount }));
  }

  function lotStatus(l) {
    const used = sumBy(l.draws.filter(d => d.date <= AS_AT), d => d.units);
    const reserved = sumBy(l.draws.filter(d => d.date > AS_AT && !d.pipeline), d => d.units);
    const forecastUse = sumBy(l.draws.filter(d => d.date > AS_AT && d.pipeline), d => d.units);
    const delivered = l.delivered <= AS_AT;
    const onHand = delivered ? l.units - used : 0;
    const jobsServed = new Set(l.draws.map(d => d.job)).size;
    const lastDraw = l.draws.length ? Math.max(...l.draws.map(d => d.date)) : null;
    return { used, reserved, forecastUse, free: Math.max(0, l.units - used - reserved), onHand, onHandValue: onHand * l.unitCost, delivered, jobsServed, lastDraw, paidToDate: sumBy(l.payments.filter(p => p.state === 'paid'), p => p.amount), toPay: sumBy(l.payments.filter(p => p.state !== 'paid'), p => p.amount) };
  }

  function jobStatus(j) {
    if (j.biz === 'ppm') return j.stages.length && j.stages[0].state === 'invoiced' ? 'Awaiting payment' : 'Complete';
    const st = j.stages;
    if (j.install <= AS_AT) return st.every(s => s.state === 'received') ? 'Complete – paid' : 'Installed – awaiting payment';
    if (st.length > 2 && st[1].inv <= AS_AT) return st[1].state === 'received' ? 'Materials ordered' : 'Pre-order payment due';
    return 'Deposit paid – scheduled';
  }
  jobs.forEach(j => {
    j.received = sumBy(j.stages.filter(s => s.state === 'received'), s => s.amount);
    j.invoiced = sumBy(j.stages.filter(s => s.state === 'invoiced'), s => s.amount);
    j.toInvoice = sumBy(j.stages.filter(s => s.state === 'forecast' || s.state === 'pipeline'), s => s.amount);
    j.materials = sumBy(j.costs, c => c.amount) + sumBy(j.draws, d => d.value);
    j.status = j.pipeline ? 'Pipeline' : jobStatus(j);
    j.overdue = Math.max(0, ...j.stages.filter(s => s.state === 'invoiced').map(s => s.overdue || Math.max(0, AS_AT - s.due)));
  });

  // ---------- CRM: lifetime value per service ----------
  const PLAN_PRICE = Object.fromEntries(PLANS.map(p => [p.plan, p.price]));
  function customerLtv(c) {
    const rows = {};
    const add = (service, biz, paid, contracted = 0) => { const r = rows[service] || (rows[service] = { service, biz, paid: 0, contracted: 0, count: 0 }); r.paid += paid; r.contracted += contracted; r.count++; };
    c.history.forEach(h => add(h.service, h.biz, h.value));
    c.jobs.map(id => JOB[id]).filter(j => j && !j.pipeline).forEach(j => {
      const paidBefore = j.stages.filter(s => s.paid < START && s.state === 'received').reduce((s, x) => s + x.amount, 0);
      const svc = j.biz === 'ppm' ? (j.type.includes('Service') || j.type.includes('Check') || j.type.includes('CP12') ? 'Servicing & certificates' : 'Repairs & call-outs') : j.type;
      add(svc, j.biz, j.received + paidBefore, j.invoiced + j.toInvoice);
    });
    (c.plans || []).forEach(p => {
      const to = Math.min(p.to || AS_AT, AS_AT);
      const months = Math.max(0, Math.round((to - p.from) / 30.44));
      add(p.plan + ' plan', 'ppm', months * (PLAN_PRICE[p.plan] || 15), 0);
    });
    (c.contracts || []).forEach(cid => {
      const con = contracts.find(x => x.id === cid);
      add('PPM contract', 'ppm', sumBy(con.invoices.filter(i => i.state === 'received'), i => i.amount), sumBy(con.invoices.filter(i => i.state !== 'received'), i => i.amount));
    });
    const list = Object.values(rows).sort((a, b) => b.paid - a.paid);
    return { rows: list, paid: sumBy(list, r => r.paid), contracted: sumBy(list, r => r.contracted), businesses: [...new Set(list.map(r => r.biz))] };
  }

  // ---------- formatting ----------
  const gbp0 = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
  const gbp2 = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmt = {
    gbp: v => (v < 0 ? '−' : '') + gbp0.format(Math.abs(v)),
    gbp2: v => (v < 0 ? '−' : '') + gbp2.format(Math.abs(v)),
    k: v => { const a = Math.abs(v), s = v < 0 ? '−' : ''; return a >= 1e6 ? `${s}£${(a / 1e6).toFixed(2)}m` : a >= 1e4 ? `${s}£${Math.round(a / 1e3)}k` : a >= 1e3 ? `${s}£${(a / 1e3).toFixed(1)}k` : `${s}£${Math.round(a)}`; },
    kNum: v => (v < 0 ? '−' : '') + (Math.abs(v) / 1000).toFixed(1),
    date: n => toDate(n).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }),
    dateShort: n => toDate(n).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
    dayName: n => toDate(n).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }),
    num: v => Math.round(v).toLocaleString('en-GB'),
    pct: v => `${Math.round(v * 100)}%`
  };

  root.DIAMOND = {
    AS_AT, START, END, MONTHS, BUSINESSES, BIZ, GROUP_BUFFER, D, iso, toDate, parts,
    customers, CUST, jobs, JOB, lots, flows, opening, contracts, PLANS, planMonths, TYPES, F,
    STATES_IN, STATES_OUT, STATE_LABEL, CAT_ORDER_IN, CAT_ORDER_OUT, SKU_LABEL,
    scenarioFlows, openingFor, daily, monthly, balanceToday, receivables, ageing, commitments, outlook, dipDrivers, lotStatus, customerLtv, sumBy, fmt, bizList
  };
})(typeof window !== 'undefined' ? window : globalThis);
