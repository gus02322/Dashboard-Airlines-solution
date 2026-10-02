/* ============================================================
   AI Copilot demo (scripted, no API call, no key)
   Answers are computed from the same sample schedule as the
   board, at board time 10:40, then streamed word by word.
   ============================================================ */

import { FLIGHTS, EVENTS, t2m } from './dashboard/data.js';

const NOW = t2m('10:40');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fl = (f, type) => ({ chip: f.flight, type });

/* Each answer is a list of parts: plain strings or { chip, type } flight tags. */
function answerNext2h() {
  const deps = FLIGHTS.filter((f) => t2m(f.etd) > NOW && t2m(f.etd) <= NOW + 120);
  const trucks = EVENTS.filter((e) => e.type === 'truck' && e.mins > NOW && e.mins <= NOW + 120);
  const parts = [`${deps.length} departures before 12:40:\n`];
  deps.forEach((f) => parts.push('• ', fl(f, 'etd'), ` ${f.airline}, ETD ${f.etd}, truck ${t2m(f.truck) <= NOW ? 'left' : 'leaves'} at ${f.truck}\n`));
  parts.push(`\n${trucks.length} trucks leave the kitchen in the same window. First one: `, fl(trucks[0].f, 'truck'), ` at ${trucks[0].time}.`);
  return parts;
}

function answerAtRisk() {
  const soon = EVENTS.filter((e) => (e.type === 'seal' || e.type === 'truck') && e.mins > NOW && e.mins <= NOW + 30);
  const parts = [`${soon.length} milestones are due in the next 30 minutes. These are the ones to watch:\n`];
  soon.forEach((e) => {
    const left = e.mins - NOW;
    parts.push('• ', fl(e.f, e.type), ` ${e.type === 'seal' ? 'sealing' : 'truck departure'} at ${e.time}, ${left} min left\n`);
  });
  const ek = soon[0];
  parts.push('\nTightest: ', fl(ek.f, ek.type), ` seals in ${ek.mins - NOW} min and its truck leaves at ${ek.f.truck}. An alert will fire on the floor screens 15 min before each one.`);
  return parts;
}

function answerHalal() {
  const halal = FLIGHTS.filter((f) => f.mealType === 'halal');
  const total = halal.reduce((s, f) => s + f.meals, 0);
  const all = FLIGHTS.reduce((s, f) => s + f.meals, 0);
  const left = halal.filter((f) => t2m(f.sealing) > NOW);
  const leftMeals = left.reduce((s, f) => s + f.meals, 0);
  const top = [...halal].sort((a, b) => b.meals - a.meals).slice(0, 3);
  const parts = [`${total.toLocaleString('en-US')} Halal meals today across ${halal.length} flights, ${Math.round((total / all) * 100)}% of the day's ${all.toLocaleString('en-US')} meals.\n\n`];
  parts.push(`Still to seal from now: ${leftMeals.toLocaleString('en-US')} meals on ${left.length} flights. Biggest loads: `);
  top.forEach((f, i) => parts.push(fl(f, 'seal'), ` ${f.meals}${i < top.length - 1 ? ', ' : '.'}`));
  return parts;
}

const ANSWERS = [answerNext2h, answerAtRisk, answerHalal];

export function initCopilot(root) {
  const log = root.querySelector('.chat-log');
  const count = root.querySelector('[data-count]');
  if (count) count.textContent = FLIGHTS.length;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let busy = false;

  async function ask(i, label) {
    if (busy) return;
    busy = true;
    root.querySelectorAll('.chip-q').forEach((b) => (b.disabled = true));
    const user = document.createElement('div');
    user.className = 'msg msg--user';
    user.innerHTML = `<p>${esc(label)}</p>`;
    log.appendChild(user);

    const bot = document.createElement('div');
    bot.className = 'msg msg--bot';
    bot.innerHTML = '<p class="typing" aria-label="Copilot is typing"><span></span><span></span><span></span></p>';
    log.appendChild(bot);
    log.setAttribute('aria-busy', 'true');
    scroll();
    await wait(reduced ? 0 : 650);

    const p = document.createElement('p');
    bot.replaceChildren(p);
    for (const part of ANSWERS[i]()) {
      if (typeof part === 'string') {
        // Stream text word by word
        const tokens = part.split(/(\s+)/);
        for (const tk of tokens) {
          if (tk.includes('\n')) p.appendChild(document.createElement('br'));
          else p.appendChild(document.createTextNode(tk));
          if (!reduced && tk.trim()) { await wait(22 + Math.random() * 28); scroll(); }
        }
      } else {
        const s = document.createElement('span');
        s.className = 'fl-chip mono c-' + part.type;
        s.textContent = part.chip;
        p.appendChild(s);
        if (!reduced) await wait(40);
      }
    }
    log.setAttribute('aria-busy', 'false');
    scroll();
    busy = false;
    root.querySelectorAll('.chip-q').forEach((b) => (b.disabled = false));
  }

  function scroll() { log.scrollTop = log.scrollHeight; }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  root.addEventListener('click', (e) => {
    const b = e.target.closest('.chip-q');
    if (b) ask(+b.dataset.q, b.textContent);
  });
}
