import { esc, icon } from './_helpers.mjs';

/** Config panel: interactive mockup of the online workspace settings, with a live preview. */
export default function configPanel(cfg) {
  const c = cfg.configPanel;
  const tabs = [['flights', 'Flights', 'plane'], ['rules', 'Timing rules', 'sliders'], ['alerts', 'Alerts', 'bell'], ['display', 'Display', 'tv']];
  return `
<section class="section cpanel" id="config" aria-labelledby="cp-title">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">${esc(c.eyebrow)}<span class="tag-early mono">${esc(c.badge)}</span></p>
      <h2 class="h2" id="cp-title">${esc(c.title)}</h2>
      <p class="lead">${esc(c.text)}</p>
    </div>
    <div class="cp reveal" data-config-panel>
      <div class="cp-panel">
        <div class="cp-top">
          <span class="cp-ws mono"><span class="logo-mark" aria-hidden="true"></span>Workspace · Sample hub</span>
          <span class="cp-saved mono" data-saved aria-live="polite">All changes saved</span>
        </div>
        <div class="cp-tabs" role="tablist" aria-label="Settings">
          ${tabs.map(([k, l, ic], i) => `<button type="button" role="tab" class="cp-tab" id="cp-tab-${k}" aria-controls="cp-pane-${k}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-tab="${k}">${icon(ic)}<span>${l}</span></button>`).join('')}
        </div>
        ${tabs.map(([k], i) => `<div class="cp-pane" role="tabpanel" id="cp-pane-${k}" aria-labelledby="cp-tab-${k}" tabindex="0"${i ? ' hidden' : ''}></div>`).join('')}
        <noscript><p class="cp-noscript">The interactive mockup needs JavaScript.</p></noscript>
      </div>
      <div class="cp-preview" aria-label="Board preview">
        <div class="cpv-top">
          <span class="cpv-title"><span class="live-dot" aria-hidden="true"></span>Board preview</span>
          <div class="cpv-days" role="group" aria-label="Preview day"></div>
        </div>
        <div class="cpv-legend mono" aria-hidden="true"><span class="c-eta">ETA</span><span class="c-seal">Sealing</span><span class="c-truck">Truck</span><span class="c-etd">ETD</span><span class="c-bell">Alert</span></div>
        <div class="cpv-axis mono" aria-hidden="true"></div>
        <ul class="cpv-rows"></ul>
        <div class="cpv-alert" hidden role="alert"></div>
      </div>
    </div>
    <p class="cp-note">${esc(c.note)}</p>
  </div>
</section>`;
}
