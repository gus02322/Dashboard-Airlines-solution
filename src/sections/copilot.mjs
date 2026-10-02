import { esc, icon } from './_helpers.mjs';

/** 5. AI Copilot: scripted chat, answers computed from the demo data. */
export default function copilot(cfg) {
  const c = cfg.copilot;
  return `
<section class="section copilot" id="copilot" aria-labelledby="copilot-title">
  <div class="container copilot-grid">
    <div class="copilot-copy reveal">
      <p class="eyebrow">${esc(c.eyebrow)}</p>
      <h2 class="h2" id="copilot-title">${esc(c.title)}</h2>
      <p class="lead">${esc(c.text)}</p>
    </div>
    <div class="chat reveal" data-copilot>
      <div class="chat-top">
        <span class="chat-ic">${icon('spark')}</span>
        <span class="chat-name">Ops Copilot</span>
        <span class="chat-time mono">Board time 10:40</span>
      </div>
      <div class="chat-log" role="log" aria-live="polite" aria-label="Copilot conversation">
        <div class="msg msg--bot"><p>Hi. I can see today's ${'<span data-count></span>'} flights. Ask me anything about the schedule.</p></div>
      </div>
      <div class="chat-suggest" role="group" aria-label="Suggested questions">
        ${c.questions.map((q, i) => `<button type="button" class="chip-q" data-q="${i}">${esc(q)}</button>`).join('')}
      </div>
      <p class="chat-note">${esc(c.disclaimer)}</p>
    </div>
  </div>
</section>`;
}
