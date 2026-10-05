import { esc, icon } from './_helpers.mjs';

/** AI via MCP: the customer's own assistant, connected to OpsRamp. Scripted example chat. */
export default function copilot(cfg) {
  const c = cfg.copilot;
  const flowIcons = ['timeline', 'link', 'chat'];
  return `
<section class="section copilot" id="copilot" aria-labelledby="copilot-title">
  <div class="container copilot-grid">
    <div class="copilot-copy reveal">
      <p class="eyebrow">${esc(c.eyebrow)}</p>
      <h2 class="h2" id="copilot-title">${esc(c.title)}</h2>
      <p class="lead">${esc(c.text)}</p>
      <ol class="mcp-flow" aria-label="How the connection works">
        ${c.flow.map((f, i) => `<li class="mcp-step${i === 1 ? ' is-mid' : ''}"><span class="mcp-ic">${icon(flowIcons[i])}</span><span>${esc(f)}</span></li>`).join('')}
      </ol>
      <ul class="ticks">
        ${c.points.map((p) => `<li>${icon('check')}<span>${esc(p)}</span></li>`).join('')}
      </ul>
    </div>
    <div class="chat-wrap reveal">
      <p class="chat-example">${icon('spark')}${esc(c.example)}</p>
      <div class="chat" data-copilot>
        <div class="chat-top">
          <span class="chat-ic">${icon('chat')}</span>
          <span class="chat-name">Your AI assistant</span>
          <span class="chat-mcp mono"><span class="live-dot" aria-hidden="true"></span>OpsRamp via MCP</span>
          <span class="chat-time mono">Board 10:40</span>
        </div>
        <div class="chat-log" role="log" aria-live="polite" aria-label="Example conversation">
          <div class="msg msg--bot"><p>Connected to OpsRamp. I can see today's ${'<span data-count></span>'} flights. Ask me anything about the schedule.</p></div>
        </div>
        <div class="chat-suggest" role="group" aria-label="Suggested questions">
          ${c.questions.map((q, i) => `<button type="button" class="chip-q" data-q="${i}">${esc(q)}</button>`).join('')}
        </div>
        <p class="chat-note">${esc(c.disclaimer)}</p>
      </div>
    </div>
  </div>
</section>`;
}
