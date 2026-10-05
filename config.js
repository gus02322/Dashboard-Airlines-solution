/**
 * OpsRamp website configuration
 * ------------------------------------------------------------
 * This is the ONLY file you need to edit to change text, links
 * and contact details. After editing, run:
 *
 *     node build.mjs
 *
 * and the site is regenerated in /dist and /docs. (Netlify does this
 * for you automatically on every push.)
 *
 * Writing rules used across the copy: short sentences, no em dashes,
 * no invented statistics, no customer names, no data provider names.
 */

export default {
  /* ---------- Site & SEO ---------- */
  site: {
    name: 'OpsRamp',
    // Final public URL, no trailing slash. Used for canonical links,
    // social previews (LinkedIn needs absolute URLs) and the sitemap.
    // Currently: GitHub Pages. Replace with your own domain later.
    url: 'https://gus02322.github.io/Dashboard-Airlines-solution',
    title: 'OpsRamp | Live operations board for airline catering',
    description:
      'A real-time board for airline catering: live estimated ETA and ETD from flight tracking, sealing and truck slots that adjust on their own, in your own private workspace.',
    language: 'en',
    year: 2026,
  },

  /* ---------- Contact & form ---------- */
  contact: {
    email: 'augustin@de-franssu.com',
    linkedin: 'https://www.linkedin.com/in/YOUR-PROFILE', // TODO: replace
    // Form provider:
    //  'mailto'    opens the visitor's email app, pre-filled (works anywhere, no account)
    //  'netlify'   Netlify Forms (only when the site is hosted on Netlify)
    //  'formspree' paste your Formspree endpoint below (works on GitHub Pages)
    formProvider: 'mailto',
    formspreeEndpoint: 'https://formspree.io/f/YOUR_FORM_ID', // only used with 'formspree'
  },

  /* ---------- Navigation ---------- */
  nav: [
    { label: 'Demo', href: '#demo' },
    { label: 'Live slots', href: '#live-slots' },
    { label: 'Config', href: '#config' },
    { label: 'Privacy', href: '#privacy' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
  navCta: 'Book a demo',

  /* ---------- Hero ---------- */
  hero: {
    eyebrow: 'Live operations board for airline catering',
    title: ['Every flight.', 'Every milestone.', 'One screen.'],
    subtitle:
      'ETA, sealing, truck departure and ETD on one live board. Arrival and departure estimates follow live flight tracking, and your slots adjust on their own. The kitchen, the dispatch desk and the ramp all see the same clock.',
    primaryCta: 'Book a demo',
    secondaryCta: 'Try the live demo',
  },

  /* Real figures only. Edit when they change. */
  proofStrip: [
    { value: '~50', label: 'daily users' },
    { value: 'Multi-site', label: 'one board, several locations' },
    { value: '4', label: 'milestones tracked per flight' },
    { value: 'Live', label: 'at a major international hub' },
  ],

  /* ---------- Problem ---------- */
  problem: {
    eyebrow: 'The problem',
    title: 'Today, the ramp runs on group chats.',
    items: [
      {
        icon: 'sheet',
        title: 'The plan is out of date by 7am',
        text: 'Someone updated it at 6am. Nobody on the floor has opened it since.',
      },
      {
        icon: 'chat',
        title: 'Changes travel by WhatsApp and radio',
        text: 'A new ETA lands in one chat, the truck driver reads another.',
      },
      {
        icon: 'truck',
        title: 'A truck leaves 20 minutes off',
        text: 'Too early, the meals wait on the tarmac. Too late, the aircraft waits for you.',
      },
    ],
  },

  /* ---------- Live demo ---------- */
  demo: {
    eyebrow: 'Interactive demo',
    title: "Don't take our word for it. Run the board.",
    subtitle:
      'Click a flight, filter by milestone, trigger a sealing alert or switch to the TV view. Sample data, fictional hub.',
    note: 'Sample schedule. Flight numbers and times are fictional. ETA and ETD marked Live are live estimates.',
  },

  /* ---------- Live slots ---------- */
  liveSlots: {
    eyebrow: 'Live slots',
    title: 'Slots that move with the aircraft.',
    text: 'OpsRamp follows each inbound aircraft with live flight tracking. When the live estimated ETA moves, the estimated departure, the Box Time slot and the truck departure move with it. Nobody has to call the kitchen.',
    points: [
      'Live estimated ETA and ETD, refreshed from live aircraft tracking (ADS-B)',
      'Box Time and truck slots recalculated from your own timing rules',
      'The change shows on every screen at once, with an alert if a slot gets tight',
    ],
    honesty:
      'Live estimates are computed from the real position of the aircraft. They are not official airline schedules and can move as the flight progresses.',
  },

  /* ---------- Config panel ---------- */
  configPanel: {
    eyebrow: 'Config panel',
    badge: 'Early access',
    title: 'Your operation, your rules.',
    text: 'Your flights, timings and alerts live in your own online workspace. Edit them in a simple panel and the board follows at once. Try it: add a flight or move a rule.',
    note: 'Mockup with sample data. The online config panel is in early access.',
  },

  /* ---------- AI via MCP ---------- */
  copilot: {
    eyebrow: 'AI Copilot · MCP',
    title: 'Connect your own AI via MCP.',
    text: 'OpsRamp plugs into the AI assistant your team already uses, through the open MCP protocol. Ask it about today\'s flights in plain English. It answers from your live board.',
    points: [
      'Works with your own AI subscription. OpsRamp bills no AI costs.',
      'We set up the connection for you. Setup is included.',
      'The Copilot works through MCP only. Nothing extra to install on the board.',
    ],
    flow: ['OpsRamp data', 'MCP connection', 'Your AI assistant'],
    example: 'Example of what your own AI assistant can answer once connected',
    disclaimer: 'Scripted demo. Answers are computed from the sample schedule above.',
    // Answers are computed live from the demo data; the questions are editable.
    questions: [
      'What leaves in the next 2 hours?',
      'Which flights are at risk?',
      'How many Halal meals today?',
    ],
  },

  /* ---------- Data & privacy ---------- */
  privacy: {
    eyebrow: 'Data & privacy',
    title: 'Your data stays yours.',
    text: 'OpsRamp is designed around five principles. They shape how the product is built, not just how it is sold.',
    // Design principles. Check each one technically before going live (see README checklist).
    items: [
      { icon: 'box', title: 'An isolated workspace', text: 'Each customer has its own workspace and its own database. Your data is never visible to another customer.' },
      { icon: 'ban', title: 'Never sold, never used to train AI', text: 'Your schedule is used to run your board. It is never resold and never used to train AI models.' },
      { icon: 'lock', title: 'Encrypted in transit and at rest', text: 'Data is encrypted on its way to your screens and where it is stored.' },
      { icon: 'users', title: 'Access per user, with roles', text: 'Admin, supervisor, and read only for TV screens. Everyone sees what their role needs.' },
      { icon: 'download', title: 'Export and deletion on request', text: 'Ask for a full export of your data, or for its deletion, at any time.' },
    ],
    link: 'Security & privacy details',
  },

  /* ---------- Features (max 6) ---------- */
  features: {
    eyebrow: 'Why teams switch',
    title: 'What changes on day one',
    items: [
      { icon: 'timeline', title: 'The whole day at a glance', text: 'Every ETA, sealing, truck and ETD on one live timeline. The NOW line shows exactly where you are.' },
      { icon: 'radar', title: 'Slots that follow the aircraft', text: 'Live estimated ETA and ETD from live flight tracking. Box Time and truck slots shift on their own.' },
      { icon: 'bell', title: 'Late becomes rare', text: 'A full-screen alert with sound before every sealing and truck departure. You choose how early. Nobody has to remember.' },
      { icon: 'tv', title: 'Kitchen TV and supervisor phones', text: 'A TV view built for factory screens, and the same board on any phone as a simple list. No app to install.' },
      { icon: 'sliders', title: 'Your own private workspace', text: 'Flights, timing rules and alerts live in your own workspace. Change them in a simple panel, the board follows.' },
      { icon: 'spark', title: 'Ask the board a question', text: 'The Ops Copilot answers from today\'s flights inside the AI assistant you already use. Works via MCP only.' },
    ],
  },

  /* ---------- How it works ---------- */
  howItWorks: {
    eyebrow: 'How it works',
    title: 'Fast to start. No IT project.',
    steps: [
      { title: 'Create your workspace', text: 'We open your private workspace with you. No servers, no software to install, no IT project.' },
      { title: 'Enter your flights and timings', text: 'Add your flights and set your timing rules in the config panel. It takes minutes, not a training course.' },
      { title: 'Your team is live on any screen', text: 'Open the board on the office PC, the kitchen TV and every supervisor phone. Alerts start the same day.' },
    ],
  },

  /* ---------- ROI calculator ---------- */
  roi: {
    eyebrow: 'Your numbers',
    title: 'What is one late truck worth to you?',
    text: 'Use your own numbers. This is an estimate, not a promise.',
    defaults: {
      flightsPerDay: 30,
      incidentsPerMonth: 6,
      costPerIncident: 800, // in currency below
      avoidablePct: 25,     // share of incidents a live board could help avoid
    },
    currency: '$',
    disclaimer:
      'Estimate only. The avoidable share is an assumption you control. OpsRamp does not guarantee a specific reduction.',
  },

  /* ---------- Comparison ---------- */
  comparison: {
    eyebrow: 'Comparison',
    title: 'Where OpsRamp fits',
    columns: ['Spreadsheets + WhatsApp', 'OpsRamp', 'Enterprise suites'],
    rows: [
      { label: 'Pricing model', values: ['Free', 'Tailored to your operation', 'Large licence, often per site'] },
      { label: 'Live ETA and ETD', values: ['Updated by hand, by phone or chat', 'Live estimates from flight tracking', 'Varies by vendor'] },
      { label: 'Time to go live', values: ['Already there', 'Fast, no IT project', 'Weeks to months'] },
      { label: 'Training', values: ['None, but no live view', 'A short walkthrough', 'Formal training'] },
      { label: 'Mobile and TV', values: ['Phone only, no alerts', 'Both, with alerts', 'Varies by module'] },
      { label: 'AI assistant', values: ['None', 'Your own AI, connected via MCP', 'Varies by vendor'] },
      { label: 'Fits a small team', values: ['Yes', 'Yes', 'Built for large operations'] },
    ],
  },

  /* ---------- Custom pricing ---------- */
  pricing: {
    eyebrow: 'Pricing',
    title: 'Custom pricing',
    subtitle: 'Priced to your operation: number of flights, sites and users.',
    criteria: [
      { icon: 'plane', title: 'Flights per day', text: 'From a single kitchen with a handful of departures to a busy hub.' },
      { icon: 'pin', title: 'Sites', text: 'One location, or several on the same board.' },
      { icon: 'users', title: 'Users and screens', text: 'Office seats, supervisor phones and kitchen TVs.' },
    ],
    included: 'Always included: setup with your team, the MCP connection to your own AI, and email support.',
    cta: 'Request a quote',
  },

  /* ---------- FAQ ---------- */
  faq: {
    eyebrow: 'FAQ',
    title: 'Questions operators ask',
    items: [
      { q: 'Is our schedule data secure?', a: 'Each customer has an isolated workspace with its own database. Data is encrypted in transit and at rest, access is per user with roles, and no passenger data is needed. The details are on the Security & privacy page.' },
      { q: 'Where do the live ETA and ETD come from?', a: 'From live aircraft tracking (ADS-B). OpsRamp estimates arrival and departure times from the real position of the aircraft. These are live estimates, not official airline schedules, and they can move as the flight progresses.' },
      { q: 'Who pays for the AI?', a: 'You do, through your own AI subscription. OpsRamp only bills access and setup, never AI usage.' },
      { q: 'Do we need an IT project or special training?', a: 'No. OpsRamp runs in a web browser on PCs, phones and TVs. We create your workspace with you, and your flights and timings go in the config panel. A short walkthrough is enough for the team.' },
      { q: 'Can we adapt it to our operation?', a: 'Yes. Airlines, colours, meal types, alert timing and the rules behind sealing and truck slots, per aircraft size, are all set in your workspace.' },
      { q: 'What support do we get?', a: 'Setup is done with you, not handed over as a manual. Email support is included.' },
      { q: 'Can we try it first?', a: 'Yes. Book a demo and we can set up a trial on your own schedule so your team sees real flights.' },
    ],
  },

  /* ---------- Final CTA & form ---------- */
  cta: {
    eyebrow: 'Book a demo',
    title: 'See your own operation on it.',
    text: 'Send us a few lines. We reply within one working day with a demo slot or a quote.',
    sizes: ['Under 20 flights / day', '20 to 50 flights / day', '50 to 100 flights / day', 'More than 100 flights / day'],
    submit: 'Request a demo',
    success: 'Thank you. Your request is in. We will reply within one working day.',
    error: 'Sending failed. Your email app will open with the message ready to send.',
  },

  /* ---------- Footer ---------- */
  footer: {
    tagline: 'Live operations board for airline catering.',
    legal: 'OpsRamp is an independent product. Airline names in the demo are used for illustration only; no affiliation is implied.',
  },

  /* ---------- /demo share page ---------- */
  demoPage: {
    title: 'OpsRamp live demo | Airline catering operations board',
    description: 'Try the OpsRamp board: live timeline, live estimated ETA and ETD, alerts, airline and production views, TV mode. Sample data.',
  },
};
