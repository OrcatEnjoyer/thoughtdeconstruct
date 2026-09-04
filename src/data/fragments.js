function assignPositions(list, { cols = 7, rows = 6, marginX = 4, marginY = 6 } = {}) {
  const cellW = (100 - marginX * 2) / cols;
  const cellH = (100 - marginY * 2) / rows;
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ r, c });
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return list.map((f, i) => {
    const cell = cells[i % cells.length];
    const jitterX = (Math.random() - 0.5) * cellW * 0.6;
    const jitterY = (Math.random() - 0.5) * cellH * 0.6;
    const top = Math.round((marginY + cell.r * cellH + cellH / 2 + jitterY) * 10) / 10;
    const left = Math.round((marginX + cell.c * cellW + cellW / 2 + jitterX) * 10) / 10;
    const rot = Math.round((Math.random() - 0.5) * 14);
    return { ...f, top, left, rot };
  });
}


function assignTimings(list, { start = 0.25, end = 0.85 } = {}) {
  const n = list.length;
  return list.map((f, idx) => {
    const t = n <= 1 ? start : start + (idx / (n - 1)) * (end - start);
    const jitter = (Math.random() - 0.5) * 0.02;
    return { ...f, at: Math.round((t + jitter) * 1000) / 1000 };
  });
}

export const fragments = assignPositions(assignTimings([
  { type: 'photostrip', backing: '#5b6b4a', c1: '#c9c3ba', c2: '#a9a49c', c3: '#c2bcb2', c4: '#aba6a0' },
  { type: 'photostrip', backing: '#d9b8d1', c1: '#33475c', c2: '#3c5268', c3: '#39506a', c4: '#2f4356' },
  { type: 'sticky', text: 'My favorite drawing' },
  { type: 'bubble', text: "I tried bowling for the first time!", tone: 'blue' },
  { type: 'bubble', text: 'that was actually really fun' },
  { type: 'sticky', doodle: '🐱' },
  { type: 'bubble', text: 'am I running out of time?', tone: 'blue' },
  { type: 'sticky', lines: ['To do list:', 'nothing'] },
  { type: 'sticky', doodle: '💪', text: 'GYM TOMORROW!!!' },
  { type: 'bubble', text: 'I laughed so hard!', tone: 'blue' },
  { type: 'sticky', text: 'Maybe tomorrow' },
  { type: 'bubble', text: 'do they actually like me?' },
  { type: 'polaroid', photoColor: '#cbb98a', text: 'Congrats!' },

  { type: 'bubble', text: "I wonder if they remember that too.", tone: 'blue' },
  { type: 'bubble', text: "That conversation ended three years ago and I'm still thinking about it." },
  { type: 'bubble', text: "I was supposed to become someone by now.", tone: 'blue' },
  { type: 'bubble', text: "Maybe nothing is wrong. Maybe I'm just tired." },
  { type: 'bubble', text: "I should've taken more pictures.", tone: 'blue' },
  { type: 'bubble', text: "There are places I'll probably never see again." },
  { type: 'bubble', text: "Why does that song still feel like a person?", tone: 'blue' },
  { type: 'bubble', text: "Some days disappear so quietly." },
  { type: 'sticky', lines: ['IDEA??', '↓', 'make it smaller', '↓', 'actually no', '↓', '<strong>MAKE IT BIGGER</strong>'] },
  { type: 'sticky', lines: ["DON'T FORGET", "the thing", "you were", "supposed to", "remember", "oops–"] },
  { type: 'sticky', lines: ['Tiny to-do list', '☐ charge headphones', '☐ water plant', '☐ find that charger', '☐ ???'] },

  { type: 'bubble', text: "did I lock the door?", tone: 'blue' },
  { type: 'bubble', text: "that email can wait until tomorrow" },
  { type: 'bubble', text: "I actually like this song", tone: 'blue' },
  { type: 'bubble', text: "need to text him back" },
  { type: 'bubble', text: "that was a good day, actually", tone: 'blue' },
  { type: 'bubble', text: "should probably drink more water" },

  { type: 'sticky', lines: ['Password ideas:', 'no', 'nope', 'definitely not'] },
{ type: 'sticky', doodle: '🌙', text: 'couldn\'t sleep again' },
{ type: 'sticky', lines: ["Movie night?", "- popcorn", "- blanket", "- don't fall asleep this time"] },
{ type: 'sticky', doodle: '☕️', text: 'one more cup won\'t hurt' },

{ type: 'photostrip', backing: '#8a6f52', c1: '#e8d9c3', c2: '#d4c2a5', c3: '#c9b48f', c4: '#e0cfae' },
{ type: 'photostrip', backing: '#3d5a5c', c1: '#a8c4c2', c2: '#8fb0ad', c3: '#b5cfcd', c4: '#96b3b0' },

{ type: 'polaroid', photoColor: '#d8c4a8', text: 'first snow!' },
{ type: 'polaroid', photoColor: '#9db3a8', text: 'the good kind of tired' },
{ type: 'polaroid', photoColor: '#c9a8a1', text: 'miss this place' },

  { type: 'reframe', text: '', isReframeCard: true },
]));

export const CHECKPOINTS = [0.25, 0.5, 0.75, 1.0];
export const INHALE_MS = 4400;
export const EXHALE_MS = 7000;
export const BREATH_PAUSE_MS = 900;
export const NOTICE_MS = 6500;
export const HOLD_BEFORE_CLOSE_MS = 9200;