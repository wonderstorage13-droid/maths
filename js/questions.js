/* ============================================================
   Maths Practice — question bank
   Every topic is a procedural generator -> infinite, instant,
   shuffled questions. No AI, no explanations, no server needed.
   ============================================================ */

function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[rnd(0, arr.length - 1)]; }
function shuffleArr(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rnd(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function lcmOf(a, b) { return (a * b) / gcd(a, b); }

// Build an MCQ from a question text + correct numeric answer.
function mcq(question, correct, decimals = 0) {
  const correctStr = decimals ? Number(correct).toFixed(decimals) : String(Math.round(correct));
  const set = new Set([correctStr]);
  const spread = Math.max(2, Math.abs(Math.round(correct * 0.2)) + 2);
  let guard = 0;
  while (set.size < 4 && guard < 60) {
    guard++;
    let variant = correct + rnd(-spread, spread) * (decimals ? 0.1 * rnd(1, 9) : 1);
    if (decimals) variant = parseFloat(variant.toFixed(decimals));
    const vs = decimals ? Number(variant).toFixed(decimals) : String(Math.round(variant));
    if (vs === correctStr) continue;
    set.add(vs);
  }
  const options = shuffleArr(Array.from(set));
  return { question, options, answerIndex: options.indexOf(correctStr) };
}

// Build an MCQ from explicit option strings (for non-numeric answers).
function mcqOptions(question, correctText, distractors) {
  const options = shuffleArr([correctText, ...distractors]);
  return { question, options, answerIndex: options.indexOf(correctText) };
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/* ---------------- generators ---------------- */
const G = {
  addition: () => { const a = rnd(100, 9999), b = rnd(100, 9999); return mcq(`${a} + ${b} = ?`, a + b); },
  subtraction: () => { const a = rnd(200, 9999), b = rnd(10, a); return mcq(`${a} − ${b} = ?`, a - b); },
  multiplication: () => { const a = rnd(3, 99), b = rnd(3, 99); return mcq(`${a} × ${b} = ?`, a * b); },
  division: () => { const b = rnd(2, 25), q = rnd(3, 60), a = b * q; return mcq(`${a} ÷ ${b} = ?`, q); },
  'mixed-operations': () => {
    const a = rnd(2, 20), b = rnd(2, 20), c = rnd(2, 20);
    const forms = [
      { t: `${a} + ${b} × ${c} = ?`, v: a + b * c },
      { t: `(${a} + ${b}) × ${c} = ?`, v: (a + b) * c },
      { t: `${a} × ${b} − ${c} = ?`, v: a * b - c },
      { t: `${a} × ${b} + ${c} = ?`, v: a * b + c }
    ];
    const f = pick(forms);
    return mcq(f.t, f.v);
  },
  squares: () => { const n = rnd(11, 40); return mcq(`${n}² = ?`, n * n); },
  cubes: () => { const n = rnd(4, 20); return mcq(`${n}³ = ?`, n ** 3); },
  'square-roots': () => { const n = rnd(4, 35); return mcq(`√${n * n} = ?`, n); },
  'cube-roots': () => { const n = rnd(2, 18); return mcq(`∛${n ** 3} = ?`, n); },
  lcm: () => { const a = rnd(3, 24), b = rnd(3, 24); return mcq(`LCM of ${a} and ${b} = ?`, lcmOf(a, b)); },
  hcf: () => { const a = rnd(6, 96), b = rnd(6, 96); return mcq(`HCF of ${a} and ${b} = ?`, gcd(a, b)); },
  fractions: () => {
    const a = rnd(1, 9), b = rnd(2, 12), c = rnd(1, 9), d = rnd(2, 12);
    const val = a / b + c / d;
    return mcq(`${a}/${b} + ${c}/${d} = ? (2 decimals)`, val, 2);
  },
  decimals: () => {
    const a = rnd(10, 99) / 10, b = rnd(10, 99) / 10;
    return mcq(`${a.toFixed(1)} + ${b.toFixed(1)} = ?`, a + b, 1);
  },
  percentages: () => {
    const x = rnd(5, 95), y = rnd(50, 900);
    return mcq(`${x}% of ${y} = ?`, (x * y) / 100, ((x * y) % 100 === 0) ? 0 : 1);
  },
  'ratio-proportion': () => {
    const r1 = rnd(2, 9), r2 = rnd(2, 9), mult = rnd(3, 15);
    const a = r1 * mult, b = r2 * mult;
    return mcq(`If a : b = ${r1} : ${r2} and a = ${a}, find b.`, b);
  },
  averages: () => {
    const n = rnd(4, 6);
    const nums = Array.from({ length: n }, () => rnd(10, 99));
    const sum = nums.reduce((s, x) => s + x, 0);
    return mcq(`Average of ${nums.join(', ')} = ? (round)`, Math.round(sum / n));
  },
  'number-series': () => {
    const start = rnd(2, 20), diff = rnd(2, 9);
    const type = pick(['ap', 'gp']);
    if (type === 'ap') {
      const seq = [0, 1, 2, 3].map(i => start + i * diff);
      return mcq(`${seq.join(', ')}, ? `, start + 4 * diff);
    } else {
      const r = rnd(2, 3);
      const seq = [0, 1, 2, 3].map(i => start * r ** i);
      return mcq(`${seq.join(', ')}, ? `, start * r ** 4);
    }
  },
  simplification: () => {
    const a = rnd(2, 12), b = rnd(2, 12), c = rnd(2, 12), d = rnd(2, 12);
    const val = (a + b) * c - d;
    return mcq(`(${a} + ${b}) × ${c} − ${d} = ?`, val);
  },
  divisibility: () => {
    const div = pick([3, 4, 6, 7, 8, 9, 11]);
    const good = div * rnd(11, 90);
    const bads = new Set();
    while (bads.size < 3) {
      const cand = rnd(50, 900);
      if (cand % div !== 0) bads.add(cand);
    }
    return mcqOptions(`Which number is divisible by ${div}?`, String(good), Array.from(bads).map(String));
  },
  'prime-numbers': () => {
    const primes = [23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
    const composites = [21, 33, 35, 39, 49, 51, 57, 63, 65, 69, 77, 81, 87, 91, 93, 95, 99];
    return mcqOptions('Which of these is a prime number?', String(pick(primes)),
      shuffleArr(composites).slice(0, 3).map(String));
  },
  'profit-loss': () => {
    const cp = rnd(100, 2000), pct = rnd(5, 40), gain = pick([true, false]);
    const sp = gain ? cp + (cp * pct) / 100 : cp - (cp * pct) / 100;
    return mcq(`CP = ₹${cp}, SP = ₹${Math.round(sp)}. ${gain ? 'Profit' : 'Loss'} % = ?`, pct);
  },
  'simple-interest': () => {
    const p = rnd(1000, 20000), r = rnd(2, 15), t = rnd(1, 6);
    return mcq(`SI on ₹${p} at ${r}% p.a. for ${t} years = ?`, (p * r * t) / 100);
  },
  'compound-interest': () => {
    const p = rnd(1000, 10000), r = rnd(5, 20), t = 2;
    const ci = p * (1 + r / 100) ** t - p;
    return mcq(`CI on ₹${p} at ${r}% p.a. for 2 years = ?`, Math.round(ci));
  },
  discount: () => {
    const mp = rnd(200, 3000), d = rnd(5, 40);
    return mcq(`Marked Price ₹${mp}, discount ${d}%. Selling Price = ?`, mp - (mp * d) / 100);
  },
  partnership: () => {
    const r1 = rnd(2, 6), r2 = rnd(2, 6), profit = (r1 + r2) * rnd(100, 900);
    return mcq(`A and B invest in ratio ${r1}:${r2}. Total profit ₹${profit}. A's share = ?`, (profit * r1) / (r1 + r2));
  },
  'mixture-alligation': () => {
    const q1 = rnd(10, 40), p1 = rnd(20, 60), q2 = rnd(10, 40), p2 = rnd(20, 60);
    const avg = (q1 * p1 + q2 * p2) / (q1 + q2);
    return mcq(`Mix ${q1}L of milk worth ₹${p1}/L with ${q2}L worth ₹${p2}/L. Average price/L = ? (round)`, Math.round(avg));
  },
  'time-work': () => {
    const a = rnd(6, 20), b = rnd(6, 20);
    const days = (a * b) / (a + b);
    return mcq(`A finishes work in ${a} days, B in ${b} days. Together, days needed = ? (2 decimals)`, days, 2);
  },
  'pipes-cisterns': () => {
    const a = rnd(4, 15), b = rnd(4, 15);
    const t = (a * b) / (a + b);
    return mcq(`Pipe A fills tank in ${a}h, Pipe B in ${b}h. Together, time to fill = ? (2 decimals)`, t, 2);
  },
  'time-speed-distance': () => {
    const speed = rnd(30, 120), time = rnd(1, 8);
    return mcq(`Speed = ${speed} km/h, Time = ${time}h. Distance = ?`, speed * time);
  },
  'boats-streams': () => {
    const b = rnd(10, 25), s = rnd(2, 8);
    return mcq(`Boat speed ${b} km/h, stream speed ${s} km/h. Downstream speed = ?`, b + s);
  },
  'train-problems': () => {
    const len = rnd(100, 300), speed = rnd(36, 108);
    const speedMS = (speed * 1000) / 3600;
    return mcq(`A train ${len}m long moving at ${speed} km/h crosses a pole in how many seconds? (round)`, Math.round(len / speedMS));
  },
  'linear-equations': () => {
    const x = rnd(2, 30), a = rnd(2, 9), b = rnd(1, 50);
    const c = a * x + b;
    return mcq(`Solve for x: ${a}x + ${b} = ${c}`, x);
  },
  'quadratic-equations': () => {
    const r1 = rnd(1, 10), r2 = rnd(1, 10);
    const b = -(r1 + r2), c = r1 * r2;
    const bStr = b >= 0 ? `+ ${b}x` : `− ${Math.abs(b)}x`;
    return mcqOptions(`One root of x² ${bStr} + ${c} = 0 is?`, String(r1), [String(r1 + 1), String(r1 - 1 || 2), String(r2 + 2)]);
  },
  'algebraic-identities': () => {
    const a = rnd(2, 15), b = rnd(2, 15);
    return mcq(`(${a} + ${b})² = ?`, (a + b) ** 2);
  },
  'surds-indices': () => {
    const base = pick([2, 3, 5]), e1 = rnd(2, 5), e2 = rnd(2, 5);
    return mcq(`${base}^${e1} × ${base}^${e2} = ${base}^?`, e1 + e2);
  },
  'area-perimeter': () => {
    const l = rnd(4, 40), w = rnd(4, 40);
    const askArea = pick([true, false]);
    return askArea ? mcq(`Rectangle: length ${l}, width ${w}. Area = ?`, l * w)
      : mcq(`Rectangle: length ${l}, width ${w}. Perimeter = ?`, 2 * (l + w));
  },
  triangles: () => {
    const base = rnd(5, 40), height = rnd(5, 40);
    return mcq(`Triangle base = ${base}, height = ${height}. Area = ? (2 decimals)`, (base * height) / 2, 2);
  },
  circles: () => {
    const r = rnd(3, 25);
    const askArea = pick([true, false]);
    return askArea ? mcq(`Circle radius = ${r}. Area = ? (use π = 3.14, round)`, Math.round(3.14 * r * r))
      : mcq(`Circle radius = ${r}. Circumference = ? (use π = 3.14, round)`, Math.round(2 * 3.14 * r));
  },
  'volume-surface-area': () => {
    const s = rnd(3, 20);
    return mcq(`Cube side = ${s}. Volume = ?`, s ** 3);
  },
  'coordinate-geometry': () => {
    const x1 = rnd(0, 10), y1 = rnd(0, 10), x2 = rnd(0, 10), y2 = rnd(0, 10);
    const d = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    return mcq(`Distance between (${x1},${y1}) and (${x2},${y2}) = ? (2 decimals)`, d, 2);
  },
  'trigonometry-basics': () => {
    const table = [
      ['sin 30°', 0.5], ['cos 60°', 0.5], ['sin 90°', 1], ['cos 0°', 1],
      ['sin 0°', 0], ['tan 45°', 1], ['cos 90°', 0], ['sin 45°', 0.71]
    ];
    const [q, v] = pick(table);
    return mcq(`Value of ${q} = ?`, v, 2);
  },
  'mean-median-mode': () => {
    const n = 5;
    const nums = shuffleArr(Array.from({ length: n }, () => rnd(1, 50)));
    const mode = pick(['mean', 'median']);
    const sorted = [...nums].sort((a, b) => a - b);
    if (mode === 'mean') {
      const sum = nums.reduce((s, x) => s + x, 0);
      return mcq(`Data: ${nums.join(', ')}. Mean = ? (2 decimals)`, sum / n, 2);
    }
    return mcq(`Data: ${nums.join(', ')}. Median = ?`, sorted[2]);
  },
  probability: () => {
    const scenarios = [
      { t: 'A die is rolled. Probability of getting a number greater than 4 = ? (as decimal, 2 dp)', v: 2 / 6 },
      { t: 'A coin is tossed twice. Probability of getting exactly one head = ? (as decimal, 2 dp)', v: 0.5 },
      { t: 'A card is drawn from a deck of 52. Probability it is an Ace = ? (as decimal, 2 dp)', v: 4 / 52 },
      { t: 'A die is rolled. Probability of getting an even number = ? (as decimal, 2 dp)', v: 0.5 }
    ];
    const s = pick(scenarios);
    return mcq(s.t, s.v, 2);
  },
  'permutation-combination': () => {
    const n = rnd(4, 8), r = rnd(2, 3);
    const type = pick(['P', 'C']);
    const fact = k => k <= 1 ? 1 : k * fact(k - 1);
    const val = type === 'P' ? fact(n) / fact(n - r) : fact(n) / (fact(r) * fact(n - r));
    return mcq(`${n}${type === 'P' ? 'P' : 'C'}${r} = ?`, val);
  },
  'data-interpretation': () => {
    const total = rnd(200, 900), part = rnd(20, 80);
    const value = Math.round((total * part) / 100);
    return mcq(`Out of ${total} students, ${part}% play sports. How many students play sports?`, value);
  },
  'age-problems': () => {
    const y = rnd(10, 25), ratio = rnd(2, 4);
    const x = y * ratio;
    return mcq(`A person's age is ${ratio} times their child's age (${y} years). Parent's age = ?`, x);
  },
  'clock-problems': () => {
    const h = rnd(1, 11), m = pick([0, 15, 30, 45]);
    const minAngle = m * 6;
    const hourAngle = (h % 12) * 30 + m * 0.5;
    let diff = Math.abs(hourAngle - minAngle);
    if (diff > 180) diff = 360 - diff;
    return mcq(`At ${h}:${m.toString().padStart(2, '0')}, the angle between hour and minute hands = ?`, diff);
  },
  'calendar-problems': () => {
    const startIdx = rnd(0, 6), n = rnd(1, 60);
    const resultIdx = (startIdx + n) % 7;
    const distractIdx = shuffleArr(WEEKDAYS.filter((_, i) => i !== resultIdx)).slice(0, 3);
    return mcqOptions(`If today is ${WEEKDAYS[startIdx]}, what day will it be after ${n} days?`, WEEKDAYS[resultIdx], distractIdx);
  },
  'number-system': () => {
    const n = rnd(1000, 9999);
    const digits = String(n).split('').map(Number);
    return mcq(`Sum of digits of ${n} = ?`, digits.reduce((a, b) => a + b, 0));
  },
  logarithms: () => {
    const base = pick([2, 10]), e = rnd(1, 6);
    const val = base ** e;
    return mcq(`log${base}(${val}) = ?`, e);
  },
  'sequence-series': () => {
    const a = rnd(2, 15), d = rnd(2, 10), n = rnd(5, 15);
    const nth = a + (n - 1) * d;
    return mcq(`AP: first term = ${a}, common difference = ${d}. ${n}th term = ?`, nth);
  }
};

const TOPICS = [
  { id: 'addition', name: 'Addition', category: 'Foundations', icon: '➕' },
  { id: 'subtraction', name: 'Subtraction', category: 'Foundations', icon: '➖' },
  { id: 'multiplication', name: 'Multiplication', category: 'Foundations', icon: '✖️' },
  { id: 'division', name: 'Division', category: 'Foundations', icon: '➗' },
  { id: 'mixed-operations', name: 'Mixed Operations (BODMAS)', category: 'Foundations', icon: '🔢' },
  { id: 'squares', name: 'Squares', category: 'Foundations', icon: '□' },
  { id: 'cubes', name: 'Cubes', category: 'Foundations', icon: '⬛' },
  { id: 'square-roots', name: 'Square Roots', category: 'Foundations', icon: '√' },
  { id: 'cube-roots', name: 'Cube Roots', category: 'Foundations', icon: '∛' },
  { id: 'lcm', name: 'LCM', category: 'Foundations', icon: '🔁' },
  { id: 'hcf', name: 'HCF', category: 'Foundations', icon: '🔀' },
  { id: 'fractions', name: 'Fractions', category: 'Foundations', icon: '½' },
  { id: 'decimals', name: 'Decimals', category: 'Foundations', icon: '.5' },
  { id: 'percentages', name: 'Percentages', category: 'Foundations', icon: '%' },
  { id: 'ratio-proportion', name: 'Ratio & Proportion', category: 'Foundations', icon: '∶' },
  { id: 'averages', name: 'Averages', category: 'Foundations', icon: '➗' },
  { id: 'number-series', name: 'Number Series', category: 'Foundations', icon: '📶' },
  { id: 'simplification', name: 'Simplification', category: 'Foundations', icon: '🧮' },
  { id: 'divisibility', name: 'Divisibility Rules', category: 'Foundations', icon: '🔎' },
  { id: 'prime-numbers', name: 'Prime Numbers', category: 'Foundations', icon: '🔑' },
  { id: 'number-system', name: 'Number System', category: 'Foundations', icon: '🔟' },

  { id: 'profit-loss', name: 'Profit & Loss', category: 'Commercial Maths', icon: '💰' },
  { id: 'simple-interest', name: 'Simple Interest', category: 'Commercial Maths', icon: '🏦' },
  { id: 'compound-interest', name: 'Compound Interest', category: 'Commercial Maths', icon: '📈' },
  { id: 'discount', name: 'Discount', category: 'Commercial Maths', icon: '🏷️' },
  { id: 'partnership', name: 'Partnership', category: 'Commercial Maths', icon: '🤝' },
  { id: 'mixture-alligation', name: 'Mixture & Alligation', category: 'Commercial Maths', icon: '🧪' },

  { id: 'time-work', name: 'Time & Work', category: 'Time, Speed & Work', icon: '⏱️' },
  { id: 'pipes-cisterns', name: 'Pipes & Cisterns', category: 'Time, Speed & Work', icon: '🚰' },
  { id: 'time-speed-distance', name: 'Time, Speed & Distance', category: 'Time, Speed & Work', icon: '🚗' },
  { id: 'boats-streams', name: 'Boats & Streams', category: 'Time, Speed & Work', icon: '🚤' },
  { id: 'train-problems', name: 'Train Problems', category: 'Time, Speed & Work', icon: '🚆' },

  { id: 'linear-equations', name: 'Linear Equations', category: 'Algebra', icon: 'x' },
  { id: 'quadratic-equations', name: 'Quadratic Equations', category: 'Algebra', icon: 'x²' },
  { id: 'algebraic-identities', name: 'Algebraic Identities', category: 'Algebra', icon: '(a+b)²' },
  { id: 'surds-indices', name: 'Surds & Indices', category: 'Algebra', icon: 'aⁿ' },

  { id: 'area-perimeter', name: 'Area & Perimeter', category: 'Geometry & Mensuration', icon: '▭' },
  { id: 'triangles', name: 'Triangles', category: 'Geometry & Mensuration', icon: '△' },
  { id: 'circles', name: 'Circles', category: 'Geometry & Mensuration', icon: '○' },
  { id: 'volume-surface-area', name: 'Volume & Surface Area', category: 'Geometry & Mensuration', icon: '🧊' },
  { id: 'coordinate-geometry', name: 'Coordinate Geometry', category: 'Geometry & Mensuration', icon: '📐' },
  { id: 'trigonometry-basics', name: 'Trigonometry Basics', category: 'Geometry & Mensuration', icon: '📏' },

  { id: 'mean-median-mode', name: 'Mean, Median & Mode', category: 'Data & Statistics', icon: '📊' },
  { id: 'probability', name: 'Probability', category: 'Data & Statistics', icon: '🎲' },
  { id: 'permutation-combination', name: 'Permutation & Combination', category: 'Data & Statistics', icon: 'nPr' },
  { id: 'data-interpretation', name: 'Data Interpretation', category: 'Data & Statistics', icon: '📋' },

  { id: 'age-problems', name: 'Age Problems', category: 'Miscellaneous', icon: '🎂' },
  { id: 'clock-problems', name: 'Clock Problems', category: 'Miscellaneous', icon: '🕒' },
  { id: 'calendar-problems', name: 'Calendar Problems', category: 'Miscellaneous', icon: '📅' },
  { id: 'logarithms', name: 'Logarithms', category: 'Miscellaneous', icon: 'log' },
  { id: 'sequence-series', name: 'Sequences & Series (AP)', category: 'Miscellaneous', icon: 'Σ' }
];

function getTopicById(id) { return TOPICS.find(t => t.id === id); }
function generateQuestion(topicId) {
  const fn = G[topicId];
  if (!fn) return null;
  return fn();
}
